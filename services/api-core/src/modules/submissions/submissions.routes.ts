import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate.js';
import { submitAnswer } from './submissions.service.js';
import { AuthError } from '../auth/auth.service.js';

const paramsSchema = z.object({ id: z.uuid() });
const bodySchema = z
  .object({
    questionId: z.uuid(),
    answer: z
      .string()
      .min(1)
      .max(4096)
      .refine((value) => Buffer.byteLength(value, 'utf8') <= 4096),
    labInstanceId: z.uuid().optional(),
  })
  .strict();

export const submissionsRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/:id/submit',
    { preHandler: [authenticate], bodyLimit: 32768 },
    async (request, reply) => {
      const { id } = paramsSchema.parse(request.params);
      reply.header('Cache-Control', 'private, no-store');
      try {
        const data = await submitAnswer(id, request.user!.sub, bodySchema.parse(request.body));
        return reply.send({ success: true, data });
      } catch (error) {
        if (error instanceof AuthError && error.code === 'SUBMISSION_LOCKED')
          reply.header('Retry-After', Number(error.details?.retryAfterSeconds));
        throw error;
      }
    },
  );
};
