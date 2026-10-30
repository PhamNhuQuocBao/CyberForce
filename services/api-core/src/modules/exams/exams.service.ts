import { randomUUID } from 'node:crypto';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { AuthError } from '../auth/auth.service.js';
import { orchestratorRequest } from '../rooms/lab.service.js';
import { FlagValidatorService } from '../submissions/flag-validator.service.js';
import { examEligibility } from './exams.policy.js';

const activeStatuses = ['provisioning', 'running'] as const;
const imagePattern = /^cyberforce\/[a-z0-9][a-z0-9._/-]*:[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
const validator = new FlagValidatorService();

export async function assertNoActiveExam(userId: string) {
  const active = await prisma.examSession.findFirst({
    where: { userId, status: { in: [...activeStatuses] }, expiresAt: { gt: new Date() } },
    select: { id: true },
  });
  if (active) throw new AuthError(423, 'Nội dung học bị khóa trong thời gian thi.', 'EXAM_LOCKED');
}

async function eligibility(exam: { pathId: string }, userId: string) {
  const enrolled = await prisma.pathEnrollment.count({ where: { pathId: exam.pathId, userId } });
  const rooms = await prisma.room.findMany({
    where: {
      pathId: exam.pathId,
      requiredForCapstone: true,
      roomType: { not: 'exam' },
      publishedAt: { lte: new Date() },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      tasks: { select: { questions: { select: { id: true } } } },
    },
  });
  const questionIds = rooms.flatMap((room) =>
    room.tasks.flatMap((task) => task.questions.map((q) => q.id)),
  );
  const solved = await prisma.submission.findMany({
    where: { userId, isCorrect: true, questionId: { in: questionIds } },
    select: { questionId: true },
    distinct: ['questionId'],
  });
  const solvedIds = new Set(solved.map((item) => item.questionId));
  return examEligibility(rooms, solvedIds, enrolled > 0);
}

const examInclude = {
  targets: { orderBy: { orderIndex: 'asc' as const } },
  objectives: { orderBy: { orderIndex: 'asc' as const } },
  path: { select: { title: true, slug: true, isPublished: true } },
};

export async function listExams(userId: string) {
  const exams = await prisma.exam.findMany({
    where: { isPublished: true, path: { isPublished: true } },
    include: { path: { select: { title: true, slug: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return Promise.all(
    exams.map(async (exam) => ({
      id: exam.id,
      slug: exam.slug,
      title: exam.title,
      description: exam.description,
      path: exam.path,
      durationHours: exam.durationHours,
      passingScore: exam.passingScore,
      eligibility: await eligibility(exam, userId),
    })),
  );
}

export async function getExam(slug: string, userId: string) {
  const exam = await prisma.exam.findUnique({ where: { slug }, include: examInclude });
  if (!exam || !exam.isPublished || !exam.path.isPublished)
    throw new AuthError(404, 'Không tìm thấy kỳ thi.', 'EXAM_NOT_FOUND');
  const active = await prisma.examSession.findFirst({
    where: {
      examId: exam.id,
      userId,
      status: { in: [...activeStatuses] },
      expiresAt: { gt: new Date() },
    },
    select: { id: true, status: true, expiresAt: true },
  });
  const recent = await prisma.examSession.findFirst({
    where: { examId: exam.id, userId, status: { in: ['finished', 'expired'] } },
    orderBy: { startedAt: 'desc' },
    select: { startedAt: true, finishedAt: true },
  });
  const retryAt = recent
    ? new Date((recent.finishedAt ?? recent.startedAt).getTime() + 14 * 86400000)
    : null;
  return {
    id: exam.id,
    slug: exam.slug,
    title: exam.title,
    description: exam.description,
    path: { title: exam.path.title, slug: exam.path.slug },
    durationHours: exam.durationHours,
    passingScore: exam.passingScore,
    totalPoints: exam.objectives.reduce((sum, o) => sum + o.points, 0),
    targetCount: exam.targets.length,
    eligibility: await eligibility(exam, userId),
    activeSession: active,
    retryAt: retryAt && retryAt > new Date() ? retryAt : null,
  };
}

export async function startExam(slug: string, userId: string, consent: boolean) {
  if (!consent) throw new AuthError(400, 'Bạn cần đồng ý quy chế thi.', 'EXAM_CONSENT_REQUIRED');
  const exam = await prisma.exam.findUnique({ where: { slug }, include: examInclude });
  if (!exam || !exam.isPublished || !exam.path.isPublished)
    throw new AuthError(404, 'Không tìm thấy kỳ thi.', 'EXAM_NOT_FOUND');
  if (
    ![6, 12, 24].includes(exam.durationHours) ||
    exam.targets.length < 2 ||
    exam.targets.length > 4 ||
    !exam.objectives.length ||
    exam.targets.some((target) => !imagePattern.test(target.image)) ||
    exam.objectives.some(
      (objective) =>
        objective.points <= 0 || !exam.targets.some((target) => target.id === objective.targetId),
    )
  )
    throw new AuthError(409, 'Kỳ thi chưa được cấu hình đầy đủ.', 'EXAM_CONFIG_INVALID');
  const existing = await prisma.examSession.findFirst({
    where: { userId, status: { in: [...activeStatuses] }, expiresAt: { gt: new Date() } },
    select: { id: true, examId: true },
  });
  if (existing) {
    if (existing.examId === exam.id) return getSession(existing.id, userId);
    throw new AuthError(409, 'Bạn đang tham gia kỳ thi khác.', 'EXAM_ALREADY_ACTIVE');
  }
  const progress = await eligibility(exam, userId);
  if (!progress.eligible)
    throw new AuthError(
      403,
      'Chưa hoàn thành các phòng bắt buộc hoặc chưa ghi danh.',
      'EXAM_PREREQUISITES_REQUIRED',
    );
  const peer = await prisma.vpnPeer.findUnique({ where: { userId }, select: { ipAddress: true } });
  if (!peer)
    throw new AuthError(409, 'Thiết lập VPN trước khi bắt đầu kỳ thi.', 'EXAM_VPN_REQUIRED');
  const lab = await prisma.labInstance.findFirst({
    where: { userId, status: { in: ['provisioning', 'running', 'terminating'] } },
    select: { id: true },
  });
  if (lab)
    throw new AuthError(409, 'Kết thúc lab đang chạy trước khi bắt đầu kỳ thi.', 'EXAM_LAB_ACTIVE');
  const last = await prisma.examSession.findFirst({
    where: { examId: exam.id, userId, status: { in: ['finished', 'expired'] } },
    orderBy: { startedAt: 'desc' },
    select: { startedAt: true, finishedAt: true },
  });
  if (last && (last.finishedAt ?? last.startedAt).getTime() + 14 * 86400000 > Date.now())
    throw new AuthError(429, 'Chưa đến thời điểm thi lại.', 'EXAM_RETRY_COOLDOWN');
  const stale = await prisma.examSession.findMany({
    where: { userId, status: { in: [...activeStatuses] }, expiresAt: { lte: new Date() } },
    select: { id: true },
  });
  for (const session of stale) await expireSession(session.id);
  const id = randomUUID();
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + exam.durationHours * 3600000);
  try {
    await prisma.examSession.create({
      data: { id, examId: exam.id, userId, consentedAt: startedAt, startedAt, expiresAt },
    });
  } catch (error) {
    const racing = await prisma.examSession.findFirst({
      where: { examId: exam.id, userId, status: { in: [...activeStatuses] } },
      orderBy: { startedAt: 'desc' },
      select: { id: true },
    });
    if (racing) return getSession(racing.id, userId);
    throw error;
  }
  try {
    const response = await orchestratorRequest('/v1/exams', 'POST', {
      sessionId: id,
      targets: exam.targets.map((target) => ({ name: target.name, image: target.image })),
    });
    const result = (await response.json()) as {
      sessionId?: string;
      targets?: { name: string; targetIp: string; containerId: string }[];
    };
    if (
      result.sessionId !== id ||
      result.targets?.length !== exam.targets.length ||
      result.targets.some(
        (target, index) =>
          target.name !== exam.targets[index].name ||
          !/^100\.(6[4-9]|[7-9][0-9]|1[01][0-9]|12[0-7])\.\d{1,3}\.\d{1,3}$/.test(
            target.targetIp,
          ) ||
          !target.containerId,
      )
    )
      throw new Error('invalid exam range');
    await orchestratorRequest(`/v1/exams/${id}/vpn-network`, 'POST');
    const grant = await fetch(`${env.VPN_GATEWAY_URL.replace(/\/$/, '')}/v1/access/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${env.VPN_GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        peerIp: peer.ipAddress,
        targetIps: result.targets.map((target) => target.targetIp),
        expiresAt: expiresAt.toISOString(),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!grant.ok) throw new Error(`VPN grant returned ${grant.status}`);
    await prisma.examSession.update({
      where: { id },
      data: {
        status: 'running',
        targetInfo: result.targets.map((target, index) => ({
          ...target,
          id: exam.targets[index].id,
        })),
      },
    });
    return getSession(id, userId);
  } catch (error) {
    try {
      await orchestratorRequest(`/v1/exams/${id}`, 'DELETE');
    } catch (cleanupError) {
      console.error('Exam cleanup failed', cleanupError);
    }
    await prisma.examSession.update({
      where: { id },
      data: { status: 'failed', finishedAt: new Date() },
    });
    throw error;
  }
}

export async function getSession(id: string, userId: string) {
  const session = await prisma.examSession.findFirst({
    where: { id, userId },
    include: {
      exam: { include: { objectives: { orderBy: { orderIndex: 'asc' } } } },
      submissions: { select: { objectiveId: true, createdAt: true } },
    },
  });
  if (!session) throw new AuthError(404, 'Không tìm thấy phiên thi.', 'EXAM_SESSION_NOT_FOUND');
  if (
    activeStatuses.includes(session.status as 'running' | 'provisioning') &&
    session.expiresAt <= new Date()
  ) {
    await expireSession(session.id);
    return getSession(id, userId);
  }
  const status = session.status;
  return {
    id: session.id,
    exam: {
      slug: session.exam.slug,
      title: session.exam.title,
      passingScore: session.exam.passingScore,
    },
    status,
    startedAt: session.startedAt,
    expiresAt: session.expiresAt,
    finishedAt: session.finishedAt,
    serverTime: new Date(),
    score: session.score,
    totalPoints: session.exam.objectives.reduce((sum, objective) => sum + objective.points, 0),
    targets: Array.isArray(session.targetInfo)
      ? (session.targetInfo as { id: string; name: string; targetIp: string }[]).map(
          ({ id: targetId, name, targetIp }) => ({ id: targetId, name, targetIp }),
        )
      : null,
    objectives: session.exam.objectives.map(({ id, targetId, title, description, points }) => ({
      id,
      targetId,
      title,
      description,
      points,
    })),
    submissions: session.submissions,
    passed:
      status === 'finished' || status === 'expired'
        ? session.score >= session.exam.passingScore
        : null,
  };
}

export async function submitExamFlag(
  id: string,
  userId: string,
  objectiveId: string,
  answer: string,
) {
  const session = await prisma.examSession.findFirst({
    where: { id, userId },
    include: { exam: { include: { objectives: true } } },
  });
  if (!session) throw new AuthError(404, 'Không tìm thấy phiên thi.', 'EXAM_SESSION_NOT_FOUND');
  if (session.status !== 'running' || session.expiresAt <= new Date())
    throw new AuthError(409, 'Phiên thi đã kết thúc.', 'EXAM_ENDED');
  const objective = session.exam.objectives.find((item) => item.id === objectiveId);
  if (!objective) throw new AuthError(404, 'Không tìm thấy nhiệm vụ.', 'EXAM_OBJECTIVE_NOT_FOUND');
  const existing = await prisma.examSubmission.findUnique({
    where: { sessionId_objectiveId: { sessionId: id, objectiveId } },
  });
  if (existing) return { accepted: true, alreadySubmitted: true, score: session.score };
  if (!validator.validate(answer, { flagType: 'static', answerHash: objective.answerHash }))
    return { accepted: false, alreadySubmitted: false, score: session.score };
  try {
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.examSession.findFirst({
        where: { id, userId, status: 'running', expiresAt: { gt: new Date() } },
        select: { id: true },
      });
      if (!current) throw new AuthError(409, 'Phiên thi đã kết thúc.', 'EXAM_ENDED');
      await tx.examSubmission.create({ data: { sessionId: id, objectiveId } });
      const updated = await tx.examSession.updateMany({
        where: { id, userId, status: 'running', expiresAt: { gt: new Date() } },
        data: { score: { increment: objective.points } },
      });
      if (!updated.count) throw new AuthError(409, 'Phiên thi đã kết thúc.', 'EXAM_ENDED');
      return (await tx.examSession.findUniqueOrThrow({ where: { id }, select: { score: true } }))
        .score;
    });
    return { accepted: true, alreadySubmitted: false, score: result };
  } catch (error) {
    const duplicate = await prisma.examSubmission.findUnique({
      where: { sessionId_objectiveId: { sessionId: id, objectiveId } },
    });
    if (duplicate)
      return {
        accepted: true,
        alreadySubmitted: true,
        score: (await prisma.examSession.findUniqueOrThrow({ where: { id } })).score,
      };
    throw error;
  }
}

export async function finishExam(id: string, userId: string) {
  const result = await prisma.examSession.updateMany({
    where: { id, userId, status: 'running', expiresAt: { gt: new Date() } },
    data: { status: 'finished', finishedAt: new Date() },
  });
  if (!result.count) {
    const session = await prisma.examSession.findFirst({
      where: { id, userId },
      select: { status: true, expiresAt: true },
    });
    if (!session) throw new AuthError(404, 'Không tìm thấy phiên thi.', 'EXAM_SESSION_NOT_FOUND');
    if (session.status === 'running' && session.expiresAt <= new Date()) {
      await expireSession(id);
      return getSession(id, userId);
    }
    if (session.status !== 'finished' && session.status !== 'expired')
      throw new AuthError(409, 'Phiên thi chưa sẵn sàng.', 'EXAM_NOT_RUNNING');
  }
  try {
    await orchestratorRequest(`/v1/exams/${id}`, 'DELETE');
    await prisma.examSession.update({ where: { id }, data: { rangeStoppedAt: new Date() } });
  } catch (error) {
    console.error('Exam range cleanup will retry', error);
  }
  return getSession(id, userId);
}

export async function expireSession(id: string) {
  await prisma.examSession.updateMany({
    where: { id, status: { in: [...activeStatuses] }, expiresAt: { lte: new Date() } },
    data: { status: 'expired', finishedAt: new Date() },
  });
  try {
    await orchestratorRequest(`/v1/exams/${id}`, 'DELETE');
    await prisma.examSession.update({ where: { id }, data: { rangeStoppedAt: new Date() } });
  } catch (error) {
    console.error('Expired exam cleanup will retry', error);
  }
}

export async function sweepExams() {
  await prisma.examSession.updateMany({
    where: { status: 'provisioning', startedAt: { lt: new Date(Date.now() - 120000) } },
    data: { status: 'failed', finishedAt: new Date() },
  });
  const expired = await prisma.examSession.findMany({
    where: {
      OR: [
        { status: { in: [...activeStatuses] }, expiresAt: { lte: new Date() } },
        { status: { in: ['finished', 'expired', 'failed'] }, rangeStoppedAt: null },
      ],
    },
    select: { id: true },
    take: 100,
  });
  for (const session of expired) await expireSession(session.id);
}
