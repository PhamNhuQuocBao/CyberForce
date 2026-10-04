import type { FastifyPluginAsync } from 'fastify';
import { getProfileHandler, updateProfileHandler } from './users.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';

export const usersRoutes: FastifyPluginAsync = async (fastify) => {
  // Public/Self Dossier endpoint (optional authentication to detect isSelf)
  fastify.get('/:username/profile', { preHandler: [optionalAuthenticate] }, getProfileHandler);

  // Authenticated Profile Settings Update
  fastify.patch('/me/profile', { preHandler: [authenticate] }, updateProfileHandler);
};
