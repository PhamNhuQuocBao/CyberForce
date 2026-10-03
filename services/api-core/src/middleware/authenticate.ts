import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken, isTokenBlacklisted, type TokenPayload } from '../lib/security.js';
import { AuthError } from '../modules/auth/auth.service.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: TokenPayload;
  }
}

export async function authenticate(request: FastifyRequest, _reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError(401, 'Authorization token required in Bearer format', 'UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);

    // Check if token was blacklisted on logout
    if (payload.jti && (await isTokenBlacklisted(payload.jti))) {
      throw new AuthError(401, 'Token has been revoked', 'TOKEN_REVOKED');
    }

    request.user = payload;
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      throw error;
    }
    const err = error as { name?: string };
    if (err.name === 'TokenExpiredError') {
      throw new AuthError(401, 'Token has expired', 'TOKEN_EXPIRED');
    }
    throw new AuthError(401, 'Invalid authentication token', 'INVALID_TOKEN');
  }
}
