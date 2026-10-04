import type { FastifyRequest, FastifyReply } from 'fastify';
import { rolesService } from './roles.service.js';
import {
  requestCreatorSchema,
  reviewRoleRequestSchema,
  listRequestsQuerySchema,
  assignRoleSchema,
} from './roles.schemas.js';
import { AuthError } from '../auth/auth.service.js';

export async function submitCreatorRequestHandler(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user?.sub;
  if (!userId) {
    throw new AuthError(401, 'Unauthorized', 'UNAUTHORIZED');
  }

  const input = requestCreatorSchema.parse(request.body);
  const ipAddress = request.ip;

  const result = await rolesService.submitCreatorRequest(userId, input, ipAddress);

  return reply.status(201).send({
    success: true,
    message: 'Creator application submitted successfully. Administrator review is pending.',
    data: result,
  });
}

export async function getMyRequestsHandler(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user?.sub;
  if (!userId) {
    throw new AuthError(401, 'Unauthorized', 'UNAUTHORIZED');
  }

  const results = await rolesService.getUserRequests(userId);

  return reply.status(200).send({
    success: true,
    data: results,
  });
}

export async function listAllRequestsHandler(request: FastifyRequest, reply: FastifyReply) {
  const query = listRequestsQuerySchema.parse(request.query);
  const result = await rolesService.listAllRequests(query);

  return reply.status(200).send({
    success: true,
    data: result.items,
    pagination: result.pagination,
  });
}

export async function reviewRequestHandler(request: FastifyRequest, reply: FastifyReply) {
  const adminId = request.user?.sub;
  if (!adminId) {
    throw new AuthError(401, 'Unauthorized', 'UNAUTHORIZED');
  }

  const input = reviewRoleRequestSchema.parse(request.body);
  const ipAddress = request.ip;

  const result = await rolesService.reviewRequest(adminId, input, ipAddress);

  return reply.status(200).send({
    success: true,
    message:
      input.action === 'approve'
        ? `Application approved! User ${result.user.username} is now elevated to ${result.user.role}.`
        : `Application rejected for user ${result.user.username}.`,
    data: result,
  });
}

export async function assignRoleHandler(request: FastifyRequest, reply: FastifyReply) {
  const adminId = request.user?.sub;
  if (!adminId) {
    throw new AuthError(401, 'Unauthorized', 'UNAUTHORIZED');
  }

  const input = assignRoleSchema.parse(request.body);
  const ipAddress = request.ip;

  const result = await rolesService.assignRoleDirect(adminId, input, ipAddress);

  return reply.status(200).send({
    success: true,
    message: `Role assigned successfully. User ${result.username} is now "${result.role}".`,
    data: result,
  });
}

export async function listAuditLogsHandler(request: FastifyRequest, reply: FastifyReply) {
  const query = request.query as { page?: string; limit?: string };
  const page = query.page ? parseInt(query.page, 10) : 1;
  const limit = query.limit ? parseInt(query.limit, 10) : 20;

  const result = await rolesService.listAuditLogs(page, limit);

  return reply.status(200).send({
    success: true,
    data: result.items,
    pagination: result.pagination,
  });
}
