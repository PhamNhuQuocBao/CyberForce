export const rankTiers = [
  { name: 'Novice', minExp: 0, badgeId: null },
  { name: 'Script Kiddie', minExp: 1000, badgeId: 'rank_script_kiddie' },
  { name: 'Hacker', minExp: 5000, badgeId: 'rank_hacker' },
  { name: 'Pro Hacker', minExp: 15000, badgeId: 'rank_pro_hacker' },
  { name: 'Elite Hacker', minExp: 35000, badgeId: 'rank_elite_hacker' },
  { name: 'Cyber Guru', minExp: 70000, badgeId: 'rank_cyber_guru' },
] as const;

export type RankTier = (typeof rankTiers)[number];

export function rankForExp(exp: number): RankTier {
  return [...rankTiers].reverse().find((tier) => exp >= tier.minExp) ?? rankTiers[0];
}

export function rankIndex(name: string): number {
  return rankTiers.findIndex((tier) => tier.name === name);
}

export function highestRank(current: string, exp: number): RankTier {
  const earned = rankForExp(exp);
  const previousIndex = rankIndex(current);
  return previousIndex > rankIndex(earned.name) ? rankTiers[previousIndex] : earned;
}

export function nextRank(current: string): RankTier | null {
  return rankTiers[rankIndex(current) + 1] ?? null;
}
