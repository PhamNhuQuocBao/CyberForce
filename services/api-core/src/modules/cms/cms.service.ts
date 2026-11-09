import { createHash } from 'node:crypto';
import type { Prisma, ContentStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AuthError } from '../auth/auth.service.js';
import {
  pathInput,
  moduleInput,
  roomInput,
  taskInput,
  questionInput,
  type cmsKind,
  type cmsListQuery,
} from './cms.schemas.js';
import type { z } from 'zod';

type Kind = z.infer<typeof cmsKind>;
type Query = z.infer<typeof cmsListQuery>;
const missing = () => new AuthError(404, 'Không tìm thấy nội dung.', 'CMS_NOT_FOUND');
const conflict = () =>
  new AuthError(
    409,
    'Nội dung đã thay đổi. Tải phiên bản mới trước khi lưu.',
    'CMS_VERSION_CONFLICT',
  );
const invalid = (message: string) => new AuthError(400, message, 'CMS_INVALID');

function sanitizedQuestion<T extends { answerHash?: string | null }>(question: T) {
  const { answerHash, ...safe } = question;
  return { ...safe, answerConfigured: Boolean(answerHash) };
}

export async function listCms(kind: Kind, query: Query) {
  const skip = (query.page - 1) * query.limit;
  const common = {
    ...(query.status && { status: query.status }),
    ...(query.search && { title: { contains: query.search, mode: 'insensitive' as const } }),
  };
  let rows: unknown[], total: number;
  if (kind === 'paths') {
    const where: Prisma.LearningPathWhereInput = common;
    [rows, total] = await Promise.all([
      prisma.learningPath.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.learningPath.count({ where }),
    ]);
  } else if (kind === 'modules') {
    const where: Prisma.ModuleWhereInput = {
      ...common,
      ...(query.parentId && { pathId: query.parentId }),
    };
    [rows, total] = await Promise.all([
      prisma.module.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
        include: { learningPath: { select: { title: true } } },
      }),
      prisma.module.count({ where }),
    ]);
  } else if (kind === 'rooms') {
    const where: Prisma.RoomWhereInput = {
      ...common,
      ...(query.parentId && { moduleId: query.parentId }),
    };
    [rows, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
        include: { module: { select: { title: true } } },
      }),
      prisma.room.count({ where }),
    ]);
  } else if (kind === 'tasks') {
    const where: Prisma.TaskWhereInput = {
      ...common,
      ...(query.parentId && { roomId: query.parentId }),
    };
    [rows, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: [{ taskOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.task.count({ where }),
    ]);
  } else {
    const where: Prisma.QuestionWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.search && { questionText: { contains: query.search, mode: 'insensitive' } }),
      ...(query.parentId && { taskId: query.parentId }),
    };
    const [questions, count] = await Promise.all([
      prisma.question.findMany({ where, skip, take: query.limit, orderBy: { createdAt: 'asc' } }),
      prisma.question.count({ where }),
    ]);
    rows = questions.map(sanitizedQuestion);
    total = count;
  }
  return {
    items: rows,
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}

export async function getCms(kind: Kind, id: string) {
  let row: unknown;
  if (kind === 'paths') row = await prisma.learningPath.findUnique({ where: { id } });
  else if (kind === 'modules') row = await prisma.module.findUnique({ where: { id } });
  else if (kind === 'rooms') row = await prisma.room.findUnique({ where: { id } });
  else if (kind === 'tasks') row = await prisma.task.findUnique({ where: { id } });
  else {
    const question = await prisma.question.findUnique({ where: { id } });
    row = question && sanitizedQuestion(question);
  }
  if (!row) throw missing();
  return row;
}

type Tx = Prisma.TransactionClient;
async function ensureParent(tx: Tx, kind: Kind, data: Record<string, unknown>, id?: string) {
  if (kind === 'modules') {
    if (
      !(await tx.learningPath.findUnique({
        where: { id: data.pathId as string },
        select: { id: true },
      }))
    )
      throw invalid('Lộ trình không tồn tại.');
  } else if (kind === 'rooms') {
    const module = await tx.module.findUnique({ where: { id: data.moduleId as string } });
    if (!module || module.pathId !== data.pathId)
      throw invalid('Module không thuộc lộ trình đã chọn.');
    if (data.prerequisiteRoomId === id)
      throw invalid('Phòng không thể tự làm điều kiện tiên quyết.');
    if (
      data.prerequisiteRoomId &&
      !(await tx.room.findUnique({
        where: { id: data.prerequisiteRoomId as string },
        select: { id: true },
      }))
    )
      throw invalid('Phòng tiên quyết không tồn tại.');
  } else if (kind === 'tasks') {
    if (!(await tx.room.findUnique({ where: { id: data.roomId as string }, select: { id: true } })))
      throw invalid('Phòng không tồn tại.');
  } else if (kind === 'questions') {
    if (!(await tx.task.findUnique({ where: { id: data.taskId as string }, select: { id: true } })))
      throw invalid('Task không tồn tại.');
  }
}

function questionData(
  input: z.infer<typeof questionInput>,
  existing?: { answerHash: string | null; flagPattern: string | null; flagType: string },
) {
  if (
    input.flagType === 'static' &&
    !input.answer &&
    !(existing?.flagType === 'static' && existing.answerHash)
  )
    throw invalid('Cờ static bắt buộc có đáp án.');
  if (
    input.flagType === 'regex' &&
    !input.flagPattern &&
    !(existing?.flagType === 'regex' && existing.flagPattern)
  )
    throw invalid('Cờ regex bắt buộc có pattern.');
  if (input.flagType === 'regex') {
    try {
      new RegExp(input.flagPattern ?? existing?.flagPattern ?? '');
    } catch {
      throw invalid('Regex pattern không hợp lệ.');
    }
  }
  return {
    taskId: input.taskId,
    questionText: input.questionText,
    flagType: input.flagType,
    pointsReward: input.pointsReward,
    hintTiers: input.hintTiers,
    answerHash:
      input.flagType === 'static'
        ? input.answer
          ? createHash('sha256').update(input.answer).digest('hex')
          : existing?.answerHash
        : null,
    flagPattern: input.flagType === 'regex' ? (input.flagPattern ?? existing?.flagPattern) : null,
  };
}

function roomData(input: z.infer<typeof roomInput>, module: { title: string; orderIndex: number }) {
  return {
    pathId: input.pathId,
    moduleId: input.moduleId,
    moduleName: module.title,
    moduleOrder: module.orderIndex,
    orderIndex: input.orderIndex,
    title: input.title,
    slug: input.slug,
    description: input.description,
    difficulty: input.difficulty,
    roomType: input.roomType,
    isFree: input.isFree,
    pointsReward: input.pointsReward,
    estimatedMinutes: input.estimatedMinutes,
    prerequisiteRoomId: input.prerequisiteRoomId,
    requiredForCapstone: input.requiredForCapstone,
    targetTemplateSpec: input.labEnabled
      ? {
          image: input.image!,
          cpuMillicores: input.cpuMillicores,
          memoryMb: input.memoryMb,
          ports: input.ports,
        }
      : {},
  };
}

async function ensureRoomKeepsQuestion(
  tx: Tx,
  roomId: string,
  omitTaskId?: string,
  omitQuestionId?: string,
) {
  const room = await tx.room.findUniqueOrThrow({ where: { id: roomId }, select: { status: true } });
  if (room.status !== 'published') return;
  const remaining = await tx.question.count({
    where: {
      status: 'published',
      ...(omitQuestionId && { id: { not: omitQuestionId } }),
      task: { roomId, status: 'published', ...(omitTaskId && { id: { not: omitTaskId } }) },
    },
  });
  if (!remaining)
    throw invalid('Phòng đã xuất bản phải giữ ít nhất một task và câu hỏi đã xuất bản.');
}

export async function createCms(kind: Kind, payload: unknown, actorId: string) {
  return prisma.$transaction(async (tx) => {
    let row: { id: string };
    if (kind === 'paths') {
      const data = pathInput.parse(payload);
      row = await tx.learningPath.create({
        data: { ...data, status: 'draft', isPublished: false },
      });
    } else if (kind === 'modules') {
      const data = moduleInput.parse(payload);
      await ensureParent(tx, kind, data);
      row = await tx.module.create({ data: { ...data, status: 'draft' } });
    } else if (kind === 'rooms') {
      const data = roomInput.parse(payload);
      await ensureParent(tx, kind, data);
      const module = await tx.module.findUniqueOrThrow({ where: { id: data.moduleId } });
      const room = await tx.room.create({
        data: { ...roomData(data, module), status: 'draft', publishedAt: null },
      });
      row = room;
      if (data.starterTask) {
        const task = await tx.task.create({
          data: {
            roomId: room.id,
            title: data.starterTask.title,
            contentMdx: data.starterTask.contentMdx,
            taskOrder: 1,
            status: 'published',
          },
        });
        await tx.question.create({
          data: {
            ...questionData({
              taskId: task.id,
              questionText: data.starterTask.questionText,
              flagType: data.starterTask.flagType,
              answer: data.starterTask.answer,
              flagPattern: data.starterTask.flagPattern,
              pointsReward: data.starterTask.pointsReward,
              hintTiers: [],
            }),
            status: 'published',
          },
        });
      }
    } else if (kind === 'tasks') {
      const data = taskInput.parse(payload);
      await ensureParent(tx, kind, data);
      row = await tx.task.create({ data: { ...data, status: 'draft' } });
    } else {
      const data = questionInput.parse(payload);
      await ensureParent(tx, kind, data);
      row = await tx.question.create({ data: { ...questionData(data), status: 'draft' } });
    }
    await tx.auditLog.create({
      data: { actorId, action: `cms.${kind}.created`, targetId: row.id },
    });
    return row.id;
  });
}

async function assertVersion(tx: Tx, kind: Kind, id: string, version: string) {
  const table = {
    paths: 'learning_paths',
    modules: 'modules',
    rooms: 'rooms',
    tasks: 'tasks',
    questions: 'questions',
  }[kind];
  const rows = await tx.$queryRawUnsafe<Array<{ updated_at: Date; status: ContentStatus }>>(
    `SELECT updated_at, status FROM ${table} WHERE id = $1::uuid FOR UPDATE`,
    id,
  );
  if (!rows.length) throw missing();
  if (rows[0].updated_at.toISOString() !== version) throw conflict();
  return rows[0].status;
}

export async function updateCms(
  kind: Kind,
  id: string,
  version: string,
  payload: unknown,
  actorId: string,
) {
  return prisma.$transaction(async (tx) => {
    await assertVersion(tx, kind, id, version);
    if (kind === 'paths') {
      const data = pathInput.parse(payload);
      await tx.learningPath.update({ where: { id }, data });
    } else if (kind === 'modules') {
      const data = moduleInput.parse(payload);
      await ensureParent(tx, kind, data, id);
      await tx.module.update({ where: { id }, data });
      await tx.room.updateMany({
        where: { moduleId: id },
        data: { pathId: data.pathId, moduleName: data.title, moduleOrder: data.orderIndex },
      });
    } else if (kind === 'rooms') {
      const data = roomInput.parse(payload);
      if (data.starterTask) throw invalid('Task khởi tạo chỉ dùng khi tạo phòng mới.');
      await ensureParent(tx, kind, data, id);
      const module = await tx.module.findUniqueOrThrow({ where: { id: data.moduleId } });
      await tx.room.update({ where: { id }, data: roomData(data, module) });
    } else if (kind === 'tasks') {
      const data = taskInput.parse(payload);
      await ensureParent(tx, kind, data, id);
      const current = await tx.task.findUniqueOrThrow({
        where: { id },
        select: { roomId: true, status: true },
      });
      if (current.status === 'published' && current.roomId !== data.roomId)
        await ensureRoomKeepsQuestion(tx, current.roomId, id);
      await tx.task.update({ where: { id }, data });
    } else {
      const data = questionInput.parse(payload);
      await ensureParent(tx, kind, data, id);
      const existing = await tx.question.findUniqueOrThrow({
        where: { id },
        select: {
          answerHash: true,
          flagPattern: true,
          flagType: true,
          taskId: true,
          status: true,
          task: { select: { roomId: true } },
        },
      });
      if (existing.status === 'published' && existing.taskId !== data.taskId)
        await ensureRoomKeepsQuestion(tx, existing.task.roomId, undefined, id);
      await tx.question.update({ where: { id }, data: questionData(data, existing) });
    }
    await tx.auditLog.create({ data: { actorId, action: `cms.${kind}.updated`, targetId: id } });
    return id;
  });
}

async function requirePublishable(tx: Tx, kind: Kind, id: string) {
  if (kind === 'modules') {
    const module = await tx.module.findUniqueOrThrow({
      where: { id },
      include: { learningPath: true },
    });
    if (module.learningPath.status !== 'published' || !module.learningPath.isPublished)
      throw invalid('Xuất bản lộ trình trước module.');
  } else if (kind === 'rooms') {
    const room = await tx.room.findUniqueOrThrow({
      where: { id },
      include: {
        module: { include: { learningPath: true } },
        tasks: { include: { questions: true } },
      },
    });
    if (
      !room.module ||
      room.module.status !== 'published' ||
      room.module.learningPath.status !== 'published' ||
      !room.module.learningPath.isPublished
    )
      throw invalid('Xuất bản lộ trình và module trước phòng.');
    const validQuestions = room.tasks
      .filter((task) => task.status === 'published')
      .flatMap((task) => task.questions.filter((question) => question.status === 'published'));
    if (
      !validQuestions.length ||
      validQuestions.some(
        (question) =>
          question.pointsReward <= 0 ||
          (question.flagType === 'static' && !question.answerHash) ||
          (question.flagType === 'regex' && !question.flagPattern),
      )
    )
      throw invalid('Phòng cần ít nhất một task và câu hỏi đã xuất bản, có cờ và EXP hợp lệ.');
  } else if (kind === 'tasks') {
    const task = await tx.task.findUniqueOrThrow({ where: { id }, include: { room: true } });
    if (task.room.status === 'archived')
      throw invalid('Không thể xuất bản task trong phòng đã lưu trữ.');
  } else if (kind === 'questions') {
    const question = await tx.question.findUniqueOrThrow({
      where: { id },
      include: { task: true },
    });
    if (question.task.status === 'archived')
      throw invalid('Không thể xuất bản câu hỏi trong task đã lưu trữ.');
    if (
      question.pointsReward <= 0 ||
      (question.flagType === 'static' && !question.answerHash) ||
      (question.flagType === 'regex' && !question.flagPattern)
    )
      throw invalid('Câu hỏi cần cờ và EXP hợp lệ.');
  }
}

async function assertImageAvailable(image: string) {
  const { env } = await import('../../config/env.js');
  const response = await fetch(
    `${env.ORCHESTRATOR_URL.replace(/\/$/, '')}/v1/images/available?name=${encodeURIComponent(image)}`,
    {
      headers: { Authorization: `Bearer ${env.ORCHESTRATOR_TOKEN}` },
      signal: AbortSignal.timeout(5000),
    },
  ).catch(() => null);
  if (!response?.ok)
    throw new AuthError(503, 'Không kiểm tra được Docker image.', 'CMS_IMAGE_CHECK_UNAVAILABLE');
  const result = (await response.json()) as { available?: boolean };
  if (!result.available) throw invalid('Docker image chưa có trên orchestrator host.');
}

export async function changeCmsStatus(
  kind: Kind,
  id: string,
  version: string,
  status: ContentStatus,
  actorId: string,
) {
  if (kind === 'rooms' && status === 'published') {
    const room = await prisma.room.findUnique({
      where: { id },
      select: { targetTemplateSpec: true },
    });
    if (!room) throw missing();
    const spec = room.targetTemplateSpec;
    if (
      spec &&
      typeof spec === 'object' &&
      !Array.isArray(spec) &&
      'image' in spec &&
      typeof spec.image === 'string'
    )
      await assertImageAvailable(spec.image);
  }
  return prisma.$transaction(async (tx) => {
    const previousStatus = await assertVersion(tx, kind, id, version);
    if (status === 'published') await requirePublishable(tx, kind, id);
    if (previousStatus === 'published' && status !== 'published' && kind === 'tasks') {
      const task = await tx.task.findUniqueOrThrow({ where: { id }, select: { roomId: true } });
      await ensureRoomKeepsQuestion(tx, task.roomId, id);
    }
    if (previousStatus === 'published' && status !== 'published' && kind === 'questions') {
      const question = await tx.question.findUniqueOrThrow({
        where: { id },
        select: { task: { select: { roomId: true } } },
      });
      await ensureRoomKeepsQuestion(tx, question.task.roomId, undefined, id);
    }
    if (kind === 'paths')
      await tx.learningPath.update({
        where: { id },
        data: { status, isPublished: status === 'published' },
      });
    else if (kind === 'modules') await tx.module.update({ where: { id }, data: { status } });
    else if (kind === 'rooms')
      await tx.room.update({
        where: { id },
        data: { status, publishedAt: status === 'published' ? new Date() : null },
      });
    else if (kind === 'tasks') await tx.task.update({ where: { id }, data: { status } });
    else await tx.question.update({ where: { id }, data: { status } });
    await tx.auditLog.create({ data: { actorId, action: `cms.${kind}.${status}`, targetId: id } });
    return id;
  });
}

export async function deleteCms(kind: Kind, id: string, version: string, actorId: string) {
  return prisma.$transaction(async (tx) => {
    if ((await assertVersion(tx, kind, id, version)) !== 'draft')
      throw invalid('Chỉ có thể xóa bản nháp chưa được sử dụng. Hãy lưu trữ nội dung đã xuất bản.');
    const blocked =
      kind === 'paths'
        ? (
            await tx.learningPath.findUniqueOrThrow({
              where: { id },
              include: {
                _count: {
                  select: {
                    modules: true,
                    rooms: true,
                    enrollments: true,
                    exams: true,
                    certificates: true,
                  },
                },
              },
            })
          )._count
        : kind === 'modules'
          ? (
              await tx.module.findUniqueOrThrow({
                where: { id },
                include: { _count: { select: { rooms: true } } },
              })
            )._count
          : kind === 'rooms'
            ? (
                await tx.room.findUniqueOrThrow({
                  where: { id },
                  include: {
                    _count: {
                      select: {
                        tasks: true,
                        labInstances: true,
                        dependentRooms: true,
                        kothMatches: true,
                      },
                    },
                  },
                })
              )._count
            : kind === 'tasks'
              ? (
                  await tx.task.findUniqueOrThrow({
                    where: { id },
                    include: { _count: { select: { questions: true, streakDays: true } } },
                  })
                )._count
              : (
                  await tx.question.findUniqueOrThrow({
                    where: { id },
                    include: { _count: { select: { submissions: true, hintUnlocks: true } } },
                  })
                )._count;
    if (Object.values(blocked).some((count) => count > 0))
      throw new AuthError(
        409,
        'Nội dung có dữ liệu liên quan. Hãy lưu trữ thay vì xóa.',
        'CMS_HAS_DEPENDENCIES',
      );
    if (kind === 'paths') await tx.learningPath.delete({ where: { id } });
    else if (kind === 'modules') await tx.module.delete({ where: { id } });
    else if (kind === 'rooms') await tx.room.delete({ where: { id } });
    else if (kind === 'tasks') await tx.task.delete({ where: { id } });
    else await tx.question.delete({ where: { id } });
    await tx.auditLog.create({ data: { actorId, action: `cms.${kind}.deleted`, targetId: id } });
  });
}
