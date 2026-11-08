import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate.js';
import {
  finishExam,
  getExam,
  getSession,
  listExams,
  startExam,
  submitExamFlag,
} from './exams.service.js';

const slugParam = z.object({ slug: z.string().regex(/^[a-z0-9-]{1,255}$/) });
const idParam = z.object({ id: z.uuid() });
const submission = z
  .object({ objectiveId: z.uuid(), answer: z.string().min(1).max(4096) })
  .strict();

export const examsRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);
  app.addHook('onRequest', async (_request, reply) => {
    reply.header('Cache-Control', 'private, no-store');
  });
  app.get('/', async (request) => ({ success: true, data: await listExams(request.user!.sub) }));
  app.get('/:slug', async (request) => ({
    success: true,
    data: await getExam(slugParam.parse(request.params).slug, request.user!.sub),
  }));
  app.post('/:slug/start', async (request, reply) => {
    const { consent } = z
      .object({ consent: z.literal(true) })
      .strict()
      .parse(request.body);
    const data = await startExam(slugParam.parse(request.params).slug, request.user!.sub, consent);
    return reply.code(201).send({ success: true, data });
  });
  app.get('/sessions/:id', async (request) => ({
    success: true,
    data: await getSession(idParam.parse(request.params).id, request.user!.sub),
  }));
  app.post('/sessions/:id/flags', async (request) => {
    const { objectiveId, answer } = submission.parse(request.body);
    return {
      success: true,
      data: await submitExamFlag(
        idParam.parse(request.params).id,
        request.user!.sub,
        objectiveId,
        answer,
      ),
    };
  });
  app.post('/sessions/:id/finish', async (request) => ({
    success: true,
    data: await finishExam(idParam.parse(request.params).id, request.user!.sub),
  }));
};
