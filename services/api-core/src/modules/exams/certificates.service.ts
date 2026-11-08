import { randomBytes } from 'node:crypto';
import { Readable } from 'node:stream';
import type { FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { AuthError } from '../auth/auth.service.js';

const finalStatuses = ['finished', 'expired'] as const;
const certificateCode = () =>
  `CF-CERT-${new Date().getUTCFullYear()}-${randomBytes(8).toString('hex').toUpperCase()}`;
const signerUrl = env.CERT_SIGNER_URL.replace(/\/$/, '');

export async function enqueueCertificate(sessionId: string) {
  const session = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: { exam: { select: { passingScore: true } } },
  });
  if (
    !session ||
    !finalStatuses.includes(session.status as 'finished' | 'expired') ||
    session.score < session.exam.passingScore ||
    !session.certificateName
  )
    return;
  const existing = await prisma.certificate.findUnique({
    where: { examSessionId: sessionId },
    select: { id: true },
  });
  if (existing) return;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await prisma.certificateIssuance.upsert({
        where: { sessionId },
        create: { sessionId, userId: session.userId, certificateCode: certificateCode() },
        update: {},
      });
      return;
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== 'P2002' ||
        attempt === 4
      )
        throw error;
    }
  }
}

export async function confirmLegacyCertificateName(
  sessionId: string,
  userId: string,
  name: string,
) {
  const session = await prisma.examSession.findFirst({
    where: { id: sessionId, userId },
    include: { exam: { select: { passingScore: true } }, certificateIssuance: true },
  });
  if (!session) throw new AuthError(404, 'Không tìm thấy phiên thi.', 'EXAM_SESSION_NOT_FOUND');
  if (
    !finalStatuses.includes(session.status as 'finished' | 'expired') ||
    session.score < session.exam.passingScore
  )
    throw new AuthError(
      409,
      'Phiên thi không đủ điều kiện cấp chứng chỉ.',
      'CERTIFICATE_NOT_ELIGIBLE',
    );
  if (session.certificateName || session.certificateIssuance)
    throw new AuthError(409, 'Tên chứng chỉ đã được xác nhận.', 'CERTIFICATE_NAME_LOCKED');
  await prisma.$transaction(async (tx) => {
    const changed = await tx.examSession.updateMany({
      where: { id: sessionId, userId, certificateName: null },
      data: { certificateName: name },
    });
    if (!changed.count)
      throw new AuthError(409, 'Tên chứng chỉ đã được xác nhận.', 'CERTIFICATE_NAME_LOCKED');
    await tx.user.update({ where: { id: userId }, data: { certificateName: name } });
  });
  await enqueueCertificate(sessionId);
  return certificateStatus(sessionId, userId);
}

export async function certificateStatus(sessionId: string, userId: string) {
  const session = await prisma.examSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      exam: { select: { passingScore: true } },
      certificateIssuance: true,
      certificate: { select: { certificateCode: true, issuedAt: true, signingKeyId: true } },
    },
  });
  if (!session) throw new AuthError(404, 'Không tìm thấy phiên thi.', 'EXAM_SESSION_NOT_FOUND');
  if (
    !finalStatuses.includes(session.status as 'finished' | 'expired') ||
    session.score < session.exam.passingScore
  )
    return { status: 'ineligible' as const };
  if (session.certificate)
    return {
      status: 'issued' as const,
      code: session.certificate.certificateCode,
      issuedAt: session.certificate.issuedAt,
      signingKeyId: session.certificate.signingKeyId,
    };
  if (!session.certificateName) return { status: 'needs_name' as const };
  if (!session.certificateIssuance) {
    await enqueueCertificate(sessionId);
    return { status: 'pending' as const };
  }
  return {
    status:
      session.certificateIssuance.status === 'failed'
        ? ('retrying' as const)
        : ('pending' as const),
    nextAttemptAt: session.certificateIssuance.nextAttemptAt,
  };
}

async function processIssuance(id: string) {
  const claimed = await prisma.certificateIssuance.updateMany({
    where: { id, status: { in: ['pending', 'failed'] }, nextAttemptAt: { lte: new Date() } },
    data: { status: 'processing', claimedAt: new Date(), attemptCount: { increment: 1 } },
  });
  if (!claimed.count) return;
  const job = await prisma.certificateIssuance.findUniqueOrThrow({
    where: { id },
    include: { session: { include: { exam: { include: { objectives: true } } } } },
  });
  const session = job.session;
  try {
    if (
      !session.certificateName ||
      !finalStatuses.includes(session.status as 'finished' | 'expired') ||
      session.score < session.exam.passingScore
    )
      throw new Error('Session is not eligible');
    const totalPoints = session.exam.objectives.reduce((sum, item) => sum + item.points, 0);
    const issuedAt = new Date();
    const signedPayload = {
      code: job.certificateCode,
      sessionId: session.id,
      name: session.certificateName,
      examTitle: session.exam.title,
      score: session.score,
      totalPoints,
      issuedAt: issuedAt.toISOString(),
    };
    const response = await fetch(`${signerUrl}/v1/certificates`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.CERT_SIGNER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signedPayload),
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`Signer returned ${response.status}`);
    const signed = (await response.json()) as {
      pdfS3Key: string;
      verificationHash: string;
      signingKeyId: string;
      payloadSignature: string;
    };
    if (
      signed.pdfS3Key !== `certificates/${job.certificateCode}.pdf` ||
      !/^sha256:[a-f0-9]{64}$/.test(signed.verificationHash) ||
      !signed.signingKeyId ||
      !signed.payloadSignature
    )
      throw new Error('Invalid signer response');
    await prisma.$transaction(async (tx) => {
      await tx.certificate.upsert({
        where: { examSessionId: session.id },
        create: {
          certificateCode: job.certificateCode,
          examSessionId: session.id,
          userId: session.userId,
          pathId: session.exam.pathId,
          scorePercentage: totalPoints ? (session.score * 100) / totalPoints : 0,
          verificationHash: signed.verificationHash,
          pdfS3Key: signed.pdfS3Key,
          signingKeyId: signed.signingKeyId,
          payloadSignature: signed.payloadSignature,
          recipientName: session.certificateName,
          signedPayload,
          issuedAt,
        },
        update: {},
      });
      await tx.certificateIssuance.update({
        where: { id },
        data: { status: 'issued', lastError: null },
      });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown signing failure';
    const waitSeconds = Math.min(300, 5 * 2 ** Math.min(job.attemptCount, 6));
    await prisma.certificateIssuance.updateMany({
      where: { id, status: 'processing' },
      data: {
        status: 'failed',
        lastError: message.slice(0, 500),
        nextAttemptAt: new Date(Date.now() + waitSeconds * 1000),
      },
    });
    console.error(`Certificate issuance ${id} failed: ${message}`);
  }
}

let sweeping = false;
export async function sweepCertificateIssuances() {
  if (sweeping) return;
  sweeping = true;
  try {
    await prisma.certificateIssuance.updateMany({
      where: { status: 'processing', claimedAt: { lt: new Date(Date.now() - 120000) } },
      data: { status: 'failed', nextAttemptAt: new Date() },
    });
    const jobs = await prisma.certificateIssuance.findMany({
      where: {
        status: { in: ['pending', 'failed'] },
        nextAttemptAt: { lte: new Date() },
      },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });
    for (const job of jobs) await processIssuance(job.id);
  } finally {
    sweeping = false;
  }
}

export async function downloadCertificate(sessionId: string, userId: string, reply: FastifyReply) {
  const certificate = await prisma.certificate.findFirst({
    where: { examSessionId: sessionId, userId },
    select: { certificateCode: true },
  });
  if (!certificate) throw new AuthError(404, 'Chứng chỉ chưa sẵn sàng.', 'CERTIFICATE_NOT_FOUND');
  const response = await fetch(`${signerUrl}/v1/certificates/${certificate.certificateCode}/pdf`, {
    headers: { Authorization: `Bearer ${env.CERT_SIGNER_TOKEN}` },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok || !response.body)
    throw new AuthError(503, 'Không tải được chứng chỉ.', 'CERTIFICATE_UNAVAILABLE');
  reply.header('Content-Type', 'application/pdf');
  reply.header('Content-Disposition', `attachment; filename="${certificate.certificateCode}.pdf"`);
  reply.header('Cache-Control', 'private, no-store');
  return reply.send(Readable.fromWeb(response.body as import('node:stream/web').ReadableStream));
}
