import WebSocket from 'ws';
import type { FastifyRequest } from 'fastify';
import { env } from '../../config/env.js';
import { redis } from '../../lib/redis.js';
import { creatorTestStatus } from './creator.test-session.js';

export function connectCreatorTerminal(
  socket: WebSocket,
  request: FastifyRequest,
  roomId: string,
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
      const raw = await redis.getdel(`creator:terminal:${ticket}`);
      if (!raw) {
        socket.close(1008, 'Ticket expired');
        return;
      }
      const claims = JSON.parse(raw) as {
        roomId: string;
        userId: string;
        instanceId: string;
        jti: string;
        exp: number;
      };
      if (
        claims.roomId !== roomId ||
        claims.exp * 1000 <= Date.now() ||
        (await redis.get(`auth:blacklist:${claims.jti}`))
      ) {
        socket.close(1008, 'Unauthorized');
        return;
      }
      const test = await creatorTestStatus(roomId, claims.userId);
      if (
        test.instanceId !== claims.instanceId ||
        test.status !== 'running' ||
        !test.expiresAt ||
        new Date(test.expiresAt) <= new Date()
      ) {
        socket.close(1008, 'Test changed');
        return;
      }
      const url = new URL(env.ORCHESTRATOR_URL);
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      url.pathname = `/v1/instances/${claims.instanceId}/terminal`;
      upstream = new WebSocket(url, {
        headers: { Authorization: `Bearer ${env.ORCHESTRATOR_TOKEN}` },
        handshakeTimeout: 10000,
        maxPayload: 64 * 1024,
      });
      const target = upstream;
      target.on('open', () => {
        for (const item of pending) target.send(item.data, { binary: item.binary });
        pending.length = 0;
      });
      target.on('message', (data, binary) => {
        if (socket.readyState === WebSocket.OPEN) socket.send(data, { binary });
      });
      target.on('close', () => socket.close());
      target.on('error', () => socket.close(1011, 'Terminal unavailable'));
      const check = setInterval(async () => {
        try {
          if (
            claims.exp * 1000 <= Date.now() ||
            (await redis.get(`auth:blacklist:${claims.jti}`))
          ) {
            close();
            return;
          }
          const current = await creatorTestStatus(roomId, claims.userId);
          if (
            current.instanceId !== claims.instanceId ||
            current.status !== 'running' ||
            !current.expiresAt ||
            new Date(current.expiresAt) <= new Date()
          )
            close();
        } catch {
          close();
        }
      }, 15000);
      socket.on('close', () => clearInterval(check));
      target.on('close', () => clearInterval(check));
    } catch {
      socket.close(1011, 'Terminal unavailable');
    }
  })();
}
