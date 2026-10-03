import type { FastifyPluginAsync } from 'fastify';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  meHandler,
  getOAuthUrlHandler,
  oauthCallbackHandler,
} from './auth.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Public auth routes (Email & Password)
  fastify.post('/register', registerHandler);
  fastify.post('/login', loginHandler);
  fastify.post('/refresh', refreshHandler);

  // 1-Click OAuth2 routes (GitHub & Google)
  fastify.get('/oauth/:provider/url', getOAuthUrlHandler);
  fastify.get('/oauth/:provider/callback', oauthCallbackHandler);
  fastify.post('/oauth/:provider/callback', oauthCallbackHandler);

  // Protected auth routes
  fastify.post('/logout', { preHandler: [authenticate] }, logoutHandler);
  fastify.get('/me', { preHandler: [authenticate] }, meHandler);
};
