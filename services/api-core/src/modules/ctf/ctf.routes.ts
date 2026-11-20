import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import {
  addChallenge,
  createEvent,
  getChallengeScore,
  getEvent,
  getLeaderboard,
  joinEvent,
  listEvents,
  publishEvent,
  submitFlag,
  unfreezeEvent,
} from './ctf.service.js';

const id = z.uuid();
const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(100);
const eventBody = z.object({
  slug,
  title: z.string().trim().min(1).max(180),
  description: z.string().max(20_000),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  freezeAt: z.coerce.date().optional(),
});
const challengeBody = z.object({
  title: z.string().trim().min(1).max(180),
  description: z.string().max(20_000),
  points: z.number().int().min(1).max(10_000),
  flag: z.string().min(1).max(4096),
  orderIndex: z.number().int().min(0).default(0),
});

export const ctfRoutes: FastifyPluginAsync = async (app) => {
  app.get('/events', async () => ({ success: true, data: await listEvents() }));
  app.get('/events/:slug', { preHandler: [optionalAuthenticate] }, async (request, reply) => {
    const params = z.object({ slug }).parse(request.params);
    return reply.header('Cache-Control', 'no-store').send({
      success: true,
      data: await getEvent(params.slug, request.user?.sub),
    });
  });
  app.get('/events/:slug/scoreboard', async (request, reply) => {
    const params = z.object({ slug }).parse(request.params);
    return reply.header('Cache-Control', 'no-store').send({
      success: true,
      data: await getLeaderboard(params.slug),
    });
  });
  app.get('/challenges/:id/score', async (request) => {
    const params = z.object({ id }).parse(request.params);
    return { success: true, data: await getChallengeScore(params.id) };
  });
  app.post('/events/:slug/join', { preHandler: [authenticate] }, async (request) => {
    const params = z.object({ slug }).parse(request.params);
    return { success: true, data: await joinEvent(params.slug, request.user!.sub) };
  });
  app.post(
    '/events/:slug/challenges/:id/submit',
    { preHandler: [authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (request) => {
      const params = z.object({ slug, id }).parse(request.params);
      const body = z.object({ answer: z.string().min(1).max(4096) }).parse(request.body);
      return {
        success: true,
        data: await submitFlag(params.slug, params.id, request.user!.sub, body.answer),
      };
    },
  );
};

export const ctfAdminRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', requireRole(['superadmin']));
  app.post('/events', async (request, reply) =>
    reply
      .status(201)
      .send({ success: true, data: await createEvent(eventBody.parse(request.body)) }),
  );
  app.post('/events/:id/challenges', async (request, reply) => {
    const params = z.object({ id }).parse(request.params);
    return reply.status(201).send({
      success: true,
      data: await addChallenge(params.id, challengeBody.parse(request.body)),
    });
  });
  app.post('/events/:id/publish', async (request) => {
    const params = z.object({ id }).parse(request.params);
    return { success: true, data: await publishEvent(params.id) };
  });
  app.post('/events/:id/unfreeze', async (request) => {
    const params = z.object({ id }).parse(request.params);
    return { success: true, data: await unfreezeEvent(params.id) };
  });
};
