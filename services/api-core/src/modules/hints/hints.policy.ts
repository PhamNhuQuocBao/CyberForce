import { z } from 'zod';

const hintsSchema = z
  .array(
    z
      .object({
        tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
        content: z.string().trim().min(1).max(50000),
      })
      .strict(),
  )
  .max(3)
  .refine(
    (hints) =>
      new Set(hints.map((hint) => hint.tier)).size === hints.length &&
      (!hints.some((hint) => hint.tier === 2) || hints.some((hint) => hint.tier === 1)),
  );

export function parseHints(value: unknown) {
  return hintsSchema.parse(value ?? []).sort((a, b) => a.tier - b.tier);
}

export function remainingReward(points: number, unlocks: { pointsDeducted: number }[]) {
  return Math.max(0, points - unlocks.reduce((sum, unlock) => sum + unlock.pointsDeducted, 0));
}

export function hintCost(tier: number, points: number, remaining: number) {
  return tier === 3
    ? remaining
    : Math.min(remaining, Math.floor((points * (tier === 1 ? 10 : 20)) / 100));
}
