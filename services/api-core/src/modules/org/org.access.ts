import { prisma } from '../../lib/prisma.js';
import { AuthError } from '../auth/auth.service.js';

export type OrgActor = { id: string; role: string };
const forbidden = () =>
  new AuthError(403, 'Bạn không có quyền quản lý tổ chức này.', 'ORG_FORBIDDEN');
const invalid = (message: string) => new AuthError(400, message, 'ORG_INVALID');

export async function requireOrgManager(actor: OrgActor, organizationId: string) {
  if (actor.role === 'superadmin') {
    const org = await prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw forbidden();
    return org;
  }
  if (actor.role !== 'org_admin') throw forbidden();
  const membership = await prisma.orgMembership.findUnique({
    where: { organizationId_userId: { organizationId, userId: actor.id } },
    include: { organization: true },
  });
  if (!membership || membership.role !== 'admin') throw forbidden();
  return membership.organization;
}

export async function listManagedOrganizations(actor: OrgActor) {
  if (actor.role === 'superadmin')
    return prisma.organization.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    });
  if (actor.role !== 'org_admin') throw forbidden();
  const rows = await prisma.orgMembership.findMany({
    where: { userId: actor.id, role: 'admin' },
    include: { organization: { select: { id: true, name: true, slug: true } } },
  });
  return rows.map((row) => row.organization);
}

export async function createOrganization(actor: OrgActor, name: string, slug: string) {
  if (actor.role !== 'superadmin') throw forbidden();
  return prisma.organization.create({ data: { name, slug } });
}

export async function listGroups(actor: OrgActor, organizationId: string) {
  await requireOrgManager(actor, organizationId);
  return prisma.orgGroup.findMany({
    where: { organizationId },
    orderBy: { name: 'asc' },
    include: { _count: { select: { memberships: true } } },
  });
}

export async function createGroup(actor: OrgActor, organizationId: string, name: string) {
  await requireOrgManager(actor, organizationId);
  return prisma.orgGroup.create({ data: { organizationId, name } });
}

export async function renameGroup(
  actor: OrgActor,
  organizationId: string,
  groupId: string,
  name: string,
) {
  await requireOrgManager(actor, organizationId);
  const result = await prisma.orgGroup.updateMany({
    where: { id: groupId, organizationId },
    data: { name },
  });
  if (!result.count) throw invalid('Nhóm không thuộc tổ chức này.');
  return prisma.orgGroup.findUniqueOrThrow({ where: { id: groupId } });
}

export async function deleteGroup(actor: OrgActor, organizationId: string, groupId: string) {
  await requireOrgManager(actor, organizationId);
  const result = await prisma.orgGroup.deleteMany({ where: { id: groupId, organizationId } });
  if (!result.count) throw invalid('Nhóm không thuộc tổ chức này.');
}

async function validateGroup(organizationId: string, groupId?: string | null) {
  if (!groupId) return;
  const group = await prisma.orgGroup.findFirst({ where: { id: groupId, organizationId } });
  if (!group) throw invalid('Nhóm không thuộc tổ chức này.');
}

export async function listMemberships(actor: OrgActor, organizationId: string) {
  await requireOrgManager(actor, organizationId);
  return prisma.orgMembership.findMany({
    where: { organizationId },
    orderBy: { user: { username: 'asc' } },
    select: {
      userId: true,
      groupId: true,
      role: true,
      joinedAt: true,
      user: { select: { username: true, certificateName: true } },
    },
  });
}

export async function addMembership(
  actor: OrgActor,
  organizationId: string,
  username: string,
  groupId: string | null,
  role: 'admin' | 'member',
) {
  await requireOrgManager(actor, organizationId);
  await validateGroup(organizationId, groupId);
  if (role === 'admin' && actor.role !== 'superadmin') throw forbidden();
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw invalid('Tài khoản chưa tồn tại.');
  if (role === 'admin' && !['org_admin', 'superadmin'].includes(user.role))
    throw invalid('Tài khoản cần vai trò Org Admin trước khi quản lý tổ chức.');
  return prisma.orgMembership.create({
    data: { organizationId, userId: user.id, groupId, role },
    select: { userId: true, groupId: true, role: true },
  });
}

export async function moveMembership(
  actor: OrgActor,
  organizationId: string,
  userId: string,
  groupId: string | null,
) {
  await requireOrgManager(actor, organizationId);
  await validateGroup(organizationId, groupId);
  const result = await prisma.orgMembership.updateMany({
    where: { organizationId, userId },
    data: { groupId },
  });
  if (!result.count) throw invalid('Thành viên không thuộc tổ chức này.');
}

export async function removeMembership(actor: OrgActor, organizationId: string, userId: string) {
  await requireOrgManager(actor, organizationId);
  const current = await prisma.orgMembership.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });
  if (!current) throw invalid('Thành viên không thuộc tổ chức này.');
  if (current.role === 'admin' && actor.role !== 'superadmin') throw forbidden();
  await prisma.orgMembership.delete({ where: { id: current.id } });
}
