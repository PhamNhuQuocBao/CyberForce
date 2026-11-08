import type { Prisma } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { completeTaskForStreak } from './streak.service.js';

const user = {
  id: 'e8cd568d-d617-434b-a261-b854426dc7df',
  timezone: 'Asia/Ho_Chi_Minh',
  streakDays: 6,
  lastStreakDate: '2026-11-07',
  streakBonusUntil: null,
  streakBonusPercent: 100,
};
function transaction(
  solved: number,
  total = 2,
  existingDay: object | null = null,
  previousTaskAward: object | null = null,
) {
  const tx = {
    question: { count: vi.fn().mockResolvedValueOnce(total).mockResolvedValueOnce(solved) },
    streakDay: {
      findUnique: vi.fn().mockResolvedValue(existingDay),
      findFirst: vi.fn().mockResolvedValue(previousTaskAward),
      create: vi.fn().mockResolvedValue({}),
    },
    userBadge: { createMany: vi.fn().mockResolvedValue({ count: 1 }) },
    user: { update: vi.fn().mockResolvedValue({}) },
  };
  return tx;
}

describe('task completion awards', () => {
  const taskId = '8c379e1c-aa55-4e41-b91a-45720c29d08e';
  const now = new Date('2026-11-08T15:30:00Z');
  it('waits for every question before awarding a streak day', async () => {
    const tx = transaction(1);
    expect(
      await completeTaskForStreak(tx as unknown as Prisma.TransactionClient, user, taskId, now),
    ).toBeNull();
    expect(tx.streakDay.create).not.toHaveBeenCalled();
  });
  it('awards day seven once and starts a 24-hour bonus after completion', async () => {
    const tx = transaction(2);
    const award = await completeTaskForStreak(
      tx as unknown as Prisma.TransactionClient,
      user,
      taskId,
      now,
    );
    expect(award).toMatchObject({ streakDays: 7, badgeUnlocked: 'streak_7', bonusPercent: 120 });
    expect(award?.bonusUntil?.toISOString()).toBe('2026-11-09T15:30:00.000Z');
    expect(tx.streakDay.create).toHaveBeenCalledOnce();
    expect(tx.userBadge.createMany).toHaveBeenCalledOnce();
  });
  it('does not award the same calendar day or a previously awarded Task again', async () => {
    const today = transaction(2, 2, {});
    expect(
      await completeTaskForStreak(today as unknown as Prisma.TransactionClient, user, taskId, now),
    ).toBeNull();
    const task = transaction(2, 2, null, {});
    expect(
      await completeTaskForStreak(task as unknown as Prisma.TransactionClient, user, taskId, now),
    ).toBeNull();
  });
  it('awards the 30-day tier without stacking multipliers', async () => {
    const tx = transaction(2);
    const award = await completeTaskForStreak(
      tx as unknown as Prisma.TransactionClient,
      {
        ...user,
        streakDays: 29,
        streakBonusPercent: 120,
        streakBonusUntil: new Date('2026-11-09T00:00:00Z'),
      },
      taskId,
      now,
    );
    expect(award).toMatchObject({ streakDays: 30, badgeUnlocked: 'streak_30', bonusPercent: 150 });
    expect(award?.bonusUntil?.toISOString()).toBe('2026-11-10T15:30:00.000Z');
  });
});
