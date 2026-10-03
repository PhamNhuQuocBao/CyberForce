import type { FastifyRequest, FastifyReply } from 'fastify';
import { authService, AuthError } from './auth.service.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  oauthParamsSchema,
  oauthUrlQuerySchema,
  oauthCallbackQuerySchema,
  oauthCallbackBodySchema,
} from './auth.schemas.js';
import {
  generateOAuthState,
  generatePKCE,
  storeOAuthState,
  consumeOAuthState,
} from '../../lib/security.js';
import { defaultOAuthClient, type IOAuthProviderClient } from './oauth.provider.js';
import { env } from '../../config/env.js';

let currentOAuthClient: IOAuthProviderClient = defaultOAuthClient;

export function setOAuthClient(client: IOAuthProviderClient) {
  currentOAuthClient = client;
}

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

/**
 * Generate authorization URL with secure state and PKCE (RFC 7636)
 */
export async function getOAuthUrlHandler(request: FastifyRequest, reply: FastifyReply) {
  const { provider } = oauthParamsSchema.parse(request.params);
  const query = oauthUrlQuerySchema.parse(request.query);

  const state = generateOAuthState();
  const pkce = provider === 'google' ? generatePKCE() : undefined;

  await storeOAuthState(state, {
    provider,
    codeVerifier: pkce?.codeVerifier,
    redirectUri: query.redirect_uri,
    target: query.target,
  });

  const url = currentOAuthClient.getAuthorizationUrl({
    provider,
    state,
    codeChallenge: pkce?.codeChallenge,
    redirectUri: query.redirect_uri,
  });

  return reply.status(200).send({
    success: true,
    data: {
      url,
      state,
      provider,
    },
  });
}

/**
 * Handle OAuth callback from browser redirect (GET) or SPA client (POST)
 */
export async function oauthCallbackHandler(request: FastifyRequest, reply: FastifyReply) {
  const { provider } = oauthParamsSchema.parse(request.params);

  let code: string;
  let state: string;
  let clientVerifier: string | undefined;
  let redirectUri: string | undefined;

  if (request.method === 'POST') {
    const body = oauthCallbackBodySchema.parse(request.body);
    code = body.code;
    state = body.state;
    clientVerifier = body.codeVerifier;
    redirectUri = body.redirectUri;
  } else {
    const query = oauthCallbackQuerySchema.parse(request.query);
    code = query.code;
    state = query.state;
  }

  // 1. Consume state from Redis (one-time use, prevents CSRF & replay)
  const storedState = await consumeOAuthState(state);
  if (!storedState || storedState.provider !== provider) {
    throw new AuthError(
      400,
      'Invalid, expired, or already used OAuth state',
      'INVALID_OAUTH_STATE',
    );
  }

  const effectiveVerifier = storedState.codeVerifier || clientVerifier;
  const effectiveRedirectUri = storedState.redirectUri || redirectUri;

  // 2. Exchange authorization code with provider for verified profile
  const profile = await currentOAuthClient.exchangeCodeForProfile({
    provider,
    code,
    codeVerifier: effectiveVerifier,
    redirectUri: effectiveRedirectUri,
  });

  // 3. Authenticate existing user or register new student
  const result = await authService.handleOAuthLoginOrRegister(profile);

  // 4. Set secure HTTP-only refresh cookie
  setAuthCookie(reply, result.tokens.refreshToken);

  // If browser GET redirect, redirect to frontend web callback
  if (request.method === 'GET') {
    const targetUrl = new URL('/auth/callback', env.WEB_ORIGIN);
    targetUrl.searchParams.set('token', result.tokens.accessToken);
    targetUrl.searchParams.set('new_user', String(result.isNewUser));
    return reply.redirect(targetUrl.toString());
  }

  // If JSON POST request, return structured payload
  return reply.status(200).send({
    success: true,
    message: result.isNewUser
      ? 'User registered successfully via OAuth'
      : 'OAuth authentication successful',
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
      isNewUser: result.isNewUser,
    },
  });
}
