import { randomUUID, createHash } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { generateTokens } from '../../lib/security.js';
import { env } from '../../config/env.js';
import { createDynamicFlag } from './flag-validator.service.js';
import { redis } from '../../lib/redis.js';
import { submissionLimit, submissionLimitKeys } from './submission-limit.js';
import { localDate, priorDate } from '../streak/streak.policy.js';

const answer = 'CF{integration_answer}';
describe('CF-203 submission API', () => {
  const app = buildApp();
  const suffix = randomUUID();
  let userId: string, token: string, roomId: string, taskId: string, questionId: string;
  const submit = (value = answer, id = questionId, authenticated = true) =>
    app.inject({
      method: 'POST',
      url: `/api/v1/tasks/${taskId}/submit`,
      headers: authenticated ? { authorization: `Bearer ${token}` } : {},
      payload: { questionId: id, answer: value },
    });
  beforeAll(async () => {
    await app.ready();
    const user = await prisma.user.create({
      data: { email: `${suffix}@test.invalid`, username: suffix },
    });
    userId = user.id;
    token = generateTokens(user).accessToken;
    const room = await prisma.room.create({
      data: {
        title: 'Submission test',
        slug: suffix,
        targetTemplateSpec: {},
        publishedAt: new Date(),
        tasks: {
          create: {
            title: 'Task',
            taskOrder: 1,
            contentMdx: 'Read',
            questions: {
              create: {
                questionText: 'Flag?',
                answerHash: createHash('sha256').update(answer).digest('hex'),
                pointsReward: 50,
              },
            },
          },
        },
      },
      include: { tasks: { include: { questions: true } } },
    });
    roomId = room.id;
    taskId = room.tasks[0].id;
    questionId = room.tasks[0].questions[0].id;
  });
  afterAll(async () => {
    const questions = await prisma.question.findMany({ where: { taskId }, select: { id: true } });
    for (const question of questions) await redis.del(...submissionLimitKeys(userId, question.id));
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.room.deleteMany({ where: { id: roomId } });
    await app.close();
  });
  it('requires authentication and validates question/task association', async () => {
    expect((await submit(answer, questionId, false)).statusCode).toBe(401);
    expect((await submit(answer, randomUUID())).statusCode).toBe(404);
    expect((await submit('')).statusCode).toBe(400);
    expect((await submit('a'.repeat(4097))).statusCode).toBe(400);
  });
  it('applies room access checks to direct submission URLs', async () => {
    await prisma.room.update({ where: { id: roomId }, data: { isFree: false } });
    expect((await submit()).statusCode).toBe(403);
    await prisma.room.update({ where: { id: roomId }, data: { isFree: true, publishedAt: null } });
    expect((await submit()).statusCode).toBe(404);
    await prisma.room.update({ where: { id: roomId }, data: { publishedAt: new Date() } });
    expect(await prisma.submission.count({ where: { userId } })).toBe(0);
  });
  it('records an incorrect answer without awarding points or exposing secrets', async () => {
    const response = await submit('wrong');
    expect(response.statusCode).toBe(200);
    expect(response.json().data).toMatchObject({ isCorrect: false, pointsEarned: 0, totalExp: 0 });
    expect(response.body).not.toContain('answerHash');
    expect(response.body).not.toContain(answer);
  });
  it('blocks prerequisite bypass through the submit endpoint', async () => {
    const prerequisite = await prisma.room.create({
      data: {
        title: 'Prerequisite',
        slug: `pre-${suffix}`,
        targetTemplateSpec: {},
        publishedAt: new Date(),
        tasks: {
          create: {
            title: 'Required task',
            taskOrder: 1,
            contentMdx: 'Read',
            questions: { create: { questionText: 'Required answer' } },
          },
        },
      },
    });
    try {
      await prisma.room.update({
        where: { id: roomId },
        data: { prerequisiteRoomId: prerequisite.id },
      });
      const response = await submit();
      expect(response.statusCode).toBe(403);
      expect(response.json().error.code).toBe('PREREQUISITE_REQUIRED');
    } finally {
      await prisma.room.update({ where: { id: roomId }, data: { prerequisiteRoomId: null } });
      await prisma.room.delete({ where: { id: prerequisite.id } });
    }
  });

  it('does not penalize invalid flag configuration as an incorrect answer', async () => {
    const question = await prisma.question.create({
      data: { taskId, questionText: 'Invalid config', answerHash: 'invalid' },
    });
    const response = await submit(answer, question.id);
    expect(response.statusCode).toBe(503);
    expect(response.json().error.code).toBe('FLAG_UNAVAILABLE');
    expect(await prisma.submission.count({ where: { questionId: question.id } })).toBe(0);
    expect(await redis.exists(...submissionLimitKeys(userId, question.id))).toBe(0);
  });
  it('awards exactly once under concurrent correct requests and retries', async () => {
    const responses = await Promise.all([submit(), submit(), submit()]);
    expect(responses.map((r) => r.statusCode)).toEqual([200, 200, 200]);
    expect(responses.reduce((sum, r) => sum + r.json().data.pointsEarned, 0)).toBe(50);
    expect(await prisma.submission.count({ where: { userId, questionId, isCorrect: true } })).toBe(
      1,
    );
    expect((await prisma.user.findUniqueOrThrow({ where: { id: userId } })).expPoints).toBe(50);
    expect((await submit()).json().data).toMatchObject({
      alreadyCompleted: true,
      pointsEarned: 0,
      totalExp: 50,
    });
  });

  it('promotes across a threshold, records one rank badge, and never replays the event', async () => {
    const username = `rank-${randomUUID()}`;
    const learner = await prisma.user.create({
      data: { email: `${username}@test.invalid`, username, expPoints: 950 },
    });
    const rankTask = await prisma.task.create({
      data: {
        roomId,
        title: 'Rank crossing',
        taskOrder: 2,
        contentMdx: 'Read',
        questions: {
          create: {
            questionText: 'Rank flag?',
            answerHash: createHash('sha256').update(answer).digest('hex'),
            pointsReward: 100,
          },
        },
      },
      include: { questions: true },
    });
    const rankSubmit = () =>
      app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${rankTask.id}/submit`,
        headers: { authorization: `Bearer ${generateTokens(learner).accessToken}` },
        payload: { questionId: rankTask.questions[0].id, answer },
      });
    try {
      const first = (await rankSubmit()).json().data;
      expect(first).toMatchObject({
        totalExp: 1050,
        rankTier: 'Script Kiddie',
        rankUp: {
          previousRank: 'Novice',
          newRank: 'Script Kiddie',
          badgeIds: ['rank_script_kiddie'],
        },
      });
      expect((await rankSubmit()).json().data.rankUp).toBeNull();
      expect(
        await prisma.userBadge.count({
          where: { userId: learner.id, badgeId: 'rank_script_kiddie' },
        }),
      ).toBe(1);
      await prisma.user.update({ where: { id: learner.id }, data: { expPoints: 990 } });
      expect((await prisma.user.findUniqueOrThrow({ where: { id: learner.id } })).rankTier).toBe(
        'Script Kiddie',
      );
    } finally {
      await prisma.user.delete({ where: { id: learner.id } });
      await prisma.task.delete({ where: { id: rankTask.id } });
    }
  });

  it('locks on the fifth wrong answer, blocks correct retries, and isolates questions/users', async () => {
    const question = await prisma.question.create({
      data: {
        taskId,
        questionText: 'Rate limit',
        answerHash: createHash('sha256').update(answer).digest('hex'),
      },
    });
    const responses = await Promise.all(
      Array.from({ length: 6 }, () => submit('wrong', question.id)),
    );
    expect(responses.filter((r) => r.statusCode === 200)).toHaveLength(4);
    expect(responses.filter((r) => r.statusCode === 429)).toHaveLength(2);
    expect(await prisma.submission.count({ where: { userId, questionId: question.id } })).toBe(5);
    const locked = await submit(answer, question.id);
    expect(locked.statusCode).toBe(429);
    expect(Number(locked.headers['retry-after'])).toBeGreaterThan(175);
    expect(locked.json().error.details.retryAfterSeconds).toBeLessThanOrEqual(180);
    expect(await submissionLimit(randomUUID(), question.id, 'check')).toBe(0);
    expect(await submissionLimit(userId, randomUUID(), 'check')).toBe(0);
    // Expire the Redis key rather than sleeping for three minutes.
    await redis.pexpire(submissionLimitKeys(userId, question.id)[1], -1);
    expect((await submit(answer, question.id)).json().data.isCorrect).toBe(true);
  });

  it('does not count incorrect answers outside the sliding 60-second window', async () => {
    const id = randomUUID();
    const keys = submissionLimitKeys(userId, id);
    await redis.zadd(
      keys[0],
      ...Array.from({ length: 4 }, (_, i) => [Date.now() - 61000, `old-${i}`]).flat(),
    );
    expect(await submissionLimit(userId, id, 'incorrect')).toBe(0);
    expect(await redis.zcard(keys[0])).toBe(1);
    await redis.del(...keys);
  });

  it('requires an owned, running, unexpired lab for dynamic flags', async () => {
    const question = await prisma.question.create({
      data: { taskId, questionText: 'Dynamic', flagType: 'dynamic_hmac' },
    });
    expect((await submit(answer, question.id)).statusCode).toBe(409);
    const instance = await prisma.labInstance.create({
      data: {
        userId,
        roomId,
        ipAddress: '127.0.0.1',
        dynamicSalt: 'integration-salt',
        status: 'running',
        expiresAt: new Date(Date.now() + 60000),
      },
    });
    const previousKey = env.PLATFORM_MASTER_KEY;
    env.PLATFORM_MASTER_KEY = 'integration-only-key-with-at-least-32-characters';
    const flag = createDynamicFlag({
      userId,
      roomId,
      instanceSalt: instance.dynamicSalt,
      masterKey: env.PLATFORM_MASTER_KEY,
    });
    const post = () =>
      app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${taskId}/submit`,
        headers: { authorization: `Bearer ${token}` },
        payload: { questionId: question.id, answer: flag, labInstanceId: instance.id },
      });
    const other = await prisma.user.create({
      data: { email: `other-${suffix}@test.invalid`, username: `o-${suffix}` },
    });
    try {
      await prisma.labInstance.update({ where: { id: instance.id }, data: { userId: other.id } });
      expect((await post()).statusCode).toBe(409);
      await prisma.labInstance.update({ where: { id: instance.id }, data: { userId } });
      await prisma.labInstance.update({
        where: { id: instance.id },
        data: { status: 'terminated' },
      });
      expect((await post()).statusCode).toBe(409);
      await prisma.labInstance.update({
        where: { id: instance.id },
        data: { status: 'running', expiresAt: new Date(0) },
      });
      expect((await post()).statusCode).toBe(409);
      await prisma.labInstance.update({
        where: { id: instance.id },
        data: { expiresAt: new Date(Date.now() + 60000) },
      });
      const result = await post();
      expect(result.statusCode).toBe(200);
      expect(result.json().data.isCorrect).toBe(true);
      expect(result.body).not.toContain(instance.dynamicSalt);
      expect(result.body).not.toContain(flag);
    } finally {
      env.PLATFORM_MASTER_KEY = previousKey;
      await prisma.user.delete({ where: { id: other.id } });
    }
  });
  it('counts a fully solved new Task once and applies the 7-day bonus only afterwards', async () => {
    const today = localDate(new Date(), 'Asia/Ho_Chi_Minh');
    await prisma.user.update({
      where: { id: userId },
      data: {
        timezone: 'Asia/Ho_Chi_Minh',
        streakDays: 6,
        lastStreakDate: priorDate(today),
        streakBonusPercent: 100,
        streakBonusUntil: null,
      },
    });
    const multi = await prisma.task.create({
      data: {
        roomId,
        title: 'Two questions',
        taskOrder: 2,
        contentMdx: 'Complete both',
        questions: {
          create: [
            {
              questionText: 'First',
              answerHash: createHash('sha256').update(answer).digest('hex'),
              pointsReward: 50,
            },
            {
              questionText: 'Second',
              answerHash: createHash('sha256').update(answer).digest('hex'),
              pointsReward: 50,
            },
          ],
        },
      },
      include: { questions: true },
    });
    const post = (id: string, task = multi.id) =>
      app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${task}/submit`,
        headers: { authorization: `Bearer ${token}` },
        payload: { questionId: id, answer },
      });
    const first = await post(multi.questions[0].id);
    expect(first.json().data).toMatchObject({
      pointsEarned: 50,
      streakDays: 6,
      badgeUnlocked: null,
    });
    const second = await post(multi.questions[1].id);
    expect(second.json().data).toMatchObject({
      pointsEarned: 50,
      streakDays: 7,
      badgeUnlocked: 'streak_7',
      bonusPercent: 120,
    });
    expect(await prisma.streakDay.count({ where: { userId } })).toBe(1);
    expect(await prisma.userBadge.count({ where: { userId, badgeId: 'streak_7' } })).toBe(1);
    expect((await post(multi.questions[1].id)).json().data).toMatchObject({
      pointsEarned: 0,
      badgeUnlocked: null,
    });
    const next = await prisma.task.create({
      data: {
        roomId,
        title: 'Next task',
        taskOrder: 3,
        contentMdx: 'New',
        questions: {
          create: {
            questionText: 'Bonus',
            answerHash: createHash('sha256').update(answer).digest('hex'),
            pointsReward: 50,
          },
        },
      },
      include: { questions: true },
    });
    expect((await post(next.questions[0].id, next.id)).json().data.pointsEarned).toBe(60);
    expect(await prisma.streakDay.count({ where: { userId } })).toBe(1);
  });
});
