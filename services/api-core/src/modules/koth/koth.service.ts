import { randomBytes, timingSafeEqual } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redis.js';
import { AuthError } from '../auth/auth.service.js';

const TICK_MS = 60_000;
const MATCH_MS = 45 * TICK_MS;
const scoreKey = (id: string) => `koth:match_${id}:scores`;
const eventChannel = (id: string) => `koth:match_${id}:events`;
const ticketKey = (ticket: string) => `koth:ticket:${ticket}`;
const tickMarker = (id: string, tick: number) => `koth:match_${id}:tick:${tick}`;
const eventMarker = (id: string, tick: number) => `koth:match_${id}:event:${tick}`;
const publishScript = `if redis.call('SET', KEYS[1], '1', 'NX', 'EX', 86400) then return redis.call('PUBLISH', KEYS[2], ARGV[1]) end return 0`;
const updateScript = `
if redis.call('SET', KEYS[2], '1', 'NX', 'EX', 86400) then
  local current = tonumber(redis.call('ZSCORE', KEYS[1], ARGV[1]) or '0')
  local expected = tonumber(ARGV[2])
  if current < expected then
    local updated = tonumber(redis.call('ZINCRBY', KEYS[1], 10, ARGV[1]))
    if updated < expected then redis.call('ZADD', KEYS[1], expected, ARGV[1]) end
  end
  return 1
end
return 0`;

export function requireRunnerToken(value: string | undefined) {
  if (
    env.NODE_ENV === 'production' &&
    env.ORCHESTRATOR_TOKEN === 'cyberforce_local_orchestrator_token_2026'
  )
    throw new AuthError(503, 'KotH runner chưa được cấu hình.', 'KOTH_UNAVAILABLE');
  const expected = Buffer.from(`Bearer ${env.ORCHESTRATOR_TOKEN}`);
  const actual = Buffer.from(value ?? '');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
    throw new AuthError(401, 'Unauthorized', 'UNAUTHORIZED');
}

export async function createMatch(
  input: { roomId: string; instanceId: string; userIds: string[] },
  organizerId: string,
) {
  const uniqueIds = [...new Set(input.userIds)];
  if (uniqueIds.length < 4 || uniqueIds.length > 10 || uniqueIds.length !== input.userIds.length)
    throw new AuthError(
      400,
      'Trận KotH cần 4 đến 10 người chơi khác nhau.',
      'INVALID_PARTICIPANTS',
    );
  const [room, instance, users] = await Promise.all([
    prisma.room.findUnique({ where: { id: input.roomId }, select: { roomType: true } }),
    prisma.labInstance.findUnique({
      where: { id: input.instanceId },
      select: { roomId: true, userId: true, status: true, expiresAt: true },
    }),
    prisma.user.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true, username: true },
    }),
  ]);
  if (
    room?.roomType !== 'koth' ||
    instance?.roomId !== input.roomId ||
    instance.userId !== organizerId ||
    instance.status !== 'running'
  )
    throw new AuthError(409, 'Máy mục tiêu KotH chưa sẵn sàng.', 'KOTH_TARGET_UNAVAILABLE');
  if (users.length !== uniqueIds.length)
    throw new AuthError(400, 'Người chơi không hợp lệ.', 'INVALID_PARTICIPANTS');
  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + MATCH_MS);
  if (instance.expiresAt < endsAt)
    throw new AuthError(409, 'Máy mục tiêu phải hoạt động ít nhất 45 phút.', 'KOTH_TARGET_LEASE');
  const match = await prisma.kothMatch.create({
    data: {
      roomId: input.roomId,
      instanceId: input.instanceId,
      startsAt,
      endsAt,
      participants: { create: users.map((user) => ({ userId: user.id, username: user.username })) },
    },
    select: { id: true, startsAt: true, endsAt: true },
  });
  return match;
}

export async function requireParticipant(matchId: string, userId: string) {
  const match = await prisma.kothMatch.findUnique({
    where: { id: matchId },
    select: { id: true, endsAt: true },
  });
  if (!match) throw new AuthError(404, 'Không tìm thấy trận KotH.', 'KOTH_NOT_FOUND');
  const member = await prisma.kothParticipant.findUnique({
    where: { matchId_userId: { matchId, userId } },
  });
  if (!member) throw new AuthError(403, 'Bạn không tham gia trận KotH này.', 'FORBIDDEN');
  return match;
}

export async function getScoreboard(matchId: string, userId: string) {
  await requireParticipant(matchId, userId);
  return readScoreboard(matchId);
}

export async function readScoreboard(matchId: string) {
  const participants = await prisma.kothParticipant.findMany({
    where: { matchId },
    select: { userId: true, username: true },
  });
  const ticks = await prisma.kothTick.groupBy({
    by: ['userId'],
    where: { matchId, status: 'credited', userId: { not: null } },
    _count: { _all: true },
  });
  const scoreByUser = new Map(ticks.map((tick) => [tick.userId, tick._count._all * 10]));
  const scores = participants.map((p) => ({
    userId: p.userId,
    username: p.username,
    score: scoreByUser.get(p.userId) ?? 0,
  }));
  scores.sort((a, b) => b.score - a.score || a.username.localeCompare(b.username));
  if (scores.length)
    await redis.zadd(
      scoreKey(matchId),
      'GT',
      ...scores.flatMap((score) => [score.score, score.userId]),
    );
  return scores;
}

export async function issueScoreboardTicket(
  matchId: string,
  userId: string,
  jti?: string,
  exp?: number,
) {
  await requireParticipant(matchId, userId);
  if (!jti || !exp) throw new AuthError(401, 'Phiên đăng nhập không hợp lệ.', 'INVALID_TOKEN');
  const ticket = randomBytes(32).toString('hex');
  await redis.set(ticketKey(ticket), JSON.stringify({ matchId, userId, jti, exp }), 'EX', 30);
  return { ticket, expiresInSeconds: 30 };
}

export async function consumeScoreboardTicket(ticket: string, matchId: string) {
  if (!/^[0-9a-f]{64}$/.test(ticket)) return null;
  const raw = await redis.getdel(ticketKey(ticket));
  if (!raw) return null;
  const claims = JSON.parse(raw) as { matchId: string; userId: string; jti: string; exp: number };
  if (
    claims.matchId !== matchId ||
    claims.exp * 1000 <= Date.now() ||
    (await redis.get(`auth:blacklist:${claims.jti}`))
  )
    return null;
  await requireParticipant(matchId, claims.userId);
  return claims;
}

export async function dueTicks(now = Date.now()) {
  const matches = await prisma.kothMatch.findMany({
    where: { startsAt: { lte: new Date(now - TICK_MS) }, endsAt: { gte: new Date(now - 5000) } },
    select: { id: true, instanceId: true, startsAt: true, endsAt: true },
  });
  return matches.flatMap((match) => {
    const tickNumber = Math.floor((now - match.startsAt.getTime()) / TICK_MS);
    const dueAt = match.startsAt.getTime() + tickNumber * TICK_MS;
    if (tickNumber < 1 || tickNumber > 45 || dueAt > match.endsAt.getTime() || now - dueAt > 5000)
      return [];
    return [{ matchId: match.id, instanceId: match.instanceId, tickNumber }];
  });
}

export async function creditTick(
  matchId: string,
  tickNumber: number,
  snapshot: { king: string; healthy: boolean },
) {
  const match = await prisma.kothMatch.findUnique({
    where: { id: matchId },
    select: { startsAt: true, endsAt: true },
  });
  if (!match) throw new AuthError(404, 'Không tìm thấy trận KotH.', 'KOTH_NOT_FOUND');
  const dueAt = match.startsAt.getTime() + tickNumber * TICK_MS;
  const now = Date.now();
  if (
    tickNumber < 1 ||
    tickNumber > 45 ||
    dueAt > match.endsAt.getTime() ||
    now < dueAt ||
    now - dueAt > 5000
  )
    throw new AuthError(409, 'Tick nằm ngoài thời gian trận đấu.', 'KOTH_TICK_EXPIRED');
  const participant = snapshot.healthy
    ? await prisma.kothParticipant.findUnique({
        where: { matchId_username: { matchId, username: snapshot.king } },
        select: { userId: true },
      })
    : null;
  const status = !snapshot.healthy ? 'sla_failed' : participant ? 'credited' : 'no_king';
  let tick;
  try {
    tick = await prisma.kothTick.create({
      data: { matchId, tickNumber, userId: participant?.userId, status },
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'))
      throw error;
    tick = await prisma.kothTick.findUniqueOrThrow({
      where: { matchId_tickNumber: { matchId, tickNumber } },
    });
  }
  if (tick.status === 'credited' && tick.userId) {
    const credited = await prisma.kothTick.count({
      where: { matchId, userId: tick.userId, status: 'credited' },
    });
    await redis.eval(
      updateScript,
      2,
      scoreKey(matchId),
      tickMarker(matchId, tickNumber),
      tick.userId,
      credited * 10,
    );
  }
  const data = {
    matchId,
    tickNumber,
    status: tick.status,
    userId: tick.userId,
    scores: await readScoreboard(matchId),
  };
  await redis.eval(
    publishScript,
    2,
    eventMarker(matchId, tickNumber),
    eventChannel(matchId),
    JSON.stringify({ type: 'KOTH_TICK_UPDATE', data }),
  );
  return data;
}

export const kothEventChannel = eventChannel;
