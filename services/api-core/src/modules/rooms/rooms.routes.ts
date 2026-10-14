import type { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../../middleware/authenticate.js';
import { pathSlugParamSchema } from '../paths/paths.schemas.js';
import { getRoom } from './rooms.service.js';
import { extendLab, spawnLab, stopLab } from './lab.service.js';
import { connectTerminal, currentLab, issueTerminalTicket } from './lab.terminal.js';

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
  app.post('/:slug/extend', { preHandler: [authenticate] }, async (request, reply) => {
    const { slug } = pathSlugParamSchema.parse(request.params);
    const data = await extendLab(slug, request.user!.sub);
    return reply.header('Cache-Control', 'private, no-store').send({ success: true, data });
  });
  app.get('/:slug/lab', { preHandler: [authenticate] }, async (request, reply) => {
    const { slug } = pathSlugParamSchema.parse(request.params);
    return reply
      .header('Cache-Control', 'private, no-store')
      .send({ success: true, data: await currentLab(slug, request.user!.sub) });
  });
  app.post('/:slug/terminal-ticket', { preHandler: [authenticate] }, async (request, reply) => {
    const { slug } = pathSlugParamSchema.parse(request.params);
    const data = await issueTerminalTicket(
      slug,
      request.user!.sub,
      request.user!.jti,
      request.user!.exp,
    );
    return reply.header('Cache-Control', 'private, no-store').send({ success: true, data });
  });
  app.get('/:slug/terminal', { websocket: true }, (socket, request) => {
    const { slug } = pathSlugParamSchema.parse(request.params);
    const ticket =
      String(request.headers['sec-websocket-protocol'] ?? '')
        .split(',')
        .map((value) => value.trim())
        .find((value) => /^[0-9a-f]{64}$/.test(value)) ?? '';
    connectTerminal(socket, request, slug, ticket);
  });
};
