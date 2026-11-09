import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { generateTokens } from '../../lib/security.js';

describe('CF-801 admin CMS', () => {
  const app = buildApp();
  const suffix = randomUUID();
  const mockFetch = vi.spyOn(globalThis, 'fetch');
  let imageAvailable = true;
  let adminId = '',
    studentId = '',
    adminToken = '',
    studentToken = '';
  let pathId = '',
    moduleId = '',
    roomId = '',
    taskId = '',
    questionId = '';
  const call = (
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    payload?: Record<string, unknown>,
    token = adminToken,
  ) =>
    app.inject({
      method,
      url: `/api/v1/admin/cms${url}`,
      headers: { authorization: `Bearer ${token}` },
      payload,
    });

  beforeAll(async () => {
    await app.ready();
    const admin = await prisma.user.create({
      data: { username: `adm-${suffix}`, email: `adm-${suffix}@test.invalid`, role: 'superadmin' },
    });
    const student = await prisma.user.create({
      data: { username: `stu-${suffix}`, email: `stu-${suffix}@test.invalid`, role: 'student' },
    });
    adminId = admin.id;
    studentId = student.id;
    adminToken = generateTokens(admin).accessToken;
    studentToken = generateTokens(student).accessToken;
    mockFetch.mockImplementation(async (input) => {
      if (String(input).includes('/v1/images/available'))
        return Response.json({ available: imageAvailable });
      throw new Error(`Unexpected fetch ${input}`);
    });
  });
  afterAll(async () => {
    mockFetch.mockRestore();
    if (roomId) await prisma.room.delete({ where: { id: roomId } });
    if (moduleId) await prisma.module.delete({ where: { id: moduleId } });
    if (pathId) await prisma.learningPath.delete({ where: { id: pathId } });
    await prisma.user.deleteMany({ where: { id: { in: [adminId, studentId] } } });
    await app.close();
  });

  it('guards every CMS endpoint with the existing admin role', async () => {
    expect((await call('GET', '/paths', undefined, studentToken)).statusCode).toBe(403);
    expect((await call('POST', '/paths', {}, studentToken)).statusCode).toBe(403);
    expect((await call('GET', '/paths', undefined, '')).statusCode).toBe(401);
  });

  it('creates a hierarchy, validates fields, publishes a runnable room, and hides answers', async () => {
    const path = (
      await call('POST', '/paths', {
        title: 'CMS test',
        slug: `cms-${suffix}`,
        description: 'Test',
        category: 'Offense',
        difficultyLevel: 'Beginner',
        estimatedHours: 1,
        orderIndex: 1,
      })
    ).json().data;
    pathId = path.id;
    expect(path.status).toBe('draft');
    const publishedPath = (
      await call('PATCH', `/paths/${pathId}/status`, {
        version: path.updatedAt,
        status: 'published',
      })
    ).json().data;
    expect(publishedPath.isPublished).toBe(true);
    const module = (await call('POST', '/modules', { pathId, title: 'Core', orderIndex: 1 })).json()
      .data;
    moduleId = module.id;
    const publishedModule = (
      await call('PATCH', `/modules/${moduleId}/status`, {
        version: module.updatedAt,
        status: 'published',
      })
    ).json().data;
    expect(publishedModule.status).toBe('published');

    const baseRoom = {
      pathId,
      moduleId,
      title: 'Lab',
      slug: `lab-${suffix}`,
      description: 'Try it',
      difficulty: 'Easy',
      roomType: 'walkthrough',
      isFree: true,
      pointsReward: 50,
      estimatedMinutes: 30,
      orderIndex: 1,
      prerequisiteRoomId: null,
      requiredForCapstone: false,
      labEnabled: true,
      image: 'cyberforce/lab-sqli:v1',
      cpuMillicores: 500,
      memoryMb: 512,
      ports: [80],
      starterTask: {
        title: 'Solve',
        contentMdx: 'Instructions',
        questionText: 'Flag?',
        flagType: 'static',
        answer: 'CF{secret}',
        pointsReward: 50,
      },
    };
    expect((await call('POST', '/rooms', { ...baseRoom, pointsReward: -10 })).statusCode).toBe(400);
    expect((await call('POST', '/rooms', { ...baseRoom, image: undefined })).statusCode).toBe(400);
    const room = (await call('POST', '/rooms', baseRoom)).json().data;
    roomId = room.id;
    const task = await prisma.task.findFirstOrThrow({ where: { roomId } });
    taskId = task.id;
    const question = await prisma.question.findFirstOrThrow({ where: { taskId } });
    questionId = question.id;
    expect(question.answerHash).not.toBe('CF{secret}');
    const adminQuestion = (await call('GET', `/questions/${questionId}`)).json().data;
    expect(adminQuestion.answerConfigured).toBe(true);
    expect(JSON.stringify(adminQuestion)).not.toContain('CF{secret}');
    expect(adminQuestion.answerHash).toBeUndefined();

    const publishedRoom = (
      await call('PATCH', `/rooms/${roomId}/status`, {
        version: room.updatedAt,
        status: 'published',
      })
    ).json().data;
    expect(publishedRoom.status).toBe('published');
    const catalog = await app.inject({ method: 'GET', url: '/api/v1/paths' });
    expect(catalog.statusCode).toBe(200);
    expect(catalog.body).toContain(`cms-${suffix}`);
    const learnerRoom = await app.inject({
      method: 'GET',
      url: `/api/v1/rooms/${baseRoom.slug}`,
      headers: { authorization: `Bearer ${studentToken}` },
    });
    expect(learnerRoom.statusCode).toBe(200);
    expect(learnerRoom.body).not.toContain('CF{secret}');
    expect(learnerRoom.json().data.tasks[0].questions).toHaveLength(1);
    const adminTask = (await call('GET', `/tasks/${taskId}`)).json().data;
    expect(
      (
        await call('PATCH', `/tasks/${taskId}/status`, {
          version: adminTask.updatedAt,
          status: 'archived',
        })
      ).statusCode,
    ).toBe(400);
    expect(
      (
        await call('PATCH', `/questions/${questionId}/status`, {
          version: adminQuestion.updatedAt,
          status: 'archived',
        })
      ).statusCode,
    ).toBe(400);
  });

  it('rejects stale edits and dependent deletion, then archives content from learners', async () => {
    const room = (await call('GET', `/rooms/${roomId}`)).json().data;
    const updated = (
      await call('PUT', `/rooms/${roomId}`, {
        version: room.updatedAt,
        data: {
          pathId,
          moduleId,
          title: 'Updated Lab',
          slug: room.slug,
          description: 'Try it',
          difficulty: 'Easy',
          roomType: 'walkthrough',
          isFree: true,
          pointsReward: 50,
          estimatedMinutes: 30,
          orderIndex: 1,
          prerequisiteRoomId: null,
          requiredForCapstone: false,
          labEnabled: true,
          image: 'cyberforce/lab-sqli:v1',
          cpuMillicores: 500,
          memoryMb: 512,
          ports: [80],
        },
      })
    ).json().data;
    expect(updated.title).toBe('Updated Lab');
    expect(
      (await call('PUT', `/rooms/${roomId}`, { version: room.updatedAt, data: {} })).statusCode,
    ).toBe(409);
    const archived = (
      await call('PATCH', `/rooms/${roomId}/status`, {
        version: updated.updatedAt,
        status: 'archived',
      })
    ).json().data;
    expect(archived.publishedAt).toBeNull();
    expect(
      (
        await app.inject({
          method: 'GET',
          url: `/api/v1/rooms/${room.slug}`,
          headers: { authorization: `Bearer ${studentToken}` },
        })
      ).statusCode,
    ).toBe(404);
    expect(
      (await call('DELETE', `/rooms/${roomId}`, { version: archived.updatedAt })).statusCode,
    ).toBe(400);
    const draft = (
      await call('PATCH', `/rooms/${roomId}/status`, {
        version: archived.updatedAt,
        status: 'draft',
      })
    ).json().data;
    expect(
      (await call('DELETE', `/rooms/${roomId}`, { version: draft.updatedAt })).statusCode,
    ).toBe(409);
    imageAvailable = false;
    expect(
      (
        await call('PATCH', `/rooms/${roomId}/status`, {
          version: draft.updatedAt,
          status: 'published',
        })
      ).statusCode,
    ).toBe(400);
    imageAvailable = true;
  });
});
