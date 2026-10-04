import { prisma } from '../../lib/prisma.js';
import { AuthError } from '../auth/auth.service.js';
import type { UserRole, RoleRequestStatus } from '@prisma/client';
import type {
  RequestCreatorInput,
  ReviewRoleRequestInput,
  ListRequestsQuery,
  AssignRoleInput,
} from './roles.schemas.js';

export class RolesService {
  /**
   * Student submits a request to become a Creator (US-01.04)
   */
  async submitCreatorRequest(userId: string, input: RequestCreatorInput, ipAddress?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, username: true },
    });

    if (!user) {
      throw new AuthError(404, 'User not found', 'USER_NOT_FOUND');
    }

    if (user.role !== 'student') {
      throw new AuthError(
        400,
        `You already hold the role "${user.role}". Only students can apply to become a Creator.`,
        'ALREADY_ROLE_HOLDER',
      );
    }

    // Check if there is already an active pending request
    const existingPending = await prisma.roleRequest.findFirst({
      where: {
        userId,
        status: 'pending',
      },
    });

    if (existingPending) {
      throw new AuthError(
        409,
        'You already have an active pending application. Please wait for administrator review.',
        'PENDING_REQUEST_EXISTS',
      );
    }

    const request = await prisma.roleRequest.create({
      data: {
        userId,
        requestedRole: 'creator',
        status: 'pending',
        motivation: input.motivation,
        specialty: input.specialty,
        portfolioUrl: input.portfolioUrl || null,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATOR_REQUEST_SUBMITTED',
        actorId: userId,
        targetId: userId,
        ipAddress: ipAddress || null,
        details: {
          requestId: request.id,
          specialty: input.specialty,
          requestedRole: 'creator',
        },
      },
    });

    return request;
  }

  /**
   * Get user's own application history
   */
  async getUserRequests(userId: string) {
    return prisma.roleRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  /**
   * Admin lists all requests with status filter & pagination (US-01.04)
   */
  async listAllRequests(query: ListRequestsQuery) {
    const where = query.status ? { status: query.status as RoleRequestStatus } : {};
    const skip = (query.page - 1) * query.limit;

    const [total, items] = await Promise.all([
      prisma.roleRequest.count({ where }),
      prisma.roleRequest.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
              role: true,
              rankTier: true,
              expPoints: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      }),
    ]);

    return {
      items,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  /**
   * Admin reviews (Approve/Reject) a Creator application (US-01.04 Scenario 1)
   */
  async reviewRequest(adminId: string, input: ReviewRoleRequestInput, ipAddress?: string) {
    const roleReq = await prisma.roleRequest.findUnique({
      where: { id: input.requestId },
      include: {
        user: true,
      },
    });

    if (!roleReq) {
      throw new AuthError(404, 'Role application not found', 'REQUEST_NOT_FOUND');
    }

    if (roleReq.status !== 'pending') {
      throw new AuthError(
        400,
        `Cannot review request because it is already ${roleReq.status}`,
        'REQUEST_ALREADY_RESOLVED',
      );
    }

    const isApprove = input.action === 'approve';
    const newStatus: RoleRequestStatus = isApprove ? 'approved' : 'rejected';

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update role request status
      const updatedReq = await tx.roleRequest.update({
        where: { id: input.requestId },
        data: {
          status: newStatus,
          reviewerId: adminId,
          reviewedAt: new Date(),
          rejectionReason: !isApprove
            ? input.rejectionReason || 'Application rejected by admin'
            : null,
        },
      });

      // 2. If approved, elevate user role to requestedRole (creator)
      let updatedUser = roleReq.user;
      if (isApprove) {
        updatedUser = await tx.user.update({
          where: { id: roleReq.userId },
          data: {
            role: roleReq.requestedRole,
          },
        });
      }

      // 3. Write structured audit log complying with US-01.04
      await tx.auditLog.create({
        data: {
          action: 'ADMIN_ROLE_CHANGE',
          actorId: adminId,
          targetId: roleReq.userId,
          ipAddress: ipAddress || null,
          details: {
            requestId: roleReq.id,
            action: input.action,
            targetUsername: roleReq.user.username,
            previousRole: roleReq.user.role,
            newRole: updatedUser.role,
            rejectionReason: !isApprove ? input.rejectionReason : null,
          },
        },
      });

      return { request: updatedReq, user: updatedUser };
    });

    return result;
  }

  /**
   * Admin direct role assignment
   */
  async assignRoleDirect(adminId: string, input: AssignRoleInput, ipAddress?: string) {
    const targetUser = await prisma.user.findUnique({
      where: { id: input.userId },
    });

    if (!targetUser) {
      throw new AuthError(404, 'Target user not found', 'USER_NOT_FOUND');
    }

    const previousRole = targetUser.role;
    const newRole = input.role as UserRole;

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: input.userId },
        data: { role: newRole },
      });

      await tx.auditLog.create({
        data: {
          action: 'ADMIN_ROLE_CHANGE',
          actorId: adminId,
          targetId: input.userId,
          ipAddress: ipAddress || null,
          details: {
            method: 'DIRECT_ASSIGN',
            targetUsername: targetUser.username,
            previousRole,
            newRole,
          },
        },
      });

      return updatedUser;
    });

    return result;
  }

  /**
   * Get audit log history (Admin only)
   */
  async listAuditLogs(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, items] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
      }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}

export const rolesService = new RolesService();
