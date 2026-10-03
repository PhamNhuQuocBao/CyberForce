import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redis.js';
import { clearFailedLogins } from '../../lib/security.js';

describe('Auth API Contract & Integration Tests', () => {
  let app: FastifyInstance;
  const testEmail = `integration_test_${Date.now()}@cyberforce.io`;
  const testUsername = `user_${Date.now().toString().slice(-6)}`;
  const testPassword = 'P@ssword2026Secure!';

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
    await clearFailedLogins(testEmail);
  });

  afterAll(async () => {
    // Cleanup test user and tokens
    try {
      await prisma.user.deleteMany({
        where: { email: testEmail },
      });
      await clearFailedLogins(testEmail);
    } catch {}

    await app.close();
    await prisma.$disconnect();
    redis.disconnect();
  });

  describe('1. Health Check Endpoint', () => {
    it('GET /health should return 200 and report database + redis healthy', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.status).toBe('healthy');
      expect(json.dependencies.database).toBe('healthy');
      expect(json.dependencies.redis).toBe('healthy');
    });
  });

  describe('2. POST /api/v1/auth/register', () => {
    it('should reject invalid registration payload with 400 VALIDATION_ERROR', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'invalid-email',
          username: 'ab', // too short
          password: '123', // too short & weak
        },
      });

      expect(res.statusCode).toBe(400);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
      expect(json.error.details).toHaveProperty('email');
      expect(json.error.details).toHaveProperty('username');
      expect(json.error.details).toHaveProperty('password');
    });

    it('should register a new cadet successfully with 201 Created and set refresh cookie', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: testEmail,
          username: testUsername,
          password: testPassword,
        },
      });

      expect(res.statusCode).toBe(201);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.user.email).toBe(testEmail.toLowerCase());
      expect(json.data.user.username).toBe(testUsername);
      expect(json.data.user.role).toBe('student');
      expect(json.data.accessToken).toBeDefined();

      // Check HTTP-only cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies).toContain('cyberforce_refresh=');
      expect(cookies).toContain('HttpOnly');
    });

    it('should reject duplicate email registration with 409 Conflict', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: testEmail,
          username: `diff_${testUsername}`,
          password: testPassword,
        },
      });

      expect(res.statusCode).toBe(409);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });
  });

  describe('3. POST /api/v1/auth/login', () => {
    it('should reject incorrect password with 401 INVALID_CREDENTIALS', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testEmail,
          password: 'WrongPassword999!',
        },
      });

      expect(res.statusCode).toBe(401);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('INVALID_CREDENTIALS');
      expect(json.error.details).toHaveProperty('remainingAttempts');
    });

    it('should login successfully with correct credentials and return tokens', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testEmail,
          password: testPassword,
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.user.email).toBe(testEmail.toLowerCase());
      expect(json.data.accessToken).toBeDefined();

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies).toContain('cyberforce_refresh=');
    });
  });

  describe('4. GET /api/v1/auth/me (Protected Route)', () => {
    let validToken: string;

    beforeAll(async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testEmail,
          password: testPassword,
        },
      });
      validToken = JSON.parse(res.payload).data.accessToken;
    });

    it('should reject unauthenticated request with 401 UNAUTHORIZED', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
      });

      expect(res.statusCode).toBe(401);
      const json = JSON.parse(res.payload);
      expect(json.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject forged/invalid token with 401 INVALID_TOKEN', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: {
          authorization: 'Bearer forged.invalid.token.here',
        },
      });

      expect(res.statusCode).toBe(401);
      const json = JSON.parse(res.payload);
      expect(json.error.code).toBe('INVALID_TOKEN');
    });

    it('should return profile for valid Bearer token', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.email).toBe(testEmail.toLowerCase());
      expect(json.data.username).toBe(testUsername);
      expect(json.data.role).toBe('student');
    });
  });

  describe('5. Token Refresh & Token Rotation', () => {
    it('should rotate tokens and return new accessToken via refresh token', async () => {
      // 1. Login to get cookies
      const loginRes = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testEmail,
          password: testPassword,
        },
      });

      const rawCookie = loginRes.headers['set-cookie'] as string;
      const refreshToken = rawCookie.split(';')[0].split('=')[1];

      // 2. Call /refresh with cookie
      const refreshRes = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
        headers: {
          cookie: `cyberforce_refresh=${refreshToken}`,
        },
      });

      expect(refreshRes.statusCode).toBe(200);
      const json = JSON.parse(refreshRes.payload);
      expect(json.success).toBe(true);
      expect(json.data.accessToken).toBeDefined();

      // Check rotated cookie
      const newCookie = refreshRes.headers['set-cookie'] as string;
      expect(newCookie).toBeDefined();
      expect(newCookie).toContain('cyberforce_refresh=');
    });
  });

  describe('6. Logout & Instant Token Invalidation', () => {
    it('should revoke refresh token and blacklist access token on logout', async () => {
      // 1. Login
      const loginRes = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testEmail,
          password: testPassword,
        },
      });

      const accessToken = JSON.parse(loginRes.payload).data.accessToken;
      const rawCookie = loginRes.headers['set-cookie'] as string;
      const refreshToken = rawCookie.split(';')[0].split('=')[1];

      // 2. Verify /me works before logout
      const meBefore = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: { authorization: `Bearer ${accessToken}` },
      });
      expect(meBefore.statusCode).toBe(200);

      // 3. Logout
      const logoutRes = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/logout',
        headers: {
          authorization: `Bearer ${accessToken}`,
          cookie: `cyberforce_refresh=${refreshToken}`,
        },
      });
      expect(logoutRes.statusCode).toBe(200);

      // 4. Verify old access token is now blacklisted
      const meAfter = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: { authorization: `Bearer ${accessToken}` },
      });
      expect(meAfter.statusCode).toBe(401);
      const json = JSON.parse(meAfter.payload);
      expect(json.error.code).toBe('TOKEN_REVOKED');
    });
  });
});
