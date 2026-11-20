import { createHash } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { generateTokens } from '../../lib/security.js';

describe('CF-504 fixed CTF scoring', () => {
  const app = buildApp();
  const suffix = `ctf-${Date.now()}`;
  let admin = '';
  let playerA = '';
  let playerB = '';
  let adminToken = '';
  let tokenA = '';
  let tokenB = '';
  let eventId = '';
  let challengeA = '';
  let challengeB = '';
  let bulkEventId = '';
  let bulkUserIds: string[] = [];

  const auth = (token: string) => ({ authorization: `Bearer ${token}` });
  beforeAll(async () => {
    await app.ready();
    const users = await Promise.all([
      prisma.user.create({
        data: {
          username: `${suffix}-admin`,
          email: `${suffix}-admin@test.invalid`,
          role: 'superadmin',
        },
      }),
      prisma.user.create({ data: { username: `${suffix}-a`, email: `${suffix}-a@test.invalid` } }),
      prisma.user.create({ data: { username: `${suffix}-b`, email: `${suffix}-b@test.invalid` } }),
    ]);
    [admin, playerA, playerB] = users.map((user) => user.id);
    [adminToken, tokenA, tokenB] = users.map((user) => generateTokens(user).accessToken);
  });
  afterAll(async () => {
    if (eventId) {
      await prisma.ctfSolve.deleteMany({ where: { challenge: { eventId } } });
      await prisma.ctfParticipant.deleteMany({ where: { eventId } });
      await prisma.ctfChallenge.deleteMany({ where: { eventId } });
      await prisma.ctfEvent.delete({ where: { id: eventId } });
    }
    if (bulkEventId) {
      await prisma.ctfSolve.deleteMany({ where: { challenge: { eventId: bulkEventId } } });
      await prisma.ctfParticipant.deleteMany({ where: { eventId: bulkEventId } });
      await prisma.ctfChallenge.deleteMany({ where: { eventId: bulkEventId } });
      await prisma.ctfEvent.delete({ where: { id: bulkEventId } });
    }
    if (bulkUserIds.length) await prisma.user.deleteMany({ where: { id: { in: bulkUserIds } } });
    if (admin) await prisma.user.deleteMany({ where: { id: { in: [admin, playerA, playerB] } } });
    await app.close();
  });

  it('locks challenge points, breaks ties by reached-at time, and preserves frozen rankings', async () => {
    const startsAt = new Date(Date.now() + 60_000).toISOString();
    const endsAt = new Date(Date.now() + 120_000).toISOString();
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/api/v1/admin/ctf/events',
          headers: auth(tokenA),
          payload: { slug: suffix, title: 'CTF', description: 'Test', startsAt, endsAt },
        })
      ).statusCode,
    ).toBe(403);
    const create = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/ctf/events',
      headers: auth(adminToken),
      payload: { slug: suffix, title: 'CTF', description: 'Test', startsAt, endsAt },
    });
    expect(create.statusCode).toBe(201);
    eventId = create.json().data.id;
    for (const [title, points] of [
      ['Alpha', 500],
      ['Beta', 400],
    ] as const) {
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/admin/ctf/events/${eventId}/challenges`,
        headers: auth(adminToken),
        payload: { title, description: title, points, flag: `flag{${title}}` },
      });
      expect(response.statusCode).toBe(201);
      expect(JSON.stringify(response.json())).not.toContain(`flag{${title}}`);
      if (title === 'Alpha') challengeA = response.json().data.id;
      else challengeB = response.json().data.id;
    }
    expect(
      (
        await app.inject({
          method: 'POST',
          url: `/api/v1/admin/ctf/events/${eventId}/publish`,
          headers: auth(adminToken),
        })
      ).statusCode,
    ).toBe(200);
    expect(
      (
        await app.inject({
          method: 'POST',
          url: `/api/v1/admin/ctf/events/${eventId}/challenges`,
          headers: auth(adminToken),
          payload: { title: 'Late', description: '', points: 1, flag: 'secret' },
        })
      ).statusCode,
    ).toBe(409);
    for (const token of [tokenA, tokenB])
      expect(
        (
          await app.inject({
            method: 'POST',
            url: `/api/v1/ctf/events/${suffix}/join`,
            headers: auth(token),
          })
        ).statusCode,
      ).toBe(200);
    await prisma.ctfEvent.update({
      where: { id: eventId },
      data: { startsAt: new Date(Date.now() - 10_000), endsAt: new Date(Date.now() + 60_000) },
    });
    const submit = (challengeId: string, answer: string, token: string) =>
      app.inject({
        method: 'POST',
        url: `/api/v1/ctf/events/${suffix}/challenges/${challengeId}/submit`,
        headers: auth(token),
        payload: { answer },
      });
    expect((await submit(challengeA, 'wrong', tokenA)).json().data.status).toBe('incorrect');
    const simultaneous = await Promise.all([
      submit(challengeA, 'flag{Alpha}', tokenA),
      submit(challengeA, 'flag{Alpha}', tokenA),
    ]);
    expect(simultaneous.map((response) => response.json().data.status).sort()).toEqual([
      'accepted',
      'duplicate',
    ]);
    expect((await submit(challengeB, 'flag{Beta}', tokenA)).json().data.status).toBe('accepted');
    expect((await submit(challengeA, 'flag{Alpha}', tokenA)).json().data.status).toBe('duplicate');
    const solvedAtA = (
      await prisma.ctfSolve.findFirstOrThrow({
        where: { userId: playerA, challengeId: challengeB },
      })
    ).solvedAt;
    await prisma.ctfEvent.update({
      where: { id: eventId },
      data: { freezeAt: new Date(solvedAtA.getTime() + 1) },
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect((await submit(challengeA, 'flag{Alpha}', tokenB)).json().data.frozen).toBe(true);
    expect((await submit(challengeB, 'flag{Beta}', tokenB)).json().data.status).toBe('accepted');
    const frozen = (
      await app.inject({ method: 'GET', url: `/api/v1/ctf/events/${suffix}/scoreboard` })
    ).json().data;
    expect(frozen.frozen).toBe(true);
    expect(frozen.entries.map((entry: { score: number }) => entry.score)).toEqual([900, 0]);
    expect(
      (
        await app.inject({ method: 'GET', url: `/api/v1/ctf/challenges/${challengeA}/score` })
      ).json().data.points,
    ).toBe(500);
    await prisma.ctfEvent.update({
      where: { id: eventId },
      data: { endsAt: new Date(Date.now() - 1) },
    });
    expect(
      (
        await app.inject({
          method: 'POST',
          url: `/api/v1/admin/ctf/events/${eventId}/unfreeze`,
          headers: auth(adminToken),
        })
      ).statusCode,
    ).toBe(200);
    const final = (
      await app.inject({ method: 'GET', url: `/api/v1/ctf/events/${suffix}/scoreboard` })
    ).json().data;
    expect(final.entries.map((entry: { score: number }) => entry.score)).toEqual([900, 900]);
    expect(final.entries.map((entry: { rank: number }) => entry.rank)).toEqual([1, 2]);
    expect(final.entries[0].username).toBe(`${suffix}-a`);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: playerA } })).expPoints).toBe(0);
    expect(
      (await prisma.ctfChallenge.findUniqueOrThrow({ where: { id: challengeA } })).points,
    ).toBe(500);
  });

  it('keeps a 500-point challenge at 500 after ten distinct solves', async () => {
    const event = await prisma.ctfEvent.create({
      data: {
        slug: `${suffix}-ten`,
        title: 'Ten solvers',
        description: '',
        startsAt: new Date(Date.now() - 60_000),
        endsAt: new Date(Date.now() + 60_000),
        publishedAt: new Date(Date.now() - 60_000),
        challenges: {
          create: {
            title: 'Fixed 500',
            description: '',
            points: 500,
            flagHash: `sha256:${createHash('sha256').update('flag{ten}').digest('hex')}`,
          },
        },
      },
      include: { challenges: true },
    });
    bulkEventId = event.id;
    const users = await Promise.all(
      Array.from({ length: 10 }, (_, index) =>
        prisma.user.create({
          data: {
            username: `${suffix}-bulk-${index}`,
            email: `${suffix}-bulk-${index}@test.invalid`,
          },
        }),
      ),
    );
    bulkUserIds = users.map((user) => user.id);
    await prisma.ctfParticipant.createMany({
      data: users.map((user) => ({
        eventId: event.id,
        userId: user.id,
        joinedAt: new Date(Date.now() - 20_000),
      })),
    });
    await prisma.ctfSolve.createMany({
      data: users.map((user, index) => ({
        challengeId: event.challenges[0].id,
        userId: user.id,
        solvedAt: new Date(Date.now() - 10_000 + index * 1_000),
      })),
    });
    const board = (
      await app.inject({ method: 'GET', url: `/api/v1/ctf/events/${suffix}-ten/scoreboard` })
    ).json().data;
    expect(board.entries).toHaveLength(10);
    expect(board.entries.every((entry: { score: number }) => entry.score === 500)).toBe(true);
    expect(
      (await prisma.ctfChallenge.findUniqueOrThrow({ where: { id: event.challenges[0].id } }))
        .points,
    ).toBe(500);
  });
});
