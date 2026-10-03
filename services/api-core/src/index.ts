import { buildApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { redis } from './lib/redis.js';

async function bootstrap() {
  const app = buildApp();

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`🚀 CyberForce Core API listening on port ${env.PORT} (${env.API_BASE_URL})`);
    console.log(`🩺 Health check endpoint available at ${env.API_BASE_URL}/health`);
    console.log(`🔐 Auth endpoints available at ${env.API_BASE_URL}/api/v1/auth`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    try {
      await app.close();
      await prisma.$disconnect();
      redis.disconnect();
      console.log('✅ Connections closed. Process exiting.');
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
