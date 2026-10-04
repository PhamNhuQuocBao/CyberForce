import type { FastifyPluginAsync } from 'fastify';
import { listPathsHandler, getPathBySlugHandler, enrollPathHandler } from './paths.controller.js';
import { optionalAuthenticate, authenticate } from '../../middleware/authenticate.js';

export const pathsRoutes: FastifyPluginAsync = async (app) => {
  // Public listing with optional user telemetry
  app.get('/', { preHandler: [optionalAuthenticate] }, listPathsHandler);

  // Path detail by slug with modular breakdown & prerequisite tree
  app.get('/:slug', { preHandler: [optionalAuthenticate] }, getPathBySlugHandler);

  // Enroll in path (requires authentication)
  app.post('/:slug/enroll', { preHandler: [authenticate] }, enrollPathHandler);
};
