import type { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import {
  listAllRequestsHandler,
  reviewRequestHandler,
  assignRoleHandler,
  listAuditLogsHandler,
} from '../roles/roles.controller.js';

export const adminRoutes: FastifyPluginAsync = async (fastify) => {
  // All admin routes strictly require authentication AND Admin role ('superadmin' or 'org_admin')
  // Complies with US-01.04 Acceptance Criteria Scenario 2: Chặn 403 Forbidden
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', requireRole(['superadmin', 'org_admin']));

  // Role Request Review Workflow
  fastify.get('/roles/requests', listAllRequestsHandler);
  fastify.post('/roles/review', reviewRequestHandler);

  // Direct Role Assignment
  fastify.post('/users/assign-role', assignRoleHandler);

  // Audit Logs
  fastify.get('/audit-logs', listAuditLogsHandler);
};
