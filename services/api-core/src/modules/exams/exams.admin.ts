import { createHash } from 'node:crypto';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { AuthError } from '../auth/auth.service.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';

const schema = z
  .object({
    pathId: z.uuid(),
    slug: z.string().regex(/^[a-z0-9-]{1,255}$/),
    title: z.string().min(1).max(255),
    description: z.string().max(4000).optional(),
    durationHours: z.union([z.literal(6), z.literal(12), z.literal(24)]),
    passingScore: z.number().int().positive(),
    targets: z
      .array(
        z
          .object({
            name: z.string().min(1).max(80),
            image: z
              .string()
              .regex(/^cyberforce\/[a-z0-9][a-z0-9._/-]*:[a-zA-Z0-9][a-zA-Z0-9._-]*$/),
          })
          .strict(),
      )
      .min(2)
      .max(4),
    objectives: z
      .array(
        z
          .object({
            targetName: z.string().min(1),
            title: z.string().min(1).max(255),
            description: z.string().min(1).max(4000),
            points: z.number().int().positive(),
            flag: z.string().min(1).max(4096),
          })
          .strict(),
      )
      .min(1)
      .max(100),
  })
  .strict();

export const examAdminRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', requireRole(['superadmin', 'org_admin']));
  app.post('/', { bodyLimit: 524288 }, async (request, reply) => {
    const input = schema.parse(request.body);
    const names = new Set(input.targets.map((target) => target.name));
    if (
      names.size !== input.targets.length ||
      input.objectives.some((objective) => !names.has(objective.targetName)) ||
      input.passingScore > input.objectives.reduce((sum, item) => sum + item.points, 0)
    )
      throw new AuthError(400, 'Cấu hình kỳ thi không hợp lệ.', 'EXAM_CONFIG_INVALID');
    const path = await prisma.learningPath.findUnique({
      where: { id: input.pathId },
      select: { isPublished: true },
    });
    if (!path?.isPublished)
      throw new AuthError(400, 'Lộ trình chưa xuất bản.', 'EXAM_PATH_INVALID');
    const exam = await prisma.exam.create({
      data: {
        pathId: input.pathId,
        slug: input.slug,
        title: input.title,
        description: input.description,
        durationHours: input.durationHours,
        passingScore: input.passingScore,
        targets: {
          create: input.targets.map((target, index) => ({ ...target, orderIndex: index })),
        },
      },
      include: { targets: true },
    });
    try {
      await prisma.examObjective.createMany({
        data: input.objectives.map((objective, index) => ({
          examId: exam.id,
          targetId: exam.targets.find((target) => target.name === objective.targetName)!.id,
          title: objective.title,
          description: objective.description,
          points: objective.points,
          orderIndex: index,
          answerHash: 'sha256:' + createHash('sha256').update(objective.flag).digest('hex'),
        })),
      });
      await prisma.exam.update({ where: { id: exam.id }, data: { isPublished: true } });
    } catch (error) {
      await prisma.exam.delete({ where: { id: exam.id } });
      throw error;
    }
    return reply.code(201).send({ success: true, data: { id: exam.id, slug: exam.slug } });
  });
};
