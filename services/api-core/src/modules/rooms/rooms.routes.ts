import type { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../../middleware/authenticate.js';
import { assertNoActiveExam } from '../exams/exams.service.js';
import { pathSlugParamSchema } from '../paths/paths.schemas.js';
import { getRoom } from './rooms.service.js';
import { downloadPublishedAttachment } from '../creator/creator.storage.js';
import { z } from 'zod';
import { extendLab, spawnLab, stopLab } from './lab.service.js';
import {
  attackBoxStatus,
  connectAttackBox,
  connectTerminal,
  currentLab,
  issueAttackBoxTicket,
  issueTerminalTicket,
  startAttackBox,
  stopAttackBox,
} from './lab.terminal.js';

export const roomsRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/:slug/attachments/:fileId',
    { preHandler: [authenticate, async (request) => assertNoActiveExam(request.user!.sub)] },
    async (request, reply) => {
      const { slug } = pathSlugParamSchema.parse(request.params);
      const { fileId } = z.object({ fileId: z.uuid() }).parse(request.params);
      const room = await getRoom(slug, request.user!.sub);
      const { item, bytes } = await downloadPublishedAttachment(room.id, fileId);
      return reply
        .header('Content-Type', item.mimeType)
        .header('Content-Length', String(bytes.length))
        .header(
          'Content-Disposition',
          `attachment; filename="${item.filename.replace(/["\\\r\n]/g, '_')}"`,
        )
        .header('Cache-Control', 'private, no-store')
        .send(bytes);
    },
  );
  app.get(
    '/:slug',
    { preHandler: [authenticate, async (request) => assertNoActiveExam(request.user!.sub)] },
    async (request, reply) => {
      const { slug } = pathSlugParamSchema.parse(request.params);
      const data = await getRoom(slug, request.user!.sub);
      return reply.header('Cache-Control', 'private, no-store').send({ success: true, data });
    },
  );
  app.post(
    '/:slug/spawn',
    { preHandler: [authenticate, async (request) => assertNoActiveExam(request.user!.sub)] },
    async (request, reply) => {
      const { slug } = pathSlugParamSchema.parse(request.params);
      const data = await spawnLab(slug, request.user!.sub);
      return reply
        .code(201)
        .header('Cache-Control', 'private, no-store')
        .send({ success: true, data });
    },
  );
  app.post(
    '/:slug/stop',
    { preHandler: [authenticate, async (request) => assertNoActiveExam(request.user!.sub)] },
    async (request, reply) => {
      const { slug } = pathSlugParamSchema.parse(request.params);
      const data = await stopLab(slug, request.user!.sub);
      return reply.header('Cache-Control', 'private, no-store').send({ success: true, data });
    },
  );
  app.post(
    '/:slug/extend',
    { preHandler: [authenticate, async (request) => assertNoActiveExam(request.user!.sub)] },
    async (request, reply) => {
      const { slug } = pathSlugParamSchema.parse(request.params);
      const data = await extendLab(slug, request.user!.sub);
      return reply.header('Cache-Control', 'private, no-store').send({ success: true, data });
    },
  );
  app.get(
    '/:slug/lab',
    { preHandler: [authenticate, async (request) => assertNoActiveExam(request.user!.sub)] },
    async (request, reply) => {
      const { slug } = pathSlugParamSchema.parse(request.params);
      return reply
        .header('Cache-Control', 'private, no-store')
        .send({ success: true, data: await currentLab(slug, request.user!.sub) });
    },
  );
  app.post(
    '/:slug/terminal-ticket',
    { preHandler: [authenticate, async (request) => assertNoActiveExam(request.user!.sub)] },
    async (request, reply) => {
      const { slug } = pathSlugParamSchema.parse(request.params);
      const data = await issueTerminalTicket(
        slug,
        request.user!.sub,
        request.user!.jti,
        request.user!.exp,
      );
      return reply.header('Cache-Control', 'private, no-store').send({ success: true, data });
    },
  );
  app.get('/:slug/terminal', { websocket: true }, (socket, request) => {
    const { slug } = pathSlugParamSchema.parse(request.params);
    const ticket =
      String(request.headers['sec-websocket-protocol'] ?? '')
        .split(',')
        .map((value) => value.trim())
        .find((value) => /^[0-9a-f]{64}$/.test(value)) ?? '';
    connectTerminal(socket, request, slug, ticket);
  });
  app.get(
    '/:slug/attackbox',
    { preHandler: [authenticate, async (request) => assertNoActiveExam(request.user!.sub)] },
    async (request, reply) => {
      const { slug } = pathSlugParamSchema.parse(request.params);
      return reply
        .header('Cache-Control', 'private, no-store')
        .send({ success: true, data: await attackBoxStatus(slug, request.user!.sub) });
    },
  );
  app.post(
    '/:slug/attackbox',
    { preHandler: [authenticate, async (request) => assertNoActiveExam(request.user!.sub)] },
    async (request, reply) => {
      const { slug } = pathSlugParamSchema.parse(request.params);
      return reply
        .header('Cache-Control', 'private, no-store')
        .code(201)
        .send({ success: true, data: await startAttackBox(slug, request.user!.sub) });
    },
  );
  app.delete(
    '/:slug/attackbox',
    { preHandler: [authenticate, async (request) => assertNoActiveExam(request.user!.sub)] },
    async (request, reply) => {
      const { slug } = pathSlugParamSchema.parse(request.params);
      return reply
        .header('Cache-Control', 'private, no-store')
        .send({ success: true, data: await stopAttackBox(slug, request.user!.sub) });
    },
  );
  app.post(
    '/:slug/attackbox/ticket',
    { preHandler: [authenticate, async (request) => assertNoActiveExam(request.user!.sub)] },
    async (request, reply) => {
      const { slug } = pathSlugParamSchema.parse(request.params);
      const data = await issueAttackBoxTicket(
        slug,
        request.user!.sub,
        request.user!.jti,
        request.user!.exp,
      );
      return reply.header('Cache-Control', 'private, no-store').send({ success: true, data });
    },
  );
  app.get('/:slug/attackbox/stream', { websocket: true }, (socket, request) => {
    const { slug } = pathSlugParamSchema.parse(request.params);
    const ticket =
      String(request.headers['sec-websocket-protocol'] ?? '')
        .split(',')
        .map((value) => value.trim())
        .find((value) => /^[0-9a-f]{64}$/.test(value)) ?? '';
    connectAttackBox(socket, request, slug, ticket);
  });
};
