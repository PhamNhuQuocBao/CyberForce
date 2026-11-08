import { buildApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { redis } from './lib/redis.js';
import { sweepExams } from './modules/exams/exams.service.js';
import { sweepCertificateIssuances } from './modules/exams/certificates.service.js';
import { sweepExpiredStreaks } from './modules/streak/streak.service.js';

async function bootstrap() {
  const app = buildApp();

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    console.info(`🚀 CyberForce Core API listening on port ${env.PORT} (${env.API_BASE_URL})`);
    console.info(`🩺 Health check endpoint available at ${env.API_BASE_URL}/health`);
    console.info(`🔐 Auth endpoints available at ${env.API_BASE_URL}/api/v1/auth`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  const examSweep = setInterval(() => {
    void sweepExams().catch((error) => console.error('Exam sweep failed', error));
  }, 30000);
  void sweepExams().catch((error) => console.error('Exam sweep failed', error));
  const certificateSweep = setInterval(() => {
    void sweepCertificateIssuances().catch((error) =>
      console.error('Certificate sweep failed', error),
    );
  }, 5000);
  void sweepCertificateIssuances().catch((error) =>
    console.error('Certificate sweep failed', error),
  );
  const streakSweep = setInterval(() => {
    void sweepExpiredStreaks().catch((error) => console.error('Streak sweep failed', error));
  }, 60000);
  void sweepExpiredStreaks().catch((error) => console.error('Streak sweep failed', error));

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    clearInterval(examSweep);
    clearInterval(certificateSweep);
    clearInterval(streakSweep);
    console.info(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    try {
      await app.close();
      await prisma.$disconnect();
      redis.disconnect();
      console.info('✅ Connections closed. Process exiting.');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap();
