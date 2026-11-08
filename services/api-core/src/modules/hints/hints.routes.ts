import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate.js';
import { getHints, unlockHint } from './hints.service.js';
import { assertNoActiveExam } from '../exams/exams.service.js';

const paramsSchema = z.object({ id: z.uuid() });
const unlockParamsSchema = paramsSchema.extend({ tier: z.enum(['1', '2', '3']) });
const bodySchema = z.object({ expectedCost: z.number().int().min(0) }).strict();

export const hintsRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', async (_request, reply) => {
    reply.header('Cache-Control', 'private, no-store');
  });
  app.get(
    '/:id/hints',
    { preHandler: [authenticate, async (request) => assertNoActiveExam(request.user!.sub)] },
    async (request) => {
      const { id } = paramsSchema.parse(request.params);
      return { success: true, data: await getHints(id, request.user!.sub) };
    },
  );
  app.post(
    '/:id/hints/:tier',
    { preHandler: [authenticate, async (request) => assertNoActiveExam(request.user!.sub)] },
    async (request) => {
      const { id, tier } = unlockParamsSchema.parse(request.params);
      const { expectedCost } = bodySchema.parse(request.body);
      return {
        success: true,
        data: await unlockHint(id, request.user!.sub, Number(tier), expectedCost),
      };
    },
  );
};
