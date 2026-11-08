import { createHash, sign } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { canonicalCertificatePayload, verifyCertificate } from './verification.service.js';

vi.mock('../../lib/prisma.js', () => ({ prisma: { certificate: { findUnique: vi.fn() } } }));

const code = 'CF-CERT-2026-ABCDEF1234567890';
const sessionId = 'e59b7c86-21d6-4c84-9883-c91a96990ee3';
const payload = {
  code,
  sessionId,
  name: 'Learner Name',
  examTitle: 'Practical Exam',
  score: 85,
  totalPoints: 100,
  issuedAt: '2026-11-08T00:00:00.000Z',
};
const pdf = Buffer.from('%PDF-1.4 signed test bytes');
const row = {
  certificateCode: code,
  revokedAt: null as Date | null,
  revocationReason: null as string | null,
  signingKeyId: 'test-ca',
  payloadSignature: '',
  examSessionId: sessionId,
  recipientName: payload.name,
  issuedAt: new Date(payload.issuedAt),
  signedPayload: payload,
  verificationHash: `sha256:${createHash('sha256').update(pdf).digest('hex')}`,
  learningPath: { title: 'Security Path' },
  examSession: {
    id: sessionId,
    score: 85,
    exam: { title: payload.examTitle, objectives: [{ points: 100 }] },
  },
};

describe('public certificate verification', () => {
  let certDir: string;
  let previousDir: string;
  const fetchMock = vi.spyOn(globalThis, 'fetch');
  const findMock = vi.mocked(prisma.certificate.findUnique);

  beforeAll(async () => {
    certDir = await mkdtemp(path.join(tmpdir(), 'cf-cert-'));
    execFileSync(
      'openssl',
      [
        'req',
        '-x509',
        '-newkey',
        'rsa:4096',
        '-nodes',
        '-days',
        '1',
        '-subj',
        '/CN=CyberForce Test CA',
        '-keyout',
        path.join(certDir, 'private.key'),
        '-out',
        path.join(certDir, 'test-ca.crt'),
      ],
      { stdio: 'ignore' },
    );
    previousDir = env.CERT_TRUSTED_CERTS_DIR;
    env.CERT_TRUSTED_CERTS_DIR = certDir;
    const key = await readFile(path.join(certDir, 'private.key'));
    row.payloadSignature = sign(
      'RSA-SHA256',
      Buffer.from(canonicalCertificatePayload(payload)),
      key,
    ).toString('base64');
    findMock.mockResolvedValue(row as never);
    fetchMock.mockImplementation(async () => new Response(pdf, { status: 200 }));
  });

  afterAll(async () => {
    env.CERT_TRUSTED_CERTS_DIR = previousDir;
    findMock.mockReset();
    fetchMock.mockRestore();
    await rm(certDir, { recursive: true, force: true });
  });

  it('returns only public fields after signature and PDF validation', async () => {
    const result = await verifyCertificate(code);
    expect(result.status).toBe('valid');
    if (result.status === 'valid') {
      expect(result.certificate).toMatchObject({
        recipientName: payload.name,
        score: 85,
        signatureVerified: true,
        pdfIntegrityVerified: true,
      });
      expect(JSON.stringify(result)).not.toMatch(/email|pdfS3Key|examSessionId/);
    }
  });

  it('reconstructs the signed fields when a legacy snapshot is absent', async () => {
    findMock.mockResolvedValueOnce({ ...row, signedPayload: null } as never);
    expect((await verifyCertificate(code)).status).toBe('valid');
  });

  it('distinguishes missing, revoked, bad signature, missing key, and changed PDF', async () => {
    findMock.mockResolvedValueOnce(null);
    expect((await verifyCertificate(code)).status).toBe('not_found');
    findMock.mockResolvedValueOnce({
      ...row,
      revokedAt: new Date(),
      revocationReason: 'issued_in_error',
    } as never);
    expect((await verifyCertificate(code)).status).toBe('revoked');
    findMock.mockResolvedValueOnce({ ...row, payloadSignature: 'x' } as never);
    expect((await verifyCertificate(code)).status).toBe('invalid');
    findMock.mockResolvedValueOnce({ ...row, signingKeyId: 'missing' } as never);
    expect((await verifyCertificate(code)).status).toBe('unavailable');
    fetchMock.mockResolvedValueOnce(new Response(Buffer.from('replacement'), { status: 200 }));
    expect((await verifyCertificate(code)).status).toBe('invalid');
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 503 }));
    expect((await verifyCertificate(code)).status).toBe('unavailable');
  });
});
