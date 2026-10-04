import type { FastifyRequest, FastifyReply } from 'fastify';
import type { UserRole } from '@prisma/client';
import { AuthError } from '../modules/auth/auth.service.js';

/**
 * Granular Role-Based Access Control (RBAC) Guard Middleware
 * Complies with US-01.04:
 * Rejects unauthorized users with HTTP 403 Forbidden and message "Access denied. Required role: <Role>"
 */
export function requireRole(allowedRoles: UserRole[]) {
  return async function (request: FastifyRequest, _reply: FastifyReply) {
    if (!request.user) {
      throw new AuthError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    const userRole = request.user.role as UserRole;

    if (!allowedRoles.includes(userRole)) {
      const displayRole =
        allowedRoles.includes('org_admin') || allowedRoles.includes('superadmin')
          ? 'Admin'
          : allowedRoles.join(', ');

      throw new AuthError(403, `Access denied. Required role: ${displayRole}`, 'FORBIDDEN');
    }
  };
}
