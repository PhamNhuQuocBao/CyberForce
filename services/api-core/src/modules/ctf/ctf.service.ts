import { createHash } from 'node:crypto';
import { prisma } from '../../lib/prisma.js';
import { AuthError } from '../auth/auth.service.js';
import { FlagValidatorService } from '../submissions/flag-validator.service.js';

const validator = new FlagValidatorService();
const missing = () => new AuthError(404, 'Không tìm thấy giải CTF.', 'CTF_NOT_FOUND');

export type CreateEventInput = {
  slug: string;
  title: string;
  description: string;
  startsAt: Date;
  endsAt: Date;
  freezeAt?: Date;
};

export async function createEvent(input: CreateEventInput) {
  if (
    input.startsAt <= new Date() ||
    input.endsAt <= input.startsAt ||
    (input.freezeAt && (input.freezeAt <= input.startsAt || input.freezeAt >= input.endsAt))
  )
    throw new AuthError(400, 'Thời gian giải đấu không hợp lệ.', 'CTF_TIME_INVALID');
  return prisma.ctfEvent.create({ data: input });
}

export async function addChallenge(
  eventId: string,
  input: { title: string; description: string; points: number; flag: string; orderIndex: number },
) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM ctf_events WHERE id = ${eventId}::uuid FOR UPDATE`;
    const event = await tx.ctfEvent.findUnique({ where: { id: eventId } });
    if (!event) throw missing();
    if (event.publishedAt || event.startsAt <= new Date())
      throw new AuthError(409, 'Không thể sửa câu hỏi sau khi mở giải.', 'CTF_LOCKED');
    const flagHash = `sha256:${createHash('sha256').update(input.flag).digest('hex')}`;
    const { flag: _flag, ...safeInput } = input;
    void _flag;
    return tx.ctfChallenge.create({
      data: { ...safeInput, eventId, flagHash },
      select: { id: true, title: true, description: true, points: true, orderIndex: true },
    });
  });
}

export async function publishEvent(eventId: string) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM ctf_events WHERE id = ${eventId}::uuid FOR UPDATE`;
    const event = await tx.ctfEvent.findUnique({
      where: { id: eventId },
      include: { _count: { select: { challenges: true } } },
    });
    if (!event) throw missing();
    if (event.startsAt <= new Date() || event._count.challenges === 0)
      throw new AuthError(409, 'Giải cần có câu hỏi và chưa bắt đầu.', 'CTF_NOT_READY');
    return tx.ctfEvent.update({
      where: { id: eventId },
      data: { publishedAt: event.publishedAt ?? new Date() },
      select: { id: true, slug: true, publishedAt: true },
    });
  });
}

export async function unfreezeEvent(eventId: string) {
  const event = await prisma.ctfEvent.findUnique({ where: { id: eventId } });
  if (!event) throw missing();
  if (!event.freezeAt || event.endsAt > new Date())
    throw new AuthError(409, 'Chỉ mở bảng điểm sau khi giải kết thúc.', 'CTF_NOT_ENDED');
  return prisma.ctfEvent.update({
    where: { id: eventId },
    data: { unfrozenAt: event.unfrozenAt ?? new Date() },
    select: { id: true, unfrozenAt: true },
  });
}

export async function listEvents() {
  return prisma.ctfEvent.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { startsAt: 'desc' },
    select: { id: true, slug: true, title: true, description: true, startsAt: true, endsAt: true },
  });
}

export async function getEvent(slug: string, userId?: string) {
  const event = await prisma.ctfEvent.findUnique({
    where: { slug },
    include: {
      challenges: {
        orderBy: [{ orderIndex: 'asc' }, { id: 'asc' }],
        select: { id: true, title: true, description: true, points: true, orderIndex: true },
      },
    },
  });
  if (!event?.publishedAt) throw missing();
  const now = new Date();
  const participant = userId
    ? await prisma.ctfParticipant.findUnique({
        where: { eventId_userId: { eventId: event.id, userId } },
      })
    : null;
  const solvedIds = participant
    ? (
        await prisma.ctfSolve.findMany({
          where: { userId, challenge: { eventId: event.id } },
          select: { challengeId: true },
        })
      ).map((solve) => solve.challengeId)
    : [];
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    frozen: Boolean(event.freezeAt && now >= event.freezeAt && !event.unfrozenAt),
    joined: Boolean(participant),
    solvedIds,
    challenges: now >= event.startsAt ? event.challenges : [],
  };
}

export async function joinEvent(slug: string, userId: string) {
  const event = await prisma.ctfEvent.findUnique({ where: { slug } });
  if (!event?.publishedAt) throw missing();
  if (event.endsAt <= new Date()) throw new AuthError(409, 'Giải đấu đã kết thúc.', 'CTF_ENDED');
  await prisma.ctfParticipant.upsert({
    where: { eventId_userId: { eventId: event.id, userId } },
    create: { eventId: event.id, userId },
    update: {},
  });
  return { joined: true };
}

export async function submitFlag(
  slug: string,
  challengeId: string,
  userId: string,
  answer: string,
) {
  const event = await prisma.ctfEvent.findUnique({ where: { slug } });
  if (!event?.publishedAt) throw missing();
  return prisma.$transaction(async (tx) => {
    // One event lock serializes accepted solves and the boundary time used for ranking.
    await tx.$queryRaw`SELECT id FROM ctf_events WHERE id = ${event.id}::uuid FOR UPDATE`;
    const now = new Date();
    if (now < event.startsAt || now >= event.endsAt)
      throw new AuthError(409, 'Giải đấu chưa mở hoặc đã kết thúc.', 'CTF_CLOSED');
    const participant = await tx.ctfParticipant.findUnique({
      where: { eventId_userId: { eventId: event.id, userId } },
    });
    if (!participant) throw new AuthError(403, 'Hãy tham gia giải trước.', 'CTF_JOIN_REQUIRED');
    const challenge = await tx.ctfChallenge.findFirst({
      where: { id: challengeId, eventId: event.id },
    });
    if (!challenge) throw new AuthError(404, 'Không tìm thấy câu hỏi.', 'CTF_CHALLENGE_NOT_FOUND');
    const previous = await tx.ctfSolve.findUnique({
      where: { challengeId_userId: { challengeId, userId } },
    });
    if (previous)
      return {
        status: 'duplicate',
        points: 0,
        frozen: Boolean(event.freezeAt && now >= event.freezeAt && !event.unfrozenAt),
      };
    if (!validator.validate(answer, { flagType: 'static', answerHash: challenge.flagHash }))
      return {
        status: 'incorrect',
        points: 0,
        frozen: Boolean(event.freezeAt && now >= event.freezeAt && !event.unfrozenAt),
      };
    await tx.ctfSolve.create({ data: { challengeId, userId, solvedAt: now } });
    return {
      status: 'accepted',
      points: challenge.points,
      frozen: Boolean(event.freezeAt && now >= event.freezeAt && !event.unfrozenAt),
    };
  });
}

export async function getChallengeScore(challengeId: string) {
  const challenge = await prisma.ctfChallenge.findUnique({
    where: { id: challengeId },
    include: { event: true },
  });
  if (!challenge?.event.publishedAt || challenge.event.startsAt > new Date())
    throw new AuthError(404, 'Không tìm thấy câu hỏi.', 'CTF_CHALLENGE_NOT_FOUND');
  return { challengeId, points: challenge.points };
}

export async function getLeaderboard(slug: string) {
  const event = await prisma.ctfEvent.findUnique({ where: { slug } });
  if (!event?.publishedAt) throw missing();
  const now = new Date();
  const frozen = Boolean(event.freezeAt && now >= event.freezeAt && !event.unfrozenAt);
  const cutoff = frozen ? event.freezeAt! : now;
  const timeFilter = frozen ? { lt: cutoff } : { lte: cutoff };
  const [participants, solves] = await prisma.$transaction([
    prisma.ctfParticipant.findMany({
      where: { eventId: event.id, joinedAt: timeFilter },
      include: { user: { select: { username: true } } },
    }),
    prisma.ctfSolve.findMany({
      where: { challenge: { eventId: event.id }, solvedAt: timeFilter },
      include: { challenge: { select: { points: true } } },
      orderBy: [{ solvedAt: 'asc' }, { id: 'asc' }],
    }),
  ]);
  const progress = new Map<string, { score: number; reachedAt: Date; solved: number }>();
  for (const solve of solves) {
    const previous = progress.get(solve.userId);
    progress.set(solve.userId, {
      score: (previous?.score ?? 0) + solve.challenge.points,
      reachedAt: solve.solvedAt,
      solved: (previous?.solved ?? 0) + 1,
    });
  }
  const rows = participants.map((participant) => {
    const own = progress.get(participant.userId);
    return {
      username: participant.user.username,
      score: own?.score ?? 0,
      reachedAt: own?.reachedAt ?? null,
      solved: own?.solved ?? 0,
    };
  });
  rows.sort(
    (a, b) =>
      b.score - a.score ||
      (a.reachedAt?.getTime() ?? Infinity) - (b.reachedAt?.getTime() ?? Infinity) ||
      a.username.localeCompare(b.username),
  );
  let previousRank = 0;
  return {
    frozen,
    freezeAt: frozen ? event.freezeAt : null,
    entries: rows.map((row, index) => {
      if (
        index === 0 ||
        row.score !== rows[index - 1].score ||
        row.reachedAt?.getTime() !== rows[index - 1].reachedAt?.getTime()
      )
        previousRank = index + 1;
      return { rank: previousRank, ...row };
    }),
  };
}
