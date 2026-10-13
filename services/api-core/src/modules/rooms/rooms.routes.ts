import type { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../../middleware/authenticate.js';
import { pathSlugParamSchema } from '../paths/paths.schemas.js';
import { getRoom } from './rooms.service.js';
import { spawnLab, stopLab } from './lab.service.js';

export const roomsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/:slug', { preHandler: [authenticate] }, async (request, reply) => {
    const { slug } = pathSlugParamSchema.parse(request.params);
    const data = await getRoom(slug, request.user!.sub);
    return reply.header('Cache-Control', 'private, no-store').send({ success: true, data });
  });
  app.post('/:slug/spawn', { preHandler: [authenticate] }, async (request, reply) => {
    const { slug } = pathSlugParamSchema.parse(request.params);
    const data = await spawnLab(slug, request.user!.sub);
    return reply
      .code(201)
      .header('Cache-Control', 'private, no-store')
      .send({ success: true, data });
  });
  app.post('/:slug/stop', { preHandler: [authenticate] }, async (request, reply) => {
    const { slug } = pathSlugParamSchema.parse(request.params);
    const data = await stopLab(slug, request.user!.sub);
    return reply.header('Cache-Control', 'private, no-store').send({ success: true, data });
  });
};
