import type { FastifyRequest, FastifyReply } from 'fastify';
import { pathsService } from './paths.service.js';
import { listPathsQuerySchema, pathSlugParamSchema } from './paths.schemas.js';

export async function listPathsHandler(request: FastifyRequest, reply: FastifyReply) {
  const query = listPathsQuerySchema.parse(request.query);
  const userId = request.user?.sub;

  const data = await pathsService.listPaths(userId, query);

  return reply.status(200).send({
    success: true,
    data,
  });
}

export async function getPathBySlugHandler(request: FastifyRequest, reply: FastifyReply) {
  const { slug } = pathSlugParamSchema.parse(request.params);
  const userId = request.user?.sub;

  const data = await pathsService.getPathBySlug(slug, userId);

  return reply.status(200).send({
    success: true,
    data,
  });
}

export async function enrollPathHandler(request: FastifyRequest, reply: FastifyReply) {
  const { slug } = pathSlugParamSchema.parse(request.params);
  const userId = request.user?.sub;

  const data = await pathsService.getPathBySlug(slug, userId);

  return reply.status(200).send({
    success: true,
    message: `Enrolled in learning track: ${data.title}`,
    data: {
      pathId: data.id,
      title: data.title,
      slug: data.slug,
      nextUpRoom: data.nextUpRoom,
    },
  });
}
