import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redis.js';

describe('Users & Profiles API Integration Tests (CF-104 / US-01.03)', () => {
  let app: FastifyInstance;

  const publicUser = {
    email: `public_op_${Date.now()}@cyberforce.io`,
    username: `op_pub_${Date.now().toString().slice(-5)}`,
    password: 'Password123!',
  };

  const privateUser = {
    email: `private_op_${Date.now()}@cyberforce.io`,
    username: `op_priv_${Date.now().toString().slice(-5)}`,
    password: 'Password123!',
  };

  let publicToken: string;
  let privateToken: string;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();

    // Register public user
    const res1 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: publicUser,
    });
    publicToken = JSON.parse(res1.payload).data.accessToken;

    // Register private user
    const res2 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: privateUser,
    });
    privateToken = JSON.parse(res2.payload).data.accessToken;

    // Set privateUser to isPublic: false
    await app.inject({
      method: 'PATCH',
      url: '/api/v1/users/me/profile',
      headers: { Authorization: `Bearer ${privateToken}` },
      payload: { isPublic: false, bio: 'Classified operative', specialty: 'Reverse Engineering' },
    });
  });

  afterAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: {
          OR: [{ email: publicUser.email }, { email: privateUser.email }],
        },
      });
    } catch {
      // Ignore cleanup error
    }
    await app.close();
    await prisma.$disconnect();
    redis.disconnect();
  });

  describe('1. GET /api/v1/users/:username/profile', () => {
    it('should return 404 USER_NOT_FOUND when username does not exist', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/users/non_existent_callsign_999/profile',
      });
      expect(res.statusCode).toBe(404);
      const json = JSON.parse(res.payload);
      expect(json.error.code).toBe('USER_NOT_FOUND');
    });

    it('should return complete portfolio dossier for public profile viewed by visitor', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/users/${publicUser.username}/profile`,
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);

      const dossier = json.data;
      expect(dossier.username).toBe(publicUser.username);
      expect(dossier.isPublic).toBe(true);
      expect(dossier.isSelf).toBe(false);
      expect(dossier.telemetry).toBeDefined();
      expect(dossier.telemetry.webExploitation).toBeGreaterThanOrEqual(0);
      expect(dossier.badges).toBeDefined();
      expect(Array.isArray(dossier.badges)).toBe(true);

      // Security check: visitor cannot see user's email
      expect(dossier.email).toBeUndefined();
    });

    it('should restrict classified dossier for visitor when profile is private (Wireframe 2.2 Perspective A)', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/users/${privateUser.username}/profile`,
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);

      const dossier = json.data;
      expect(dossier.username).toBe(privateUser.username);
      expect(dossier.isPublic).toBe(false);
      expect(dossier.isSelf).toBe(false);

      // Restricted: Telemetry, badges, certificates, bio are withheld
      expect(dossier.telemetry).toBeUndefined();
      expect(dossier.badges).toBeUndefined();
      expect(dossier.certificates).toBeUndefined();
      expect(dossier.bio).toBeUndefined();
    });

    it('should allow owner to see full private dossier with isSelf: true (Wireframe 2.2 Perspective B)', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/users/${privateUser.username}/profile`,
        headers: { Authorization: `Bearer ${privateToken}` },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      const dossier = json.data;

      expect(dossier.username).toBe(privateUser.username);
      expect(dossier.isPublic).toBe(false);
      expect(dossier.isSelf).toBe(true);
      expect(dossier.email).toBe(privateUser.email);
      expect(dossier.telemetry).toBeDefined();
      expect(dossier.badges).toBeDefined();
      expect(dossier.bio).toBe('Classified operative');
      expect(dossier.specialty).toBe('Reverse Engineering');
    });
  });

  describe('2. PATCH /api/v1/users/me/profile', () => {
    it('should reject unauthenticated profile update with 401 UNAUTHORIZED', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/v1/users/me/profile',
        payload: { bio: 'Hacker' },
      });
      expect(res.statusCode).toBe(401);
    });

    it('should reject bio exceeding 500 characters with 400 VALIDATION_ERROR', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/v1/users/me/profile',
        headers: { Authorization: `Bearer ${publicToken}` },
        payload: { bio: 'A'.repeat(501) },
      });
      expect(res.statusCode).toBe(400);
      const json = JSON.parse(res.payload);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should update bio, specialty, and toggle isPublic to false', async () => {
      const updateRes = await app.inject({
        method: 'PATCH',
        url: '/api/v1/users/me/profile',
        headers: { Authorization: `Bearer ${publicToken}` },
        payload: {
          bio: 'Elite penetration tester & CTF player.',
          specialty: 'Cloud Security & Containers',
          isPublic: false,
        },
      });

      expect(updateRes.statusCode).toBe(200);
      const updateJson = JSON.parse(updateRes.payload);
      expect(updateJson.success).toBe(true);
      expect(updateJson.data.bio).toBe('Elite penetration tester & CTF player.');
      expect(updateJson.data.specialty).toBe('Cloud Security & Containers');
      expect(updateJson.data.isPublic).toBe(false);

      // Verify now visitor sees private shield
      const getRes = await app.inject({
        method: 'GET',
        url: `/api/v1/users/${publicUser.username}/profile`,
      });
      const getJson = JSON.parse(getRes.payload);
      expect(getJson.data.isPublic).toBe(false);
      expect(getJson.data.telemetry).toBeUndefined();

      // Toggle back to isPublic: true
      const restoreRes = await app.inject({
        method: 'PATCH',
        url: '/api/v1/users/me/profile',
        headers: { Authorization: `Bearer ${publicToken}` },
        payload: { isPublic: true },
      });
      expect(restoreRes.statusCode).toBe(200);
      expect(JSON.parse(restoreRes.payload).data.isPublic).toBe(true);
    });
  });
});
