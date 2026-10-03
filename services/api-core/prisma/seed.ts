import { PrismaClient, UserRole, RoomType, FlagType } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Password hashing with Argon2id
  const defaultPassword = 'Password123!';
  const passwordHash = await argon2.hash(defaultPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // 2. Upsert Superadmin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cyberforce.io' },
    update: {},
    create: {
      email: 'admin@cyberforce.io',
      username: 'cyber_admin',
      passwordHash,
      role: UserRole.superadmin,
      expPoints: 9999,
      rankTier: 'Master',
      streakDays: 30,
    },
  });
  console.log(`👤 Superadmin created: ${admin.email}`);

  // 3. Upsert Creator User
  const creator = await prisma.user.upsert({
    where: { email: 'creator@cyberforce.io' },
    update: {},
    create: {
      email: 'creator@cyberforce.io',
      username: 'forge_creator',
      passwordHash,
      role: UserRole.creator,
      expPoints: 5000,
      rankTier: 'Expert',
      streakDays: 14,
    },
  });
  console.log(`👤 Creator created: ${creator.email}`);

  // 4. Upsert Student User
  const student = await prisma.user.upsert({
    where: { email: 'student@cyberforce.io' },
    update: {},
    create: {
      email: 'student@cyberforce.io',
      username: 'novice_hacker',
      passwordHash,
      role: UserRole.student,
      expPoints: 120,
      rankTier: 'Novice',
      streakDays: 3,
    },
  });
  console.log(`👤 Student created: ${student.email}`);

  // 5. Seed Learning Path
  const webPath = await prisma.learningPath.upsert({
    where: { slug: 'web-security-specialist' },
    update: {},
    create: {
      title: 'Web Application Security Specialist',
      slug: 'web-security-specialist',
      description:
        'Master offensive web exploitation from SQL Injection, XSS, SSRF to IDOR and JWT tampering.',
      difficultyLevel: 'Intermediate',
      orderIndex: 1,
      isPublished: true,
    },
  });
  console.log(`📚 Learning Path created: ${webPath.title}`);

  // 6. Seed Room
  const sqliRoom = await prisma.room.upsert({
    where: { slug: 'sqli-basics-101' },
    update: {},
    create: {
      pathId: webPath.id,
      title: 'SQL Injection Fundamentals',
      slug: 'sqli-basics-101',
      description:
        'Learn in-band SQL Injection, authentication bypass, and automated data extraction.',
      difficulty: 'Easy',
      roomType: RoomType.walkthrough,
      targetTemplateSpec: {
        image: 'vulnerables/web-dvwa:latest',
        cpuLimit: '0.5',
        memLimit: '512MB',
        internalPort: 80,
      },
      isFree: true,
      publishedAt: new Date(),
    },
  });
  console.log(`🚪 Room created: ${sqliRoom.title}`);

  // 7. Seed Tasks & Questions
  const task1 = await prisma.task.create({
    data: {
      roomId: sqliRoom.id,
      taskOrder: 1,
      title: 'Authentication Bypass using SQL Injection',
      contentMdx:
        '### Understanding Auth Bypass\nSQL Injection occurs when untrusted user input is directly concatenated into dynamic SQL queries.',
      questions: {
        create: [
          {
            questionText:
              'What is the classic SQL payload used to force a WHERE condition to evaluate to TRUE?',
            flagPattern: "' OR '1'='1",
            flagType: FlagType.static,
            pointsReward: 50,
          },
          {
            questionText: 'Submit the administrator flag after logging in.',
            flagPattern: 'flag{sql_injection_bypass_success_9918}',
            flagType: FlagType.static,
            pointsReward: 100,
          },
        ],
      },
    },
  });
  console.log(`📝 Task created: ${task1.title}`);

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
