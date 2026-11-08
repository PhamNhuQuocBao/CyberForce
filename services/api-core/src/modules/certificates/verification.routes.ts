import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { AuthError } from '../auth/auth.service.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import { verifyCertificate } from './verification.service.js';

const codeParam = z.object({ code: z.string().min(1).max(50) });
const revocationBody = z
  .object({
    reason: z.enum(['academic_integrity', 'issued_in_error', 'other']),
    note: z.string().trim().min(1).max(1000).optional(),
  })
  .strict();

export const publicCertificateRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/verify/:code',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (request, reply) => {
      reply.header('Cache-Control', 'no-store');
      return { success: true, data: await verifyCertificate(codeParam.parse(request.params).code) };
    },
  );
};

export const adminCertificateRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', requireRole(['superadmin']));
  app.post('/:code/revoke', async (request) => {
    const { code } = codeParam.parse(request.params);
    const { reason, note } = revocationBody.parse(request.body);
    return prisma.$transaction(async (tx) => {
      const certificate = await tx.certificate.findUnique({
        where: { certificateCode: code },
        select: { id: true, revokedAt: true },
      });
      if (!certificate)
        throw new AuthError(404, 'Không tìm thấy chứng chỉ.', 'CERTIFICATE_NOT_FOUND');
      if (certificate.revokedAt)
        throw new AuthError(409, 'Chứng chỉ đã bị thu hồi.', 'CERTIFICATE_ALREADY_REVOKED');
      const revokedAt = new Date();
      const changed = await tx.certificate.updateMany({
        where: { id: certificate.id, revokedAt: null },
        data: { revokedAt, revocationReason: reason },
      });
      if (!changed.count)
        throw new AuthError(409, 'Chứng chỉ đã bị thu hồi.', 'CERTIFICATE_ALREADY_REVOKED');
      await tx.auditLog.create({
        data: {
          action: 'certificate.revoked',
          actorId: request.user!.sub,
          targetId: certificate.id,
          details: { code, reason, note: note ?? null },
        },
      });
      return { success: true, data: { status: 'revoked', code, revokedAt, reason } };
    });
  });
};
