import Fastify, { type FastifyError } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import { ZodError } from 'zod';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { redis } from './lib/redis.js';
import { AuthError } from './modules/auth/auth.service.js';
import { authRoutes } from './modules/auth/auth.routes.js';

export function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'info' : 'warn',
    },
  });

  // ---------------------------------------------------------------------------
  // 1. SECURITY PLUGINS (Helmet, CORS, Cookie, Rate Limit)
  // ---------------------------------------------------------------------------
  app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production',
  });

  app.register(cors, {
    origin: [env.WEB_ORIGIN, 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  app.register(cookie);

  app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // ---------------------------------------------------------------------------
  // 2. HEALTHCHECK (Liveness & Readiness probe)
  // ---------------------------------------------------------------------------
  app.get('/health', async (_req, reply) => {
    let dbStatus = 'down';
    let redisStatus = 'down';

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'healthy';
    } catch (e: any) {
      dbStatus = `unhealthy: ${e.message}`;
    }

    try {
      const ping = await redis.ping();
      redisStatus = ping === 'PONG' ? 'healthy' : 'unhealthy';
    } catch (e: any) {
      redisStatus = `unhealthy: ${e.message}`;
    }

    const isHealthy = dbStatus === 'healthy' && redisStatus === 'healthy';

    return reply.status(isHealthy ? 200 : 503).send({
      status: isHealthy ? 'healthy' : 'degraded',
      service: '@cyberforce/api-core',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      dependencies: {
        database: dbStatus,
        redis: redisStatus,
      },
    });
  });

  // ---------------------------------------------------------------------------
  // 3. API ROUTES
  // ---------------------------------------------------------------------------
  app.register(authRoutes, { prefix: '/api/v1/auth' });

  // ---------------------------------------------------------------------------
  // 4. CENTRALIZED ERROR HANDLER
  // ---------------------------------------------------------------------------
  app.setErrorHandler((error: FastifyError | Error, _request, reply) => {
    // A. Zod Schema Validation Error
    if (error instanceof ZodError) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input parameters',
          details: error.flatten().fieldErrors,
        },
      });
    }

    // B. Custom Domain / Auth Error
    if (error instanceof AuthError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      });
    }

    // C. Fastify Rate Limit Error (Status 429)
    if ('statusCode' in error && error.statusCode === 429) {
      return reply.status(429).send({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please slow down.',
        },
      });
    }

    // D. Unhandled Server Error
    app.log.error(error);
    return reply.status(500).send({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal server error occurred.',
      },
    });
  });

  return app;
}
