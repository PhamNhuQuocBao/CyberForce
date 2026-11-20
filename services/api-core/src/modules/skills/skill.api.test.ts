import { createHash, randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { generateTokens } from '../../lib/security.js';

describe('CF-703 real skill awards', () => {
  const app = buildApp();
  const suffix = randomUUID();
  const flag = 'CF{skill-award}';
  let userId = '',
    token = '',
    roomId = '',
    taggedTaskId = '',
    generalTaskId = '';
  let taggedQuestionId = '',
    generalQuestionId = '';
  beforeAll(async () => {
    await app.ready();
    const user = await prisma.user.create({
      data: { username: `skill-${suffix}`, email: `skill-${suffix}@test.invalid` },
    });
    userId = user.id;
    token = generateTokens(user).accessToken;
    const room = await prisma.room.create({
      data: {
        title: 'Skill room',
        slug: `skill-${suffix}`,
        targetTemplateSpec: {},
        publishedAt: new Date(),
        tasks: {
          create: [
            {
              title: 'Cloud network',
              taskOrder: 1,
              contentMdx: '',
              skillTags: ['cloud_devsecops', 'network'],
              questions: {
                create: {
                  questionText: 'Flag A',
                  answerHash: createHash('sha256').update(flag).digest('hex'),
                  pointsReward: 100,
                },
              },
            },
            {
              title: 'General',
              taskOrder: 2,
              contentMdx: '',
              questions: {
                create: {
                  questionText: 'Flag B',
                  answerHash: createHash('sha256').update(flag).digest('hex'),
                  pointsReward: 30,
                },
              },
            },
          ],
        },
      },
      include: { tasks: { include: { questions: true } } },
    });
    roomId = room.id;
    taggedTaskId = room.tasks[0].id;
    taggedQuestionId = room.tasks[0].questions[0].id;
    generalTaskId = room.tasks[1].id;
    generalQuestionId = room.tasks[1].questions[0].id;
  });
  afterAll(async () => {
    if (roomId) await prisma.room.delete({ where: { id: roomId } });
    if (userId) await prisma.user.delete({ where: { id: userId } });
    await app.close();
  });
  const submit = (taskId: string, questionId: string) =>
    app.inject({
      method: 'POST',
      url: `/api/v1/tasks/${taskId}/submit`,
      headers: { authorization: `Bearer ${token}` },
      payload: { questionId, answer: flag },
    });
  it('awards full EXP in parallel for each skill, once per task', async () => {
    expect((await submit(taggedTaskId, taggedQuestionId)).statusCode).toBe(200);
    expect((await submit(taggedTaskId, taggedQuestionId)).json().data.pointsEarned).toBe(0);
    const awards = await prisma.skillAward.findMany({ where: { userId } });
    expect(awards.map((item) => [item.skill, item.pointsEarned]).sort()).toEqual([
      ['cloud_devsecops', 100],
      ['network', 100],
    ]);
    const radar = await app.inject({ method: 'GET', url: `/api/v1/users/skill-${suffix}/radar` });
    expect(radar.json().data).toMatchObject({ cloud_devsecops: 100, network: 100, web: 0 });
  });
  it('keeps General EXP out of all skill axes', async () => {
    expect((await submit(generalTaskId, generalQuestionId)).statusCode).toBe(200);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: userId } })).expPoints).toBe(130);
    expect(await prisma.skillAward.count({ where: { userId } })).toBe(2);
  });
});
