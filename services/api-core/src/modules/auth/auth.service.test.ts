import { describe, it, expect } from 'vitest';
import { UserRole } from '@prisma/client';
import { toUserProfile, AuthError } from './auth.service.js';

describe('Auth Service Helpers & Errors', () => {
  it('toUserProfile should format database User into clean public UserProfile DTO', () => {
    const dbUser = {
      id: 'a0000000-0000-0000-0000-000000000001',
      email: 'student@cyberforce.io',
      username: 'cyber_student',
      avatarUrl: 'https://cdn.cyberforce.io/avatars/cadet.png',
      role: UserRole.student,
      expPoints: 250,
      rankTier: 'Novice',
      streakDays: 5,
      lastActiveAt: new Date('2026-10-01T12:00:00Z'),
      createdAt: new Date('2026-09-01T00:00:00Z'),
      // Should exclude sensitive fields like passwordHash
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$secret',
    };

    const profile = toUserProfile(dbUser);

    expect(profile).toEqual({
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      avatarUrl: dbUser.avatarUrl,
      role: dbUser.role,
      expPoints: dbUser.expPoints,
      rankTier: dbUser.rankTier,
      streakDays: dbUser.streakDays,
      lastActiveAt: dbUser.lastActiveAt,
      createdAt: dbUser.createdAt,
    });

    expect('passwordHash' in profile).toBe(false);
  });

  it('AuthError should encapsulate statusCode, error code, and metadata details', () => {
    const error = new AuthError(429, 'Account locked due to brute-force', 'ACCOUNT_LOCKED', {
      remainingSeconds: 600,
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(429);
    expect(error.code).toBe('ACCOUNT_LOCKED');
    expect(error.message).toBe('Account locked due to brute-force');
    expect(error.details).toEqual({ remainingSeconds: 600 });
  });
});
