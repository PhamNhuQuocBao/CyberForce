import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { generateTokens } from '../../lib/security.js';

describe('CF-802 Creator Studio', () => {
  const app = buildApp();
  const suffix = randomUUID();
  const mockFetch = vi.spyOn(globalThis, 'fetch');
  let creatorId = '',
    otherId = '',
    studentId = '',
    adminId = '';
  let creatorToken = '',
    otherToken = '',
    studentToken = '',
    adminToken = '';
  let pathId = '',
    moduleId = '',
    roomId = '';
  let attachmentId = '';
  const call = (
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    payload?: Record<string, unknown>,
    token = creatorToken,
  ) =>
    app.inject({
      method,
      url: `/api/v1/creator${path}`,
      headers: { authorization: `Bearer ${token}` },
      payload,
    });
  const roomInput = () => ({
    pathId,
    moduleId,
    title: 'Creator lab',
    slug: `creator-${suffix}`,
    description: 'Preview',
    difficulty: 'Easy',
    roomType: 'walkthrough',
    isFree: true,
    pointsReward: 100,
    estimatedMinutes: 30,
    orderIndex: 1,
    prerequisiteRoomId: null,
    requiredForCapstone: false,
    labEnabled: true,
    image: 'cyberforce/cf802:test',
    cpuMillicores: 500,
    memoryMb: 512,
    ports: [80],
    starterTask: {
      title: 'Try it',
      contentMdx: '# Lesson',
      questionText: 'Flag?',
      flagType: 'static',
      answer: 'CF{creator}',
      pointsReward: 50,
    },
  });

  beforeAll(async () => {
    await app.ready();
    const users = await Promise.all(
      ['creator', 'instructor', 'student', 'superadmin'].map((role, index) =>
        prisma.user.create({
          data: {
            username: `cf802-${index}-${suffix}`,
            email: `cf802-${index}-${suffix}@test.invalid`,
            role: role as 'creator' | 'instructor' | 'student' | 'superadmin',
          },
        }),
      ),
    );
    [creatorId, otherId, studentId, adminId] = users.map((user) => user.id);
    [creatorToken, otherToken, studentToken, adminToken] = users.map(
      (user) => generateTokens(user).accessToken,
    );
    const path = await prisma.learningPath.create({
      data: {
        title: 'Creator path',
        slug: `creator-path-${suffix}`,
        isPublished: true,
        status: 'published',
      },
    });
    pathId = path.id;
    const module = await prisma.module.create({
      data: { pathId, title: 'Core', status: 'published' },
    });
    moduleId = module.id;
    mockFetch.mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.includes('/v1/images/available')) return Response.json({ available: true });
      if (url.endsWith('/v1/instances') && init?.method === 'POST') {
        const body = JSON.parse(String(init.body)) as { instanceId: string };
        return Response.json(
          { instanceId: body.instanceId, containerId: 'creator-container', targetIp: '100.64.0.2' },
          { status: 201 },
        );
      }
      if (init?.method === 'DELETE') return new Response(null, { status: 204 });
      throw new Error(`Unexpected fetch ${url}`);
    });
  });
  afterAll(async () => {
    mockFetch.mockRestore();
    if (roomId) await prisma.room.delete({ where: { id: roomId } });
    if (moduleId) await prisma.module.delete({ where: { id: moduleId } });
    if (pathId) await prisma.learningPath.delete({ where: { id: pathId } });
    await prisma.user.deleteMany({
      where: { id: { in: [creatorId, otherId, studentId, adminId] } },
    });
    await app.close();
  });

  it('isolates draft ownership and does not reveal static flags', async () => {
    expect((await call('POST', '/rooms', roomInput(), studentToken)).statusCode).toBe(403);
    const created = await call('POST', '/rooms', roomInput());
    expect(created.statusCode).toBe(201);
    const room = created.json().data;
    roomId = room.id;
    expect(room.status).toBe('draft');
    expect(room.tasks[0].questions[0].answerConfigured).toBe(true);
    expect(created.body).not.toContain('CF{creator}');
    expect(created.body).not.toContain('answerHash');
    expect(
      (
        await app.inject({
          method: 'PUT',
          url: `/api/v1/admin/cms/rooms/${roomId}`,
          headers: { authorization: `Bearer ${adminToken}` },
          payload: { version: room.updatedAt, data: { ...roomInput(), starterTask: undefined } },
        })
      ).statusCode,
    ).toBe(400);
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/api/v1/admin/cms/tasks',
          headers: { authorization: `Bearer ${adminToken}` },
          payload: { roomId, title: 'Bypass', contentMdx: '# Bypass', taskOrder: 2 },
        })
      ).statusCode,
    ).toBe(400);
    expect((await call('GET', `/rooms/${roomId}`, undefined, otherToken)).statusCode).toBe(404);
    expect(
      (
        await call(
          'PUT',
          `/rooms/${roomId}`,
          { version: room.updatedAt, data: { ...roomInput(), starterTask: undefined } },
          otherToken,
        )
      ).statusCode,
    ).toBe(404);
    expect(
      (
        await app.inject({
          method: 'GET',
          url: `/api/v1/rooms/${room.slug}`,
          headers: { authorization: `Bearer ${studentToken}` },
        })
      ).statusCode,
    ).toBe(404);
  });

  it('stores a private attachment and enforces upload validation', async () => {
    const url = `/api/v1/creator/rooms/${roomId}/attachments?filename=notes.txt&mime=text%2Fplain`;
    const bytes = Buffer.from('Lab notes');
    const upload = await app.inject({
      method: 'POST',
      url,
      headers: {
        authorization: `Bearer ${creatorToken}`,
        'content-type': 'application/octet-stream',
      },
      payload: bytes,
    });
    expect(upload.statusCode).toBe(201);
    const fileId = upload.json().data.id as string;
    attachmentId = fileId;
    expect(
      (
        await app.inject({
          method: 'GET',
          url: `/api/v1/creator/rooms/${roomId}/attachments/${fileId}`,
          headers: { authorization: `Bearer ${otherToken}` },
        })
      ).statusCode,
    ).toBe(404);
    const download = await app.inject({
      method: 'GET',
      url: `/api/v1/creator/rooms/${roomId}/attachments/${fileId}`,
      headers: { authorization: `Bearer ${creatorToken}` },
    });
    expect(download.statusCode).toBe(200);
    expect(download.body).toBe('Lab notes');
    const bad = await app.inject({
      method: 'POST',
      url: `/api/v1/creator/rooms/${roomId}/attachments?filename=bad.pdf&mime=application%2Fpdf`,
      headers: {
        authorization: `Bearer ${creatorToken}`,
        'content-type': 'application/octet-stream',
      },
      payload: bytes,
    });
    expect(bad.statusCode).toBe(400);
  });

  it('requires a real test of every flag for the current revision before admin publication', async () => {
    const room = (await call('GET', `/rooms/${roomId}`)).json().data;
    const questionId = room.tasks[0].questions[0].id as string;
    expect((await call('POST', `/rooms/${roomId}/submit-review`)).statusCode).toBe(400);
    expect(
      (
        await app.inject({
          method: 'PATCH',
          url: `/api/v1/admin/cms/rooms/${roomId}/status`,
          headers: { authorization: `Bearer ${adminToken}` },
          payload: { version: room.updatedAt, status: 'published' },
        })
      ).statusCode,
    ).toBe(400);
    const started = await call('POST', `/rooms/${roomId}/test`);
    expect(started.statusCode).toBe(201);
    expect(
      (await call('POST', `/rooms/${roomId}/test/flags/${questionId}`, { answer: 'wrong' })).json()
        .data.correct,
    ).toBe(false);
    const correct = await call('POST', `/rooms/${roomId}/test/flags/${questionId}`, {
      answer: 'CF{creator}',
    });
    expect(correct.json().data.passed).toBe(true);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: creatorId } })).expPoints).toBe(0);
    const task = room.tasks[0];
    const changed = await call('PUT', `/rooms/${roomId}/tasks/${task.id}`, {
      version: task.updatedAt,
      data: {
        roomId,
        title: task.title,
        taskOrder: task.taskOrder,
        contentMdx: '# Updated lesson',
      },
    });
    expect(changed.statusCode).toBe(200);
    expect((await call('GET', `/rooms/${roomId}/test`)).json().data.passed).toBe(false);
    expect((await call('POST', `/rooms/${roomId}/submit-review`)).statusCode).toBe(400);
    expect((await call('DELETE', `/rooms/${roomId}/test`)).statusCode).toBe(200);
    expect((await call('POST', `/rooms/${roomId}/test`)).statusCode).toBe(201);
    expect(
      (
        await call('POST', `/rooms/${roomId}/test/flags/${questionId}`, { answer: 'CF{creator}' })
      ).json().data.passed,
    ).toBe(true);
    const submitted = await call('POST', `/rooms/${roomId}/submit-review`);
    expect(submitted.statusCode).toBe(200);
    expect(submitted.json().data.reviewStatus).toBe('pending_review');
    expect(
      (
        await call('PUT', `/rooms/${roomId}`, {
          version: room.updatedAt,
          data: { ...roomInput(), starterTask: undefined },
        })
      ).statusCode,
    ).toBe(400);
    const queue = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/creator-reviews',
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(queue.statusCode).toBe(200);
    expect(queue.body).toContain(roomId);
    expect(queue.body).not.toContain('CF{creator}');
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/api/v1/admin/creator-reviews',
          headers: { authorization: `Bearer ${studentToken}` },
        })
      ).statusCode,
    ).toBe(403);
    const approved = await app.inject({
      method: 'POST',
      url: `/api/v1/admin/creator-reviews/${roomId}/decision`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { decision: 'approved' },
    });
    expect(approved.statusCode).toBe(200);
    expect(approved.json().data.status).toBe('published');
    const learner = await app.inject({
      method: 'GET',
      url: `/api/v1/rooms/${room.slug}`,
      headers: { authorization: `Bearer ${studentToken}` },
    });
    expect(learner.statusCode).toBe(200);
    expect(learner.json().data.attachments).toHaveLength(1);
    const file = await app.inject({
      method: 'GET',
      url: `/api/v1/rooms/${room.slug}/attachments/${attachmentId}`,
      headers: { authorization: `Bearer ${studentToken}` },
    });
    expect(file.statusCode).toBe(200);
    expect(file.body).toBe('Lab notes');
  });
});
