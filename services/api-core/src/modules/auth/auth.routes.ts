import type { FastifyPluginAsync } from 'fastify';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  meHandler,
} from './auth.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Public auth routes
  fastify.post('/register', registerHandler);
  fastify.post('/login', loginHandler);
  fastify.post('/refresh', refreshHandler);

  // Protected auth routes
  fastify.post('/logout', { preHandler: [authenticate] }, logoutHandler);
  fastify.get('/me', { preHandler: [authenticate] }, meHandler);
};
