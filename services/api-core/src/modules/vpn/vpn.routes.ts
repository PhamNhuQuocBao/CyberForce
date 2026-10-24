import type { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../../middleware/authenticate.js';
import { issueVpnConfig, vpnStatus } from './vpn.service.js';

export const vpnRoutes: FastifyPluginAsync = async (app) => {
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
