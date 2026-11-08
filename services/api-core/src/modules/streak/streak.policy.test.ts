import { describe, expect, it } from 'vitest';
import {
  boostedPoints,
  localDate,
  nextStreak,
  priorDate,
  validTimezone,
  visibleStreak,
} from './streak.policy.js';

describe('local learning-day policy', () => {
  it('uses the learner timezone at midnight', () => {
    expect(localDate(new Date('2026-11-08T16:59:59Z'), 'Asia/Ho_Chi_Minh')).toBe('2026-11-08');
    expect(localDate(new Date('2026-11-08T17:00:00Z'), 'Asia/Ho_Chi_Minh')).toBe('2026-11-09');
    expect(nextStreak(6, '2026-11-08', '2026-11-09')).toBe(7);
    expect(nextStreak(6, '2026-11-07', '2026-11-09')).toBe(1);
    expect(priorDate('2027-01-01')).toBe('2026-12-31');
  });

  it('handles daylight-saving transitions by calendar date', () => {
    expect(localDate(new Date('2026-03-08T06:59:59Z'), 'America/New_York')).toBe('2026-03-08');
    expect(localDate(new Date('2026-03-09T03:59:59Z'), 'America/New_York')).toBe('2026-03-08');
    expect(localDate(new Date('2026-03-09T04:00:00Z'), 'America/New_York')).toBe('2026-03-09');
    expect(
      visibleStreak(6, '2026-03-08', new Date('2026-03-09T04:00:00Z'), 'America/New_York'),
    ).toBe(6);
  });

  it('resets an unproven or missed streak and rounds bonus points', () => {
    expect(visibleStreak(1, null, new Date(), 'UTC')).toBe(0);
    expect(visibleStreak(5, '2026-11-06', new Date('2026-11-08T00:00:00Z'), 'UTC')).toBe(0);
    expect(boostedPoints(51, 120)).toBe(61);
    expect(validTimezone('Asia/Ho_Chi_Minh')).toBe(true);
    expect(validTimezone('not/a-zone')).toBe(false);
  });
});
