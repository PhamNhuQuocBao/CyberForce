import { randomUUID, createHash } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { generateTokens } from '../../lib/security.js';

const hintTiers = [
  { tier: 1, content: 'Private hint one' },
  { tier: 2, content: 'Private hint two' },
  { tier: 3, content: 'Private solution' },
];
const answer = 'CF{hint_test}';

describe('CF-204 hint API and rewards', () => {
  const app = buildApp();
  const suffix = randomUUID();
  let userId: string,
    otherId: string,
    token: string,
    otherToken: string,
    roomId: string,
    taskId: string;
  const headers = () => ({ authorization: `Bearer ${token}` });
  const question = (pointsReward = 50) =>
    prisma.question.create({
      data: {
        taskId,
        questionText: 'Test question',
        pointsReward,
        hintTiers,
        answerHash: createHash('sha256').update(answer).digest('hex'),
      },
    });
  const get = (id: string, auth = token) =>
    app.inject({
      method: 'GET',
      url: `/api/v1/questions/${id}/hints`,
      headers: auth ? { authorization: `Bearer ${auth}` } : {},
    });
  const open = (id: string, tier: number, expectedCost = 0) =>
    app.inject({
      method: 'POST',
      url: `/api/v1/questions/${id}/hints/${tier}`,
      headers: headers(),
      payload: { expectedCost },
    });
  const submit = (id: string) =>
    app.inject({
      method: 'POST',
      url: `/api/v1/tasks/${taskId}/submit`,
      headers: headers(),
      payload: { questionId: id, answer },
    });
  beforeAll(async () => {
    await app.ready();
    const user = await prisma.user.create({
      data: { email: `${suffix}@hints.invalid`, username: suffix },
    });
    const other = await prisma.user.create({
      data: { email: `other-${suffix}@hints.invalid`, username: `other-${suffix}` },
    });
    userId = user.id;
    otherId = other.id;
    token = generateTokens(user).accessToken;
    otherToken = generateTokens(other).accessToken;
    const room = await prisma.room.create({
      data: {
        slug: suffix,
        title: 'Hint tests',
        targetTemplateSpec: {},
        publishedAt: new Date(),
        tasks: { create: { title: 'Task', taskOrder: 1, contentMdx: 'Read' } },
      },
      include: { tasks: true },
    });
    roomId = room.id;
    taskId = room.tasks[0].id;
  });
  afterAll(async () => {
    await prisma.room.deleteMany({ where: { id: roomId } });
    await prisma.user.deleteMany({ where: { id: { in: [userId, otherId] } } });
    await app.close();
  });
  it('requires authentication, validates input and never returns unopened content', async () => {
    const q = await question();
    expect((await get(q.id, '')).statusCode).toBe(401);
    expect((await get(randomUUID())).statusCode).toBe(404);
    expect((await open(q.id, 4)).statusCode).toBe(400);
    expect((await open(q.id, 1, -1)).statusCode).toBe(400);
    const response = await get(q.id);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.json().data.pointsAvailable).toBe(50);
    expect(response.body).not.toContain('Private');
    expect(response.body).not.toContain('answerHash');
    expect(
      (await app.inject({ method: 'GET', url: `/api/v1/rooms/${suffix}`, headers: headers() }))
        .body,
    ).not.toContain('Private');
  });
  it('requires confirmed pricing and sequential hints; exposes only the purchased content', async () => {
    const q = await question();
    expect((await open(q.id, 1, 0)).json().error.code).toBe('HINT_COST_CHANGED');
    expect((await open(q.id, 2, 10)).json().error.code).toBe('HINT_TIER_LOCKED');
    expect((await open(q.id, 3, 50)).json().error.code).toBe('HINT_TIER_LOCKED');
    const response = await open(q.id, 1, 5);
    expect(response.statusCode).toBe(200);
    expect(response.json().data.pointsAvailable).toBe(45);
    expect(response.body).toContain('Private hint one');
    expect(response.body).not.toContain('Private hint two');
    expect(response.body).not.toContain('Private solution');
    expect((await get(q.id, otherToken)).body).not.toContain('Private');
    expect((await get(q.id)).json().data.hints[0].unlocked).toBe(true);
  });
  it('makes retries/concurrent opens idempotent and preserves accumulated EXP/rank', async () => {
    const q = await question();
    const before = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const results = await Promise.all([open(q.id, 1, 5), open(q.id, 1, 5), open(q.id, 1, 5)]);
    expect(results.every((r) => r.statusCode === 200 && r.json().data.pointsAvailable === 45)).toBe(
      true,
    );
    expect(await prisma.hintUnlock.count({ where: { questionId: q.id, userId } })).toBe(1);
    const after = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    expect([after.expPoints, after.rankTier]).toEqual([before.expPoints, before.rankTier]);
  });
  it('deducts 10% and an additional 20% of the original reward when grading', async () => {
    const q = await question(100);
    await open(q.id, 1, 10);
    expect((await open(q.id, 2, 20)).json().data.pointsAvailable).toBe(70);
    expect((await submit(q.id)).json().data.pointsEarned).toBe(70);
    expect((await submit(q.id)).json().data.pointsEarned).toBe(0);
  });
  it('awards zero after a walkthrough and counts completion', async () => {
    const q = await question();
    await open(q.id, 1, 5);
    await open(q.id, 2, 10);
    expect((await open(q.id, 3, 35)).json().data.pointsAvailable).toBe(0);
    expect((await submit(q.id)).json().data).toMatchObject({ isCorrect: true, pointsEarned: 0 });
    expect((await get(q.id)).json().data.isCompleted).toBe(true);
  });
  it('allows solved questions to reveal the walkthrough immediately for free', async () => {
    const q = await question();
    await submit(q.id);
    const before = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    expect((await open(q.id, 3)).json().data.hints[2].content).toBe('Private solution');
    expect((await open(q.id, 2)).statusCode).toBe(200);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: userId } })).expPoints).toBe(
      before.expPoints,
    );
  });
  it('serializes hint reveal with correct submission so no reward escapes the deduction', async () => {
    const q = await question();
    const [opened, submitted] = await Promise.all([open(q.id, 1, 5), submit(q.id)]);
    const unlock = await prisma.hintUnlock.findUnique({
      where: { userId_questionId_tier: { userId, questionId: q.id, tier: 1 } },
    });
    const earned = submitted.json().data.pointsEarned;
    expect(earned).toBe(unlock ? 45 : 50);
    expect(opened.statusCode).toBe(unlock ? 200 : 409);
  });
  it('rounds percentage deductions down to integer EXP', async () => {
    const q = await question(7);
    expect((await open(q.id, 1, 0)).json().data.pointsAvailable).toBe(7);
    expect((await open(q.id, 2, 1)).json().data.pointsAvailable).toBe(6);
    expect((await submit(q.id)).json().data.pointsEarned).toBe(6);
  });
  it('handles missing/malformed configuration without revealing content or creating unlocks', async () => {
    const q = await question();
    await prisma.question.update({ where: { id: q.id }, data: { hintTiers: [] } });
    expect((await get(q.id)).json().data.hints).toEqual([]);
    expect((await open(q.id, 1)).statusCode).toBe(404);
    await prisma.question.update({
      where: { id: q.id },
      data: { hintTiers: [{ tier: 2, content: 'Secret' }] },
    });
    expect((await get(q.id)).statusCode).toBe(503);
    expect(await prisma.hintUnlock.count({ where: { questionId: q.id } })).toBe(0);
  });
  it('checks paid/unpublished/exam access for both read and reveal URLs', async () => {
    const q = await question();
    for (const data of [
      { isFree: false },
      { isFree: true, publishedAt: null },
      { publishedAt: new Date(), roomType: 'exam' as const },
    ]) {
      await prisma.room.update({ where: { id: roomId }, data });
      expect([403, 404]).toContain((await get(q.id)).statusCode);
      expect([403, 404]).toContain((await open(q.id, 1, 5)).statusCode);
    }
    await prisma.room.update({ where: { id: roomId }, data: { roomType: 'walkthrough' } });
  });
});
