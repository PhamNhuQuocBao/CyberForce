import { Redis } from 'ioredis';
import { env } from '../config/env.js';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    retryStrategy(times: number) {
      const delay = Math.min(times * 100, 2000);
      return delay;
    },
  });

redis.on('error', (err: Error) => {
  console.error('Redis connection error:', err.message);
});

redis.on('connect', () => {
  if (env.NODE_ENV === 'development') {
    console.log('⚡ Connected to Redis successfully');
  }
});

if (env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}
