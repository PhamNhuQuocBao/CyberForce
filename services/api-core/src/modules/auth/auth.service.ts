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
  generateOtp,
  storePendingLinkSession,
  consumePendingLinkSession,
  storeOtpForLink,
  verifyAndConsumeOtp,
  type PendingLinkSession,
} from '../../lib/security.js';

import type { RegisterInput, LoginInput, UserProfile } from './auth.schemas.js';
import type { NormalizedOAuthProfile } from './oauth.provider.js';

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

  /**
   * Helper to issue JWT access & refresh tokens and persist refresh token hash
   */
  async issueSessionTokens(user: { id: string; email: string; role: UserRole | string }) {
    const tokens = generateTokens(user);
    const tokenHash = hashToken(tokens.refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return tokens;
  }

  /**
   * 1-Click OAuth2 Login or Registration (GitHub / Google)
   * Complies with US-01.01:
   * - Automatic student role, Novice rank tier, 0 EXP, Streak: 1 day.
   * - Prevents account takeover by rejecting auto-merge on email collision with different provider.
   */
  async handleOAuthLoginOrRegister(profile: NormalizedOAuthProfile) {
    const emailKey = profile.email.toLowerCase();

    // 1. Check if OAuth identity is already linked
    const existingOAuth = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
        },
      },
      include: {
        user: true,
      },
    });

    if (existingOAuth) {
      // Existing user logging in with linked OAuth provider
      const updatedUser = await prisma.user.update({
        where: { id: existingOAuth.userId },
        data: {
          lastActiveAt: new Date(),
          ...(profile.avatarUrl && !existingOAuth.user.avatarUrl
            ? { avatarUrl: profile.avatarUrl }
            : {}),
        },
      });

      const tokens = await this.issueSessionTokens(updatedUser);
      return {
        user: toUserProfile(updatedUser),
        tokens,
        isNewUser: false,
      };
    }

    // 2. Check if a user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: emailKey },
      include: { oauthAccounts: true },
    });

    if (existingUser) {
      // Email exists — issue a pending link token so the client can initiate Sub-flow 1.2
      const { randomUUID } = await import('node:crypto');
      const pendingLinkToken = randomUUID();

      const session: PendingLinkSession = {
        existingUserId: existingUser.id,
        incomingProvider: profile.provider,
        incomingProviderAccountId: profile.providerAccountId,
      };
      await storePendingLinkSession(pendingLinkToken, session);

      throw new AuthError(
        409,
        `An account with email "${profile.email}" already exists with a different login method. Please authenticate with your existing account to link your ${profile.provider} identity.`,
        'ACCOUNT_EXISTS_DIFFERENT_PROVIDER',
        {
          email: profile.email,
          attemptedProvider: profile.provider,
          pendingLinkToken,
        },
      );
    }

    // 3. Register brand new user via 1-Click OAuth2
    let chosenUsername = profile.username.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
    if (!chosenUsername || chosenUsername.length < 3) {
      chosenUsername = `${profile.provider}_user_${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const usernameConflict = await prisma.user.findUnique({
      where: { username: chosenUsername },
      select: { id: true },
    });

    if (usernameConflict) {
      chosenUsername = `${chosenUsername.slice(0, 35)}_${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: emailKey,
          username: chosenUsername,
          passwordHash: null,
          avatarUrl: profile.avatarUrl,
          role: UserRole.student,
          expPoints: 0,
          rankTier: 'Novice',
          streakDays: 1, // Story US-01.01: Streak: 1 ngày
        },
      });

      await tx.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
        },
      });

      return user;
    });

    const tokens = await this.issueSessionTokens(newUser);
    return {
      user: toUserProfile(newUser),
      tokens,
      isNewUser: true,
    };
  }

  /**
   * Sub-flow 1.2.3 — Send a 6-digit OTP to the existing user's email
   * In this implementation the OTP is returned in the response (dev mode).
   * Production systems should send via email service (SendGrid, SES…).
   */
  async initiateAccountLinking(
    pendingLinkToken: string,
  ): Promise<{ otpSent: boolean; email: string }> {
    // Peek at the session without consuming it yet
    const key = `account_link:pending:${pendingLinkToken}`;
    const raw = await import('../../lib/redis.js').then(({ redis }) => redis.get(key));
    if (!raw) {
      throw new AuthError(400, 'Pending link session not found or expired', 'INVALID_LINK_TOKEN');
    }
    const session: PendingLinkSession = JSON.parse(raw);

    const user = await prisma.user.findUnique({
      where: { id: session.existingUserId },
      select: { email: true },
    });
    if (!user) {
      throw new AuthError(404, 'User not found', 'USER_NOT_FOUND');
    }

    const otp = generateOtp();
    await storeOtpForLink(pendingLinkToken, otp);

    // TODO: integrate email service (SendGrid/SES) in production
    // For now, log OTP to console in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[Account Link OTP] ${user.email}: ${otp}`);
    }

    return { otpSent: true, email: user.email };
  }

  /**
   * Sub-flow 1.2.2 — Verify by existing account password then link OAuth identity
   */
  async verifyLinkByPassword(
    pendingLinkToken: string,
    password: string,
  ): Promise<{ user: UserProfile; tokens: ReturnType<typeof generateTokens> }> {
    const session = await consumePendingLinkSession(pendingLinkToken);
    if (!session) {
      throw new AuthError(400, 'Pending link session not found or expired', 'INVALID_LINK_TOKEN');
    }

    const user = await prisma.user.findUnique({
      where: { id: session.existingUserId },
    });
    if (!user || !user.passwordHash) {
      throw new AuthError(
        401,
        'Cannot verify via password for this account',
        'INVALID_CREDENTIALS',
      );
    }

    const isValid = await verifyPassword(user.passwordHash, password);
    if (!isValid) {
      // Re-store the session so the user can retry
      await storePendingLinkSession(pendingLinkToken, session);
      throw new AuthError(401, 'Incorrect password', 'INVALID_CREDENTIALS');
    }

    return this._performLink(user, session);
  }

  /**
   * Sub-flow 1.2.4-1.2.5 — Verify by OTP then link OAuth identity
   */
  async verifyLinkByOtp(
    pendingLinkToken: string,
    otp: string,
  ): Promise<{ user: UserProfile; tokens: ReturnType<typeof generateTokens> }> {
    const isOtpValid = await verifyAndConsumeOtp(pendingLinkToken, otp);
    if (!isOtpValid) {
      throw new AuthError(401, 'Invalid or expired OTP', 'INVALID_OTP');
    }

    const session = await consumePendingLinkSession(pendingLinkToken);
    if (!session) {
      throw new AuthError(400, 'Pending link session not found or expired', 'INVALID_LINK_TOKEN');
    }

    const user = await prisma.user.findUnique({ where: { id: session.existingUserId } });
    if (!user) {
      throw new AuthError(404, 'User not found', 'USER_NOT_FOUND');
    }

    return this._performLink(user, session);
  }

  /**
   * Internal: create OAuthAccount record and issue session tokens after successful verification
   */
  private async _performLink(
    user: {
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
    },
    session: PendingLinkSession,
  ) {
    await prisma.$transaction(async (tx) => {
      // Guard: check the OAuth identity isn't already linked to another user
      const existing = await tx.oAuthAccount.findUnique({
        where: {
          provider_providerAccountId: {
            provider: session.incomingProvider,
            providerAccountId: session.incomingProviderAccountId,
          },
        },
      });
      if (existing && existing.userId !== user.id) {
        throw new AuthError(
          409,
          'This OAuth identity is already linked to a different account',
          'OAUTH_ALREADY_LINKED',
        );
      }
      if (!existing) {
        await tx.oAuthAccount.create({
          data: {
            userId: user.id,
            provider: session.incomingProvider,
            providerAccountId: session.incomingProviderAccountId,
          },
        });
      }
    });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    const tokens = await this.issueSessionTokens(updatedUser);
    return { user: toUserProfile(updatedUser), tokens };
  }
}

export const authService = new AuthService();
