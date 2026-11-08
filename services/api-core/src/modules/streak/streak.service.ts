import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import {
  DEFAULT_TIMEZONE,
  localDate,
  nextStreak,
  priorDate,
  visibleStreak,
} from './streak.policy.js';

export type StreakAward = {
  streakDays: number;
  badgeUnlocked: string | null;
  bonusPercent: number;
  bonusUntil: Date | null;
};

export async function completeTaskForStreak(
  tx: Prisma.TransactionClient,
  user: {
    id: string;
    timezone: string | null;
    streakDays: number;
    lastStreakDate: string | null;
    streakBonusUntil: Date | null;
    streakBonusPercent: number;
  },
  taskId: string,
  now: Date,
): Promise<StreakAward | null> {
  const questionCount = await tx.question.count({ where: { taskId } });
  if (!questionCount) return null;
  const solvedCount = await tx.question.count({
    where: { taskId, submissions: { some: { userId: user.id, isCorrect: true } } },
  });
  if (solvedCount !== questionCount) return null;
  const timezone = user.timezone ?? DEFAULT_TIMEZONE;
  const today = localDate(now, timezone);
  const existingDay = await tx.streakDay.findUnique({
    where: { userId_localDate: { userId: user.id, localDate: today } },
  });
  if (existingDay) return null;
  const previousTaskAward = await tx.streakDay.findFirst({ where: { userId: user.id, taskId } });
  if (previousTaskAward) return null;
  const streakDays = nextStreak(user.streakDays, user.lastStreakDate, today);
  await tx.streakDay.create({
    data: { userId: user.id, localDate: today, timezone, taskId, earnedAt: now },
  });
  const badgeId = streakDays === 7 ? 'streak_7' : streakDays === 30 ? 'streak_30' : null;
  let bonusPercent =
    user.streakBonusUntil && user.streakBonusUntil > now ? user.streakBonusPercent : 100;
  let bonusUntil =
    user.streakBonusUntil && user.streakBonusUntil > now ? user.streakBonusUntil : null;
  let badgeUnlocked: string | null = null;
  if (badgeId) {
    const badge = await tx.userBadge.createMany({
      data: [{ userId: user.id, badgeId, earnedAt: now }],
      skipDuplicates: true,
    });
    badgeUnlocked = badge.count ? badgeId : null;
    const milestonePercent = streakDays === 30 ? 150 : 120;
    if (milestonePercent >= bonusPercent) {
      bonusPercent = milestonePercent;
      bonusUntil = new Date(now.getTime() + (streakDays === 30 ? 48 : 24) * 60 * 60 * 1000);
    }
  }
  await tx.user.update({
    where: { id: user.id },
    data: {
      streakDays,
      lastStreakDate: today,
      streakBonusPercent: bonusPercent,
      streakBonusUntil: bonusUntil,
    },
  });
  return { streakDays, badgeUnlocked, bonusPercent, bonusUntil };
}

export async function sweepExpiredStreaks(now = new Date()) {
  const users = await prisma.user.findMany({
    where: { streakDays: { gt: 0 } },
    select: { id: true, timezone: true, lastStreakDate: true },
  });
  for (const user of users) {
    const timezone = user.timezone ?? DEFAULT_TIMEZONE;
    const today = localDate(now, timezone);
    if (user.lastStreakDate === today || user.lastStreakDate === priorDate(today)) continue;
    await prisma.user.updateMany({
      where: { id: user.id, lastStreakDate: user.lastStreakDate, streakDays: { gt: 0 } },
      data: { streakDays: 0 },
    });
  }
}

export function streakSummary(
  user: { streakDays: number; lastStreakDate?: string | null; timezone?: string | null },
  now = new Date(),
) {
  return visibleStreak(
    user.streakDays,
    user.lastStreakDate ?? null,
    now,
    user.timezone ?? DEFAULT_TIMEZONE,
  );
}
