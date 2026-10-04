import type { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../../middleware/authenticate.js';
import { submitCreatorRequestHandler, getMyRequestsHandler } from './roles.controller.js';

export const rolesRoutes: FastifyPluginAsync = async (fastify) => {
  // Student endpoints (Requires valid authentication)
  fastify.post('/request-creator', { preHandler: [authenticate] }, submitCreatorRequestHandler);
  fastify.get('/my-requests', { preHandler: [authenticate] }, getMyRequestsHandler);
};
