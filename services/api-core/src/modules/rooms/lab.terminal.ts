import { randomBytes } from 'node:crypto';
import WebSocket from 'ws';
import type { FastifyRequest } from 'fastify';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redis.js';
import { AuthError } from '../auth/auth.service.js';
import { getRoom } from './rooms.service.js';
import { orchestratorRequest } from './lab.service.js';

type LabStream = 'terminal' | 'attackbox';
const ticketKey = (stream: LabStream, ticket: string) => `lab:${stream}:ticket:${ticket}`;

export async function runningLab(slug: string, userId: string) {
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

async function issueStreamTicket(
  stream: LabStream,
  slug: string,
  userId: string,
  jti?: string,
  exp?: number,
) {
  if (!jti || !exp) throw new AuthError(401, 'Phiên đăng nhập không hợp lệ.', 'INVALID_TOKEN');
  const instance = await runningLab(slug, userId);
  const ticket = randomBytes(32).toString('hex');
  await redis.set(
    ticketKey(stream, ticket),
    JSON.stringify({ slug, userId, instanceId: instance.id, jti, exp }),
    'EX',
    30,
  );
  return { ticket, expiresInSeconds: 30 };
}

export const issueTerminalTicket = (slug: string, userId: string, jti?: string, exp?: number) =>
  issueStreamTicket('terminal', slug, userId, jti, exp);

export async function attackBoxStatus(slug: string, userId: string) {
  const lab = await runningLab(slug, userId);
  const response = await orchestratorRequest(`/v1/instances/${lab.id}/attackbox`, 'GET');
  return (await response.json()) as { running: boolean };
}

export async function startAttackBox(slug: string, userId: string) {
  const lab = await runningLab(slug, userId);
  const response = await orchestratorRequest(`/v1/instances/${lab.id}/attackbox`, 'POST');
  return (await response.json()) as { running: boolean };
}

export async function stopAttackBox(slug: string, userId: string) {
  const lab = await runningLab(slug, userId);
  await orchestratorRequest(`/v1/instances/${lab.id}/attackbox`, 'DELETE');
  return { running: false };
}

export async function issueAttackBoxTicket(
  slug: string,
  userId: string,
  jti?: string,
  exp?: number,
) {
  const status = await attackBoxStatus(slug, userId);
  if (!status.running)
    throw new AuthError(404, 'AttackBox chưa chạy trong phiên lab này.', 'ATTACKBOX_NOT_FOUND');
  return issueStreamTicket('attackbox', slug, userId, jti, exp);
}

function connectStream(
  stream: LabStream,
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
      const raw = await redis.getdel(ticketKey(stream, ticket));
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
      target.pathname =
        stream === 'terminal'
          ? `/v1/instances/${lab.id}/terminal`
          : `/v1/instances/${lab.id}/attackbox/stream`;
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

export const connectTerminal = (
  socket: WebSocket,
  request: FastifyRequest,
  slug: string,
  ticket: string,
) => connectStream('terminal', socket, request, slug, ticket);

export const connectAttackBox = (
  socket: WebSocket,
  request: FastifyRequest,
  slug: string,
  ticket: string,
) => connectStream('attackbox', socket, request, slug, ticket);
