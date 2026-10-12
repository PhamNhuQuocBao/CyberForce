import { createHash, createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  createDynamicFlag,
  FlagConfigurationError,
  FlagValidatorService,
} from './flag-validator.service.js';

const validator = new FlagValidatorService();
const answer = 'CF{learning_security}';
const hash = createHash('sha256').update(answer).digest('hex');

describe('FlagValidatorService', () => {
  const dynamic = {
    flagType: 'dynamic_hmac' as const,
    userId: 'user-one',
    roomId: 'room-one',
    instanceSalt: 'session-one',
    masterKey: 'test-key',
  };

  it('uses the TDD HMAC formula and exact lowercase flag prefix', () => {
    const expected = `flag{${createHmac('sha256', 'test-key').update('user-oneroom-onesession-one').digest('hex').slice(0, 24)}}`;
    expect(createDynamicFlag(dynamic)).toBe(expected);
    expect(validator.validate(expected, dynamic)).toBe(true);
    expect(validator.validate(expected.replace('flag{', 'CF{'), dynamic)).toBe(false);
  });

  it('binds dynamic flags to user, room, salt and master key', () => {
    const flag = createDynamicFlag(dynamic);
    for (const field of ['userId', 'roomId', 'instanceSalt', 'masterKey']) {
      expect(validator.validate(flag, { ...dynamic, [field]: 'other' })).toBe(false);
    }
    expect(() => createDynamicFlag({ ...dynamic, masterKey: '' })).toThrow(FlagConfigurationError);
  });
  it('validates SHA-256 flags without normalizing meaningful characters', () => {
    for (const answerHash of [hash, `sha256:${hash}`]) {
      const flag = { flagType: 'static' as const, answerHash };
      expect(validator.validate(answer, flag)).toBe(true);
      expect(validator.validate(answer.toLowerCase(), flag)).toBe(false);
      expect(validator.validate(` ${answer}`, flag)).toBe(false);
      expect(validator.validate(`${answer}\n`, flag)).toBe(false);
    }
  });

  it('rejects missing, malformed and plaintext hash configuration', () => {
    for (const answerHash of [null, '', answer, 'sha256:invalid']) {
      expect(() => validator.validate(answer, { flagType: 'static', answerHash })).toThrow(
        FlagConfigurationError,
      );
    }
  });

  it('matches the entire regex answer, including alternation', () => {
    const flag = { flagType: 'regex' as const, flagPattern: 'http|https' };
    expect(validator.validate('https', flag)).toBe(true);
    expect(validator.validate('http', flag)).toBe(true);
    expect(validator.validate('prefixhttps', flag)).toBe(false);
    expect(validator.validate('httpssuffix', flag)).toBe(false);
    expect(validator.validate('https\n', flag)).toBe(false);
  });

  it('supports escaped punctuation and rejects invalid patterns', () => {
    expect(
      validator.validate('10.0.0.1', { flagType: 'regex', flagPattern: '10\\.0\\.0\\.1' }),
    ).toBe(true);
    expect(() => validator.validate(answer, { flagType: 'regex', flagPattern: '[' })).toThrow(
      FlagConfigurationError,
    );
  });

  it('bounds pathological regex execution', () => {
    expect(() =>
      validator.validate(`${'a'.repeat(200)}!`, { flagType: 'regex', flagPattern: '(a+)+b' }),
    ).toThrow(FlagConfigurationError);
  });

  it('rejects empty and oversized input before evaluation', () => {
    const flag = { flagType: 'regex' as const, flagPattern: '.*' };
    expect(validator.validate('', flag)).toBe(false);
    expect(validator.validate('a'.repeat(4097), flag)).toBe(false);
    expect(validator.validate('é'.repeat(2049), flag)).toBe(false);
  });
});
