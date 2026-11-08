import { createHash, verify as verifySignature, X509Certificate } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { AuthError } from '../auth/auth.service.js';

export const certificateCodePattern = /^CF-CERT-\d{4}-(?:[A-F0-9]{6}|[A-F0-9]{16})$/;
const signingKeyPattern = /^[A-Za-z0-9_-]{1,100}$/;
const signedPayloadSchema = z
  .object({
    code: z.string().regex(certificateCodePattern),
    sessionId: z.uuid(),
    name: z.string().min(1).max(120),
    examTitle: z.string().min(1).max(255),
    score: z.number().int().nonnegative(),
    totalPoints: z.number().int().positive(),
    issuedAt: z.iso.datetime(),
  })
  .strict();
export type SignedCertificatePayload = z.infer<typeof signedPayloadSchema>;

export function canonicalCertificatePayload(payload: SignedCertificatePayload) {
  return JSON.stringify({
    code: payload.code,
    sessionId: payload.sessionId,
    name: payload.name,
    examTitle: payload.examTitle,
    score: payload.score,
    totalPoints: payload.totalPoints,
    issuedAt: payload.issuedAt,
  });
}

export async function verifyCertificate(code: string) {
  if (!certificateCodePattern.test(code))
    throw new AuthError(400, 'Mã chứng chỉ không hợp lệ.', 'CERTIFICATE_CODE_INVALID');
  const certificate = await prisma.certificate.findUnique({
    where: { certificateCode: code },
    include: {
      learningPath: { select: { title: true } },
      examSession: {
        include: { exam: { include: { objectives: { select: { points: true } } } } },
      },
    },
  });
  if (!certificate) return { status: 'not_found' as const };
  if (certificate.revokedAt)
    return {
      status: 'revoked' as const,
      code,
      revokedAt: certificate.revokedAt,
      reason: certificate.revocationReason ?? 'other',
    };
  if (
    !certificate.signingKeyId ||
    !signingKeyPattern.test(certificate.signingKeyId) ||
    !certificate.payloadSignature ||
    !certificate.examSessionId
  )
    return { status: 'unavailable' as const };
  const fallback =
    certificate.examSession && certificate.recipientName
      ? {
          code,
          sessionId: certificate.examSession.id,
          name: certificate.recipientName,
          examTitle: certificate.examSession.exam.title,
          score: certificate.examSession.score,
          totalPoints: certificate.examSession.exam.objectives.reduce(
            (sum, item) => sum + item.points,
            0,
          ),
          issuedAt: certificate.issuedAt.toISOString(),
        }
      : null;
  const parsed = signedPayloadSchema.safeParse(certificate.signedPayload ?? fallback);
  if (!parsed.success) return { status: 'unavailable' as const };
  const payload = parsed.data;
  if (
    payload.code !== code ||
    payload.sessionId !== certificate.examSessionId ||
    payload.name !== certificate.recipientName ||
    payload.issuedAt !== certificate.issuedAt.toISOString() ||
    payload.score > payload.totalPoints
  )
    return { status: 'invalid' as const };
  let publicCertificate: X509Certificate;
  try {
    const certBytes = await readFile(
      path.join(env.CERT_TRUSTED_CERTS_DIR, `${certificate.signingKeyId}.crt`),
    );
    publicCertificate = new X509Certificate(certBytes);
    if (
      publicCertificate.publicKey.asymmetricKeyType !== 'rsa' ||
      publicCertificate.publicKey.asymmetricKeyDetails?.modulusLength !== 4096
    )
      return { status: 'invalid' as const };
  } catch {
    return { status: 'unavailable' as const };
  }
  const signature = Buffer.from(certificate.payloadSignature, 'base64');
  if (
    signature.length !== 512 ||
    !verifySignature(
      'RSA-SHA256',
      Buffer.from(canonicalCertificatePayload(payload), 'utf8'),
      publicCertificate.publicKey,
      signature,
    )
  )
    return { status: 'invalid' as const };
  if (!/^sha256:[a-f0-9]{64}$/.test(certificate.verificationHash))
    return { status: 'invalid' as const };
  try {
    const response = await fetch(
      `${env.CERT_SIGNER_URL.replace(/\/$/, '')}/v1/certificates/${code}/pdf`,
      {
        headers: { Authorization: `Bearer ${env.CERT_SIGNER_TOKEN}` },
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!response.ok || !response.body) return { status: 'unavailable' as const };
    const digest = createHash('sha256');
    let size = 0;
    const reader = response.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 10 * 1024 * 1024) return { status: 'invalid' as const };
        digest.update(value);
      }
    } finally {
      reader.releaseLock();
    }
    if (`sha256:${digest.digest('hex')}` !== certificate.verificationHash)
      return { status: 'invalid' as const };
  } catch {
    return { status: 'unavailable' as const };
  }
  return {
    status: 'valid' as const,
    certificate: {
      code,
      recipientName: payload.name,
      examTitle: payload.examTitle,
      score: payload.score,
      totalPoints: payload.totalPoints,
      issuedAt: payload.issuedAt,
      learningPathTitle: certificate.learningPath.title,
      issuer: 'CyberForce Certificate Authority',
      signingKeyId: certificate.signingKeyId,
      signatureVerified: true,
      pdfIntegrityVerified: true,
    },
  };
}
