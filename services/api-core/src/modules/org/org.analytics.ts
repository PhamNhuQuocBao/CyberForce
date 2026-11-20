import { prisma } from '../../lib/prisma.js';
import { AuthError } from '../auth/auth.service.js';
import { emptySkills, skillAxes, type SkillAxisKey } from '../skills/skill.policy.js';
import { requireOrgManager, type OrgActor } from './org.access.js';

const round = (value: number) => Math.round(value * 10) / 10;
const proficiency = (earned: number, available: number) =>
  available > 0 ? round(Math.min(100, (earned / available) * 100)) : 0;

export async function orgAnalytics(
  actor: OrgActor,
  organizationId: string,
  options: { groupId?: string; page?: number; limit?: number; all?: boolean } = {},
) {
  const organization = await requireOrgManager(actor, organizationId);
  if (options.groupId) {
    const group = await prisma.orgGroup.findFirst({
      where: { id: options.groupId, organizationId },
      select: { id: true },
    });
    if (!group)
      throw new AuthError(404, 'Không tìm thấy nhóm trong tổ chức.', 'ORG_GROUP_NOT_FOUND');
  }
  const memberships = await prisma.orgMembership.findMany({
    where: { organizationId, role: 'member', ...(options.groupId && { groupId: options.groupId }) },
    orderBy: { user: { username: 'asc' } },
    select: {
      userId: true,
      groupId: true,
      user: { select: { username: true, certificateName: true } },
      group: { select: { name: true } },
    },
  });
  const userIds = memberships.map((item) => item.userId);
  const [awards, tasks, groups] = await Promise.all([
    userIds.length
      ? prisma.skillAward.groupBy({
          by: ['userId', 'skill'],
          where: { userId: { in: userIds } },
          _sum: { pointsEarned: true },
        })
      : Promise.resolve([]),
    prisma.task.findMany({
      where: {
        status: 'published',
        room: {
          status: 'published',
          learningPath: { status: 'published', isPublished: true },
        },
      },
      select: {
        skillTags: true,
        questions: { where: { status: 'published' }, select: { pointsReward: true } },
        room: { select: { learningPath: { select: { id: true, title: true, slug: true } } } },
      },
    }),
    prisma.orgGroup.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);
  const availableExp = emptySkills();
  const pathSkills = new Map<
    string,
    { id: string; title: string; slug: string; skills: Set<SkillAxisKey> }
  >();
  for (const task of tasks) {
    const points = task.questions.reduce((sum, question) => sum + question.pointsReward, 0);
    if (!points) continue;
    for (const skill of task.skillTags) availableExp[skill] += points;
    const path = task.room.learningPath;
    if (path && task.skillTags.length) {
      const entry = pathSkills.get(path.id) ?? { ...path, skills: new Set<SkillAxisKey>() };
      task.skillTags.forEach((skill) => entry.skills.add(skill));
      pathSkills.set(path.id, entry);
    }
  }
  const expByUser = new Map<string, ReturnType<typeof emptySkills>>();
  for (const award of awards) {
    const values = expByUser.get(award.userId) ?? emptySkills();
    values[award.skill] = award._sum.pointsEarned ?? 0;
    expByUser.set(award.userId, values);
  }
  const members = memberships.map((membership) => {
    const skillExp = expByUser.get(membership.userId) ?? emptySkills();
    const scores = emptySkills();
    for (const axis of skillAxes) scores[axis] = proficiency(skillExp[axis], availableExp[axis]);
    return {
      userId: membership.userId,
      username: membership.user.username,
      displayName: membership.user.certificateName ?? membership.user.username,
      groupId: membership.groupId,
      groupName: membership.group?.name ?? null,
      skillExp,
      scores,
      overall: round(skillAxes.reduce((sum, axis) => sum + scores[axis], 0) / skillAxes.length),
    };
  });
  const averages = emptySkills();
  const belowBenchmark = emptySkills();
  for (const axis of skillAxes) {
    averages[axis] = members.length
      ? round(members.reduce((sum, member) => sum + member.scores[axis], 0) / members.length)
      : 0;
    belowBenchmark[axis] = members.length
      ? round((members.filter((member) => member.scores[axis] < 75).length / members.length) * 100)
      : 0;
  }
  const gaps = skillAxes
    .filter(
      (axis) =>
        availableExp[axis] > 0 &&
        members.length > 0 &&
        awards.length > 0 &&
        (averages[axis] < 40 || belowBenchmark[axis] >= 70),
    )
    .map((axis) => ({
      skill: axis,
      average: averages[axis],
      belowBenchmarkPercent: belowBenchmark[axis],
      paths: [...pathSkills.values()]
        .filter((path) => path.skills.has(axis))
        .slice(0, 3)
        .map(({ id, title, slug }) => ({ id, title, slug })),
    }))
    .sort((a, b) => a.average - b.average);
  const page = options.page ?? 1;
  const limit = options.limit ?? 50;
  return {
    organization: { id: organization.id, name: organization.name, slug: organization.slug },
    selectedGroupId: options.groupId ?? null,
    groups,
    memberCount: members.length,
    hasActivity: awards.length > 0,
    availableExp,
    averages,
    belowBenchmark,
    gaps,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(members.length / limit)),
    members: options.all ? members : members.slice((page - 1) * limit, page * limit),
    generatedAt: new Date().toISOString(),
  };
}
