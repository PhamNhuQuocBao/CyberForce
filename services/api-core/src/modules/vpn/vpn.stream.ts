import { randomBytes } from 'node:crypto';
import type { FastifyRequest } from 'fastify';
import WebSocket from 'ws';
import { env } from '../../config/env.js';
import { redis } from '../../lib/redis.js';
import { AuthError } from '../auth/auth.service.js';
import { vpnLiveStatus } from './vpn.service.js';

const ticketKey = (ticket: string) => `vpn:status:ticket:${ticket}`;

export async function issueVpnStatusTicket(userId: string, jti?: string, exp?: number) {
  if (!jti || !exp) throw new AuthError(401, 'Phiên đăng nhập không hợp lệ.', 'INVALID_TOKEN');
  const ticket = randomBytes(32).toString('hex');
  await redis.set(ticketKey(ticket), JSON.stringify({ userId, jti, exp }), 'EX', 30);
  return { ticket, expiresInSeconds: 30 };
}

export function connectVpnStatus(socket: WebSocket, request: FastifyRequest, ticket: string) {
  let timer: ReturnType<typeof setInterval> | undefined;
  let busy = false;
  let previous = '';
  const close = () => {
    if (timer) clearInterval(timer);
    if (socket.readyState === WebSocket.OPEN) socket.close();
  };
  socket.on('close', close);
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
      const claims = JSON.parse(raw) as { userId: string; jti: string; exp: number };
      const sample = async () => {
        if (busy || socket.readyState !== WebSocket.OPEN) return;
        busy = true;
        try {
          if (
            claims.exp * 1000 <= Date.now() ||
            (await redis.get(`auth:blacklist:${claims.jti}`))
          ) {
            socket.close(1008, 'Session expired');
            return;
          }
          const data = await vpnLiveStatus(claims.userId);
          const value = JSON.stringify(data);
          if (value !== previous && socket.readyState === WebSocket.OPEN) {
            previous = value;
            socket.send(JSON.stringify({ type: 'VPN_STATUS_CHANGE', data }));
          }
        } catch {
          if (previous !== 'unavailable' && socket.readyState === WebSocket.OPEN) {
            previous = 'unavailable';
            socket.send(JSON.stringify({ type: 'VPN_STATUS_UNAVAILABLE' }));
          }
        } finally {
          busy = false;
        }
      };
      await sample();
      if (socket.readyState === WebSocket.OPEN) timer = setInterval(() => void sample(), 1000);
    } catch {
      socket.close(1011, 'VPN status unavailable');
    }
  })();
}
