import type { UserRole } from '@prisma/client';
import argon2 from 'argon2';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { redis } from './redis.js';

export interface TokenPayload extends JwtPayload {
  sub: string;
  email: string;
  role: UserRole | string;
  jti: string;
}

// -----------------------------------------------------------------------------
// 1. ARGON2ID PASSWORD HASHING (TDD Compliant: Section 9.1)
// -----------------------------------------------------------------------------
export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3, // 3 iterations
    parallelism: 4, // 4 threads
  });
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

// -----------------------------------------------------------------------------
// 2. JWT TOKENS
// -----------------------------------------------------------------------------
export function generateTokens(user: { id: string; email: string; role: string }) {
  const accessJti = crypto.randomUUID();
  const refreshJti = crypto.randomUUID();

  const accessPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    jti: accessJti,
  };

  const refreshPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    jti: refreshJti,
  };

  const accessToken = jwt.sign(accessPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign(refreshPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  return {
    accessToken,
    refreshToken,
    accessJti,
    refreshJti,
  };
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// -----------------------------------------------------------------------------
// 3. REDIS RATE LIMITING & BRUTE FORCE PROTECTION (TDD Section 9.2)
// -----------------------------------------------------------------------------
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_SECONDS = 900; // 15 minutes

export async function checkLoginRateLimit(identifier: string): Promise<{
  locked: boolean;
  remainingSeconds: number;
}> {
  try {
    const key = `auth:failed_attempts:${identifier}`;
    const attempts = await redis.get(key);

    if (attempts && parseInt(attempts, 10) >= MAX_FAILED_ATTEMPTS) {
      const ttl = await redis.ttl(key);
      return {
        locked: true,
        remainingSeconds: ttl > 0 ? ttl : LOCKOUT_WINDOW_SECONDS,
      };
    }

    return { locked: false, remainingSeconds: 0 };
  } catch (error) {
    console.error('Redis rate limit check error:', error);
    return { locked: false, remainingSeconds: 0 }; // Fail open for resilience if redis is temporarily unreachable
  }
}

export async function recordFailedLogin(identifier: string): Promise<number> {
  try {
    const key = `auth:failed_attempts:${identifier}`;
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, LOCKOUT_WINDOW_SECONDS);
    }
    return current;
  } catch (error) {
    console.error('Redis record failed login error:', error);
    return 1;
  }
}

export async function clearFailedLogins(identifier: string): Promise<void> {
  try {
    const key = `auth:failed_attempts:${identifier}`;
    await redis.del(key);
  } catch (error) {
    console.error('Redis clear failed logins error:', error);
  }
}

// -----------------------------------------------------------------------------
// 4. TOKEN BLACKLISTING (Revocation)
// -----------------------------------------------------------------------------
export async function blacklistToken(jti: string, ttlSeconds: number): Promise<void> {
  try {
    await redis.set(`auth:blacklist:${jti}`, '1', 'EX', ttlSeconds);
  } catch (error) {
    console.error('Redis blacklist error:', error);
  }
}

export async function isTokenBlacklisted(jti: string): Promise<boolean> {
  try {
    const val = await redis.get(`auth:blacklist:${jti}`);
    return val === '1';
  } catch {
    return false;
  }
}
