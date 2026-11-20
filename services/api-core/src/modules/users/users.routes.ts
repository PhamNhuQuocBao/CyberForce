import type { FastifyPluginAsync } from 'fastify';
import { getProfileHandler, updateProfileHandler } from './users.controller.js';
import { usersService } from './users.service.js';
import { usernameParamSchema } from './users.schemas.js';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';

export const usersRoutes: FastifyPluginAsync = async (fastify) => {
  // Public/Self Dossier endpoint (optional authentication to detect isSelf)
  fastify.get('/:username/profile', { preHandler: [optionalAuthenticate] }, getProfileHandler);
  fastify.get('/:username/radar', { preHandler: [optionalAuthenticate] }, async (request) => {
    const { username } = usernameParamSchema.parse(request.params);
    const profile = await usersService.getProfileByUsername(username, request.user?.sub);
    return { success: true, data: profile.telemetry ?? null };
  });

  // Authenticated Profile Settings Update
  fastify.patch('/me/profile', { preHandler: [authenticate] }, updateProfileHandler);
};
