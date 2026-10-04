import { z } from 'zod';
import type { UserRole } from '@prisma/client';

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(255, 'Email is too long'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain alphanumeric characters, underscores, and dashes',
    ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
});

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export const oauthParamsSchema = z.object({
  provider: z.enum(['github', 'google']),
});

export const oauthUrlQuerySchema = z.object({
  redirect_uri: z.string().url().optional(),
  target: z.string().optional(),
});

export const oauthCallbackQuerySchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State is required'),
});

export const oauthCallbackBodySchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State is required'),
  codeVerifier: z.string().optional(),
  redirectUri: z.string().url().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type OAuthParamsInput = z.infer<typeof oauthParamsSchema>;
export type OAuthUrlQueryInput = z.infer<typeof oauthUrlQuerySchema>;
export type OAuthCallbackQueryInput = z.infer<typeof oauthCallbackQuerySchema>;
export type OAuthCallbackBodyInput = z.infer<typeof oauthCallbackBodySchema>;

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  role: UserRole | string;
  expPoints: number;
  rankTier: string;
  streakDays: number;
  bio?: string | null;
  specialty?: string | null;
  isPublic?: boolean;
  lastActiveAt?: Date;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessJti?: string;
  refreshJti?: string;
}

export interface AuthResponseData {
  user: UserProfile;
  accessToken: string;
}

// -----------------------------------------------------------------------------
// Account Linking Schemas (Sub-flow 1.2 — CF-102)
// -----------------------------------------------------------------------------

export const linkInitiateSchema = z.object({
  pendingLinkToken: z.string().uuid('Invalid pending link token'),
});

export const linkVerifyPasswordSchema = z.object({
  pendingLinkToken: z.string().uuid('Invalid pending link token'),
  password: z.string().min(1, 'Password is required'),
});

export const linkVerifyOtpSchema = z.object({
  pendingLinkToken: z.string().uuid('Invalid pending link token'),
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

export const linkAccountSchema = z
  .object({
    pendingLinkToken: z.string().uuid('Invalid pending link token'),
    method: z.enum(['password', 'otp']).optional(),
    password: z.string().optional(),
    otp: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.method === 'password' || (!data.method && data.password !== undefined)) {
        return !!data.password && data.password.length > 0;
      }
      if (data.method === 'otp' || (!data.method && data.otp !== undefined)) {
        return !!data.otp && /^\d{6}$/.test(data.otp);
      }
      return false;
    },
    {
      message: 'Either valid password or 6-digit OTP is required for account linking',
    },
  );

export type LinkInitiateInput = z.infer<typeof linkInitiateSchema>;
export type LinkVerifyPasswordInput = z.infer<typeof linkVerifyPasswordSchema>;
export type LinkVerifyOtpInput = z.infer<typeof linkVerifyOtpSchema>;
export type LinkAccountInput = z.infer<typeof linkAccountSchema>;
