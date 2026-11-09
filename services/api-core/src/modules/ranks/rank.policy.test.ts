import { describe, expect, it } from 'vitest';
import { highestRank, nextRank, rankForExp, rankTiers } from './rank.policy.js';

describe('rank thresholds', () => {
  it.each(rankTiers.slice(1))('promotes at $name threshold', (tier) => {
    expect(rankForExp(tier.minExp).name).toBe(tier.name);
    expect(rankForExp(tier.minExp - 1).name).not.toBe(tier.name);
  });

  it('supports multi-tier jumps and keeps the highest tier after EXP deduction', () => {
    expect(highestRank('Novice', 5000).name).toBe('Hacker');
    expect(highestRank('Hacker', 4980).name).toBe('Hacker');
    expect(nextRank('Hacker')?.minExp).toBe(15000);
    expect(nextRank('Cyber Guru')).toBeNull();
  });
});
