import { z } from 'zod';

export const usernameParamSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters'),
});

export const updateProfileSchema = z.object({
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').nullable().optional(),
  specialty: z.string().max(100, 'Specialty cannot exceed 100 characters').optional(),
  isPublic: z.boolean().optional(),
  avatarUrl: z.string().url('Invalid avatar URL').nullable().optional(),
});

export type UsernameParamInput = z.infer<typeof usernameParamSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export interface SkillTelemetry {
  webExploitation: number;
  cloudSecurity: number;
  networkPentest: number;
  devSecOps: number;
  cryptography: number;
  reverseEngineering: number;
  osint: number;
  binaryExploitation: number;
}

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface CertificateItem {
  code: string;
  title: string;
  scorePercentage: number;
  issuedAt: string;
  verificationHash: string;
}

export interface LearningPathProgress {
  title: string;
  completionPercentage: number;
  completedRooms: number;
  totalRooms: number;
}

export interface UserDossierResponse {
  isPublic: boolean;
  isSelf: boolean;
  username: string;
  // If private and not self, other fields are withheld per Wireframe 2.2
  avatarUrl?: string | null;
  rankTier?: string;
  expPoints?: number;
  streakDays?: number;
  bio?: string | null;
  specialty?: string | null;
  memberSince?: string;
  labsCleared?: number;
  telemetry?: SkillTelemetry;
  badges?: BadgeItem[];
  certificates?: CertificateItem[];
  completedPaths?: LearningPathProgress[];
  email?: string; // Only returned if isSelf === true
}
