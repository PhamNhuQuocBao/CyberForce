import { randomBytes } from 'node:crypto';
import WebSocket from 'ws';
import type { FastifyRequest } from 'fastify';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redis.js';
import { AuthError } from '../auth/auth.service.js';
import { getRoom } from './rooms.service.js';

const ticketKey = (ticket: string) => `lab:terminal:ticket:${ticket}`;

async function runningLab(slug: string, userId: string) {
  const room = await getRoom(slug, userId);
  const instance = await prisma.labInstance.findFirst({
    where: { roomId: room.id, userId, status: 'running' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, status: true, expiresAt: true, extensionCount: true, ipAddress: true },
  });
  if (!instance || instance.expiresAt.getTime() <= Date.now())
    throw new AuthError(404, 'Bạn chưa có máy lab đang chạy trong phòng này.', 'LAB_NOT_FOUND');
  return instance;
}

export async function currentLab(slug: string, userId: string) {
  const room = await getRoom(slug, userId);
  const instance = await prisma.labInstance.findFirst({
    where: { roomId: room.id, userId, status: { in: ['provisioning', 'running', 'terminating'] } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, status: true, expiresAt: true, extensionCount: true, ipAddress: true },
  });
  if (!instance)
    throw new AuthError(404, 'Bạn chưa có máy lab đang chạy trong phòng này.', 'LAB_NOT_FOUND');
  return {
    instanceId: instance.id,
    status: instance.status,
    targetIp: instance.ipAddress,
    expiresAt: instance.expiresAt.toISOString(),
    remainingSeconds: Math.max(0, Math.ceil((instance.expiresAt.getTime() - Date.now()) / 1000)),
    extensionCount: instance.extensionCount,
    maxExtensions: 3,
  };
}

export async function issueTerminalTicket(
  slug: string,
  userId: string,
  jti?: string,
  exp?: number,
) {
  if (!jti || !exp) throw new AuthError(401, 'Phiên đăng nhập không hợp lệ.', 'INVALID_TOKEN');
  const instance = await runningLab(slug, userId);
  const ticket = randomBytes(32).toString('hex');
  await redis.set(
    ticketKey(ticket),
    JSON.stringify({ slug, userId, instanceId: instance.id, jti, exp }),
    'EX',
    30,
  );
  return { ticket, expiresInSeconds: 30 };
}

export function connectTerminal(
  socket: WebSocket,
  request: FastifyRequest,
  slug: string,
  ticket: string,
) {
  let upstream: WebSocket | undefined;
  const pending: Array<{ data: WebSocket.RawData; binary: boolean }> = [];
  let pendingBytes = 0;
  const close = () => {
    upstream?.close();
    socket.close();
  };
  socket.on('close', close);
  // Register before any async authorization so keystrokes sent on browser open are not lost.
  socket.on('message', (data, binary) => {
    if (upstream?.readyState === WebSocket.OPEN) upstream.send(data, { binary });
    else if (!upstream || upstream.readyState === WebSocket.CONNECTING) {
      pendingBytes += Array.isArray(data)
        ? data.reduce((total, part) => total + part.byteLength, 0)
        : data.byteLength;
      if (pendingBytes > 64 * 1024) close();
      else pending.push({ data, binary });
    }
  });
  void (async () => {
    try {
      if (request.headers.origin !== env.WEB_ORIGIN || !/^[0-9a-f]{64}$/.test(ticket)) {
        socket.close(1008, 'Unauthorized');
        return;
      }
      const raw = await redis.getdel(ticketKey(ticket));
      if (!raw) {
        socket.close(1008, 'Ticket expired');
        return;
      }
      const claims = JSON.parse(raw) as {
        slug: string;
        userId: string;
        instanceId: string;
        jti: string;
        exp: number;
      };
      if (
        claims.slug !== slug ||
        claims.exp * 1000 <= Date.now() ||
        (await redis.get(`auth:blacklist:${claims.jti}`))
      ) {
        socket.close(1008, 'Unauthorized');
        return;
      }
      const lab = await runningLab(slug, claims.userId);
      if (lab.id !== claims.instanceId) {
        socket.close(1008, 'Lab changed');
        return;
      }
      const target = new URL(env.ORCHESTRATOR_URL);
      target.protocol = target.protocol === 'https:' ? 'wss:' : 'ws:';
      target.pathname = `/v1/instances/${lab.id}/terminal`;
      upstream = new WebSocket(target, {
        headers: { Authorization: `Bearer ${env.ORCHESTRATOR_TOKEN}` },
        handshakeTimeout: 10000,
        maxPayload: 64 * 1024,
      });
      if (socket.readyState !== WebSocket.OPEN) {
        upstream.close();
        return;
      }
      const targetSocket = upstream;
      targetSocket.on('open', () => {
        for (const item of pending) targetSocket.send(item.data, { binary: item.binary });
        pending.length = 0;
        pendingBytes = 0;
      });
      targetSocket.on('close', () => socket.close());
      targetSocket.on('error', () => socket.close(1011, 'Terminal unavailable'));
      targetSocket.on('message', (data, binary) => {
        if (socket.readyState === WebSocket.OPEN) socket.send(data, { binary });
      });
      const leaseCheck = setInterval(async () => {
        try {
          if (
            claims.exp * 1000 <= Date.now() ||
            (await redis.get(`auth:blacklist:${claims.jti}`))
          ) {
            close();
            return;
          }
          const active = await prisma.labInstance.findUnique({
            where: { id: lab.id },
            select: { status: true, expiresAt: true },
          });
          if (active?.status !== 'running' || active.expiresAt.getTime() <= Date.now()) close();
        } catch {
          close();
        }
      }, 15000);
      socket.on('close', () => clearInterval(leaseCheck));
      targetSocket.on('close', () => clearInterval(leaseCheck));
    } catch {
      socket.close(1011, 'Terminal unavailable');
    }
  })();
}
