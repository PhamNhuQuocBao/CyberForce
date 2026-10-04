import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redis.js';
import { clearFailedLogins, generateOAuthState, storeOAuthState } from '../../lib/security.js';
import { setOAuthClient } from './auth.controller.js';
import type { IOAuthProviderClient, NormalizedOAuthProfile } from './oauth.provider.js';

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
        where: {
          OR: [
            { email: testEmail },
            { email: { startsWith: 'oauth_test_' } },
            { email: { startsWith: 'link_test_' } },
            { email: { startsWith: 'conflict_' } },
            { email: { startsWith: 'unified_' } },
            { email: 'gh_conflict_test@cyberforce.io' },
          ],
        },
      });
      await clearFailedLogins(testEmail);
    } catch {
      // Ignore test cleanup errors
    }

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

  describe('6. 1-Click OAuth2 Integration (US-01.01 Google & GitHub)', () => {
    const mockOAuthClient: IOAuthProviderClient & { mockProfile?: NormalizedOAuthProfile } = {
      getAuthorizationUrl({ provider, state, codeChallenge }) {
        if (provider === 'github') {
          return `https://github.com/login/oauth/authorize?client_id=mock_gh&state=${state}&scope=read:user,user:email`;
        }
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=mock_gg&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
      },
      async exchangeCodeForProfile() {
        if (!this.mockProfile) throw new Error('Mock profile not set');
        return this.mockProfile;
      },
    };

    beforeAll(() => {
      setOAuthClient(mockOAuthClient);
    });

    it('GET /api/v1/auth/oauth/github/url should return authorization URL with CSRF state', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/oauth/github/url',
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.provider).toBe('github');
      expect(json.data.state).toBeDefined();
      expect(json.data.url).toContain('https://github.com/login/oauth/authorize');
      expect(json.data.url).toContain(`state=${json.data.state}`);
    });

    it('GET /api/v1/auth/oauth/google/url should include PKCE code_challenge and S256 method', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/oauth/google/url',
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.provider).toBe('google');
      expect(json.data.url).toContain('code_challenge=');
      expect(json.data.url).toContain('code_challenge_method=S256');
    });

    it('POST /api/v1/auth/oauth/github/callback should reject invalid or expired state with 400', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/oauth/github/callback',
        payload: {
          code: 'mock_code',
          state: 'non_existent_fake_state',
        },
      });

      expect(res.statusCode).toBe(400);
      const json = JSON.parse(res.payload);
      expect(json.error.code).toBe('INVALID_OAUTH_STATE');
    });

    it('POST /api/v1/auth/oauth/github/callback should register new student user with Novice, 0 EXP, 1 day streak (US-01.01 Scenario 1)', async () => {
      const testOAuthId = `gh_acc_${Date.now()}`;
      const testOAuthEmail = `oauth_test_${Date.now()}@cyberforce.io`;
      const testOAuthUsername = `gh_user_${Date.now().toString().slice(-4)}`;

      mockOAuthClient.mockProfile = {
        provider: 'github',
        providerAccountId: testOAuthId,
        email: testOAuthEmail,
        username: testOAuthUsername,
        avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
      };

      const validState = generateOAuthState();
      await storeOAuthState(validState, { provider: 'github' });

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/oauth/github/callback',
        payload: {
          code: 'valid_gh_code',
          state: validState,
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.isNewUser).toBe(true);
      expect(json.data.user.email).toBe(testOAuthEmail);
      expect(json.data.user.role).toBe('student');
      expect(json.data.user.rankTier).toBe('Novice');
      expect(json.data.user.expPoints).toBe(0);
      expect(json.data.user.streakDays).toBe(1);
      expect(json.data.accessToken).toBeDefined();

      // Verify HTTP-only cookie set
      const rawCookie = res.headers['set-cookie'] as string;
      expect(rawCookie).toBeDefined();
      expect(rawCookie).toContain('cyberforce_refresh=');
      expect(rawCookie).toContain('HttpOnly');

      // Verify OAuthAccount record exists in database
      const dbLink = await prisma.oAuthAccount.findUnique({
        where: {
          provider_providerAccountId: {
            provider: 'github',
            providerAccountId: testOAuthId,
          },
        },
      });
      expect(dbLink).not.toBeNull();
      expect(dbLink?.userId).toBe(json.data.user.id);
    });

    it('POST /api/v1/auth/oauth/github/callback should log in existing linked OAuth user without duplicates', async () => {
      const testOAuthId = `gh_acc_existing_${Date.now()}`;
      const testOAuthEmail = `oauth_test_existing_${Date.now()}@cyberforce.io`;

      mockOAuthClient.mockProfile = {
        provider: 'github',
        providerAccountId: testOAuthId,
        email: testOAuthEmail,
        username: `gh_existing_${Date.now().toString().slice(-4)}`,
        avatarUrl: null,
      };

      // 1. First registration
      const state1 = generateOAuthState();
      await storeOAuthState(state1, { provider: 'github' });

      const res1 = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/oauth/github/callback',
        payload: { code: 'code1', state: state1 },
      });
      expect(res1.statusCode).toBe(200);
      const user1 = JSON.parse(res1.payload).data.user;

      // 2. Second login via same GitHub identity
      const state2 = generateOAuthState();
      await storeOAuthState(state2, { provider: 'github' });

      const res2 = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/oauth/github/callback',
        payload: { code: 'code2', state: state2 },
      });
      expect(res2.statusCode).toBe(200);
      const json2 = JSON.parse(res2.payload);
      expect(json2.data.isNewUser).toBe(false);
      expect(json2.data.user.id).toBe(user1.id);

      // Verify user count didn't increase
      const count = await prisma.user.count({
        where: { email: testOAuthEmail },
      });
      expect(count).toBe(1);
    });

    it('POST /api/v1/auth/oauth/google/callback should refuse auto-merge on email conflict (US-01.01 Scenario 2)', async () => {
      const conflictEmail = 'gh_conflict_test@cyberforce.io';

      // 1. Create a user via normal registration
      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: conflictEmail,
          username: `conflict_user_${Date.now().toString().slice(-4)}`,
          password: 'ConflictPassword123!',
        },
      });

      // 2. Google OAuth returns the SAME email address
      mockOAuthClient.mockProfile = {
        provider: 'google',
        providerAccountId: 'google_sub_99999',
        email: conflictEmail,
        username: 'google_conflict',
        avatarUrl: null,
      };

      const validState = generateOAuthState();
      await storeOAuthState(validState, { provider: 'google' });

      // 3. System must reject auto-merge and throw 409 ACCOUNT_EXISTS_DIFFERENT_PROVIDER
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/oauth/google/callback',
        payload: {
          code: 'google_code',
          state: validState,
        },
      });

      expect(res.statusCode).toBe(409);
      const json = JSON.parse(res.payload);
      expect(json.error.code).toBe('ACCOUNT_EXISTS_DIFFERENT_PROVIDER');
      expect(json.error.message).toContain('already exists with a different login method');
    });

    it('GET /api/v1/auth/oauth/github/callback should redirect browser to frontend web callback', async () => {
      const testOAuthId = `gh_acc_redirect_${Date.now()}`;
      const testOAuthEmail = `oauth_test_redirect_${Date.now()}@cyberforce.io`;

      mockOAuthClient.mockProfile = {
        provider: 'github',
        providerAccountId: testOAuthId,
        email: testOAuthEmail,
        username: `gh_redirect_${Date.now().toString().slice(-4)}`,
        avatarUrl: null,
      };

      const validState = generateOAuthState();
      await storeOAuthState(validState, { provider: 'github' });

      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/auth/oauth/github/callback?code=redirect_code&state=${validState}`,
      });

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toContain('/auth/callback?token=');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('GET /api/v1/auth/oauth/github/callback should redirect to /auth/callback with link_required on email conflict', async () => {
      const conflictEmail = `conflict_redirect_${Date.now()}@cyberforce.io`;

      // 1. Create existing user
      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: conflictEmail,
          username: `user_${Date.now().toString().slice(-5)}`,
          password: 'Password123!',
        },
      });

      // 2. Incoming OAuth with same email
      mockOAuthClient.mockProfile = {
        provider: 'github',
        providerAccountId: `gh_redirect_conflict_${Date.now()}`,
        email: conflictEmail,
        username: 'conflict_github',
        avatarUrl: null,
      };

      const validState = generateOAuthState();
      await storeOAuthState(validState, { provider: 'github' });

      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/auth/oauth/github/callback?code=code&state=${validState}`,
      });

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toContain('/auth/callback?');
      expect(res.headers.location).toContain('link_required=true');
      expect(res.headers.location).toContain(`email=${encodeURIComponent(conflictEmail)}`);
      expect(res.headers.location).toContain('pending_token=');
    });

    describe('CF-102: Account Linking Flow (Sub-flow 1.2)', () => {
      const linkEmail = `link_test_${Date.now()}@cyberforce.io`;
      const linkPassword = 'CorrectP@ssword2026!';
      let existingUserId: string;

      beforeAll(async () => {
        const regRes = await app.inject({
          method: 'POST',
          url: '/api/v1/auth/register',
          payload: {
            email: linkEmail,
            username: `linker_${Date.now().toString().slice(-4)}`,
            password: linkPassword,
          },
        });
        const body = JSON.parse(regRes.payload);
        existingUserId = body.data.user.id;
      });

      it('Sub-flow 1.2.3 & 1.2.4 & 1.2.5: OTP Request & Verification flow', async () => {
        // Step 1: Trigger OAuth collision via POST
        const incomingGhId = `gh_link_${Date.now()}`;
        mockOAuthClient.mockProfile = {
          provider: 'github',
          providerAccountId: incomingGhId,
          email: linkEmail,
          username: 'linker_gh',
          avatarUrl: null,
        };

        const state1 = generateOAuthState();
        await storeOAuthState(state1, { provider: 'github' });

        const conflictRes = await app.inject({
          method: 'POST',
          url: '/api/v1/auth/oauth/github/callback',
          payload: { code: 'code_gh', state: state1 },
        });

        expect(conflictRes.statusCode).toBe(409);
        const conflictJson = JSON.parse(conflictRes.payload);
        expect(conflictJson.error.code).toBe('ACCOUNT_EXISTS_DIFFERENT_PROVIDER');
        const pendingToken = conflictJson.error.details.pendingLinkToken;
        expect(pendingToken).toBeDefined();

        // Step 2: Request OTP via Sub-flow 1.2.3 (POST /auth/link/send-otp)
        const sendOtpRes = await app.inject({
          method: 'POST',
          url: '/api/v1/auth/link/send-otp',
          payload: { pendingLinkToken: pendingToken },
        });

        expect(sendOtpRes.statusCode).toBe(200);
        const sendOtpJson = JSON.parse(sendOtpRes.payload);
        expect(sendOtpJson.success).toBe(true);
        expect(sendOtpJson.data.email).toBe(linkEmail);

        // Fetch OTP from Redis
        const otp = await redis.get(`account_link:otp:${pendingToken}`);
        expect(otp).toBeDefined();
        expect(otp).toMatch(/^\d{6}$/);

        // Step 3: Sub-flow 1.2.4 - Submit incorrect OTP -> 401 INVALID_OTP
        const wrongOtpRes = await app.inject({
          method: 'POST',
          url: '/api/v1/auth/link/verify-otp',
          payload: { pendingLinkToken: pendingToken, otp: '000000' },
        });
        expect(wrongOtpRes.statusCode).toBe(401);
        const wrongOtpJson = JSON.parse(wrongOtpRes.payload);
        expect(wrongOtpJson.error.code).toBe('INVALID_OTP');

        // Step 4: Sub-flow 1.2.5 - Submit correct OTP -> 200 OK & linked session tokens
        const correctOtpRes = await app.inject({
          method: 'POST',
          url: '/api/v1/auth/link/verify-otp',
          payload: { pendingLinkToken: pendingToken, otp },
        });

        expect(correctOtpRes.statusCode).toBe(200);
        const correctOtpJson = JSON.parse(correctOtpRes.payload);
        expect(correctOtpJson.success).toBe(true);
        expect(correctOtpJson.data.user.id).toBe(existingUserId);
        expect(correctOtpJson.data.accessToken).toBeDefined();

        // Step 5: Verify OAuth account is now linked in database
        const oAuthAccount = await prisma.oAuthAccount.findUnique({
          where: {
            provider_providerAccountId: {
              provider: 'github',
              providerAccountId: incomingGhId,
            },
          },
        });
        expect(oAuthAccount).toBeDefined();
        expect(oAuthAccount?.userId).toBe(existingUserId);

        // Step 6: Verify logging in with this GitHub account now succeeds directly (no 409!)
        const state2 = generateOAuthState();
        await storeOAuthState(state2, { provider: 'github' });
        const directLoginRes = await app.inject({
          method: 'POST',
          url: '/api/v1/auth/oauth/github/callback',
          payload: { code: 'code_gh_2', state: state2 },
        });
        expect(directLoginRes.statusCode).toBe(200);
        const directJson = JSON.parse(directLoginRes.payload);
        expect(directJson.data.user.id).toBe(existingUserId);
      });

      it('Sub-flow 1.2.2: Password Verification flow', async () => {
        const incomingGoogleId = `google_link_${Date.now()}`;
        mockOAuthClient.mockProfile = {
          provider: 'google',
          providerAccountId: incomingGoogleId,
          email: linkEmail,
          username: 'linker_google',
          avatarUrl: null,
        };

        const state = generateOAuthState();
        await storeOAuthState(state, { provider: 'google' });

        const conflictRes = await app.inject({
          method: 'POST',
          url: '/api/v1/auth/oauth/google/callback',
          payload: { code: 'code_gg', state },
        });

        expect(conflictRes.statusCode).toBe(409);
        const pendingToken = JSON.parse(conflictRes.payload).error.details.pendingLinkToken;

        // Wrong password -> 401
        const wrongPassRes = await app.inject({
          method: 'POST',
          url: '/api/v1/auth/link/verify-password',
          payload: { pendingLinkToken: pendingToken, password: 'WrongPassword999!' },
        });
        expect(wrongPassRes.statusCode).toBe(401);

        // Correct password -> 200 and linked
        const correctPassRes = await app.inject({
          method: 'POST',
          url: '/api/v1/auth/link/verify-password',
          payload: { pendingLinkToken: pendingToken, password: linkPassword },
        });
        expect(correctPassRes.statusCode).toBe(200);
        const json = JSON.parse(correctPassRes.payload);
        expect(json.data.user.id).toBe(existingUserId);

        // Verify google account is linked
        const googleLink = await prisma.oAuthAccount.findUnique({
          where: {
            provider_providerAccountId: {
              provider: 'google',
              providerAccountId: incomingGoogleId,
            },
          },
        });
        expect(googleLink).toBeDefined();
        expect(googleLink?.userId).toBe(existingUserId);
      });

      it('POST /api/v1/auth/link-account should link via unified endpoint with password or OTP', async () => {
        // Create another user
        const unifiedEmail = `unified_${Date.now()}@cyberforce.io`;
        const unifiedPass = 'UnifiedP@ssword2026!';
        const regRes = await app.inject({
          method: 'POST',
          url: '/api/v1/auth/register',
          payload: {
            email: unifiedEmail,
            username: `uni_${Date.now().toString().slice(-4)}`,
            password: unifiedPass,
          },
        });
        const userId = JSON.parse(regRes.payload).data.user.id;

        const incomingGh = `gh_uni_${Date.now()}`;
        mockOAuthClient.mockProfile = {
          provider: 'github',
          providerAccountId: incomingGh,
          email: unifiedEmail,
          username: 'uni_gh',
          avatarUrl: null,
        };

        const state = generateOAuthState();
        await storeOAuthState(state, { provider: 'github' });

        const conflictRes = await app.inject({
          method: 'POST',
          url: '/api/v1/auth/oauth/github/callback',
          payload: { code: 'code', state },
        });
        const pendingToken = JSON.parse(conflictRes.payload).error.details.pendingLinkToken;

        // Use unified /link-account endpoint with password
        const linkRes = await app.inject({
          method: 'POST',
          url: '/api/v1/auth/link-account',
          payload: {
            pendingLinkToken: pendingToken,
            method: 'password',
            password: unifiedPass,
          },
        });

        expect(linkRes.statusCode).toBe(200);
        const linkJson = JSON.parse(linkRes.payload);
        expect(linkJson.success).toBe(true);
        expect(linkJson.data.user.id).toBe(userId);
      });

      it('should reject invalid or expired pendingLinkToken with 400 INVALID_LINK_TOKEN', async () => {
        const { randomUUID } = await import('node:crypto');
        const fakeToken = randomUUID();
        const res = await app.inject({
          method: 'POST',
          url: '/api/v1/auth/link/verify-password',
          payload: { pendingLinkToken: fakeToken, password: 'any' },
        });
        expect(res.statusCode).toBe(400);
        const json = JSON.parse(res.payload);
        expect(json.error.code).toBe('INVALID_LINK_TOKEN');
      });
    });
  });
});
