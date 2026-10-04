import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { generateTokens, hashPassword } from '../../lib/security.js';

describe('RBAC & Role Request Review API Contract Tests (US-01.04 / CF-105)', () => {
  let app: FastifyInstance;

  let studentUser: { id: string; email: string; username: string };
  let studentToken: string;

  let secondStudentUser: { id: string; email: string; username: string };
  let secondStudentToken: string;

  let adminUser: { id: string; email: string; username: string };
  let adminToken: string;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();

    const timestamp = Date.now();
    const pwHash = await hashPassword('P@ssword123!');

    // 1. Create Student 1
    studentUser = await prisma.user.create({
      data: {
        email: `student_${timestamp}@cyberforce.io`,
        username: `student_${timestamp}`,
        passwordHash: pwHash,
        role: 'student',
        rankTier: 'Novice',
        expPoints: 100,
      },
    });
    studentToken = generateTokens(studentUser).accessToken;

    // 2. Create Student 2
    secondStudentUser = await prisma.user.create({
      data: {
        email: `student2_${timestamp}@cyberforce.io`,
        username: `student2_${timestamp}`,
        passwordHash: pwHash,
        role: 'student',
        rankTier: 'Novice',
        expPoints: 50,
      },
    });
    secondStudentToken = generateTokens(secondStudentUser).accessToken;

    // 3. Create Admin (superadmin)
    adminUser = await prisma.user.create({
      data: {
        email: `admin_${timestamp}@cyberforce.io`,
        username: `admin_${timestamp}`,
        passwordHash: pwHash,
        role: 'superadmin',
        rankTier: 'Grandmaster',
        expPoints: 5000,
      },
    });
    adminToken = generateTokens(adminUser).accessToken;
  });

  afterAll(async () => {
    // Clean up created test data
    await prisma.auditLog.deleteMany({
      where: {
        actorId: { in: [studentUser.id, secondStudentUser.id, adminUser.id] },
      },
    });
    await prisma.roleRequest.deleteMany({
      where: {
        userId: { in: [studentUser.id, secondStudentUser.id] },
      },
    });
    await prisma.user.deleteMany({
      where: {
        id: { in: [studentUser.id, secondStudentUser.id, adminUser.id] },
      },
    });
    await app.close();
  });

  // ---------------------------------------------------------------------------
  // 1. RBAC Guard Security (Scenario 2)
  // ---------------------------------------------------------------------------
  describe('1. RBAC Guard Enforcement (US-01.04 Scenario 2)', () => {
    it('POST /api/v1/admin/users/assign-role should reject non-admin with 403 Forbidden', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/users/assign-role',
        headers: {
          authorization: `Bearer ${studentToken}`,
        },
        payload: {
          userId: studentUser.id,
          role: 'creator',
        },
      });

      expect(res.statusCode).toBe(403);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('FORBIDDEN');
      expect(json.error.message).toContain('Access denied. Required role: Admin');
    });

    it('GET /api/v1/admin/roles/requests should reject unauthenticated request with 401', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/roles/requests',
      });

      expect(res.statusCode).toBe(401);
    });

    it('GET /api/v1/admin/audit-logs should reject student with 403 Forbidden', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/audit-logs',
        headers: {
          authorization: `Bearer ${studentToken}`,
        },
      });

      expect(res.statusCode).toBe(403);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Student Creator Application Flow
  // ---------------------------------------------------------------------------
  describe('2. Student Creator Application Workflow', () => {
    let createdRequestId: string;

    it('POST /api/v1/roles/request-creator should allow student to submit an application', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/roles/request-creator',
        headers: {
          authorization: `Bearer ${studentToken}`,
        },
        payload: {
          specialty: 'Web Application Exploitation',
          motivation:
            'I have 5 years experience in ethical hacking and created several CTF challenges for university competitions.',
          portfolioUrl: 'https://github.com/cybersecurity-portfolio',
        },
      });

      expect(res.statusCode).toBe(201);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('pending');
      expect(json.data.requestedRole).toBe('creator');
      expect(json.data.specialty).toBe('Web Application Exploitation');

      createdRequestId = json.data.id;
    });

    it('POST /api/v1/roles/request-creator should reject duplicate pending application with 409', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/roles/request-creator',
        headers: {
          authorization: `Bearer ${studentToken}`,
        },
        payload: {
          specialty: 'Network Security',
          motivation: 'Applying again before review is complete.',
        },
      });

      expect(res.statusCode).toBe(409);
      const json = JSON.parse(res.payload);
      expect(json.error.code).toBe('PENDING_REQUEST_EXISTS');
    });

    it('GET /api/v1/roles/my-requests should return list of submitted applications', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/roles/my-requests',
        headers: {
          authorization: `Bearer ${studentToken}`,
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.length).toBeGreaterThanOrEqual(1);
      expect(json.data[0].id).toBe(createdRequestId);
      expect(json.data[0].status).toBe('pending');
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Admin Review & Role Elevation (US-01.04 Scenario 1)
  // ---------------------------------------------------------------------------
  describe('3. Admin Review & Role Elevation Workflow', () => {
    it('GET /api/v1/admin/roles/requests should allow admin to view all pending requests', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/roles/requests?status=pending',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      const found = json.data.find((r: { user: { id: string } }) => r.user.id === studentUser.id);
      expect(found).toBeDefined();
      expect(found.user.username).toBe(studentUser.username);
    });

    it('POST /api/v1/admin/roles/review should approve application and elevate student role to Creator', async () => {
      // Find student's request
      const pendingReq = await prisma.roleRequest.findFirst({
        where: { userId: studentUser.id, status: 'pending' },
      });
      expect(pendingReq).toBeDefined();

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/roles/review',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          requestId: pendingReq!.id,
          action: 'approve',
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.request.status).toBe('approved');
      expect(json.data.user.role).toBe('creator');

      // Verify in DB directly
      const updatedInDb = await prisma.user.findUnique({
        where: { id: studentUser.id },
      });
      expect(updatedInDb?.role).toBe('creator');

      // Verify Audit Log entry
      const audit = await prisma.auditLog.findFirst({
        where: {
          action: 'ADMIN_ROLE_CHANGE',
          targetId: studentUser.id,
        },
      });
      expect(audit).toBeDefined();
      expect(audit?.actorId).toBe(adminUser.id);
    });

    it('POST /api/v1/admin/roles/review should reject an already resolved request with 400', async () => {
      const resolvedReq = await prisma.roleRequest.findFirst({
        where: { userId: studentUser.id },
      });

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/roles/review',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          requestId: resolvedReq!.id,
          action: 'reject',
          rejectionReason: 'Already approved previously',
        },
      });

      expect(res.statusCode).toBe(400);
      const json = JSON.parse(res.payload);
      expect(json.error.code).toBe('REQUEST_ALREADY_RESOLVED');
    });

    it('POST /api/v1/admin/roles/review should support rejecting an application with reason', async () => {
      // Second student submits application
      const submitRes = await app.inject({
        method: 'POST',
        url: '/api/v1/roles/request-creator',
        headers: {
          authorization: `Bearer ${secondStudentToken}`,
        },
        payload: {
          specialty: 'Cryptography',
          motivation: 'Interested in making rooms for beginner crypto.',
        },
      });
      expect(submitRes.statusCode).toBe(201);
      const submitJson = JSON.parse(submitRes.payload);

      // Admin rejects
      const reviewRes = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/roles/review',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          requestId: submitJson.data.id,
          action: 'reject',
          rejectionReason: 'Please complete at least 5 intermediate rooms before applying.',
        },
      });

      expect(reviewRes.statusCode).toBe(200);
      const reviewJson = JSON.parse(reviewRes.payload);
      expect(reviewJson.data.request.status).toBe('rejected');
      expect(reviewJson.data.request.rejectionReason).toContain(
        'Please complete at least 5 intermediate rooms',
      );

      // Verify user remains student
      const userAfter = await prisma.user.findUnique({
        where: { id: secondStudentUser.id },
      });
      expect(userAfter?.role).toBe('student');
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Direct Role Assignment & Audit Logs Inspection
  // ---------------------------------------------------------------------------
  describe('4. Direct Role Assignment & Audit Logs Query', () => {
    it('POST /api/v1/admin/users/assign-role should directly change role for a user', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/users/assign-role',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          userId: secondStudentUser.id,
          role: 'instructor',
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.role).toBe('instructor');

      const userInDb = await prisma.user.findUnique({
        where: { id: secondStudentUser.id },
      });
      expect(userInDb?.role).toBe('instructor');
    });

    it('GET /api/v1/admin/audit-logs should return chronological audit trails for admin', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/audit-logs?limit=10',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
      expect(json.data[0].action).toBeDefined();
      expect(json.pagination.total).toBeGreaterThan(0);
    });
  });
});
