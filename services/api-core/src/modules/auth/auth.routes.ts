import type { FastifyPluginAsync } from 'fastify';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  meHandler,
  getOAuthUrlHandler,
  oauthCallbackHandler,
  linkInitiateHandler,
  linkVerifyPasswordHandler,
  linkVerifyOtpHandler,
  linkAccountHandler,
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

  // CF-102: Account Linking routes (Sub-flow 1.2)
  fastify.post('/link/send-otp', linkInitiateHandler);
  fastify.post('/link/verify-password', linkVerifyPasswordHandler);
  fastify.post('/link/verify-otp', linkVerifyOtpHandler);
  fastify.post('/link-account', linkAccountHandler);

  // Protected auth routes
  fastify.post('/logout', { preHandler: [authenticate] }, logoutHandler);
  fastify.get('/me', { preHandler: [authenticate] }, meHandler);
};
