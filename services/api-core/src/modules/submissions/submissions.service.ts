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
      const completed = await tx.submission.findFirst({
        where: { userId, questionId: question.id, isCorrect: true },
        select: { id: true },
      });
      let pointsEarned = 0;
      let retryAfterSeconds = 0;
      let isCorrect = Boolean(completed);
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
          pointsEarned = remainingReward(question.pointsReward, unlocks);
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
        if (pointsEarned)
          await tx.user.update({
            where: { id: userId },
            data: { expPoints: { increment: pointsEarned } },
          });
      }
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { expPoints: true },
      });
      return {
        questionId: question.id,
        isCorrect,
        alreadyCompleted: Boolean(completed),
        pointsEarned,
        totalExp: user.expPoints,
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
