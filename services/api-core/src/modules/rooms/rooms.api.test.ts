import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { buildApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { generateTokens } from '../../lib/security.js';

describe('CF-202 room content access', () => {
  const app = buildApp();
  const suffix = `room-${Date.now()}`;
  let userId: string;
  let otherId: string;
  let token: string;
  let otherToken: string;
  let pathId: string;
  let prerequisiteId: string;
  let questionId: string;
  const url = `/api/v1/rooms/${suffix}`;
  beforeAll(async () => {
    await app.ready();
    const user = await prisma.user.create({
      data: { email: `${suffix}@test.invalid`, username: suffix },
    });
    const other = await prisma.user.create({
      data: { email: `other-${suffix}@test.invalid`, username: `other-${suffix}` },
    });
    userId = user.id;
    otherId = other.id;
    token = generateTokens(user).accessToken;
    otherToken = generateTokens(other).accessToken;
    const path = await prisma.learningPath.create({
      data: { title: suffix, slug: suffix, isPublished: true },
    });
    pathId = path.id;
    const prerequisite = await prisma.room.create({
      data: {
        title: 'Prerequisite',
        slug: `pre-${suffix}`,
        pathId,
        publishedAt: new Date(),
        targetTemplateSpec: {},
        tasks: {
          create: {
            title: 'Foundation',
            taskOrder: 1,
            contentMdx: 'Read',
            questions: {
              create: {
                questionText: 'Question',
                answerHash: 'SECRET_HASH',
                flagPattern: 'SECRET_PATTERN',
                hintTiers: { secret: 'SECRET_HINT' },
              },
            },
          },
        },
      },
      include: { tasks: { include: { questions: true } } },
    });
    prerequisiteId = prerequisite.id;
    questionId = prerequisite.tasks[0].questions[0].id;
    await prisma.room.create({
      data: {
        title: 'Room',
        slug: suffix,
        pathId,
        prerequisiteRoomId: prerequisite.id,
        publishedAt: new Date(),
        targetTemplateSpec: { image: 'PRIVATE_IMAGE' },
        tasks: {
          create: {
            title: 'Lesson',
            taskOrder: 1,
            contentMdx: '# Lesson',
            questions: {
              create: {
                questionText: 'Answer?',
                answerHash: 'SECRET_HASH',
                flagPattern: 'SECRET_PATTERN',
                hintTiers: { secret: 'SECRET_HINT' },
              },
            },
          },
        },
      },
    });
  });
  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: { in: [userId, otherId] } } });
    await prisma.room.deleteMany({ where: { pathId } });
    await prisma.learningPath.delete({ where: { id: pathId } });
    await app.close();
  });
  it('requires a valid login', async () => {
    expect((await app.inject({ method: 'GET', url })).statusCode).toBe(401);
  });
  it('enforces prerequisite on direct URLs', async () => {
    const response = await app.inject({
      method: 'GET',
      url,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe('PREREQUISITE_REQUIRED');
    expect(response.body).not.toContain('# Lesson');
  });
  it('counts distinct solved questions and isolates progress by user', async () => {
    await prisma.submission.create({
      data: { userId, questionId, submittedValue: 'answer', isCorrect: true, pointsEarned: 50 },
    });
    const response = await app.inject({
      method: 'GET',
      url,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.json().data.hasLab).toBe(true);
    expect(response.json().data.tasks[0].content).toBe('# Lesson');
    for (const secret of [
      'SECRET_HASH',
      'SECRET_PATTERN',
      'SECRET_HINT',
      'PRIVATE_IMAGE',
      'submissions',
      'answerHash',
      'flagPattern',
    ])
      expect(response.body).not.toContain(secret);
    expect(
      (await app.inject({ method: 'GET', url, headers: { authorization: `Bearer ${otherToken}` } }))
        .statusCode,
    ).toBe(403);
    const pre = await app.inject({
      method: 'GET',
      url: `/api/v1/rooms/pre-${suffix}`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(pre.json().data.completedQuestions).toBe(1);
    expect(pre.json().data.hasLab).toBe(false);
  });
  it('hides draft, future and unpublished-path rooms', async () => {
    for (const publishedAt of [null, new Date(Date.now() + 86400000)]) {
      await prisma.room.update({ where: { id: prerequisiteId }, data: { publishedAt } });
      expect(
        (
          await app.inject({
            method: 'GET',
            url: `/api/v1/rooms/pre-${suffix}`,
            headers: { authorization: `Bearer ${token}` },
          })
        ).statusCode,
      ).toBe(404);
    }
    await prisma.room.update({ where: { id: prerequisiteId }, data: { publishedAt: new Date() } });
    await prisma.learningPath.update({ where: { id: pathId }, data: { isPublished: false } });
    expect(
      (await app.inject({ method: 'GET', url, headers: { authorization: `Bearer ${token}` } }))
        .statusCode,
    ).toBe(404);
    await prisma.learningPath.update({ where: { id: pathId }, data: { isPublished: true } });
  });
  it('does not grant paid access without an entitlement system', async () => {
    await prisma.room.update({ where: { id: prerequisiteId }, data: { isFree: false } });
    expect(
      (
        await app.inject({
          method: 'GET',
          url: `/api/v1/rooms/pre-${suffix}`,
          headers: { authorization: `Bearer ${token}` },
        })
      ).statusCode,
    ).toBe(403);
  });
});
