import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AuthError } from '../auth/auth.service.js';
import { getRoom } from '../rooms/rooms.service.js';
import { hintCost, parseHints, remainingReward } from './hints.policy.js';

async function accessibleQuestion(questionId: string, userId: string) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      pointsReward: true,
      hintTiers: true,
      task: { select: { room: { select: { slug: true, roomType: true } } } },
    },
  });
  if (!question) throw new AuthError(404, 'Không tìm thấy câu hỏi.', 'QUESTION_NOT_FOUND');
  await getRoom(question.task.room.slug, userId);
  if (question.task.room.roomType === 'exam')
    throw new AuthError(403, 'Không có gợi ý trong kỳ thi.', 'HINTS_NOT_ALLOWED');
  try {
    return { ...question, hints: parseHints(question.hintTiers) };
  } catch {
    throw new AuthError(503, 'Gợi ý chưa sẵn sàng. Vui lòng thử lại sau.', 'HINTS_UNAVAILABLE');
  }
}

type HintQuestion = Awaited<ReturnType<typeof accessibleQuestion>>;
async function hintState(tx: Prisma.TransactionClient, question: HintQuestion, userId: string) {
  const unlocks = await tx.hintUnlock.findMany({ where: { userId, questionId: question.id } });
  const completed = await tx.submission.findFirst({
    where: { userId, questionId: question.id, isCorrect: true },
    select: { pointsEarned: true },
  });
  const remaining = remainingReward(question.pointsReward, unlocks);
  return {
    questionId: question.id,
    isCompleted: Boolean(completed),
    pointsAvailable: completed ? 0 : remaining,
    hints: question.hints.map((hint) => {
      const unlocked = unlocks.some((unlock) => unlock.tier === hint.tier);
      const available =
        Boolean(completed) ||
        question.hints
          .filter((previous) => previous.tier < hint.tier)
          .every((previous) => unlocks.some((unlock) => unlock.tier === previous.tier));
      return {
        tier: hint.tier,
        unlocked,
        available,
        cost: completed || unlocked ? 0 : hintCost(hint.tier, question.pointsReward, remaining),
        ...(unlocked ? { content: hint.content } : {}),
      };
    }),
  };
}

export async function getHints(questionId: string, userId: string) {
  const question = await accessibleQuestion(questionId, userId);
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId}::uuid FOR UPDATE`;
    return hintState(tx, question, userId);
  });
}

export async function unlockHint(
  questionId: string,
  userId: string,
  tier: number,
  expectedCost: number,
) {
  const question = await accessibleQuestion(questionId, userId);
  return prisma.$transaction(async (tx) => {
    // Shares the submission lock: the reveal and reward cannot race each other.
    await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId}::uuid FOR UPDATE`;
    const state = await hintState(tx, question, userId);
    const hint = state.hints.find((item) => item.tier === tier);
    if (!hint) throw new AuthError(404, 'Chưa có nội dung gợi ý này.', 'HINT_NOT_FOUND');
    if (hint.unlocked) return state;
    if (!hint.available)
      throw new AuthError(409, 'Mở các gợi ý trước đó trước khi tiếp tục.', 'HINT_TIER_LOCKED');
    if (hint.cost !== expectedCost)
      throw new AuthError(
        409,
        'Chi phí đã thay đổi. Hãy tải lại gợi ý và xác nhận mức mới.',
        'HINT_COST_CHANGED',
      );
    await tx.hintUnlock.create({
      data: { userId, questionId, tier, pointsDeducted: hint.cost },
    });
    return hintState(tx, question, userId);
  });
}
