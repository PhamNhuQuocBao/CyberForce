import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { generateTokens, hashPassword } from '../../lib/security.js';
import { FlagType } from '@prisma/client';

describe('Learning Paths Catalog & Prerequisite Gating API (US-02.01 / CF-201)', () => {
  let app: FastifyInstance;

  let testStudent: { id: string; email: string; username: string };
  let studentToken: string;

  let testPathId: string;
  const testPathSlug = `test-offensive-path-${Date.now()}`;
  let room1Id: string;
  let room2Id: string;
  let room3Id: string;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();

    const timestamp = Date.now();
    const pwHash = await hashPassword('P@ssword123!');

    // 1. Create a test student
    testStudent = await prisma.user.create({
      data: {
        email: `path_student_${timestamp}@cyberforce.io`,
        username: `path_student_${timestamp}`,
        passwordHash: pwHash,
        role: 'student',
        expPoints: 200,
        rankTier: 'Novice',
      },
    });
    studentToken = generateTokens(testStudent).accessToken;

    // 2. Create a test LearningPath with 3 chained rooms
    const path = await prisma.learningPath.create({
      data: {
        title: 'Test Web Exploitation Path',
        slug: testPathSlug,
        description: 'Test curriculum for prerequisite gating verification.',
        category: 'Offense',
        difficultyLevel: 'Intermediate',
        estimatedHours: 15,
        isPublished: true,
        orderIndex: 99,
      },
    });
    testPathId = path.id;

    // Room 1: Foundational (No prerequisite)
    const r1 = await prisma.room.create({
      data: {
        pathId: testPathId,
        moduleName: 'Module 1: Foundations',
        moduleOrder: 1,
        orderIndex: 1,
        title: 'Room 1: Web Fundamentals',
        slug: `test-room-1-${timestamp}`,
        difficulty: 'Easy',
        pointsReward: 100,
        isFree: true,
        targetTemplateSpec: {},
        publishedAt: new Date(),
        tasks: {
          create: [
            {
              taskOrder: 1,
              title: 'Task 1.1',
              contentMdx: 'Task 1.1 Content',
              questions: {
                create: [
                  {
                    questionText: 'Question 1.1.1',
                    flagPattern: 'CF{flag1}',
                    flagType: FlagType.static,
                    pointsReward: 50,
                  },
                ],
              },
            },
          ],
        },
      },
      include: {
        tasks: { include: { questions: true } },
      },
    });
    room1Id = r1.id;

    // Room 2: Intermediate (Prerequisite: Room 1)
    const r2 = await prisma.room.create({
      data: {
        pathId: testPathId,
        moduleName: 'Module 1: Foundations',
        moduleOrder: 1,
        orderIndex: 2,
        title: 'Room 2: Injection Attacks',
        slug: `test-room-2-${timestamp}`,
        difficulty: 'Intermediate',
        pointsReward: 150,
        prerequisiteRoomId: room1Id,
        isFree: true,
        targetTemplateSpec: {},
        publishedAt: new Date(),
        tasks: {
          create: [
            {
              taskOrder: 1,
              title: 'Task 2.1',
              contentMdx: 'Task 2.1 Content',
              questions: {
                create: [
                  {
                    questionText: 'Question 2.1.1',
                    flagPattern: 'CF{flag2_1}',
                    flagType: FlagType.static,
                    pointsReward: 75,
                  },
                  {
                    questionText: 'Question 2.1.2',
                    flagPattern: 'CF{flag2_2}',
                    flagType: FlagType.static,
                    pointsReward: 75,
                  },
                ],
              },
            },
          ],
        },
      },
      include: {
        tasks: { include: { questions: true } },
      },
    });
    room2Id = r2.id;

    // Room 3: Advanced (Prerequisite: Room 2)
    const r3 = await prisma.room.create({
      data: {
        pathId: testPathId,
        moduleName: 'Module 2: Advanced Exploits',
        moduleOrder: 2,
        orderIndex: 3,
        title: 'Room 3: Kernel Exploitation',
        slug: `test-room-3-${timestamp}`,
        difficulty: 'Advanced',
        pointsReward: 250,
        prerequisiteRoomId: room2Id,
        isFree: true,
        targetTemplateSpec: {},
        publishedAt: new Date(),
        tasks: {
          create: [
            {
              taskOrder: 1,
              title: 'Task 3.1',
              contentMdx: 'Task 3.1 Content',
              questions: {
                create: [
                  {
                    questionText: 'Question 3.1.1',
                    flagPattern: 'CF{flag3}',
                    flagType: FlagType.static,
                    pointsReward: 250,
                  },
                ],
              },
            },
          ],
        },
      },
    });
    room3Id = r3.id;

    // 3. Seed student progress:
    // Solve Room 1's question (100% completed)
    const q1 = r1.tasks[0]?.questions[0];
    if (q1) {
      await prisma.submission.create({
        data: {
          userId: testStudent.id,
          questionId: q1.id,
          submittedValue: 'CF{flag1}',
          isCorrect: true,
          pointsEarned: 50,
        },
      });
    }

    // Solve only 1 of 2 questions in Room 2 (50% completed)
    const q2First = r2.tasks[0]?.questions[0];
    if (q2First) {
      await prisma.submission.create({
        data: {
          userId: testStudent.id,
          questionId: q2First.id,
          submittedValue: 'CF{flag2_1}',
          isCorrect: true,
          pointsEarned: 75,
        },
      });
    }
  });

  afterAll(async () => {
    if (testStudent) {
      await prisma.submission.deleteMany({ where: { userId: testStudent.id } });
      await prisma.user.delete({ where: { id: testStudent.id } });
    }
    if (testPathId) {
      await prisma.room.deleteMany({ where: { pathId: testPathId } });
      await prisma.learningPath.delete({ where: { id: testPathId } });
    }
    await app.close();
  });

  describe('GET /api/v1/paths', () => {
    it('should list published learning paths for unauthenticated users with 0% progress', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/paths',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);

      const found = body.data.find((p: { slug: string }) => p.slug === testPathSlug);
      expect(found).toBeDefined();
      expect(found.title).toBe('Test Web Exploitation Path');
      expect(found.progressPercentage).toBe(0);
      expect(found.completedRoomsCount).toBe(0);
      expect(found.status).toBe('not_started');
    });

    it('should filter paths by category', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/paths?category=Offense',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(
        body.data.every((p: { category: string }) => p.category.toLowerCase() === 'offense'),
      ).toBe(true);
    });

    it('should filter paths by search query', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/paths?search=Test%20Web%20Exploitation`,
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      expect(body.data[0].slug).toBe(testPathSlug);
    });

    it('should return calculated telemetry for authenticated student', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/paths',
        headers: {
          authorization: `Bearer ${studentToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      const found = body.data.find((p: { slug: string }) => p.slug === testPathSlug);
      expect(found).toBeDefined();
      // Room 1 completed out of 3 total rooms => 33% progress
      expect(found.completedRoomsCount).toBe(1);
      expect(found.roomsCount).toBe(3);
      expect(found.progressPercentage).toBe(33);
      expect(found.status).toBe('in_progress');
      expect(found.earnedPoints).toBe(125); // 50 (q1) + 75 (q2_1)
      // Next up room should be Room 2 (in progress)
      expect(found.nextUpRoom).toBeDefined();
      expect(found.nextUpRoom.title).toBe('Room 2: Injection Attacks');
    });
  });

  describe('GET /api/v1/paths/:slug', () => {
    it('should return 404 for non-existent learning path slug', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/paths/non-existent-path-slug-9999',
      });

      expect(response.statusCode).toBe(404);
      const body = response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('PATH_NOT_FOUND');
    });

    it('should return full modular hierarchy and prerequisite gating for authenticated student', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/paths/${testPathSlug}`,
        headers: {
          authorization: `Bearer ${studentToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.success).toBe(true);
      const pathData = body.data;

      expect(pathData.slug).toBe(testPathSlug);
      expect(pathData.totalRoomsCount).toBe(3);
      expect(pathData.completedRoomsCount).toBe(1);
      expect(pathData.progressPercentage).toBe(33);
      expect(pathData.isCapstoneUnlocked).toBe(false);

      // Verify Modules
      expect(pathData.modules.length).toBe(2);
      const mod1 = pathData.modules[0];
      expect(mod1.moduleName).toBe('Module 1: Foundations');
      expect(mod1.roomsCount).toBe(2);
      expect(mod1.completedRoomsCount).toBe(1);

      // Room 1: Completed
      const r1Data = mod1.rooms[0];
      expect(r1Data.title).toBe('Room 1: Web Fundamentals');
      expect(r1Data.status).toBe('completed');
      expect(r1Data.userProgress.percentage).toBe(100);
      expect(r1Data.prerequisite.isSatisfied).toBe(true);

      // Room 2: In Progress (Prereq Room 1 is completed)
      const r2Data = mod1.rooms[1];
      expect(r2Data.title).toBe('Room 2: Injection Attacks');
      expect(r2Data.status).toBe('in_progress');
      expect(r2Data.userProgress.completedQuestions).toBe(1);
      expect(r2Data.userProgress.totalQuestions).toBe(2);
      expect(r2Data.userProgress.percentage).toBe(50);
      expect(r2Data.prerequisite.isSatisfied).toBe(true);

      // Room 3: Prerequisite Locked! (Requires Room 2 to be 100% completed)
      const mod2 = pathData.modules[1];
      const r3Data = mod2.rooms[0];
      expect(r3Data.title).toBe('Room 3: Kernel Exploitation');
      expect(r3Data.status).toBe('locked');
      expect(r3Data.prerequisite.isSatisfied).toBe(false);
      expect(r3Data.prerequisite.requiredRoomId).toBe(room2Id);
      expect(r3Data.prerequisite.requiredRoomTitle).toBe('Room 2: Injection Attacks');
      expect(r3Data.prerequisite.prerequisiteProgress.percentage).toBe(50);
    });
  });

  describe('POST /api/v1/paths/:slug/enroll', () => {
    it('should reject unauthenticated enrollment with 401', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/paths/${testPathSlug}/enroll`,
      });

      expect(response.statusCode).toBe(401);
    });

    it('should successfully enroll authenticated student and return next up room', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/paths/${testPathSlug}/enroll`,
        headers: {
          authorization: `Bearer ${studentToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.message).toContain('Enrolled in learning track');
      expect(body.data.nextUpRoom).toBeDefined();
      expect(body.data.nextUpRoom.title).toBe('Room 2: Injection Attacks');
    });
  });
});
