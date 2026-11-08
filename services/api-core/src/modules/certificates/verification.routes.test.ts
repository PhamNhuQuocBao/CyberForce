import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { prisma } from '../../lib/prisma.js';
import { publicCertificateRoutes, adminCertificateRoutes } from './verification.routes.js';
import { verifyCertificate } from './verification.service.js';

vi.mock('../../lib/prisma.js', () => ({ prisma: { $transaction: vi.fn() } }));
vi.mock('./verification.service.js', () => ({ verifyCertificate: vi.fn() }));
vi.mock('../../middleware/authenticate.js', () => ({
  authenticate: async (request: { headers: { authorization?: string }; user?: unknown }) => {
    if (request.headers.authorization === 'Bearer admin')
      request.user = { sub: '76145c86-3934-4393-8a80-197c448d9025', role: 'superadmin' };
    if (request.headers.authorization === 'Bearer student')
      request.user = { sub: 'a4dc6f47-6e33-4001-97b7-cc3ee3643adc', role: 'student' };
  },
}));

const code = 'CF-CERT-2026-ABCDEF1234567890';
const audit = vi.fn();
const find = vi.fn();
const update = vi.fn();

describe('certificate verification routes', () => {
  const app = Fastify();
  beforeAll(async () => {
    await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
    await app.register(publicCertificateRoutes, { prefix: '/api/v1/certificates' });
    await app.register(adminCertificateRoutes, { prefix: '/api/v1/admin/certificates' });
    await app.ready();
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) =>
      callback({
        certificate: { findUnique: find, updateMany: update },
        auditLog: { create: audit },
      } as never),
    );
  });
  afterAll(async () => app.close());

  it('allows anonymous lookup but limits repeated requests', async () => {
    vi.mocked(verifyCertificate).mockResolvedValue({ status: 'not_found' });
    const url = `/api/v1/certificates/verify/${code}`;
    const response = await app.inject({ method: 'GET', url });
    expect(response.statusCode).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.json()).toEqual({ success: true, data: { status: 'not_found' } });
    for (let i = 0; i < 9; i++)
      expect((await app.inject({ method: 'GET', url })).statusCode).toBe(200);
    expect((await app.inject({ method: 'GET', url })).statusCode).toBe(429);
  });

  it('restricts revocation to superadmin and records an audit event', async () => {
    const url = `/api/v1/admin/certificates/${code}/revoke`;
    const payload = { reason: 'issued_in_error', note: 'Duplicate issuance' };
    const request = (authorization?: string) =>
      app.inject({ method: 'POST', url, headers: authorization ? { authorization } : {}, payload });
    expect((await request()).statusCode).toBe(401);
    expect((await request('Bearer student')).statusCode).toBe(403);
    find.mockResolvedValue({ id: 'c5109731-d2d5-4816-80eb-0891d51e1d15', revokedAt: null });
    update.mockResolvedValue({ count: 1 });
    audit.mockResolvedValue({});
    const response = await request('Bearer admin');
    expect(response.statusCode).toBe(200);
    expect(response.json().data.status).toBe('revoked');
    expect(audit).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'certificate.revoked',
        details: { code, reason: 'issued_in_error', note: 'Duplicate issuance' },
      }),
    });
  });
});
