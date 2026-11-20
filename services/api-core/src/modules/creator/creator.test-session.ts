import { randomBytes, randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redis.js';
import { AuthError } from '../auth/auth.service.js';
import { assertImageAvailable, requirePublishable } from '../cms/cms.service.js';
import { orchestratorRequest, withUserLock } from '../rooms/lab.service.js';
import { syncVpnAccess } from '../vpn/vpn.access.js';
import {
  FlagValidatorService,
  createDynamicFlag,
  requirePlatformMasterKey,
} from '../submissions/flag-validator.service.js';
import {
  ownedRoom,
  editable,
  roomFingerprint,
  creatorInvalid,
  creatorMissing,
  creatorConflict,
} from './creator.content.js';

const validator = new FlagValidatorService();
const active = ['provisioning', 'running', 'terminating'] as const;
const imagePattern = /^cyberforce\/[a-z0-9][a-z0-9._/-]*:[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

function labSpec(value: Prisma.JsonValue) {
  const spec = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const image = typeof spec.image === 'string' ? spec.image : '';
  if (!imagePattern.test(image))
    throw creatorInvalid('Bài lab cần Docker image hợp lệ để chạy thử.');
  return {
    image,
    cpuMillicores: typeof spec.cpuMillicores === 'number' ? spec.cpuMillicores : 2000,
    memoryMb: typeof spec.memoryMb === 'number' ? spec.memoryMb : 2048,
    ports: Array.isArray(spec.ports)
      ? spec.ports.filter((port): port is number => typeof port === 'number')
      : [],
  };
}

async function latestRun(roomId: string, userId: string) {
  await ownedRoom(roomId, userId);
  return prisma.creatorTestRun.findFirst({
    where: { roomId, userId },
    orderBy: { createdAt: 'desc' },
    include: { labInstance: true },
  });
}

export async function creatorTestStatus(roomId: string, userId: string) {
  const run = await latestRun(roomId, userId);
  const fingerprint = await roomFingerprint(roomId);
  const required = await prisma.question.findMany({
    where: { task: { roomId, status: 'published' }, status: 'published' },
    select: { id: true },
  });
  const verified = Array.isArray(run?.verifiedQuestionIds)
    ? run.verifiedQuestionIds.filter((id): id is string => typeof id === 'string')
    : [];
  return {
    instanceId: run?.labInstanceId ?? null,
    targetIp: run?.labInstance.ipAddress ?? null,
    status: run?.labInstance.status ?? 'not_started',
    expiresAt: run?.expiresAt ?? null,
    validRevision: Boolean(run && run.fingerprint === fingerprint),
    verifiedQuestionIds: verified,
    verifiedCount:
      run?.fingerprint === fingerprint ? required.filter((q) => verified.includes(q.id)).length : 0,
    requiredCount: required.length,
    passed: Boolean(
      run &&
      run.expiresAt > new Date() &&
      run.fingerprint === fingerprint &&
      required.length > 0 &&
      required.every((q) => verified.includes(q.id)),
    ),
  };
}

export async function startCreatorTest(roomId: string, userId: string) {
  return withUserLock(userId, async () => {
    const room = await ownedRoom(roomId, userId);
    editable(room);
    const existing = await prisma.labInstance.findFirst({
      where: { userId, status: { in: [...active] }, expiresAt: { gt: new Date() } },
    });
    if (existing)
      throw new AuthError(
        409,
        'Bạn đã có máy lab đang chạy. Hãy dừng phiên đó trước.',
        'LAB_ALREADY_ACTIVE',
      );
    const questions = await prisma.question.findMany({
      where: { task: { roomId, status: 'published' }, status: 'published' },
    });
    if (!questions.length) throw creatorInvalid('Thêm ít nhất một câu hỏi trước khi chạy thử.');
    if (
      questions.some(
        (question) =>
          question.pointsReward <= 0 ||
          (question.flagType === 'static' && !question.answerHash) ||
          (question.flagType === 'regex' && !question.flagPattern),
      )
    )
      throw creatorInvalid('Mỗi câu hỏi cần cờ và EXP hợp lệ.');
    const spec = labSpec(room.targetTemplateSpec);
    await assertImageAvailable(spec.image);
    const fingerprint = await roomFingerprint(roomId);
    const instanceId = randomUUID();
    const dynamicSalt = randomBytes(16).toString('hex');
    const dynamicFlag = questions.some((question) => question.flagType === 'dynamic_hmac')
      ? createDynamicFlag({
          userId,
          roomId,
          instanceSalt: dynamicSalt,
          masterKey: requirePlatformMasterKey(env.PLATFORM_MASTER_KEY),
        })
      : undefined;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await prisma.$transaction(async (tx) => {
      await tx.labInstance.create({
        data: {
          id: instanceId,
          roomId,
          userId,
          instanceType: 'creator_test',
          ipAddress: '0.0.0.0',
          dynamicSalt,
          expiresAt,
        },
      });
      await tx.creatorTestRun.create({
        data: { roomId, userId, labInstanceId: instanceId, fingerprint, expiresAt },
      });
    });
    try {
      const response = await orchestratorRequest('/v1/instances', 'POST', {
        instanceId,
        ...spec,
        ...(dynamicFlag && { dynamicFlag }),
      });
      const data = (await response.json()) as {
        instanceId?: string;
        containerId?: string;
        targetIp?: string;
      };
      if (
        data.instanceId !== instanceId ||
        !data.containerId ||
        !/^100\.(6[4-9]|[7-9][0-9]|1[01][0-9]|12[0-7])\.\d{1,3}\.\d{1,3}$/.test(data.targetIp ?? '')
      )
        throw new Error('Invalid orchestrator response');
      await prisma.labInstance.update({
        where: { id: instanceId },
        data: { status: 'running', ipAddress: data.targetIp!, containerId: data.containerId },
      });
      await syncVpnAccess(userId);
      await prisma.auditLog.create({
        data: { actorId: userId, targetId: roomId, action: 'creator.test.started' },
      });
      return creatorTestStatus(roomId, userId);
    } catch (error) {
      await orchestratorRequest(`/v1/instances/${instanceId}`, 'DELETE').catch(() => {});
      await prisma.labInstance.update({
        where: { id: instanceId },
        data: { status: 'terminated' },
      });
      throw error;
    }
  });
}

export async function stopCreatorTest(roomId: string, userId: string) {
  return withUserLock(userId, async () => {
    const run = await latestRun(roomId, userId);
    if (!run || !active.includes(run.labInstance.status as (typeof active)[number]))
      throw creatorMissing();
    await prisma.labInstance.update({
      where: { id: run.labInstanceId },
      data: { status: 'terminating' },
    });
    await orchestratorRequest(`/v1/instances/${run.labInstanceId}`, 'DELETE');
    await prisma.labInstance.update({
      where: { id: run.labInstanceId },
      data: { status: 'terminated' },
    });
    return creatorTestStatus(roomId, userId);
  });
}

export async function checkCreatorFlag(
  roomId: string,
  questionId: string,
  userId: string,
  answer: string,
) {
  const run = await latestRun(roomId, userId);
  if (!run || run.labInstance.status !== 'running' || run.expiresAt <= new Date())
    throw creatorInvalid('Chạy thử lab trước khi kiểm tra cờ.');
  if (run.fingerprint !== (await roomFingerprint(roomId)))
    throw creatorInvalid('Nội dung đã sửa sau khi chạy thử. Hãy chạy lại.');
  const question = await prisma.question.findFirst({
    where: { id: questionId, task: { roomId, status: 'published' }, status: 'published' },
  });
  if (!question) throw creatorMissing();
  let correct: boolean;
  try {
    correct =
      question.flagType === 'static'
        ? validator.validate(answer, { flagType: 'static', answerHash: question.answerHash })
        : question.flagType === 'regex'
          ? validator.validate(answer, { flagType: 'regex', flagPattern: question.flagPattern })
          : validator.validate(answer, {
              flagType: 'dynamic_hmac',
              userId,
              roomId,
              instanceSalt: run.labInstance.dynamicSalt,
              masterKey: requirePlatformMasterKey(env.PLATFORM_MASTER_KEY),
            });
  } catch {
    throw creatorInvalid('Cấu hình cờ không hợp lệ.');
  }
  if (correct)
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM creator_test_runs WHERE id = ${run.id}::uuid FOR UPDATE`;
      const current = await tx.creatorTestRun.findUniqueOrThrow({ where: { id: run.id } });
      const verified = Array.isArray(current.verifiedQuestionIds)
        ? current.verifiedQuestionIds.filter((id): id is string => typeof id === 'string')
        : [];
      if (!verified.includes(questionId))
        await tx.creatorTestRun.update({
          where: { id: run.id },
          data: { verifiedQuestionIds: [...verified, questionId] },
        });
    });
  return { correct, ...(await creatorTestStatus(roomId, userId)) };
}

export async function submitCreatorReview(roomId: string, userId: string) {
  const room = await ownedRoom(roomId, userId);
  editable(room);
  const test = await creatorTestStatus(roomId, userId);
  if (!test.passed) throw creatorInvalid('Chạy thử lab và xác minh tất cả cờ trước khi gửi duyệt.');
  const fingerprint = await roomFingerprint(roomId);
  return prisma.$transaction(async (tx) => {
    const current = await ownedRoom(roomId, userId, tx);
    editable(current);
    if (fingerprint !== (await roomFingerprint(roomId, tx)))
      throw creatorInvalid('Nội dung đã thay đổi. Hãy chạy thử lại.');
    const updated = await tx.room.update({
      where: { id: roomId },
      data: {
        reviewStatus: 'pending_review',
        reviewFingerprint: fingerprint,
        reviewSubmittedAt: new Date(),
        reviewFeedback: null,
      },
    });
    await tx.auditLog.create({
      data: { actorId: userId, targetId: roomId, action: 'creator.review.submitted' },
    });
    return { reviewStatus: updated.reviewStatus, reviewSubmittedAt: updated.reviewSubmittedAt };
  });
}

export async function adminReviewQueue() {
  return prisma.room.findMany({
    where: { creatorId: { not: null }, reviewStatus: 'pending_review' },
    orderBy: { reviewSubmittedAt: 'asc' },
    select: {
      id: true,
      title: true,
      slug: true,
      reviewSubmittedAt: true,
      reviewFingerprint: true,
      targetTemplateSpec: true,
      creator: { select: { username: true } },
      creatorTestRuns: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { fingerprint: true, verifiedQuestionIds: true, createdAt: true },
      },
      tasks: {
        select: {
          id: true,
          title: true,
          contentMdx: true,
          questions: {
            select: { id: true, questionText: true, flagType: true, pointsReward: true },
          },
        },
      },
    },
  });
}

export async function decideCreatorReview(
  roomId: string,
  reviewerId: string,
  decision: 'approved' | 'changes_requested' | 'rejected',
  feedback?: string,
) {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room || !room.creatorId || room.reviewStatus !== 'pending_review') throw creatorMissing();
  if (room.reviewFingerprint !== (await roomFingerprint(roomId)))
    throw creatorInvalid('Bài đã đổi sau khi gửi. Yêu cầu Creator gửi lại.');
  if (decision !== 'approved' && !feedback?.trim())
    throw creatorInvalid('Cần nhập nhận xét khi yêu cầu sửa hoặc từ chối.');
  if (decision === 'approved') {
    const spec = labSpec(room.targetTemplateSpec);
    await assertImageAvailable(spec.image);
  }
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM rooms WHERE id = ${roomId}::uuid FOR UPDATE`;
    const current = await tx.room.findUniqueOrThrow({ where: { id: roomId } });
    if (
      current.reviewStatus !== 'pending_review' ||
      current.reviewFingerprint !== (await roomFingerprint(roomId, tx))
    )
      throw creatorConflict();
    if (decision === 'approved') await requirePublishable(tx, 'rooms', roomId);
    const updated = await tx.room.update({
      where: { id: roomId },
      data: {
        reviewStatus: decision,
        reviewFeedback: feedback?.trim() ?? null,
        ...(decision === 'approved' && { status: 'published', publishedAt: new Date() }),
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: reviewerId,
        targetId: roomId,
        action: `creator.review.${decision}`,
        details: { feedback: feedback?.trim() ?? null },
      },
    });
    return { id: updated.id, reviewStatus: updated.reviewStatus, status: updated.status };
  });
}

export async function issueCreatorTerminalTicket(
  roomId: string,
  userId: string,
  jti?: string,
  exp?: number,
) {
  if (!jti || !exp) throw new AuthError(401, 'Phiên đăng nhập không hợp lệ.', 'INVALID_TOKEN');
  const run = await latestRun(roomId, userId);
  if (!run || run.labInstance.status !== 'running' || run.expiresAt <= new Date())
    throw creatorMissing();
  const ticket = randomBytes(32).toString('hex');
  await redis.set(
    `creator:terminal:${ticket}`,
    JSON.stringify({ roomId, userId, instanceId: run.labInstanceId, jti, exp }),
    'EX',
    30,
  );
  return { ticket, expiresInSeconds: 30 };
}
