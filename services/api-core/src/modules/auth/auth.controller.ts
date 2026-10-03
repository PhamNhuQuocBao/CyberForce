import type { FastifyRequest, FastifyReply } from 'fastify';
import { authService, AuthError } from './auth.service.js';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.schemas.js';

const REFRESH_COOKIE_NAME = 'cyberforce_refresh';
const COOKIE_PATH = '/api/v1/auth';
const COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Reusable helper to set HTTP-only refresh token cookie with security flags
 */
function setAuthCookie(reply: FastifyReply, refreshToken: string): void {
  reply.setCookie(REFRESH_COOKIE_NAME, refreshToken, {
    path: COOKIE_PATH,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

/**
 * Reusable helper to clear HTTP-only refresh token cookie
 */
function clearAuthCookie(reply: FastifyReply): void {
  reply.clearCookie(REFRESH_COOKIE_NAME, {
    path: COOKIE_PATH,
  });
}

export async function registerHandler(request: FastifyRequest, reply: FastifyReply) {
  const input = registerSchema.parse(request.body);
  const result = await authService.register(input);

  setAuthCookie(reply, result.tokens.refreshToken);

  return reply.status(201).send({
    success: true,
    message: 'User registered successfully',
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
    },
  });
}

export async function loginHandler(request: FastifyRequest, reply: FastifyReply) {
  const input = loginSchema.parse(request.body);
  const clientIp = request.ip || '127.0.0.1';

  const result = await authService.login(input, clientIp);

  setAuthCookie(reply, result.tokens.refreshToken);

  return reply.status(200).send({
    success: true,
    message: 'Authentication successful',
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
    },
  });
}

export async function refreshHandler(request: FastifyRequest, reply: FastifyReply) {
  // Read token from cookie or request body
  const cookieToken = request.cookies[REFRESH_COOKIE_NAME];
  const body = refreshTokenSchema.safeParse(request.body);
  const bodyToken = body.success ? body.data.refreshToken : undefined;

  const token = cookieToken || bodyToken;

  if (!token) {
    throw new AuthError(401, 'No refresh token provided', 'NO_REFRESH_TOKEN');
  }

  const result = await authService.refresh(token);

  setAuthCookie(reply, result.tokens.refreshToken);

  return reply.status(200).send({
    success: true,
    message: 'Session refreshed successfully',
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
    },
  });
}

export async function logoutHandler(request: FastifyRequest, reply: FastifyReply) {
  const cookieToken = request.cookies[REFRESH_COOKIE_NAME];
  const userId = request.user?.sub;
  const accessJti = request.user?.jti;

  if (userId) {
    await authService.logout(userId, cookieToken, accessJti);
  }

  clearAuthCookie(reply);

  return reply.status(200).send({
    success: true,
    message: 'Logged out successfully',
  });
}

export async function meHandler(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user?.sub;

  if (!userId) {
    throw new AuthError(401, 'Unauthorized', 'UNAUTHORIZED');
  }

  const profile = await authService.getProfile(userId);

  return reply.status(200).send({
    success: true,
    data: profile,
  });
}
