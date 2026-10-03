import { UserRole } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyRefreshToken,
  hashToken,
  checkLoginRateLimit,
  recordFailedLogin,
  clearFailedLogins,
  blacklistToken,
} from '../../lib/security.js';
import type { RegisterInput, LoginInput, UserProfile } from './auth.schemas.js';

export class AuthError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = 'AUTH_ERROR',
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Reusable helper to project raw DB User model to public UserProfile DTO
 */
export function toUserProfile(user: {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  role: UserRole | string;
  expPoints: number;
  rankTier: string;
  streakDays: number;
  lastActiveAt?: Date;
  createdAt: Date;
}): UserProfile {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
    role: user.role,
    expPoints: user.expPoints,
    rankTier: user.rankTier,
    streakDays: user.streakDays,
    lastActiveAt: user.lastActiveAt,
    createdAt: user.createdAt,
  };
}

export class AuthService {
  /**
   * Register a new student user
   */
  async register(input: RegisterInput) {
    // 1. Check for existing email or username
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: input.email.toLowerCase() }, { username: input.username }],
      },
      select: { email: true, username: true },
    });

    if (existing) {
      if (existing.email.toLowerCase() === input.email.toLowerCase()) {
        throw new AuthError(
          409,
          'An account with this email already exists',
          'EMAIL_ALREADY_EXISTS',
        );
      }
      throw new AuthError(409, 'Username is already taken', 'USERNAME_ALREADY_EXISTS');
    }

    // 2. Hash password with Argon2id
    const passwordHash = await hashPassword(input.password);

    // 3. Create user in database
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        username: input.username,
        passwordHash,
        role: UserRole.student,
        expPoints: 0,
        rankTier: 'Novice',
        streakDays: 1,
      },
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        role: true,
        expPoints: true,
        rankTier: true,
        streakDays: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    // 4. Generate JWT tokens
    const tokens = generateTokens(user);
    const tokenHash = hashToken(tokens.refreshToken);

    // Store refresh token for revocation tracking (7 days expiration)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return { user: toUserProfile(user), tokens };
  }

  /**
   * Authenticate user with brute-force rate-limiting
   */
  async login(input: LoginInput, _clientIp: string) {
    const emailKey = input.email.toLowerCase();

    // 1. Check Redis rate limit (5 failed attempts within 15 mins)
    const rateLimit = await checkLoginRateLimit(emailKey);
    if (rateLimit.locked) {
      throw new AuthError(
        429,
        `Too many failed login attempts. Account temporarily locked for ${Math.ceil(
          rateLimit.remainingSeconds / 60,
        )} minutes.`,
        'ACCOUNT_LOCKED',
        { remainingSeconds: rateLimit.remainingSeconds },
      );
    }

    // 2. Find user
    const user = await prisma.user.findUnique({
      where: { email: emailKey },
    });

    if (!user || !user.passwordHash) {
      await recordFailedLogin(emailKey);
      throw new AuthError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // 3. Verify Argon2 password hash
    const isValid = await verifyPassword(user.passwordHash, input.password);
    if (!isValid) {
      const attempts = await recordFailedLogin(emailKey);
      const remainingAttempts = Math.max(0, 5 - attempts);
      throw new AuthError(401, 'Invalid email or password', 'INVALID_CREDENTIALS', {
        remainingAttempts,
      });
    }

    // 4. Reset failed attempts on success
    await clearFailedLogins(emailKey);

    // 5. Update last active timestamp
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    // 6. Generate tokens & store refresh token
    const tokens = generateTokens(updatedUser);
    const tokenHash = hashToken(tokens.refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: updatedUser.id,
        tokenHash,
        expiresAt,
      },
    });

    return { user: toUserProfile(updatedUser), tokens };
  }

  /**
   * Refresh session with token rotation
   */
  async refresh(refreshToken: string) {
    try {
      verifyRefreshToken(refreshToken);
    } catch {
      throw new AuthError(401, 'Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }

    const tokenHash = hashToken(refreshToken);

    // Find token record
    const record = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.revoked || record.expiresAt < new Date()) {
      // Possible token theft / reuse detection: revoke all tokens for this user
      if (record && record.revoked) {
        await prisma.refreshToken.updateMany({
          where: { userId: record.userId },
          data: { revoked: true },
        });
      }
      throw new AuthError(401, 'Refresh token has been revoked or expired', 'TOKEN_REVOKED');
    }

    // Revoke used token (Token Rotation)
    await prisma.refreshToken.update({
      where: { id: record.id },
      data: { revoked: true },
    });

    // Generate new pair
    const tokens = generateTokens(record.user);
    const newHash = hashToken(tokens.refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: record.userId,
        tokenHash: newHash,
        expiresAt,
      },
    });

    return { user: toUserProfile(record.user), tokens };
  }

  /**
   * Logout user by revoking tokens
   */
  async logout(userId: string, refreshToken?: string, accessJti?: string) {
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { revoked: true },
      });
    }

    // Blacklist access token if provided (15 mins TTL)
    if (accessJti) {
      await blacklistToken(accessJti, 900);
    }

    return { success: true };
  }

  /**
   * Fetch current authenticated user profile
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        role: true,
        expPoints: true,
        rankTier: true,
        streakDays: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AuthError(404, 'User not found', 'USER_NOT_FOUND');
    }

    return toUserProfile(user);
  }
}

export const authService = new AuthService();
