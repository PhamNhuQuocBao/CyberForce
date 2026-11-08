import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { generateTokens } from '../../lib/security.js';
import { expireSession } from './exams.service.js';
import { sweepCertificateIssuances } from './certificates.service.js';

const hash = `sha256:${'a'.repeat(64)}`;

describe('CF-602 certificate issuance', () => {
  const app = buildApp();
  const suffix = `cert-${Date.now()}`;
  let userId: string;
  let otherId: string;
  let pathId: string;
  let examId: string;
  let token: string;
  let otherToken: string;
  const fetchMock = vi.spyOn(globalThis, 'fetch');
  let signingFails = true;
  const signed = {
    pdfS3Key: '',
    verificationHash: `sha256:${'b'.repeat(64)}`,
    signingKeyId: 'test-key',
    payloadSignature: 'signed-payload',
  };

  beforeAll(async () => {
    await app.ready();
    const user = await prisma.user.create({
      data: { email: `${suffix}@test.invalid`, username: suffix, certificateName: 'Learner Name' },
    });
    const other = await prisma.user.create({
      data: { email: `other-${suffix}@test.invalid`, username: `other-${suffix}` },
    });
    userId = user.id;
    otherId = other.id;
    token = generateTokens(user).accessToken;
    otherToken = generateTokens(other).accessToken;
    const path = await prisma.learningPath.create({
      data: { title: suffix, slug: suffix, isPublished: true },
    });
    pathId = path.id;
    const exam = await prisma.exam.create({
      data: {
        pathId,
        slug: suffix,
        title: 'Certificate exam',
        durationHours: 6,
        passingScore: 70,
        isPublished: true,
        targets: { create: [{ name: 'target', image: 'cyberforce/test:1' }] },
      },
    });
    examId = exam.id;
    const target = await prisma.examTarget.findFirstOrThrow({ where: { examId } });
    await prisma.examObjective.create({
      data: {
        examId,
        targetId: target.id,
        title: 'Objective',
        description: 'Test',
        points: 100,
        answerHash: hash,
      },
    });
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      if (init?.method === 'DELETE') return new Response(null, { status: 204 });
      if (url.endsWith('/v1/certificates') && init?.method === 'POST') {
        if (signingFails) return new Response(null, { status: 503 });
        const body = JSON.parse(String(init.body)) as { code: string };
        return Response.json(
          { ...signed, pdfS3Key: `certificates/${body.code}.pdf` },
          { status: 201 },
        );
      }
      if (url.endsWith('/pdf'))
        return new Response(Buffer.from('%PDF-1.4 test'), {
          status: 200,
          headers: { 'Content-Type': 'application/pdf' },
        });
      throw new Error(`Unexpected fetch ${url}`);
    });
  });

  afterAll(async () => {
    fetchMock.mockRestore();
    await prisma.certificate.deleteMany({ where: { examSession: { examId } } });
    await prisma.certificateIssuance.deleteMany({ where: { session: { examId } } });
    await prisma.examSession.deleteMany({ where: { examId } });
    await prisma.examObjective.deleteMany({ where: { examId } });
    await prisma.examTarget.deleteMany({ where: { examId } });
    await prisma.exam.delete({ where: { id: examId } });
    await prisma.learningPath.delete({ where: { id: pathId } });
    await prisma.user.deleteMany({ where: { id: { in: [userId, otherId] } } });
    await app.close();
  });

  it('retries failure, issues once, and restricts the PDF to its owner', async () => {
    const session = await prisma.examSession.create({
      data: {
        examId,
        userId,
        status: 'finished',
        score: 85,
        certificateName: 'Learner Name',
        consentedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        finishedAt: new Date(),
      },
    });
    const url = `/api/v1/exams/sessions/${session.id}/certificate`;
    const headers = { authorization: `Bearer ${token}` };
    expect((await app.inject({ method: 'GET', url, headers })).json().data.status).toBe('pending');
    expect(await prisma.certificateIssuance.count({ where: { sessionId: session.id } })).toBe(1);
    await sweepCertificateIssuances();
    expect((await app.inject({ method: 'GET', url, headers })).json().data.status).toBe('retrying');
    expect(await prisma.certificate.count({ where: { examSessionId: session.id } })).toBe(0);
    signingFails = false;
    await prisma.certificateIssuance.update({
      where: { sessionId: session.id },
      data: { nextAttemptAt: new Date(0) },
    });
    await sweepCertificateIssuances();
    await sweepCertificateIssuances();
    const status = (await app.inject({ method: 'GET', url, headers })).json().data;
    expect(status.status).toBe('issued');
    expect(status.code).toMatch(/^CF-CERT-\d{4}-[A-F0-9]{16}$/);
    expect(await prisma.certificate.count({ where: { examSessionId: session.id } })).toBe(1);
    const pdf = await app.inject({ method: 'GET', url: `${url}/pdf`, headers });
    expect(pdf.statusCode).toBe(200);
    expect(pdf.headers['content-type']).toContain('application/pdf');
    expect(
      (
        await app.inject({
          method: 'GET',
          url: `${url}/pdf`,
          headers: { authorization: `Bearer ${otherToken}` },
        })
      ).statusCode,
    ).toBe(404);
  });

  it('enqueues an expired passing session, but not a failed score', async () => {
    const expired = await prisma.examSession.create({
      data: {
        examId,
        userId,
        status: 'running',
        score: 70,
        certificateName: 'Learner Name',
        consentedAt: new Date(Date.now() - 10000),
        expiresAt: new Date(Date.now() - 1000),
      },
    });
    await expireSession(expired.id);
    expect(await prisma.certificateIssuance.count({ where: { sessionId: expired.id } })).toBe(1);
    const failed = await prisma.examSession.create({
      data: {
        examId,
        userId,
        status: 'finished',
        score: 69,
        certificateName: 'Learner Name',
        consentedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        finishedAt: new Date(),
      },
    });
    const status = await app.inject({
      method: 'GET',
      url: `/api/v1/exams/sessions/${failed.id}/certificate`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(status.json().data.status).toBe('ineligible');
    expect(await prisma.certificateIssuance.count({ where: { sessionId: failed.id } })).toBe(0);
  });

  it('requires one-time name confirmation for an older passing session', async () => {
    const legacy = await prisma.examSession.create({
      data: {
        examId,
        userId,
        status: 'finished',
        score: 75,
        consentedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        finishedAt: new Date(),
      },
    });
    const url = `/api/v1/exams/sessions/${legacy.id}/certificate`;
    const headers = { authorization: `Bearer ${token}` };
    expect((await app.inject({ method: 'GET', url, headers })).json().data.status).toBe(
      'needs_name',
    );
    const confirmed = await app.inject({
      method: 'POST',
      url: `/api/v1/exams/sessions/${legacy.id}/certificate-name`,
      headers,
      payload: { certificateName: 'Legacy Learner' },
    });
    expect(confirmed.json().data.status).toBe('pending');
    expect(await prisma.certificateIssuance.count({ where: { sessionId: legacy.id } })).toBe(1);
    expect(
      (
        await app.inject({
          method: 'POST',
          url: `/api/v1/exams/sessions/${legacy.id}/certificate-name`,
          headers,
          payload: { certificateName: 'Changed Name' },
        })
      ).statusCode,
    ).toBe(409);
  });
});
