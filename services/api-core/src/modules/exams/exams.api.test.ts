import { createHash } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { generateTokens } from '../../lib/security.js';

const hash = (value: string) => createHash('sha256').update(value).digest('hex');

describe('CF-601 exam API', () => {
  const app = buildApp();
  const suffix = `exam-${Date.now()}`;
  const fetchMock = vi.spyOn(globalThis, 'fetch');
  let userId: string;
  let adminId: string;
  let pathId: string;
  let token: string;
  let adminToken: string;
  let examId: string;
  const questions: { taskId: string; questionId: string; roomSlug: string }[] = [];

  beforeAll(async () => {
    await app.ready();
    const user = await prisma.user.create({
      data: { email: `${suffix}@test.invalid`, username: suffix },
    });
    const admin = await prisma.user.create({
      data: {
        email: `admin-${suffix}@test.invalid`,
        username: `admin-${suffix}`,
        role: 'superadmin',
      },
    });
    userId = user.id;
    adminId = admin.id;
    token = generateTokens(user).accessToken;
    adminToken = generateTokens(admin).accessToken;
    const path = await prisma.learningPath.create({
      data: { title: suffix, slug: suffix, isPublished: true },
    });
    pathId = path.id;
    await prisma.pathEnrollment.create({ data: { userId, pathId } });
    await prisma.vpnPeer.create({
      data: {
        userId,
        publicKey: Buffer.alloc(32, 7).toString('base64'),
        ipAddress: '100.127.240.77',
      },
    });
    for (let index = 0; index < 5; index++) {
      const roomSlug = `${suffix}-room-${index}`;
      const room = await prisma.room.create({
        data: {
          title: roomSlug,
          slug: roomSlug,
          pathId,
          publishedAt: new Date(),
          targetTemplateSpec: {},
          tasks: {
            create: [
              {
                taskOrder: 1,
                title: 'Task',
                contentMdx: 'Walkthrough',
                questions: {
                  create: [{ questionText: 'Question', answerHash: `sha256:${hash('answer')}` }],
                },
              },
            ],
          },
        },
        include: { tasks: { include: { questions: true } } },
      });
      questions.push({
        taskId: room.tasks[0].id,
        questionId: room.tasks[0].questions[0].id,
        roomSlug,
      });
    }
    await prisma.submission.createMany({
      data: questions.slice(0, 3).map((item) => ({
        userId,
        questionId: item.questionId,
        submittedValue: 'answer',
        isCorrect: true,
      })),
    });
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      if (init?.method === 'DELETE' || url.includes('/vpn-network') || url.includes('/v1/access/'))
        return new Response(null, { status: 204 });
      if (url.endsWith('/v1/exams')) {
        const body = JSON.parse(String(init?.body)) as {
          sessionId: string;
          targets: { name: string }[];
        };
        return new Response(
          JSON.stringify({
            sessionId: body.sessionId,
            targets: body.targets.map((target, index) => ({
              name: target.name,
              targetIp: `100.64.0.${index + 2}`,
              containerId: `exam-target-${index}`,
            })),
          }),
          { status: 201 },
        );
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
  });

  afterAll(async () => {
    fetchMock.mockRestore();
    if (examId) {
      await prisma.examSubmission.deleteMany({ where: { session: { examId } } });
      await prisma.examSession.deleteMany({ where: { examId } });
      await prisma.examObjective.deleteMany({ where: { examId } });
      await prisma.examTarget.deleteMany({ where: { examId } });
      await prisma.exam.delete({ where: { id: examId } });
    }
    await prisma.submission.deleteMany({ where: { userId } });
    await prisma.room.deleteMany({ where: { pathId } });
    await prisma.pathEnrollment.deleteMany({ where: { pathId } });
    await prisma.vpnPeer.deleteMany({ where: { userId } });
    await prisma.learningPath.delete({ where: { id: pathId } });
    await prisma.user.deleteMany({ where: { id: { in: [userId, adminId] } } });
    await app.close();
  });

  it('requires all rooms, provisions a private range, locks learning, scores once, and ends', async () => {
    const adminHeaders = { authorization: `Bearer ${adminToken}` };
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/exams',
      headers: adminHeaders,
      payload: {
        pathId,
        slug: suffix,
        title: 'Practical exam',
        durationHours: 6,
        passingScore: 50,
        targets: [
          { name: 'web', image: 'cyberforce/test-web:1' },
          { name: 'db', image: 'cyberforce/test-db:1' },
        ],
        objectives: [
          {
            targetName: 'web',
            title: 'Web flag',
            description: 'Find the flag',
            points: 50,
            flag: 'flag{correct}',
          },
        ],
      },
    });
    expect(created.statusCode).toBe(201);
    examId = created.json().data.id;
    const objective = await prisma.examObjective.findFirstOrThrow({ where: { examId } });
    expect(objective.answerHash).toBe(`sha256:${hash('flag{correct}')}`);
    const headers = { authorization: `Bearer ${token}` };
    const startUrl = `/api/v1/exams/${suffix}/start`;
    const blocked = await app.inject({
      method: 'POST',
      url: startUrl,
      headers,
      payload: { consent: true },
    });
    expect(blocked.statusCode).toBe(403);
    const detail = await app.inject({ method: 'GET', url: `/api/v1/exams/${suffix}`, headers });
    expect(detail.json().data.eligibility).toMatchObject({
      completed: 3,
      total: 5,
      eligible: false,
    });
    await prisma.submission.createMany({
      data: questions.slice(3).map((item) => ({
        userId,
        questionId: item.questionId,
        submittedValue: 'answer',
        isCorrect: true,
      })),
    });
    const started = await app.inject({
      method: 'POST',
      url: startUrl,
      headers,
      payload: { consent: true },
    });
    expect(started.statusCode).toBe(201);
    const session = started.json().data as {
      id: string;
      expiresAt: string;
      startedAt: string;
      targets: unknown[];
    };
    expect(session.targets).toHaveLength(2);
    expect(new Date(session.expiresAt).getTime() - new Date(session.startedAt).getTime()).toBe(
      6 * 3600000,
    );
    const grant = fetchMock.mock.calls.find(
      ([url, init]) => String(url).endsWith(`/v1/access/${session.id}`) && init?.method === 'PUT',
    );
    expect(JSON.parse(String(grant?.[1]?.body))).toMatchObject({
      userId,
      peerIp: '100.127.240.77',
      targetIps: ['100.64.0.2', '100.64.0.3'],
    });
    const duplicate = await app.inject({
      method: 'POST',
      url: startUrl,
      headers,
      payload: { consent: true },
    });
    expect(duplicate.json().data.id).toBe(session.id);
    expect(
      (await app.inject({ method: 'GET', url: `/api/v1/rooms/${questions[0].roomSlug}`, headers }))
        .statusCode,
    ).toBe(423);
    expect(
      (
        await app.inject({
          method: 'GET',
          url: `/api/v1/questions/${questions[0].questionId}/hints`,
          headers,
        })
      ).statusCode,
    ).toBe(423);
    const flagUrl = `/api/v1/exams/sessions/${session.id}/flags`;
    expect(
      (
        await app.inject({
          method: 'POST',
          url: flagUrl,
          headers,
          payload: { objectiveId: objective.id, answer: 'wrong' },
        })
      ).json().data.accepted,
    ).toBe(false);
    const correct = await app.inject({
      method: 'POST',
      url: flagUrl,
      headers,
      payload: { objectiveId: objective.id, answer: 'flag{correct}' },
    });
    expect(correct.json().data).toMatchObject({ accepted: true, score: 50 });
    expect(
      (
        await app.inject({
          method: 'POST',
          url: flagUrl,
          headers,
          payload: { objectiveId: objective.id, answer: 'flag{correct}' },
        })
      ).json().data,
    ).toMatchObject({ alreadySubmitted: true, score: 50 });
    const finished = await app.inject({
      method: 'POST',
      url: `/api/v1/exams/sessions/${session.id}/finish`,
      headers,
    });
    expect(finished.json().data).toMatchObject({ status: 'finished', score: 50, passed: true });
    expect(
      (
        await app.inject({
          method: 'POST',
          url: flagUrl,
          headers,
          payload: { objectiveId: objective.id, answer: 'flag{correct}' },
        })
      ).statusCode,
    ).toBe(409);
  });

  it('expires a persisted deadline after a refresh and refuses late flags', async () => {
    const startedAt = new Date(Date.now() - 7 * 3600000);
    const session = await prisma.examSession.create({
      data: {
        examId,
        userId,
        status: 'running',
        consentedAt: startedAt,
        startedAt,
        expiresAt: new Date(startedAt.getTime() + 6 * 3600000),
      },
    });
    const headers = { authorization: `Bearer ${token}` };
    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/exams/sessions/${session.id}`,
      headers,
    });
    expect(response.json().data).toMatchObject({ status: 'expired', score: 0, passed: false });
    expect(
      (await prisma.examSession.findUniqueOrThrow({ where: { id: session.id } })).rangeStoppedAt,
    ).not.toBeNull();
    const objective = await prisma.examObjective.findFirstOrThrow({ where: { examId } });
    const late = await app.inject({
      method: 'POST',
      url: `/api/v1/exams/sessions/${session.id}/flags`,
      headers,
      payload: { objectiveId: objective.id, answer: 'flag{correct}' },
    });
    expect(late.statusCode).toBe(409);
  });
});
