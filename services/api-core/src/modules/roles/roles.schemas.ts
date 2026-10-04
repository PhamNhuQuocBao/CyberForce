import { z } from 'zod';

export const requestCreatorSchema = z.object({
  motivation: z
    .string()
    .min(10, 'Motivation must be at least 10 characters')
    .max(2000, 'Motivation must be at most 2000 characters'),
  specialty: z
    .string()
    .min(3, 'Specialty must be at least 3 characters')
    .max(100, 'Specialty must be at most 100 characters'),
  portfolioUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
});

export const reviewRoleRequestSchema = z.object({
  requestId: z.string().uuid('Invalid requestId format'),
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().min(5, 'Rejection reason must be at least 5 characters').optional(),
});

export const listRequestsQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const assignRoleSchema = z.object({
  userId: z.string().uuid('Invalid userId format'),
  role: z.enum(['student', 'creator', 'instructor', 'org_admin', 'superadmin']),
});

export type RequestCreatorInput = z.infer<typeof requestCreatorSchema>;
export type ReviewRoleRequestInput = z.infer<typeof reviewRoleRequestSchema>;
export type ListRequestsQuery = z.infer<typeof listRequestsQuerySchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
