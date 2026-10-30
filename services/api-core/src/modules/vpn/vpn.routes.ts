import type { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../../middleware/authenticate.js';
import { issueVpnConfig, vpnStatus } from './vpn.service.js';
import { connectVpnStatus, issueVpnStatusTicket } from './vpn.stream.js';

export const vpnRoutes: FastifyPluginAsync = async (app) => {
  app.post('/status-ticket', { preHandler: [authenticate] }, async (request, reply) =>
    reply.header('Cache-Control', 'private, no-store').send({
      success: true,
      data: await issueVpnStatusTicket(request.user!.sub, request.user!.jti, request.user!.exp),
    }),
  );
  app.get('/status-stream', { websocket: true }, (socket, request) => {
    const ticket =
      String(request.headers['sec-websocket-protocol'] ?? '')
        .split(',')
        .map((value) => value.trim())
        .find((value) => /^[0-9a-f]{64}$/.test(value)) ?? '';
    connectVpnStatus(socket, request, ticket);
  });
  app.get('/status', { preHandler: [authenticate] }, async (request, reply) =>
    reply.header('Cache-Control', 'private, no-store').send({
      success: true,
      data: await vpnStatus(request.user!.sub),
    }),
  );
  app.post('/config/download', { preHandler: [authenticate] }, async (request, reply) =>
    reply.header('Cache-Control', 'private, no-store').send({
      success: true,
      data: await issueVpnConfig(request.user!.sub, false),
    }),
  );
  app.post('/config/regenerate', { preHandler: [authenticate] }, async (request, reply) =>
    reply.header('Cache-Control', 'private, no-store').send({
      success: true,
      data: await issueVpnConfig(request.user!.sub, true),
    }),
  );
};
