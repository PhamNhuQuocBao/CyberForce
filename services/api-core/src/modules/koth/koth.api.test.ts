import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import WebSocket from 'ws';
import { buildApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redis.js';
import { generateTokens } from '../../lib/security.js';

const suffix = `koth-${Date.now()}`;
const runnerHeader = {
  authorization: `Bearer ${process.env.ORCHESTRATOR_TOKEN ?? 'cyberforce_local_orchestrator_token_2026'}`,
};

describe('CF-501 KotH score flow', () => {
  const app = buildApp();
  let ids: string[] = [];
  let roomId = '';
  let instanceId = '';
  let matchId = '';
  let adminToken = '';
  let playerToken = '';
  let outsiderToken = '';

  beforeAll(async () => {
    await app.ready();
    const users = await Promise.all(
      Array.from({ length: 5 }, (_, index) =>
        prisma.user.create({
          data: {
            email: `${suffix}-${index}@test.invalid`,
            username: `${suffix}-${index}`,
            role: index === 0 ? 'org_admin' : 'student',
          },
        }),
      ),
    );
    ids = users.map((user) => user.id);
    adminToken = generateTokens(users[0]).accessToken;
    playerToken = generateTokens(users[1]).accessToken;
    outsiderToken = generateTokens(users[4]).accessToken;
    const room = await prisma.room.create({
      data: {
        title: suffix,
        slug: suffix,
        roomType: 'koth',
        targetTemplateSpec: { image: 'cyberforce/test:v1' },
      },
    });
    roomId = room.id;
    const instance = await prisma.labInstance.create({
      data: {
        userId: ids[0],
        roomId,
        ipAddress: '100.64.0.2',
        dynamicSalt: 'test',
        status: 'running',
        expiresAt: new Date(Date.now() + 3_600_000),
      },
    });
    instanceId = instance.id;
  });

  afterAll(async () => {
    if (matchId) await prisma.kothMatch.delete({ where: { id: matchId } });
    if (instanceId) await prisma.labInstance.delete({ where: { id: instanceId } });
    if (roomId) await prisma.room.delete({ where: { id: roomId } });
    if (ids.length) await prisma.user.deleteMany({ where: { id: { in: ids } } });
    if (matchId)
      await redis.del(
        `koth:match_${matchId}:scores`,
        `koth:match_${matchId}:tick:1`,
        `koth:match_${matchId}:event:1`,
        `koth:match_${matchId}:event:2`,
        `koth:match_${matchId}:event:3`,
      );
    await app.close();
  });

  it('restricts setup and scoreboard to organizers and participants', async () => {
    const body = { roomId, instanceId, userIds: ids.slice(0, 4) };
    expect(
      (await app.inject({ method: 'POST', url: '/api/v1/koth/matches', payload: body })).statusCode,
    ).toBe(401);
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/api/v1/koth/matches',
          payload: body,
          headers: { authorization: `Bearer ${playerToken}` },
        })
      ).statusCode,
    ).toBe(403);
    await prisma.labInstance.update({ where: { id: instanceId }, data: { userId: ids[1] } });
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/api/v1/koth/matches',
          payload: body,
          headers: { authorization: `Bearer ${adminToken}` },
        })
      ).statusCode,
    ).toBe(409);
    await prisma.labInstance.update({ where: { id: instanceId }, data: { userId: ids[0] } });
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/koth/matches',
      payload: body,
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(created.statusCode).toBe(201);
    matchId = created.json().data.id;
    expect(
      (
        await app.inject({
          method: 'GET',
          url: `/api/v1/koth/matches/${matchId}/scoreboard`,
          headers: { authorization: `Bearer ${outsiderToken}` },
        })
      ).statusCode,
    ).toBe(403);
    expect((await app.inject({ method: 'GET', url: '/api/v1/koth/internal/due' })).statusCode).toBe(
      401,
    );
    expect(
      (
        await app.inject({
          method: 'POST',
          url: `/api/v1/koth/matches/${matchId}/scoreboard-ticket`,
          headers: { authorization: `Bearer ${outsiderToken}` },
        })
      ).statusCode,
    ).toBe(403);
  });

  it('credits once, broadcasts an update, and rejects a bad king', async () => {
    const address = await app.listen({ port: 0, host: '127.0.0.1' });
    const ticketResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/koth/matches/${matchId}/scoreboard-ticket`,
      headers: { authorization: `Bearer ${playerToken}` },
    });
    expect(ticketResponse.statusCode).toBe(200);
    const ticket = ticketResponse.json().data.ticket;
    const socket = new WebSocket(
      `${address.replace('http', 'ws')}/ws/arena/koth/${matchId}`,
      ['cf-koth-scoreboard', ticket],
      { origin: 'http://localhost:3000' },
    );
    const initial = new Promise<void>((resolve, reject) => {
      socket.once('message', (message) => {
        try {
          expect(JSON.parse(message.toString()).type).toBe('KOTH_SCOREBOARD');
          resolve();
        } catch (error) {
          reject(error);
        }
      });
      socket.once('error', reject);
    });
    await initial;
    await prisma.kothMatch.update({
      where: { id: matchId },
      data: { startsAt: new Date(Date.now() - 60_000), endsAt: new Date(Date.now() + 44 * 60_000) },
    });
    const update = new Promise<unknown>((resolve) =>
      socket.once('message', (message) => resolve(JSON.parse(message.toString()))),
    );
    const payload = { king: `${suffix}-1`, healthy: true };
    const url = `/api/v1/koth/internal/matches/${matchId}/ticks/1`;
    const first = await app.inject({ method: 'POST', url, headers: runnerHeader, payload });
    expect(first.statusCode).toBe(200);
    expect(first.json().data.scores[0]).toMatchObject({ userId: ids[1], score: 10 });
    expect(((await update) as { type: string }).type).toBe('KOTH_TICK_UPDATE');
    const duplicate = await app.inject({ method: 'POST', url, headers: runnerHeader, payload });
    expect(duplicate.statusCode).toBe(200);
    expect(await prisma.kothTick.count({ where: { matchId } })).toBe(1);
    expect(await redis.zscore(`koth:match_${matchId}:scores`, ids[1])).toBe('10');
    const board = await app.inject({
      method: 'GET',
      url: `/api/v1/koth/matches/${matchId}/scoreboard`,
      headers: { authorization: `Bearer ${playerToken}` },
    });
    expect(board.json().data[0].score).toBe(10);
    await redis.del(`koth:match_${matchId}:scores`);
    await app.inject({
      method: 'GET',
      url: `/api/v1/koth/matches/${matchId}/scoreboard`,
      headers: { authorization: `Bearer ${playerToken}` },
    });
    expect(await redis.zscore(`koth:match_${matchId}:scores`, ids[1])).toBe('10');
    socket.close();
  });

  it('does not credit invalid kings, failed SLA, or expired matches', async () => {
    await prisma.kothMatch.update({
      where: { id: matchId },
      data: {
        startsAt: new Date(Date.now() - 120_000),
        endsAt: new Date(Date.now() + 43 * 60_000),
      },
    });
    const second = await app.inject({
      method: 'POST',
      url: `/api/v1/koth/internal/matches/${matchId}/ticks/2`,
      headers: runnerHeader,
      payload: { king: `${suffix}-1 extra`, healthy: true },
    });
    expect(second.json().data.status).toBe('no_king');
    await prisma.kothMatch.update({
      where: { id: matchId },
      data: {
        startsAt: new Date(Date.now() - 180_000),
        endsAt: new Date(Date.now() + 42 * 60_000),
      },
    });
    const third = await app.inject({
      method: 'POST',
      url: `/api/v1/koth/internal/matches/${matchId}/ticks/3`,
      headers: runnerHeader,
      payload: { king: `${suffix}-1`, healthy: false },
    });
    expect(third.json().data.status).toBe('sla_failed');
    expect(await redis.zscore(`koth:match_${matchId}:scores`, ids[1])).toBe('10');
    await prisma.kothMatch.update({
      where: { id: matchId },
      data: { startsAt: new Date(Date.now() - 46 * 60_000), endsAt: new Date(Date.now() - 60_000) },
    });
    const expired = await app.inject({
      method: 'POST',
      url: `/api/v1/koth/internal/matches/${matchId}/ticks/45`,
      headers: runnerHeader,
      payload: { king: `${suffix}-1`, healthy: true },
    });
    expect(expired.statusCode).toBe(409);
  });
});
