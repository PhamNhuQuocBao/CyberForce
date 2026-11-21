import { createHash } from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const database = new URL(process.env.DATABASE_URL ?? 'postgres://invalid/invalid').pathname.slice(
  1,
);
if (process.env.CF_E2E_PROJECT?.startsWith('cf903-e2e-') !== true || database !== 'cf903_e2e') {
  throw new Error('E2E fixture may only seed the isolated CF-903 database');
}

const prisma = new PrismaClient();
const flag = 'CF{e2e_lab_verified}';

try {
  await prisma.learningPath.create({
    data: {
      title: 'CF-903 E2E Path',
      slug: 'cf903-e2e-path',
      isPublished: true,
      status: 'published',
      modules: {
        create: {
          title: 'E2E Module',
          status: 'published',
          rooms: {
            create: {
              title: 'CF-903 E2E Lab',
              slug: 'cf903-e2e-lab',
              description: 'Disposable browser test lab',
              status: 'published',
              publishedAt: new Date(),
              targetTemplateSpec: {
                image: 'cyberforce/cf903-e2e:local',
                port: 8080,
                cpuMillicores: 250,
                memoryMb: 256,
              },
              tasks: {
                create: {
                  taskOrder: 1,
                  title: 'Find the flag',
                  contentMdx: 'Read the flag from the lab HTTP server using Web Terminal.',
                  status: 'published',
                  questions: {
                    create: {
                      questionText: 'What is the flag?',
                      answerHash: createHash('sha256').update(flag).digest('hex'),
                      flagType: 'static',
                      pointsReward: 50,
                      status: 'published',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  console.info('CF-903 fixture seeded');
} finally {
  await prisma.$disconnect();
}
