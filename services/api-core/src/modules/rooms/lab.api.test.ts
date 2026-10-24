import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { generateTokens } from '../../lib/security.js';
import { redis } from '../../lib/redis.js';
import { env } from '../../config/env.js';
import { createDynamicFlag } from '../submissions/flag-validator.service.js';

describe('CF-301 lab lifecycle API', () => {
  const app = buildApp();
  const suffix = `lab-${Date.now()}`;
  const fetchMock = vi.spyOn(globalThis, 'fetch');
  let userId: string;
  let otherId: string;
  let pathId: string;
  let token: string;
  let otherToken: string;
  let roomId: string;
  let attackBoxRunning = false;
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
    const room = await prisma.room.create({
      data: {
        title: 'Lab',
        slug: suffix,
        pathId,
        publishedAt: new Date(),
        targetTemplateSpec: { image: 'cyberforce/cf301-smoke:test' },
      },
    });
    roomId = room.id;
    await prisma.room.createMany({
      data: [
        {
          title: 'Paid',
          slug: `paid-${suffix}`,
          pathId,
          publishedAt: new Date(),
          isFree: false,
          targetTemplateSpec: { image: 'cyberforce/cf301-smoke:test' },
        },
        {
          title: 'Draft',
          slug: `draft-${suffix}`,
          pathId,
          targetTemplateSpec: { image: 'cyberforce/cf301-smoke:test' },
        },
        {
          title: 'No image',
          slug: `no-image-${suffix}`,
          pathId,
          publishedAt: new Date(),
          targetTemplateSpec: {},
        },
      ],
    });
    fetchMock.mockImplementation(async (input, init) => {
      const requestUrl = String(input);
      if (requestUrl.endsWith('/vpn-network') || requestUrl.includes('/v1/access/')) {
        return new Response(null, { status: 204 });
      }
      if (requestUrl.endsWith('/attackbox')) {
        if (init?.method === 'DELETE') {
          attackBoxRunning = false;
          return new Response(null, { status: 204 });
        }
        if (init?.method === 'POST') attackBoxRunning = true;
        return new Response(JSON.stringify({ running: attackBoxRunning }), {
          status: init?.method === 'POST' ? 201 : 200,
        });
      }
      if (init?.method === 'DELETE') return new Response(null, { status: 204 });
      const body = JSON.parse(String(init?.body)) as { instanceId: string };
      return new Response(
        JSON.stringify({
          instanceId: body.instanceId,
          containerId: 'test-container',
          targetIp: '100.64.0.2',
        }),
        { status: 201 },
      );
    });
  });

  afterAll(async () => {
    fetchMock.mockRestore();
    await prisma.vpnPeer.deleteMany({ where: { userId: { in: [userId, otherId] } } });
    await prisma.labInstance.deleteMany({ where: { userId: { in: [userId, otherId] } } });
    await prisma.room.deleteMany({ where: { pathId } });
    await prisma.learningPath.delete({ where: { id: pathId } });
    await prisma.user.deleteMany({ where: { id: { in: [userId, otherId] } } });
    await app.close();
  });

  it('grants only the owner peer access to its running target and revokes on stop', async () => {
    await prisma.vpnPeer.create({
      data: {
        userId,
        publicKey: Buffer.alloc(32, 8).toString('base64'),
        ipAddress: '100.127.240.20',
      },
    });
    fetchMock.mockClear();
    const headers = { authorization: `Bearer ${token}` };
    const spawn = await app.inject({ method: 'POST', url: `${url}/spawn`, headers });
    expect(spawn.statusCode).toBe(201);
    const id = spawn.json().data.instanceId as string;
    const grant = fetchMock.mock.calls.find(
      ([input, init]) => String(input).endsWith(`/v1/access/${id}`) && init?.method === 'PUT',
    );
    expect(grant).toBeDefined();
    expect(JSON.parse(String(grant![1]?.body))).toMatchObject({
      userId,
      peerIp: '100.127.240.20',
      targetIp: '100.64.0.2',
    });
    expect(
      fetchMock.mock.calls.some(
        ([input, init]) =>
          String(input).endsWith(`/v1/instances/${id}/vpn-network`) && init?.method === 'POST',
      ),
    ).toBe(true);
    const stopped = await app.inject({ method: 'POST', url: `${url}/stop`, headers });
    expect(stopped.statusCode).toBe(200);
    expect(
      fetchMock.mock.calls.some(
        ([input, init]) =>
          String(input).endsWith(`/v1/instances/${id}`) && init?.method === 'DELETE',
      ),
    ).toBe(true);
    await prisma.vpnPeer.delete({ where: { userId } });
  });

  it('stops a new lab when its VPN grant fails', async () => {
    await prisma.vpnPeer.create({
      data: {
        userId,
        publicKey: Buffer.alloc(32, 9).toString('base64'),
        ipAddress: '100.127.240.21',
      },
    });
    const original = fetchMock.getMockImplementation()!;
    fetchMock.mockImplementation(async (input, init) => {
      if (String(input).includes('/v1/access/') && init?.method === 'PUT')
        return new Response(null, { status: 503 });
      return original(input, init);
    });
    try {
      const response = await app.inject({
        method: 'POST',
        url: `${url}/spawn`,
        headers: { authorization: `Bearer ${token}` },
      });
      expect(response.statusCode).toBe(503);
      expect(
        await prisma.labInstance.count({
          where: { userId, status: { in: ['running', 'provisioning'] } },
        }),
      ).toBe(0);
    } finally {
      fetchMock.mockImplementation(original);
      await prisma.vpnPeer.delete({ where: { userId } });
    }
  });

  it('gates spawn by login and room access before contacting Docker', async () => {
    expect((await app.inject({ method: 'POST', url: `${url}/spawn` })).statusCode).toBe(401);
    for (const [slug, status] of [
      [`paid-${suffix}`, 403],
      [`draft-${suffix}`, 404],
      [`no-image-${suffix}`, 409],
    ] as const) {
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/rooms/${slug}/spawn`,
        headers: { authorization: `Bearer ${token}` },
      });
      expect(response.statusCode).toBe(status);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('stores one running session and lets only its owner stop it', async () => {
    const spawn = await app.inject({
      method: 'POST',
      url: `${url}/spawn`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(spawn.statusCode).toBe(201);
    expect(spawn.json().data.targetIp).toBe('100.64.0.2');
    expect(spawn.body).not.toContain('containerId');
    expect(JSON.parse(String(fetchMock.mock.lastCall?.[1]?.body))).not.toHaveProperty(
      'dynamicFlag',
    );
    const id = spawn.json().data.instanceId as string;
    const stored = await prisma.labInstance.findUniqueOrThrow({ where: { id } });
    expect(stored.roomId).toBe(roomId);
    expect(stored.dynamicSalt).toHaveLength(32);
    expect(stored.status).toBe('running');
    const duplicate = await app.inject({
      method: 'POST',
      url: `${url}/spawn`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(duplicate.statusCode).toBe(409);
    const foreignStop = await app.inject({
      method: 'POST',
      url: `${url}/stop`,
      headers: { authorization: `Bearer ${otherToken}` },
    });
    expect(foreignStop.statusCode).toBe(404);
    const stop = await app.inject({
      method: 'POST',
      url: `${url}/stop`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(stop.statusCode).toBe(200);
    expect((await prisma.labInstance.findUniqueOrThrow({ where: { id } })).status).toBe(
      'terminated',
    );
  });

  it('injects a per-session dynamic flag that the submission API accepts', async () => {
    const task = await prisma.task.create({
      data: { roomId, title: 'Dynamic task', taskOrder: 1, contentMdx: 'Find the flag' },
    });
    const question = await prisma.question.create({
      data: { taskId: task.id, questionText: 'Flag?', flagType: 'dynamic_hmac' },
    });
    const previousKey = env.PLATFORM_MASTER_KEY;
    const headers = { authorization: `Bearer ${token}` };
    try {
      fetchMock.mockClear();
      env.PLATFORM_MASTER_KEY = 'cyberforce_platform_master_hmac_secret_2026';
      const unavailable = await app.inject({ method: 'POST', url: `${url}/spawn`, headers });
      expect(unavailable.statusCode).toBe(503);
      expect(unavailable.json().error.code).toBe('DYNAMIC_FLAG_UNAVAILABLE');
      expect(fetchMock).not.toHaveBeenCalled();

      env.PLATFORM_MASTER_KEY = 'integration-only-key-with-at-least-32-characters';
      const spawn = await app.inject({ method: 'POST', url: `${url}/spawn`, headers });
      expect(spawn.statusCode).toBe(201);
      const instance = await prisma.labInstance.findUniqueOrThrow({
        where: { id: spawn.json().data.instanceId },
      });
      const flag = createDynamicFlag({
        userId,
        roomId,
        instanceSalt: instance.dynamicSalt,
        masterKey: env.PLATFORM_MASTER_KEY,
      });
      const request = JSON.parse(String(fetchMock.mock.lastCall?.[1]?.body));
      expect(request.dynamicFlag).toBe(flag);
      expect(request).not.toHaveProperty('masterKey');
      expect(spawn.body).not.toContain(flag);
      expect(spawn.body).not.toContain(instance.dynamicSalt);
      const submission = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${task.id}/submit`,
        headers,
        payload: { questionId: question.id, answer: flag, labInstanceId: instance.id },
      });
      expect(submission.statusCode).toBe(200);
      expect(submission.json().data.isCorrect).toBe(true);
      expect(submission.body).not.toContain(flag);
      await app.inject({ method: 'POST', url: `${url}/stop`, headers });
    } finally {
      env.PLATFORM_MASTER_KEY = previousKey;
      await prisma.question.delete({ where: { id: question.id } });
      await prisma.task.delete({ where: { id: task.id } });
    }
  });

  it('issues a one-use terminal ticket only for the running lab owner', async () => {
    const ticketUrl = `${url}/terminal-ticket`;
    const ownerHeaders = { authorization: `Bearer ${token}` };
    expect((await app.inject({ method: 'POST', url: ticketUrl })).statusCode).toBe(401);
    expect(
      (await app.inject({ method: 'POST', url: ticketUrl, headers: ownerHeaders })).statusCode,
    ).toBe(404);
    const spawn = await app.inject({ method: 'POST', url: `${url}/spawn`, headers: ownerHeaders });
    expect(spawn.statusCode).toBe(201);
    expect(
      (
        await app.inject({
          method: 'POST',
          url: ticketUrl,
          headers: { authorization: `Bearer ${otherToken}` },
        })
      ).statusCode,
    ).toBe(404);
    expect(
      (await app.inject({ method: 'GET', url: `${url}/lab`, headers: ownerHeaders })).json().data
        .instanceId,
    ).toBe(spawn.json().data.instanceId);
    const response = await app.inject({ method: 'POST', url: ticketUrl, headers: ownerHeaders });
    expect(response.statusCode).toBe(200);
    const ticket = response.json().data.ticket as string;
    expect(ticket).toMatch(/^[0-9a-f]{64}$/);
    const key = `lab:terminal:ticket:${ticket}`;
    expect(JSON.parse((await redis.getdel(key))!).instanceId).toBe(spawn.json().data.instanceId);
    expect(await redis.getdel(key)).toBeNull();
    await app.inject({ method: 'POST', url: `${url}/stop`, headers: ownerHeaders });
    expect(
      (await app.inject({ method: 'POST', url: ticketUrl, headers: ownerHeaders })).statusCode,
    ).toBe(404);
  });

  it('requires a running owner lab and attackbox before issuing a one-use viewer ticket', async () => {
    const ownerHeaders = { authorization: `Bearer ${token}` };
    const ticketUrl = `${url}/attackbox/ticket`;
    expect((await app.inject({ method: 'POST', url: ticketUrl })).statusCode).toBe(401);
    expect(
      (await app.inject({ method: 'POST', url: ticketUrl, headers: ownerHeaders })).statusCode,
    ).toBe(404);
    expect(
      (
        await app.inject({
          method: 'POST',
          url: `/api/v1/rooms/paid-${suffix}/attackbox`,
          headers: ownerHeaders,
        })
      ).statusCode,
    ).toBe(403);
    const spawn = await app.inject({ method: 'POST', url: `${url}/spawn`, headers: ownerHeaders });
    expect(spawn.statusCode).toBe(201);
    expect(
      (await app.inject({ method: 'POST', url: ticketUrl, headers: ownerHeaders })).statusCode,
    ).toBe(404);
    expect(
      (
        await app.inject({
          method: 'POST',
          url: `${url}/attackbox`,
          headers: { authorization: `Bearer ${otherToken}` },
        })
      ).statusCode,
    ).toBe(404);
    expect(
      (await app.inject({ method: 'POST', url: `${url}/attackbox`, headers: ownerHeaders }))
        .statusCode,
    ).toBe(201);
    expect(
      (await app.inject({ method: 'GET', url: `${url}/attackbox`, headers: ownerHeaders })).json()
        .data.running,
    ).toBe(true);
    const response = await app.inject({ method: 'POST', url: ticketUrl, headers: ownerHeaders });
    expect(response.statusCode).toBe(200);
    const ticket = response.json().data.ticket as string;
    expect(ticket).toMatch(/^[0-9a-f]{64}$/);
    const key = `lab:attackbox:ticket:${ticket}`;
    expect(JSON.parse((await redis.getdel(key))!).instanceId).toBe(spawn.json().data.instanceId);
    expect(await redis.getdel(key)).toBeNull();
    expect(
      (await app.inject({ method: 'DELETE', url: `${url}/attackbox`, headers: ownerHeaders }))
        .statusCode,
    ).toBe(200);
    expect(
      (await app.inject({ method: 'POST', url: ticketUrl, headers: ownerHeaders })).statusCode,
    ).toBe(404);
    await app.inject({ method: 'POST', url: `${url}/stop`, headers: ownerHeaders });
  });

  it('cleans up a failed spawn and does not strand an active DB session', async () => {
    fetchMock.mockImplementationOnce(async () => new Response('failed', { status: 502 }));
    const failed = await app.inject({
      method: 'POST',
      url: `${url}/spawn`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(failed.statusCode).toBe(503);
    expect(
      await prisma.labInstance.count({
        where: { userId, status: { in: ['running', 'provisioning'] } },
      }),
    ).toBe(0);
  });

  it('rejects a concurrent spawn for the same account', async () => {
    fetchMock.mockImplementationOnce(async (_input, init) => {
      await new Promise((resolve) => setTimeout(resolve, 75));
      const body = JSON.parse(String(init?.body)) as { instanceId: string };
      return new Response(
        JSON.stringify({
          instanceId: body.instanceId,
          containerId: 'test-container',
          targetIp: '100.64.0.2',
        }),
        { status: 201 },
      );
    });
    const request = () =>
      app.inject({
        method: 'POST',
        url: `${url}/spawn`,
        headers: { authorization: `Bearer ${token}` },
      });
    const responses = await Promise.all([request(), request()]);
    expect(responses.map((response) => response.statusCode).sort()).toEqual([201, 409]);
    expect(await prisma.labInstance.count({ where: { userId, status: 'running' } })).toBe(1);
    expect(
      (
        await app.inject({
          method: 'POST',
          url: `${url}/stop`,
          headers: { authorization: `Bearer ${token}` },
        })
      ).statusCode,
    ).toBe(200);
  });

  it('extends only the owner session, at most three times, including grace', async () => {
    const spawn = await app.inject({
      method: 'POST',
      url: `${url}/spawn`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(spawn.statusCode).toBe(201);
    const id = spawn.json().data.instanceId as string;
    const extend = (authorization?: string) =>
      app.inject({
        method: 'POST',
        url: `${url}/extend`,
        headers: authorization ? { authorization: `Bearer ${authorization}` } : {},
      });
    expect((await extend()).statusCode).toBe(401);
    expect((await extend(otherToken)).statusCode).toBe(404);
    const graceDeadline = new Date(Date.now() - 60_000);
    await prisma.labInstance.update({
      where: { id },
      data: { expiresAt: graceDeadline },
    });
    const graceStatus = await app.inject({
      method: 'GET',
      url: `${url}/lab`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(graceStatus.statusCode).toBe(200);
    expect(graceStatus.json().data.remainingSeconds).toBe(0);
    expect(
      (
        await app.inject({
          method: 'POST',
          url: `${url}/terminal-ticket`,
          headers: { authorization: `Bearer ${token}` },
        })
      ).statusCode,
    ).toBe(404);
    const first = await extend(token);
    expect(first.statusCode).toBe(200);
    expect(first.json().data.extensionCount).toBe(1);
    expect(first.json().data.remainingSeconds).toBeGreaterThan(3500);
    expect((await extend(token)).json().data.extensionCount).toBe(2);
    const concurrent = await Promise.all([extend(token), extend(token)]);
    expect(concurrent.map((response) => response.statusCode).sort()).toEqual([200, 409]);
    const fourth = await extend(token);
    expect(fourth.statusCode).toBe(409);
    expect(fourth.json().error.code).toBe('LAB_EXTENSION_LIMIT');
    const afterThree = await prisma.labInstance.findUniqueOrThrow({ where: { id } });
    expect(afterThree.extensionCount).toBe(3);
    expect(afterThree.expiresAt.getTime()).toBe(graceDeadline.getTime() + 3 * 60 * 60_000);
    await prisma.labInstance.update({
      where: { id },
      data: { extensionCount: 2, expiresAt: new Date(Date.now() - 4 * 60_000) },
    });
    const expired = await extend(token);
    expect(expired.statusCode).toBe(409);
    expect(expired.json().error.code).toBe('LAB_LEASE_EXPIRED');
    expect((await prisma.labInstance.findUniqueOrThrow({ where: { id } })).extensionCount).toBe(2);
    expect(
      (
        await app.inject({
          method: 'POST',
          url: `${url}/stop`,
          headers: { authorization: `Bearer ${token}` },
        })
      ).statusCode,
    ).toBe(200);
  });
});
