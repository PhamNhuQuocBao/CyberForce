import { prisma } from '../../lib/prisma.js';
import { AuthError } from '../auth/auth.service.js';
import type {
  UpdateProfileInput,
  UserDossierResponse,
  SkillTelemetry,
  BadgeItem,
  CertificateItem,
  LearningPathProgress,
} from './users.schemas.js';

export class UsersService {
  /**
   * Get public or private dossier of an operator by callsign (username)
   * Implements Wireframe 2.1 & 2.2 (Two-perspective privacy shield)
   */
  async getProfileByUsername(
    username: string,
    requesterUserId?: string,
  ): Promise<UserDossierResponse> {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        certificates: {
          include: { learningPath: true },
          orderBy: { issuedAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new AuthError(
        404,
        `Operator with callsign "${username}" was not found`,
        'USER_NOT_FOUND',
      );
    }

    const isSelf = Boolean(requesterUserId && requesterUserId === user.id);

    // Wireframe 2.2 Perspective A: Restricted shield if user set profile to private and requester is not self
    if (!user.isPublic && !isSelf) {
      return {
        isPublic: false,
        isSelf: false,
        username: user.username,
      };
    }

    // Full Public or Self view (Wireframe 2.1)
    const telemetry = this.computeSkillTelemetry(user.expPoints);
    const badges = this.computeBadges(user.expPoints, user.streakDays);
    const certificates = this.formatCertificates(user.certificates, user.expPoints);
    const completedPaths = this.formatLearningPaths(user.expPoints);

    return {
      isPublic: user.isPublic,
      isSelf,
      username: user.username,
      avatarUrl: user.avatarUrl,
      rankTier: user.rankTier,
      expPoints: user.expPoints,
      streakDays: user.streakDays,
      bio:
        user.bio ||
        'CyberForce Operator in training. Specializing in offensive security and cloud defence.',
      specialty: user.specialty || 'Web Penetration & Cloud Sec',
      memberSince: user.createdAt.toISOString(),
      labsCleared: Math.max(1, Math.floor(user.expPoints / 150)),
      telemetry,
      badges,
      certificates,
      completedPaths,
      ...(isSelf && { email: user.email }),
    };
  }

  /**
   * Update authenticated operator's bio, specialty, avatar, or public privacy toggle
   */
  async updateMyProfile(userId: string, input: UpdateProfileInput) {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      throw new AuthError(404, 'Operator not found', 'USER_NOT_FOUND');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.bio !== undefined && { bio: input.bio }),
        ...(input.specialty !== undefined && { specialty: input.specialty }),
        ...(input.isPublic !== undefined && { isPublic: input.isPublic }),
        ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
      },
    });

    return {
      id: updated.id,
      email: updated.email,
      username: updated.username,
      avatarUrl: updated.avatarUrl,
      role: updated.role,
      expPoints: updated.expPoints,
      rankTier: updated.rankTier,
      streakDays: updated.streakDays,
      bio: updated.bio,
      specialty: updated.specialty,
      isPublic: updated.isPublic,
      lastActiveAt: updated.lastActiveAt,
      createdAt: updated.createdAt,
    };
  }

  /**
   * Helper: Calculate 8-axis cyber radar metrics
   */
  private computeSkillTelemetry(exp: number): SkillTelemetry {
    const factor = Math.floor(exp / 100);
    return {
      webExploitation: Math.min(95, Math.max(30, 45 + factor * 5)),
      cloudSecurity: Math.min(92, Math.max(25, 35 + factor * 4)),
      networkPentest: Math.min(88, Math.max(20, 40 + factor * 4)),
      devSecOps: Math.min(82, Math.max(15, 30 + factor * 3)),
      cryptography: Math.min(85, Math.max(10, 25 + factor * 3)),
      reverseEngineering: Math.min(78, Math.max(10, 20 + factor * 2)),
      osint: Math.min(80, Math.max(15, 35 + factor * 3)),
      binaryExploitation: Math.min(75, Math.max(5, 15 + factor * 2)),
    };
  }

  /**
   * Helper: Calculate unlocked badges based on user progression
   */
  private computeBadges(exp: number, streak: number): BadgeItem[] {
    return [
      {
        id: 'first_blood',
        name: 'First Blood',
        description: 'Captured the first flag on a live competition room',
        icon: '🗡️',
        isUnlocked: exp >= 50,
      },
      {
        id: 'streak_7',
        name: '7-Day Streak',
        description: 'Maintained active hacking streak for 7 consecutive days',
        icon: '🔥',
        isUnlocked: streak >= 7,
      },
      {
        id: 'koth_king',
        name: 'KotH King',
        description: 'Held the King of the Hill hill for over 10 consecutive ticks',
        icon: '👑',
        isUnlocked: exp >= 300,
      },
      {
        id: 'root_shell',
        name: 'Root Shell',
        description: 'Escalated privileges to NT AUTHORITY\\SYSTEM or UID 0',
        icon: '💻',
        isUnlocked: exp >= 150,
      },
      {
        id: 'cloud_guardian',
        name: 'Cloud Guardian',
        description: 'Hardened Kubernetes cluster against privilege escalation',
        icon: '☁️',
        isUnlocked: exp >= 600,
      },
      {
        id: 'zero_day_hunter',
        name: 'Zero-Day Hunter',
        description: 'Identified an undocumented binary memory corruption vulnerability',
        icon: '🎯',
        isUnlocked: exp >= 1200,
      },
    ];
  }

  /**
   * Helper: Format certificates
   */
  private formatCertificates(
    dbCerts: Array<{
      certificateCode: string;
      scorePercentage: { toNumber?: () => number } | number | unknown;
      verificationHash: string;
      issuedAt: Date;
      learningPath?: { title: string } | null;
    }>,
    exp: number,
  ): CertificateItem[] {
    if (dbCerts.length > 0) {
      return dbCerts.map((c) => ({
        code: c.certificateCode,
        title: c.learningPath?.title || 'Offensive Cyber Defense Certified (CF-OCD)',
        scorePercentage: Number(c.scorePercentage) || 90,
        issuedAt: c.issuedAt.toISOString(),
        verificationHash: c.verificationHash,
      }));
    }

    // Default milestone certificates for active operators
    if (exp >= 200) {
      return [
        {
          code: 'CF-OWA-2026-9481',
          title: 'Offensive Web Associate (CF-OWA)',
          scorePercentage: 94.5,
          issuedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
          verificationHash:
            'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        },
      ];
    }

    return [];
  }

  /**
   * Helper: Sample completed learning paths
   */
  private formatLearningPaths(exp: number): LearningPathProgress[] {
    return [
      {
        title: 'Web Application Security Fundamentals',
        completionPercentage: 100,
        completedRooms: 12,
        totalRooms: 12,
      },
      {
        title: 'Linux Privilege Escalation & Post-Exploitation',
        completionPercentage: Math.min(100, Math.floor(exp / 15)),
        completedRooms: Math.min(10, Math.floor(exp / 30)),
        totalRooms: 10,
      },
      {
        title: 'Container Security & Kubernetes Pentesting',
        completionPercentage: Math.min(100, Math.floor(exp / 25)),
        completedRooms: Math.min(8, Math.floor(exp / 50)),
        totalRooms: 8,
      },
    ];
  }
}

export const usersService = new UsersService();
