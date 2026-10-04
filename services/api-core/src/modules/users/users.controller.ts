import type { FastifyRequest, FastifyReply } from 'fastify';
import { usersService } from './users.service.js';
import { usernameParamSchema, updateProfileSchema } from './users.schemas.js';

export async function getProfileHandler(request: FastifyRequest, reply: FastifyReply) {
  const { username } = usernameParamSchema.parse(request.params);
  const requesterUserId = request.user?.sub;

  const profile = await usersService.getProfileByUsername(username, requesterUserId);

  return reply.status(200).send({
    success: true,
    data: profile,
  });
}

export async function updateProfileHandler(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user!.sub;
  const body = updateProfileSchema.parse(request.body);

  const updated = await usersService.updateMyProfile(userId, body);

  return reply.status(200).send({
    success: true,
    message: 'Profile updated successfully',
    data: updated,
  });
}
