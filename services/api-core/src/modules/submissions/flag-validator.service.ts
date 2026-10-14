import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { Script } from 'node:vm';

const MAX_ANSWER_BYTES = 4096;
const MAX_PATTERN_LENGTH = 255;
const REGEX_TIMEOUT_MS = 25;
const regexScript = new Script(
  'new RegExp(pattern); new RegExp("^(?:" + pattern + ")(?![\\\\s\\\\S])").test(answer)',
);

export class FlagConfigurationError extends Error {
  constructor() {
    super('Cấu hình đáp án không hợp lệ.');
    this.name = 'FlagConfigurationError';
  }
}

export function requirePlatformMasterKey(key: string): string {
  if (key.length < 32 || key === 'cyberforce_platform_master_hmac_secret_2026')
    throw new FlagConfigurationError();
  return key;
}

type FlagDefinition =
  | { flagType: 'static'; answerHash: string | null }
  | { flagType: 'regex'; flagPattern: string | null }
  | {
      flagType: 'dynamic_hmac';
      userId: string;
      roomId: string;
      instanceSalt: string;
      masterKey: string;
    };

export function createDynamicFlag(context: {
  userId: string;
  roomId: string;
  instanceSalt: string;
  masterKey: string;
}): string {
  if (!context.userId || !context.roomId || !context.instanceSalt || !context.masterKey)
    throw new FlagConfigurationError();
  const payload = createHmac('sha256', context.masterKey)
    .update(context.userId + context.roomId + context.instanceSalt)
    .digest('hex');
  return `flag{${payload.slice(0, 24)}}`;
}

/** Answers are case-sensitive; whitespace is significant for both flag types. */
export class FlagValidatorService {
  validate(answer: string, definition: FlagDefinition): boolean {
    if (!answer || Buffer.byteLength(answer, 'utf8') > MAX_ANSWER_BYTES) return false;
    if (definition.flagType === 'static') return this.validateStatic(answer, definition.answerHash);
    if (definition.flagType === 'dynamic_hmac') {
      const expected = Buffer.from(createDynamicFlag(definition));
      const submitted = Buffer.from(answer);
      return submitted.length === expected.length && timingSafeEqual(submitted, expected);
    }
    return this.validateRegex(answer, definition.flagPattern);
  }

  private validateStatic(answer: string, hash: string | null): boolean {
    // Accept explicit SHA-256 and legacy bare hex, never plaintext fallback.
    const hex = hash?.replace(/^sha256:/, '');
    if (!hex || !/^[a-fA-F0-9]{64}$/.test(hex)) throw new FlagConfigurationError();
    return timingSafeEqual(createHash('sha256').update(answer).digest(), Buffer.from(hex, 'hex'));
  }

  private validateRegex(answer: string, pattern: string | null): boolean {
    if (!pattern || pattern.length > MAX_PATTERN_LENGTH) throw new FlagConfigurationError();
    try {
      // Only this fixed script executes; pattern/answer are data in a fresh context.
      // A timeout bounds pathological backtracking rather than blocking indefinitely.
      return regexScript.runInNewContext(
        { pattern, answer },
        { timeout: REGEX_TIMEOUT_MS, contextCodeGeneration: { strings: false, wasm: false } },
      ) as boolean;
    } catch {
      throw new FlagConfigurationError();
    }
  }
}
