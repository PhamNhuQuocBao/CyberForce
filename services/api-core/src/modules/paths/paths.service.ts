import { prisma } from '../../lib/prisma.js';
import { AuthError } from '../auth/auth.service.js';
import type { ListPathsQuery } from './paths.schemas.js';

export interface RoomPrerequisiteInfo {
  requiredRoomId: string | null;
  requiredRoomTitle: string | null;
  requiredRoomSlug: string | null;
  isSatisfied: boolean;
  prerequisiteProgress: {
    completedQuestions: number;
    totalQuestions: number;
    percentage: number;
  } | null;
}

export interface PathRoomItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  difficulty: string;
  pointsReward: number;
  estimatedMinutes: number;
  isFree: boolean;
  orderIndex: number;
  moduleName: string;
  moduleOrder: number;
  taskCount: number;
  questionCount: number;
  status: 'completed' | 'in_progress' | 'available' | 'locked';
  userProgress: {
    completedQuestions: number;
    totalQuestions: number;
    percentage: number;
  };
  prerequisite: RoomPrerequisiteInfo;
}

export interface PathModuleGroup {
  moduleName: string;
  moduleOrder: number;
  roomsCount: number;
  completedRoomsCount: number;
  rooms: PathRoomItem[];
}

export class PathsService {
  /**
   * List all published learning paths with user progress telemetry
   */
  async listPaths(userId?: string, query?: ListPathsQuery) {
    const whereClause: Record<string, unknown> = {
      isPublished: true,
    };

    if (query?.category && query.category.toLowerCase() !== 'all') {
      whereClause.category = {
        equals: query.category,
        mode: 'insensitive',
      };
    }

    if (query?.difficulty) {
      whereClause.difficultyLevel = {
        equals: query.difficulty,
        mode: 'insensitive',
      };
    }

    if (query?.search) {
      whereClause.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const paths = await prisma.learningPath.findMany({
      where: whereClause,
      orderBy: { orderIndex: 'asc' },
      include: {
        rooms: {
          orderBy: [{ moduleOrder: 'asc' }, { orderIndex: 'asc' }],
          include: {
            tasks: {
              include: {
                questions: {
                  select: { id: true, pointsReward: true },
                },
              },
            },
          },
        },
      },
    });

    // If userId provided, fetch all correct question submissions for this user
    let solvedQuestionIds = new Set<string>();
    if (userId) {
      const submissions = await prisma.submission.findMany({
        where: {
          userId,
          isCorrect: true,
        },
        select: { questionId: true },
      });
      solvedQuestionIds = new Set(submissions.map((s) => s.questionId));
    }

    return paths.map((path) => {
      const distinctModules = new Set(path.rooms.map((r) => r.moduleName));
      const totalRooms = path.rooms.length;
      let completedRoomsCount = 0;
      let totalPoints = 0;
      let earnedPoints = 0;

      // Map room completion statuses
      const roomCompletionMap = new Map<string, boolean>();

      for (const room of path.rooms) {
        totalPoints += room.pointsReward;
        const allQuestions = room.tasks.flatMap((t) => t.questions);
        const totalQuestions = allQuestions.length;
        const solvedCount = allQuestions.filter((q) => solvedQuestionIds.has(q.id)).length;

        allQuestions.forEach((q) => {
          if (solvedQuestionIds.has(q.id)) {
            earnedPoints += q.pointsReward;
          }
        });

        const isCompleted = totalQuestions > 0 && solvedCount === totalQuestions;
        roomCompletionMap.set(room.id, isCompleted);
        if (isCompleted) {
          completedRoomsCount++;
        }
      }

      // Determine next up room
      let nextUpRoom: {
        id: string;
        slug: string;
        title: string;
        orderIndex: number;
        moduleName: string;
      } | null = null;

      for (const room of path.rooms) {
        const isCompleted = roomCompletionMap.get(room.id) || false;
        if (!isCompleted) {
          // Check if prerequisite is satisfied
          const prereqSatisfied =
            !room.prerequisiteRoomId || roomCompletionMap.get(room.prerequisiteRoomId) === true;
          if (prereqSatisfied) {
            nextUpRoom = {
              id: room.id,
              slug: room.slug,
              title: room.title,
              orderIndex: room.orderIndex,
              moduleName: room.moduleName,
            };
            break;
          }
        }
      }

      // If all completed or no room found, fallback to first incomplete or first room
      if (!nextUpRoom && path.rooms.length > 0) {
        const firstIncomplete = path.rooms.find((r) => !roomCompletionMap.get(r.id));
        if (firstIncomplete) {
          nextUpRoom = {
            id: firstIncomplete.id,
            slug: firstIncomplete.slug,
            title: firstIncomplete.title,
            orderIndex: firstIncomplete.orderIndex,
            moduleName: firstIncomplete.moduleName,
          };
        }
      }

      const progressPercentage =
        totalRooms > 0 ? Math.round((completedRoomsCount / totalRooms) * 100) : 0;

      let status: 'not_started' | 'in_progress' | 'mastered' = 'not_started';
      if (progressPercentage === 100 && totalRooms > 0) {
        status = 'mastered';
      } else if (completedRoomsCount > 0 || earnedPoints > 0) {
        status = 'in_progress';
      }

      return {
        id: path.id,
        title: path.title,
        slug: path.slug,
        description: path.description,
        difficultyLevel: path.difficultyLevel,
        category: path.category,
        estimatedHours: path.estimatedHours,
        iconUrl: path.iconUrl,
        orderIndex: path.orderIndex,
        modulesCount: distinctModules.size,
        roomsCount: totalRooms,
        totalPointsReward: totalPoints,
        earnedPoints: userId ? earnedPoints : 0,
        completedRoomsCount: userId ? completedRoomsCount : 0,
        progressPercentage: userId ? progressPercentage : 0,
        status: userId ? status : 'not_started',
        nextUpRoom,
      };
    });
  }

  /**
   * Get detailed learning path hierarchy by slug
   */
  async getPathBySlug(slug: string, userId?: string) {
    const path = await prisma.learningPath.findUnique({
      where: { slug },
      include: {
        rooms: {
          orderBy: [{ moduleOrder: 'asc' }, { orderIndex: 'asc' }],
          include: {
            prerequisiteRoom: {
              select: {
                id: true,
                title: true,
                slug: true,
                tasks: {
                  include: {
                    questions: { select: { id: true } },
                  },
                },
              },
            },
            tasks: {
              orderBy: { taskOrder: 'asc' },
              include: {
                questions: {
                  select: { id: true, pointsReward: true },
                },
              },
            },
          },
        },
      },
    });

    if (!path || !path.isPublished) {
      throw new AuthError(404, `Learning path with slug "${slug}" not found`, 'PATH_NOT_FOUND');
    }

    // Solved questions for user
    let solvedQuestionIds = new Set<string>();
    if (userId) {
      const submissions = await prisma.submission.findMany({
        where: {
          userId,
          isCorrect: true,
        },
        select: { questionId: true },
      });
      solvedQuestionIds = new Set(submissions.map((s) => s.questionId));
    }

    // Step 1: Precompute completion and question counts for each room
    const roomMetrics = new Map<
      string,
      {
        totalQuestions: number;
        completedQuestions: number;
        isCompleted: boolean;
        pointsEarned: number;
      }
    >();

    let totalTrackExp = 0;
    let userTrackExp = 0;

    for (const room of path.rooms) {
      totalTrackExp += room.pointsReward;
      const allQuestions = room.tasks.flatMap((t) => t.questions);
      const totalQuestions = allQuestions.length;
      let solvedCount = 0;
      let pointsEarnedInRoom = 0;

      for (const q of allQuestions) {
        if (solvedQuestionIds.has(q.id)) {
          solvedCount++;
          pointsEarnedInRoom += q.pointsReward;
        }
      }

      const isCompleted = totalQuestions > 0 && solvedCount === totalQuestions;
      userTrackExp += pointsEarnedInRoom;

      roomMetrics.set(room.id, {
        totalQuestions,
        completedQuestions: solvedCount,
        isCompleted,
        pointsEarned: pointsEarnedInRoom,
      });
    }

    // Step 2: Build detailed room items with prerequisite gating
    let completedRoomsTotal = 0;

    const roomItems: PathRoomItem[] = path.rooms.map((room) => {
      const metrics = roomMetrics.get(room.id)!;
      if (metrics.isCompleted) {
        completedRoomsTotal++;
      }

      let prerequisiteInfo: RoomPrerequisiteInfo = {
        requiredRoomId: null,
        requiredRoomTitle: null,
        requiredRoomSlug: null,
        isSatisfied: true,
        prerequisiteProgress: null,
      };

      let status: 'completed' | 'in_progress' | 'available' | 'locked' = 'available';

      if (room.prerequisiteRoom) {
        const prereqMetrics = roomMetrics.get(room.prerequisiteRoom.id) || {
          totalQuestions: room.prerequisiteRoom.tasks.flatMap((t) => t.questions).length,
          completedQuestions: room.prerequisiteRoom.tasks
            .flatMap((t) => t.questions)
            .filter((q) => solvedQuestionIds.has(q.id)).length,
          isCompleted: false,
          pointsEarned: 0,
        };

        const isPrereqSatisfied =
          prereqMetrics.totalQuestions === 0 ||
          prereqMetrics.completedQuestions === prereqMetrics.totalQuestions;

        prerequisiteInfo = {
          requiredRoomId: room.prerequisiteRoom.id,
          requiredRoomTitle: room.prerequisiteRoom.title,
          requiredRoomSlug: room.prerequisiteRoom.slug,
          isSatisfied: isPrereqSatisfied,
          prerequisiteProgress: {
            completedQuestions: prereqMetrics.completedQuestions,
            totalQuestions: prereqMetrics.totalQuestions,
            percentage:
              prereqMetrics.totalQuestions > 0
                ? Math.round(
                    (prereqMetrics.completedQuestions / prereqMetrics.totalQuestions) * 100,
                  )
                : 100,
          },
        };

        if (!isPrereqSatisfied) {
          status = 'locked';
        }
      }

      if (status !== 'locked') {
        if (metrics.isCompleted) {
          status = 'completed';
        } else if (metrics.completedQuestions > 0) {
          status = 'in_progress';
        } else {
          status = 'available';
        }
      }

      const qPercentage =
        metrics.totalQuestions > 0
          ? Math.round((metrics.completedQuestions / metrics.totalQuestions) * 100)
          : 0;

      return {
        id: room.id,
        slug: room.slug,
        title: room.title,
        description: room.description,
        difficulty: room.difficulty,
        pointsReward: room.pointsReward,
        estimatedMinutes: room.estimatedMinutes,
        isFree: room.isFree,
        orderIndex: room.orderIndex,
        moduleName: room.moduleName,
        moduleOrder: room.moduleOrder,
        taskCount: room.tasks.length,
        questionCount: metrics.totalQuestions,
        status,
        userProgress: {
          completedQuestions: userId ? metrics.completedQuestions : 0,
          totalQuestions: metrics.totalQuestions,
          percentage: userId ? qPercentage : 0,
        },
        prerequisite: prerequisiteInfo,
      };
    });

    // Step 3: Group into modules
    const moduleMap = new Map<string, PathModuleGroup>();

    for (const r of roomItems) {
      if (!moduleMap.has(r.moduleName)) {
        moduleMap.set(r.moduleName, {
          moduleName: r.moduleName,
          moduleOrder: r.moduleOrder,
          roomsCount: 0,
          completedRoomsCount: 0,
          rooms: [],
        });
      }
      const group = moduleMap.get(r.moduleName)!;
      group.roomsCount++;
      if (r.status === 'completed') {
        group.completedRoomsCount++;
      }
      group.rooms.push(r);
    }

    const modules = Array.from(moduleMap.values()).sort((a, b) => a.moduleOrder - b.moduleOrder);

    const totalRoomsCount = path.rooms.length;
    const progressPercentage =
      totalRoomsCount > 0 ? Math.round((completedRoomsTotal / totalRoomsCount) * 100) : 0;

    let overallStatus: 'not_started' | 'in_progress' | 'mastered' = 'not_started';
    if (progressPercentage === 100 && totalRoomsCount > 0) {
      overallStatus = 'mastered';
    } else if (completedRoomsTotal > 0 || userTrackExp > 0) {
      overallStatus = 'in_progress';
    }

    // Determine next up room for the path
    const nextUpRoom =
      roomItems.find((r) => r.status === 'in_progress' || r.status === 'available') || null;

    return {
      id: path.id,
      title: path.title,
      slug: path.slug,
      description: path.description,
      difficultyLevel: path.difficultyLevel,
      category: path.category,
      estimatedHours: path.estimatedHours,
      iconUrl: path.iconUrl,
      orderIndex: path.orderIndex,
      totalTrackExp,
      totalRoomsCount,
      completedRoomsCount: userId ? completedRoomsTotal : 0,
      userTrackExp: userId ? userTrackExp : 0,
      progressPercentage: userId ? progressPercentage : 0,
      status: userId ? overallStatus : 'not_started',
      isCapstoneUnlocked: progressPercentage === 100,
      nextUpRoom: nextUpRoom
        ? {
            id: nextUpRoom.id,
            slug: nextUpRoom.slug,
            title: nextUpRoom.title,
            orderIndex: nextUpRoom.orderIndex,
            moduleName: nextUpRoom.moduleName,
          }
        : null,
      modules,
    };
  }
}

export const pathsService = new PathsService();
