import { prisma } from '../../lib/prisma.js';
import { AuthError } from '../auth/auth.service.js';

export async function getRoom(slug: string, userId: string) {
  const room = await prisma.room.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      difficulty: true,
      roomType: true,
      estimatedMinutes: true,
      pointsReward: true,
      isFree: true,
      publishedAt: true,
      targetTemplateSpec: true,
      learningPath: { select: { title: true, slug: true, isPublished: true } },
      prerequisiteRoom: {
        select: {
          id: true,
          slug: true,
          title: true,
          publishedAt: true,
          tasks: { select: { questions: { select: { id: true } } } },
        },
      },
      tasks: {
        orderBy: [{ taskOrder: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          title: true,
          taskOrder: true,
          contentMdx: true,
          questions: {
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
            select: {
              id: true,
              questionText: true,
              pointsReward: true,
              submissions: { where: { userId, isCorrect: true }, take: 1, select: { id: true } },
            },
          },
        },
      },
    },
  });
  if (
    !room ||
    !room.publishedAt ||
    room.publishedAt > new Date() ||
    (room.learningPath && !room.learningPath.isPublished)
  ) {
    throw new AuthError(404, 'Không tìm thấy phòng học đã xuất bản.', 'ROOM_NOT_FOUND');
  }
  if (!room.isFree) {
    throw new AuthError(
      403,
      'Phòng này chưa hỗ trợ quyền truy cập trả phí.',
      'ROOM_ACCESS_REQUIRED',
    );
  }
  if (room.prerequisiteRoom) {
    const prerequisite = room.prerequisiteRoom;
    const ids = prerequisite.tasks.flatMap((task) => task.questions.map((question) => question.id));
    const solved = await prisma.submission.findMany({
      where: { userId, isCorrect: true, questionId: { in: ids } },
      distinct: ['questionId'],
      select: { questionId: true },
    });
    if (
      !prerequisite.publishedAt ||
      prerequisite.publishedAt > new Date() ||
      solved.length < ids.length
    ) {
      throw new AuthError(
        403,
        'Hoàn thành phòng tiên quyết trước khi mở phòng này.',
        'PREREQUISITE_REQUIRED',
      );
    }
  }
  const tasks = room.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    order: task.taskOrder,
    content: task.contentMdx,
    questions: task.questions.map((question) => ({
      id: question.id,
      text: question.questionText,
      pointsReward: question.pointsReward,
      isCompleted: question.submissions.length > 0,
    })),
  }));
  const questions = tasks.flatMap((task) => task.questions);
  return {
    id: room.id,
    slug: room.slug,
    title: room.title,
    description: room.description,
    difficulty: room.difficulty,
    roomType: room.roomType,
    estimatedMinutes: room.estimatedMinutes,
    pointsReward: room.pointsReward,
    hasLab: Boolean(
      room.targetTemplateSpec &&
      typeof room.targetTemplateSpec === 'object' &&
      !Array.isArray(room.targetTemplateSpec) &&
      Object.keys(room.targetTemplateSpec).length,
    ),
    path: room.learningPath
      ? { title: room.learningPath.title, slug: room.learningPath.slug }
      : null,
    totalQuestions: questions.length,
    completedQuestions: questions.filter((question) => question.isCompleted).length,
    tasks,
  };
}
