import { createHash } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AuthError } from '../auth/auth.service.js';
import { roomInput, taskInput, questionInput } from '../cms/cms.schemas.js';
import { roomData, questionData } from '../cms/cms.service.js';

export const creatorMissing = () =>
  new AuthError(404, 'Không tìm thấy bài lab của bạn.', 'CREATOR_ROOM_NOT_FOUND');
export const creatorConflict = () =>
  new AuthError(409, 'Bản nháp đã thay đổi. Tải lại trước khi lưu.', 'CREATOR_VERSION_CONFLICT');
export const creatorInvalid = (message: string) => new AuthError(400, message, 'CREATOR_INVALID');

export async function ownedRoom(
  roomId: string,
  userId: string,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) {
  const room = await tx.room.findFirst({ where: { id: roomId, creatorId: userId } });
  if (!room) throw creatorMissing();
  return room;
}

export function editable(room: { reviewStatus: string; status: string }) {
  if (
    room.status !== 'draft' ||
    !['editing', 'changes_requested', 'rejected'].includes(room.reviewStatus)
  )
    throw creatorInvalid('Bài đã gửi duyệt hoặc xuất bản. Không thể sửa bản này.');
}

export async function roomFingerprint(
  roomId: string,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) {
  const room = await tx.room.findUniqueOrThrow({
    where: { id: roomId },
    include: {
      tasks: {
        orderBy: [{ taskOrder: 'asc' }, { id: 'asc' }],
        include: { questions: { orderBy: { id: 'asc' } } },
      },
      creatorAttachments: { orderBy: { id: 'asc' } },
    },
  });
  const source = {
    pathId: room.pathId,
    moduleId: room.moduleId,
    moduleName: room.moduleName,
    moduleOrder: room.moduleOrder,
    orderIndex: room.orderIndex,
    title: room.title,
    slug: room.slug,
    description: room.description,
    difficulty: room.difficulty,
    roomType: room.roomType,
    targetTemplateSpec: room.targetTemplateSpec,
    isFree: room.isFree,
    pointsReward: room.pointsReward,
    estimatedMinutes: room.estimatedMinutes,
    prerequisiteRoomId: room.prerequisiteRoomId,
    requiredForCapstone: room.requiredForCapstone,
    tasks: room.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      contentMdx: task.contentMdx,
      taskOrder: task.taskOrder,
      skillTags: task.skillTags,
      status: task.status,
      questions: task.questions.map((question) => ({
        id: question.id,
        questionText: question.questionText,
        flagType: question.flagType,
        answerHash: question.answerHash,
        flagPattern: question.flagPattern,
        hintTiers: question.hintTiers,
        pointsReward: question.pointsReward,
        status: question.status,
      })),
    })),
    attachments: room.creatorAttachments.map((item) => ({
      id: item.id,
      objectKey: item.objectKey,
      filename: item.filename,
      sizeBytes: item.sizeBytes,
    })),
  };
  return createHash('sha256').update(JSON.stringify(source)).digest('hex');
}

export async function creatorRoomDetail(roomId: string, userId: string) {
  await ownedRoom(roomId, userId);
  const room = await prisma.room.findUniqueOrThrow({
    where: { id: roomId },
    include: {
      tasks: {
        orderBy: { taskOrder: 'asc' },
        include: { questions: { orderBy: { createdAt: 'asc' } } },
      },
      creatorAttachments: { orderBy: { createdAt: 'asc' } },
    },
  });
  return {
    ...room,
    tasks: room.tasks.map((task) => ({
      ...task,
      questions: task.questions.map(({ answerHash, ...question }) => ({
        ...question,
        answerConfigured: Boolean(answerHash),
      })),
    })),
    creatorAttachments: room.creatorAttachments.map((attachment) => ({
      id: attachment.id,
      roomId: attachment.roomId,
      uploaderId: attachment.uploaderId,
      filename: attachment.filename,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes,
      createdAt: attachment.createdAt,
    })),
  };
}

export async function listCreatorRooms(userId: string) {
  return prisma.room.findMany({
    where: { creatorId: userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      reviewStatus: true,
      reviewFeedback: true,
      updatedAt: true,
      createdAt: true,
    },
  });
}

export async function createCreatorRoom(payload: unknown, userId: string) {
  const data = roomInput.parse(payload);
  return prisma.$transaction(async (tx) => {
    const module = await tx.module.findFirst({
      where: {
        id: data.moduleId,
        pathId: data.pathId,
        status: 'published',
        learningPath: { status: 'published', isPublished: true },
      },
    });
    if (!module) throw creatorInvalid('Chọn module thuộc lộ trình đã xuất bản.');
    if (data.prerequisiteRoomId) {
      const prerequisite = await tx.room.findFirst({
        where: { id: data.prerequisiteRoomId, status: 'published', pathId: data.pathId },
      });
      if (!prerequisite) throw creatorInvalid('Phòng tiên quyết phải thuộc lộ trình đã xuất bản.');
    }
    const room = await tx.room.create({
      data: { ...roomData(data, module), status: 'draft', creatorId: userId },
    });
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
    await tx.auditLog.create({
      data: { actorId: userId, targetId: room.id, action: 'creator.room.created' },
    });
    return room.id;
  });
}

export async function updateCreatorRoom(
  roomId: string,
  userId: string,
  version: string,
  payload: unknown,
) {
  const data = roomInput.parse(payload);
  if (data.starterTask) throw creatorInvalid('Task khởi tạo chỉ dùng khi tạo phòng mới.');
  return prisma.$transaction(async (tx) => {
    const room = await ownedRoom(roomId, userId, tx);
    editable(room);
    const module = await tx.module.findFirst({
      where: {
        id: data.moduleId,
        pathId: data.pathId,
        status: 'published',
        learningPath: { status: 'published', isPublished: true },
      },
    });
    if (!module) throw creatorInvalid('Chọn module thuộc lộ trình đã xuất bản.');
    if (data.prerequisiteRoomId) {
      if (data.prerequisiteRoomId === roomId)
        throw creatorInvalid('Phòng không thể tự làm điều kiện tiên quyết.');
      const prerequisite = await tx.room.findFirst({
        where: { id: data.prerequisiteRoomId, status: 'published', pathId: data.pathId },
      });
      if (!prerequisite) throw creatorInvalid('Phòng tiên quyết phải thuộc lộ trình đã xuất bản.');
    }
    const result = await tx.room.updateMany({
      where: { id: roomId, creatorId: userId, updatedAt: new Date(version) },
      data: {
        ...roomData(data, module),
        reviewStatus: 'editing',
        reviewFingerprint: null,
        reviewFeedback: null,
      },
    });
    if (!result.count) throw creatorConflict();
    await tx.auditLog.create({
      data: { actorId: userId, targetId: roomId, action: 'creator.room.updated' },
    });
  });
}

export async function saveCreatorTask(
  roomId: string,
  taskId: string | null,
  userId: string,
  payload: unknown,
  version?: string,
) {
  const data = taskInput.parse(payload);
  if (data.roomId !== roomId) throw creatorInvalid('Task không thuộc bài lab này.');
  return prisma.$transaction(async (tx) => {
    const room = await ownedRoom(roomId, userId, tx);
    editable(room);
    let id: string;
    if (taskId) {
      const old = await tx.task.findFirst({ where: { id: taskId, roomId } });
      if (!old) throw creatorMissing();
      const result = await tx.task.updateMany({
        where: { id: taskId, roomId, updatedAt: new Date(version!) },
        data: {
          title: data.title,
          taskOrder: data.taskOrder,
          contentMdx: data.contentMdx,
          ...(data.skillTags && { skillTags: data.skillTags }),
        },
      });
      if (!result.count) throw creatorConflict();
      id = taskId;
    } else id = (await tx.task.create({ data: { ...data, status: 'published' } })).id;
    await tx.room.update({
      where: { id: roomId },
      data: { reviewStatus: 'editing', reviewFingerprint: null, reviewFeedback: null },
    });
    await tx.auditLog.create({
      data: {
        actorId: userId,
        targetId: id,
        action: taskId ? 'creator.task.updated' : 'creator.task.created',
      },
    });
    return id;
  });
}

export async function saveCreatorQuestion(
  roomId: string,
  questionId: string | null,
  userId: string,
  payload: unknown,
  version?: string,
) {
  const data = questionInput.parse(payload);
  return prisma.$transaction(async (tx) => {
    const room = await ownedRoom(roomId, userId, tx);
    editable(room);
    const task = await tx.task.findFirst({ where: { id: data.taskId, roomId } });
    if (!task) throw creatorInvalid('Task không thuộc bài lab này.');
    let id: string;
    if (questionId) {
      const old = await tx.question.findFirst({ where: { id: questionId, task: { roomId } } });
      if (!old) throw creatorMissing();
      const result = await tx.question.updateMany({
        where: { id: questionId, updatedAt: new Date(version!) },
        data: questionData(data, old),
      });
      if (!result.count) throw creatorConflict();
      id = questionId;
    } else
      id = (await tx.question.create({ data: { ...questionData(data), status: 'published' } })).id;
    await tx.room.update({
      where: { id: roomId },
      data: { reviewStatus: 'editing', reviewFingerprint: null, reviewFeedback: null },
    });
    await tx.auditLog.create({
      data: {
        actorId: userId,
        targetId: id,
        action: questionId ? 'creator.question.updated' : 'creator.question.created',
      },
    });
    return id;
  });
}
