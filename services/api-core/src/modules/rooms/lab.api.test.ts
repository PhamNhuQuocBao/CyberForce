import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { generateTokens } from '../../lib/security.js';

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
    fetchMock.mockImplementation(async (_input, init) => {
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
});
