import { z } from 'zod';

export const listPathsQuerySchema = z.object({
  category: z.string().optional(),
  difficulty: z.string().optional(),
  search: z.string().optional(),
});

export const pathSlugParamSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
});

export type ListPathsQuery = z.infer<typeof listPathsQuerySchema>;
export type PathSlugParam = z.infer<typeof pathSlugParamSchema>;
