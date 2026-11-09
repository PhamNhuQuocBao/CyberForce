import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { AuthError } from '../auth/auth.service.js';
import { getRoom } from '../rooms/rooms.service.js';
import {
  FlagConfigurationError,
  FlagValidatorService,
  requirePlatformMasterKey,
} from './flag-validator.service.js';
import { submissionLimit, submissionLocked } from './submission-limit.js';
import { remainingReward } from '../hints/hints.policy.js';
import { boostedPoints } from '../streak/streak.policy.js';
import { completeTaskForStreak, streakSummary } from '../streak/streak.service.js';
import { highestRank, rankIndex, rankTiers } from '../ranks/rank.policy.js';

const validator = new FlagValidatorService();
type SubmitInput = { questionId: string; answer: string; labInstanceId?: string };

async function validateAnswer(
  tx: Prisma.TransactionClient,
  question: { flagType: string; answerHash: string | null; flagPattern: string | null },
  context: SubmitInput & { userId: string; roomId: string },
) {
  if (question.flagType === 'dynamic_hmac') {
    const instance = context.labInstanceId
      ? await tx.labInstance.findFirst({
          where: {
            id: context.labInstanceId,
            userId: context.userId,
            roomId: context.roomId,
            status: 'running',
            expiresAt: { gt: new Date() },
          },
          select: { dynamicSalt: true },
        })
      : null;
    if (!instance)
      throw new AuthError(
        409,
        'Cần phiên lab đang chạy của bạn trong phòng này.',
        'LAB_SESSION_REQUIRED',
      );
    const key = requirePlatformMasterKey(env.PLATFORM_MASTER_KEY);
    return validator.validate(context.answer, {
      flagType: 'dynamic_hmac',
      userId: context.userId,
      roomId: context.roomId,
      instanceSalt: instance.dynamicSalt,
      masterKey: key,
    });
  }
  return question.flagType === 'static'
    ? validator.validate(context.answer, { flagType: 'static', answerHash: question.answerHash })
    : validator.validate(context.answer, { flagType: 'regex', flagPattern: question.flagPattern });
}

export async function submitAnswer(taskId: string, userId: string, input: SubmitInput) {
  const question = await prisma.question.findFirst({
    where: { id: input.questionId, taskId },
    include: { task: { select: { roomId: true, room: { select: { slug: true } } } } },
  });
  if (!question)
    throw new AuthError(404, 'Không tìm thấy câu hỏi trong nhiệm vụ.', 'QUESTION_NOT_FOUND');
  await getRoom(question.task.room.slug, userId);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Serialize rewards for this user so concurrent retries cannot award EXP twice.
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId}::uuid FOR UPDATE`;
      const currentUser = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          id: true,
          timezone: true,
          streakDays: true,
          lastStreakDate: true,
          streakBonusUntil: true,
          streakBonusPercent: true,
          expPoints: true,
          rankTier: true,
        },
      });
      const now = new Date();
      const completed = await tx.submission.findFirst({
        where: { userId, questionId: question.id, isCorrect: true },
        select: { id: true },
      });
      let pointsEarned = 0;
      let retryAfterSeconds = 0;
      let isCorrect = Boolean(completed);
      let badgeUnlocked: string | null = null;
      let rankUp: { previousRank: string; newRank: string; badgeIds: string[] } | null = null;
      if (!completed) {
        const lockedFor = await submissionLimit(userId, question.id, 'check');
        if (lockedFor) throw submissionLocked(lockedFor);
        isCorrect = await validateAnswer(tx, question, {
          ...input,
          userId,
          roomId: question.task.roomId,
        });
        if (isCorrect) {
          const unlocks = await tx.hintUnlock.findMany({
            where: { userId, questionId: question.id },
            select: { pointsDeducted: true },
          });
          const basePoints = remainingReward(question.pointsReward, unlocks);
          const activePercent =
            currentUser.streakBonusUntil && currentUser.streakBonusUntil > now
              ? currentUser.streakBonusPercent
              : 100;
          pointsEarned = boostedPoints(basePoints, activePercent);
        }
        if (!isCorrect) retryAfterSeconds = await submissionLimit(userId, question.id, 'incorrect');
        await tx.submission.create({
          data: {
            userId,
            questionId: question.id,
            submittedValue: input.answer,
            isCorrect,
            pointsEarned,
          },
        });
        if (isCorrect) {
          const award = await completeTaskForStreak(tx, currentUser, taskId, now);
          badgeUnlocked = award?.badgeUnlocked ?? null;
        }
        if (pointsEarned) {
          const earnedRank = highestRank(
            currentUser.rankTier,
            currentUser.expPoints + pointsEarned,
          );
          const previousIndex = rankIndex(currentUser.rankTier);
          const earnedIndex = rankIndex(earnedRank.name);
          await tx.user.update({
            where: { id: userId },
            data: {
              expPoints: { increment: pointsEarned },
              ...(earnedIndex > previousIndex && { rankTier: earnedRank.name }),
            },
          });
          if (earnedIndex > previousIndex) {
            const badgeIds = rankTiers
              .slice(Math.max(1, previousIndex + 1), earnedIndex + 1)
              .map((tier) => tier.badgeId)
              .filter((id): id is NonNullable<typeof id> => id !== null);
            await tx.userBadge.createMany({
              data: badgeIds.map((badgeId) => ({ userId, badgeId, earnedAt: now })),
              skipDuplicates: true,
            });
            rankUp = { previousRank: currentUser.rankTier, newRank: earnedRank.name, badgeIds };
          }
        }
      }
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          expPoints: true,
          rankTier: true,
          streakDays: true,
          lastStreakDate: true,
          timezone: true,
          streakBonusUntil: true,
          streakBonusPercent: true,
        },
      });
      return {
        questionId: question.id,
        isCorrect,
        alreadyCompleted: Boolean(completed),
        pointsEarned,
        totalExp: user.expPoints,
        rankTier: user.rankTier,
        rankUp,
        streakDays: streakSummary(user, now),
        lastStreakDate: user.lastStreakDate,
        badgeUnlocked,
        bonusPercent:
          user.streakBonusUntil && user.streakBonusUntil > now ? user.streakBonusPercent : 100,
        bonusUntil:
          user.streakBonusUntil && user.streakBonusUntil > now ? user.streakBonusUntil : null,
        retryAfterSeconds,
      };
    });
    if (result.retryAfterSeconds) throw submissionLocked(result.retryAfterSeconds);
    const { retryAfterSeconds: _, ...response } = result;
    return response;
  } catch (error) {
    if (error instanceof FlagConfigurationError)
      throw new AuthError(
        503,
        'Câu hỏi chưa sẵn sàng để chấm. Vui lòng thử lại sau.',
        'FLAG_UNAVAILABLE',
      );
    throw error;
  }
}
