import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { generateTokens } from '../../lib/security.js';
import { redis } from '../../lib/redis.js';

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
      if (String(input).endsWith('/attackbox')) {
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
    await prisma.labInstance.deleteMany({ where: { userId: { in: [userId, otherId] } } });
    await prisma.room.deleteMany({ where: { pathId } });
    await prisma.learningPath.delete({ where: { id: pathId } });
    await prisma.user.deleteMany({ where: { id: { in: [userId, otherId] } } });
    await app.close();
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
