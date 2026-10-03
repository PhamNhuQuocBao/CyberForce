import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  checkLoginRateLimit,
  recordFailedLogin,
  clearFailedLogins,
  blacklistToken,
  isTokenBlacklisted,
  generateOAuthState,
  generatePKCE,
  verifyPKCE,
  storeOAuthState,
  consumeOAuthState,
} from './security.js';
import { redis } from './redis.js';

describe('Security Utility Module', () => {
  afterAll(async () => {
    redis.disconnect();
  });

  describe('1. Argon2id Password Hashing (TDD Section 9.1)', () => {
    const plainPassword = 'SuperStrongPassword2026!';

    it('should hash password using argon2id format', async () => {
      const hash = await hashPassword(plainPassword);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).toContain('$argon2id$');
    });

    it('should verify correct password successfully', async () => {
      const hash = await hashPassword(plainPassword);
      const isMatch = await verifyPassword(hash, plainPassword);
      expect(isMatch).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const hash = await hashPassword(plainPassword);
      const isMatch = await verifyPassword(hash, 'WrongPassword123!');
      expect(isMatch).toBe(false);
    });

    it('should return false when verifying malformed hash string', async () => {
      const isMatch = await verifyPassword('not-a-valid-argon2-hash', plainPassword);
      expect(isMatch).toBe(false);
    });
  });

  describe('2. JWT Tokens & Claims', () => {
    const mockUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'cadet@cyberforce.io',
      role: 'student',
    };

    it('should generate accessToken and refreshToken with unique JTIs', () => {
      const tokens = generateTokens(mockUser);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.accessJti).toBeDefined();
      expect(tokens.refreshJti).toBeDefined();
      expect(tokens.accessJti).not.toEqual(tokens.refreshJti);
    });

    it('should verify accessToken and decode valid payload', () => {
      const { accessToken, accessJti } = generateTokens(mockUser);
      const payload = verifyAccessToken(accessToken);

      expect(payload.sub).toBe(mockUser.id);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.role).toBe(mockUser.role);
      expect(payload.jti).toBe(accessJti);
    });

    it('should verify refreshToken and decode valid payload', () => {
      const { refreshToken, refreshJti } = generateTokens(mockUser);
      const payload = verifyRefreshToken(refreshToken);

      expect(payload.sub).toBe(mockUser.id);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.role).toBe(mockUser.role);
      expect(payload.jti).toBe(refreshJti);
    });

    it('should throw error when accessToken is verified with wrong secret or tampered', () => {
      const { accessToken } = generateTokens(mockUser);
      const tampered = accessToken.slice(0, -6) + 'abcdef';

      expect(() => verifyAccessToken(tampered)).toThrow();
    });

    it('should compute deterministic SHA-256 hash for token storage', () => {
      const token = 'sample_raw_refresh_token_string';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });
  });

  describe('3. Redis Brute-Force Rate Limiting (TDD Section 9.2)', () => {
    const testIdentifier = `test_rate_limit_${Date.now()}@cyberforce.io`;

    beforeAll(async () => {
      await clearFailedLogins(testIdentifier);
    });

    afterAll(async () => {
      await clearFailedLogins(testIdentifier);
    });

    it('should return locked: false initially', async () => {
      const status = await checkLoginRateLimit(testIdentifier);
      expect(status.locked).toBe(false);
      expect(status.remainingSeconds).toBe(0);
    });

    it('should increment failed attempts on recordFailedLogin', async () => {
      const count1 = await recordFailedLogin(testIdentifier);
      expect(count1).toBe(1);

      const count2 = await recordFailedLogin(testIdentifier);
      expect(count2).toBe(2);

      const status = await checkLoginRateLimit(testIdentifier);
      expect(status.locked).toBe(false);
    });

    it('should lock account after 5 failed attempts', async () => {
      await recordFailedLogin(testIdentifier); // 3
      await recordFailedLogin(testIdentifier); // 4
      await recordFailedLogin(testIdentifier); // 5

      const status = await checkLoginRateLimit(testIdentifier);
      expect(status.locked).toBe(true);
      expect(status.remainingSeconds).toBeGreaterThan(0);
    });

    it('should reset failed attempts on clearFailedLogins', async () => {
      await clearFailedLogins(testIdentifier);
      const status = await checkLoginRateLimit(testIdentifier);
      expect(status.locked).toBe(false);
    });
  });

  describe('4. Token Blacklist & Instant Revocation', () => {
    const testJti = `test-jti-${Date.now()}`;

    it('should return false for unblacklisted token', async () => {
      const isBlacklisted = await isTokenBlacklisted(testJti);
      expect(isBlacklisted).toBe(false);
    });

    it('should return true after token JTI is blacklisted', async () => {
      await blacklistToken(testJti, 60); // 60 seconds TTL
      const isBlacklisted = await isTokenBlacklisted(testJti);
      expect(isBlacklisted).toBe(true);
    });
  });

  describe('5. PKCE (RFC 7636) & OAuth State Management', () => {
    it('should generate high-entropy random state strings', () => {
      const state1 = generateOAuthState();
      const state2 = generateOAuthState();
      expect(state1).toBeDefined();
      expect(state2).toBeDefined();
      expect(state1).not.toBe(state2);
      expect(state1.length).toBeGreaterThanOrEqual(40);
    });

    it('should generate valid PKCE codeVerifier and codeChallenge (S256)', () => {
      const pkce = generatePKCE();
      expect(pkce.codeVerifier).toBeDefined();
      expect(pkce.codeChallenge).toBeDefined();
      expect(pkce.codeChallengeMethod).toBe('S256');

      // Verification succeeds
      const isValid = verifyPKCE(pkce.codeVerifier, pkce.codeChallenge);
      expect(isValid).toBe(true);

      // Verification fails for tampered verifier
      const isTampered = verifyPKCE('tampered-verifier-code', pkce.codeChallenge);
      expect(isTampered).toBe(false);
    });

    it('should store and atomically consume OAuth state in Redis (preventing replay attacks)', async () => {
      const state = generateOAuthState();
      await storeOAuthState(state, {
        provider: 'google',
        codeVerifier: 'mock_verifier_123',
        redirectUri: 'http://localhost:3000/callback',
      });

      // First consume succeeds
      const consumed = await consumeOAuthState(state);
      expect(consumed).not.toBeNull();
      expect(consumed?.provider).toBe('google');
      expect(consumed?.codeVerifier).toBe('mock_verifier_123');

      // Second consume returns null (one-time use, prevents CSRF replay)
      const replayed = await consumeOAuthState(state);
      expect(replayed).toBeNull();
    });
  });
});
