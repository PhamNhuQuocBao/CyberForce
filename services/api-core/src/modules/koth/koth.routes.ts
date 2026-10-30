import type { FastifyPluginAsync } from 'fastify';
import WebSocket from 'ws';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { redis } from '../../lib/redis.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import {
  consumeScoreboardTicket,
  createMatch,
  creditTick,
  dueTicks,
  getScoreboard,
  issueScoreboardTicket,
  kothEventChannel,
  readScoreboard,
  requireRunnerToken,
} from './koth.service.js';

const id = z.uuid();
const matchBody = z.object({ roomId: id, instanceId: id, userIds: z.array(id).min(4).max(10) });
const tickBody = z.object({ king: z.string().max(50), healthy: z.boolean() });

export const kothRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/matches',
    { preHandler: [authenticate, requireRole(['org_admin', 'superadmin'])] },
    async (request, reply) => {
      const match = await createMatch(matchBody.parse(request.body), request.user!.sub);
      return reply.status(201).send({ success: true, data: match });
    },
  );
  app.get('/matches/:id/scoreboard', { preHandler: [authenticate] }, async (request, reply) => {
    const { id: matchId } = z.object({ id }).parse(request.params);
    return reply
      .header('Cache-Control', 'private, no-store')
      .send({ success: true, data: await getScoreboard(matchId, request.user!.sub) });
  });
  app.post(
    '/matches/:id/scoreboard-ticket',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id: matchId } = z.object({ id }).parse(request.params);
      const data = await issueScoreboardTicket(
        matchId,
        request.user!.sub,
        request.user!.jti,
        request.user!.exp,
      );
      return reply.header('Cache-Control', 'private, no-store').send({ success: true, data });
    },
  );
  app.get('/internal/due', async (request) => {
    requireRunnerToken(request.headers.authorization);
    return { success: true, data: await dueTicks() };
  });
  app.post('/internal/matches/:id/ticks/:number', async (request) => {
    requireRunnerToken(request.headers.authorization);
    const params = z
      .object({ id, number: z.coerce.number().int().min(1).max(45) })
      .parse(request.params);
    return {
      success: true,
      data: await creditTick(params.id, params.number, tickBody.parse(request.body)),
    };
  });
};

export const kothWebsocketRoutes: FastifyPluginAsync = async (app) => {
  app.get('/:id', { websocket: true }, (socket, request) => {
    const parsed = z.object({ id }).safeParse(request.params);
    const ticket =
      String(request.headers['sec-websocket-protocol'] ?? '')
        .split(',')
        .map((part) => part.trim())
        .find((part) => /^[0-9a-f]{64}$/.test(part)) ?? '';
    if (!parsed.success || request.headers.origin !== env.WEB_ORIGIN) {
      socket.close(1008, 'Unauthorized');
      return;
    }
    const matchId = parsed.data.id;
    const subscriber = redis.duplicate();
    let timer: ReturnType<typeof setInterval> | undefined;
    socket.on('close', () => {
      if (timer) clearInterval(timer);
      subscriber.disconnect();
    });
    void (async () => {
      try {
        const claims = await consumeScoreboardTicket(ticket, matchId);
        if (!claims || socket.readyState !== WebSocket.OPEN) {
          socket.close(1008, 'Unauthorized');
          return;
        }
        await subscriber.subscribe(kothEventChannel(matchId));
        subscriber.on('message', (_channel, message) => {
          if (socket.readyState === WebSocket.OPEN) socket.send(message);
        });
        socket.send(
          JSON.stringify({ type: 'KOTH_SCOREBOARD', data: await readScoreboard(matchId) }),
        );
        timer = setInterval(() => {
          void (async () => {
            if (
              claims.exp * 1000 <= Date.now() ||
              (await redis.get(`auth:blacklist:${claims.jti}`))
            )
              socket.close(1008, 'Session expired');
          })().catch(() => socket.close(1011, 'Session unavailable'));
        }, 10_000);
      } catch {
        socket.close(1011, 'Scoreboard unavailable');
      }
    })();
  });
};
