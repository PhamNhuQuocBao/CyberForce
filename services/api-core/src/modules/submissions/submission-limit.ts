import { randomUUID } from 'node:crypto';
import { redis } from '../../lib/redis.js';
import { AuthError } from '../auth/auth.service.js';

// Redis time and a single script keep the sliding window consistent across API instances.
const script = `
local ttl = redis.call('PTTL', KEYS[2])
if ttl > 0 then return math.ceil(ttl / 1000) end
if ARGV[1] == 'check' then return 0 end
local time = redis.call('TIME')
local now = time[1] * 1000 + math.floor(time[2] / 1000)
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', now - 60000)
redis.call('ZADD', KEYS[1], now, ARGV[2])
redis.call('PEXPIRE', KEYS[1], 60000)
if redis.call('ZCARD', KEYS[1]) >= 5 then
  redis.call('SET', KEYS[2], '1', 'PX', 180000)
  redis.call('DEL', KEYS[1])
  return 180
end
return 0
`;

export function submissionLimitKeys(userId: string, questionId: string) {
  const scope = `submission:{${userId}:${questionId}}`;
  return [`${scope}:failures`, `${scope}:lock`];
}

export async function submissionLimit(
  userId: string,
  questionId: string,
  mode: 'check' | 'incorrect',
) {
  try {
    return Number(
      await redis.eval(script, 2, ...submissionLimitKeys(userId, questionId), mode, randomUUID()),
    );
  } catch {
    throw new AuthError(
      503,
      'Tạm thời chưa thể nộp bài. Vui lòng thử lại sau.',
      'SUBMISSION_UNAVAILABLE',
    );
  }
}

export function submissionLocked(retryAfterSeconds: number) {
  return new AuthError(
    429,
    'Bạn đã nộp sai 5 lần trong 60 giây. Câu hỏi bị khóa trong 3 phút.',
    'SUBMISSION_LOCKED',
    { retryAfterSeconds },
  );
}
