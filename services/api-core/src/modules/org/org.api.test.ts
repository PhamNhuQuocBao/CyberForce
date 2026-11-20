import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { generateTokens } from '../../lib/security.js';

describe('CF-803 organization analytics', () => {
  const app = buildApp();
  const suffix = randomUUID();
  let rootId = '',
    adminAId = '',
    adminBId = '',
    orgAId = '',
    orgBId = '';
  let groupAId = '',
    groupBId = '',
    emptyGroupId = '',
    pathId = '',
    roomId = '';
  let rootToken = '',
    adminAToken = '',
    adminBToken = '',
    studentToken = '';
  const users: string[] = [];
  const call = (
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    url: string,
    token: string,
    payload?: Record<string, unknown>,
  ) =>
    app.inject({
      method,
      url: `/api/v1/org${url}`,
      headers: { authorization: `Bearer ${token}` },
      payload,
    });
  beforeAll(async () => {
    await app.ready();
    const [root, adminA, adminB] = await Promise.all([
      prisma.user.create({
        data: {
          username: `root-${suffix}`,
          email: `root-${suffix}@test.invalid`,
          role: 'superadmin',
        },
      }),
      prisma.user.create({
        data: {
          username: `admin-a-${suffix}`,
          email: `admin-a-${suffix}@test.invalid`,
          role: 'org_admin',
        },
      }),
      prisma.user.create({
        data: {
          username: `admin-b-${suffix}`,
          email: `admin-b-${suffix}@test.invalid`,
          role: 'org_admin',
        },
      }),
    ]);
    rootId = root.id;
    adminAId = adminA.id;
    adminBId = adminB.id;
    rootToken = generateTokens(root).accessToken;
    adminAToken = generateTokens(adminA).accessToken;
    adminBToken = generateTokens(adminB).accessToken;
    const a = await call('POST', '/organizations', rootToken, {
      name: 'Org A',
      slug: `a-${suffix}`,
    });
    const b = await call('POST', '/organizations', rootToken, {
      name: 'Org B',
      slug: `b-${suffix}`,
    });
    expect(a.statusCode).toBe(201);
    expect(b.statusCode).toBe(201);
    orgAId = a.json().data.id;
    orgBId = b.json().data.id;
    await prisma.orgMembership.createMany({
      data: [
        { organizationId: orgAId, userId: adminAId, role: 'admin' },
        { organizationId: orgBId, userId: adminBId, role: 'admin' },
      ],
    });
    groupAId = (
      await call('POST', `/organizations/${orgAId}/groups`, adminAToken, { name: 'SOC L1' })
    ).json().data.id;
    emptyGroupId = (
      await call('POST', `/organizations/${orgAId}/groups`, adminAToken, { name: 'New class' })
    ).json().data.id;
    groupBId = (
      await call('POST', `/organizations/${orgBId}/groups`, adminBToken, { name: 'Other team' })
    ).json().data.id;
    const created = await Promise.all(
      Array.from({ length: 50 }, (_, index) =>
        prisma.user.create({
          data: {
            username: `org-${index}-${suffix}`,
            email: `org-${index}-${suffix}@test.invalid`,
            ...(index === 0 && { certificateName: '=HYPERLINK("bad")' }),
          },
        }),
      ),
    );
    users.push(...created.map((user) => user.id));
    studentToken = generateTokens(created[0]).accessToken;
    await prisma.orgMembership.createMany({
      data: created.map((user, index) => ({
        organizationId: orgAId,
        userId: user.id,
        groupId: index < 20 ? groupAId : emptyGroupId,
        role: 'member' as const,
      })),
    });
    const path = await prisma.learningPath.create({
      data: {
        title: 'Cloud Foundation',
        slug: `cloud-${suffix}`,
        status: 'published',
        isPublished: true,
      },
    });
    pathId = path.id;
    const room = await prisma.room.create({
      data: {
        title: 'Cloud Lab',
        slug: `cloud-room-${suffix}`,
        pathId,
        targetTemplateSpec: {},
        status: 'published',
        publishedAt: new Date(),
        tasks: {
          create: {
            title: 'Cloud task',
            taskOrder: 1,
            contentMdx: '',
            skillTags: ['cloud_devsecops', 'network'],
            questions: { create: { questionText: 'Flag?', pointsReward: 100 } },
          },
        },
      },
      include: { tasks: true },
    });
    roomId = room.id;
    await prisma.skillAward.createMany({
      data: created.slice(0, 6).flatMap((user) => [
        {
          userId: user.id,
          taskId: room.tasks[0].id,
          skill: 'cloud_devsecops' as const,
          pointsEarned: 100,
        },
        { userId: user.id, taskId: room.tasks[0].id, skill: 'network' as const, pointsEarned: 100 },
      ]),
    });
  });
  afterAll(async () => {
    if (roomId) await prisma.room.delete({ where: { id: roomId } });
    if (pathId) await prisma.learningPath.delete({ where: { id: pathId } });
    if (orgAId) await prisma.organization.delete({ where: { id: orgAId } });
    if (orgBId) await prisma.organization.delete({ where: { id: orgBId } });
    await prisma.user.deleteMany({ where: { id: { in: [...users, rootId, adminAId, adminBId] } } });
    await app.close();
  });
  it('isolates each organization and validates group ownership', async () => {
    expect((await call('GET', `/organizations/${orgAId}/analytics`, adminBToken)).statusCode).toBe(
      403,
    );
    expect(
      (await call('GET', `/organizations/${orgAId}/analytics.csv`, adminBToken)).statusCode,
    ).toBe(403);
    expect(
      (await call('GET', `/organizations/${orgAId}/analytics.pdf`, studentToken)).statusCode,
    ).toBe(403);
    expect(
      (await call('GET', `/organizations/${orgAId}/analytics?groupId=${groupBId}`, adminAToken))
        .statusCode,
    ).toBe(404);
    expect(
      (
        await call('POST', `/organizations/${orgAId}/memberships`, adminAToken, {
          username: `org-0-${suffix}`,
          groupId: groupBId,
        })
      ).statusCode,
    ).toBe(400);
  });
  it('computes the full 50-member snapshot and group averages from real awards', async () => {
    const all = await call('GET', `/organizations/${orgAId}/analytics?limit=10`, adminAToken);
    expect(all.statusCode).toBe(200);
    expect(all.json().data).toMatchObject({
      memberCount: 50,
      totalPages: 5,
      availableExp: { cloud_devsecops: 100, network: 100, web: 0 },
      averages: { cloud_devsecops: 12, network: 12, web: 0 },
    });
    expect(all.json().data.members).toHaveLength(10);
    const group = await call(
      'GET',
      `/organizations/${orgAId}/analytics?groupId=${groupAId}`,
      adminAToken,
    );
    expect(group.json().data.memberCount).toBe(20);
    expect(group.json().data.averages.cloud_devsecops).toBe(30);
    expect(group.json().data.gaps[0].paths[0].title).toBe('Cloud Foundation');
    const empty = await call(
      'GET',
      `/organizations/${orgAId}/analytics?groupId=${emptyGroupId}`,
      adminAToken,
    );
    expect(empty.json().data).toMatchObject({
      memberCount: 30,
      hasActivity: false,
      averages: { cloud_devsecops: 0, network: 0 },
    });
    expect(empty.json().data.gaps).toEqual([]);
  });
  it('exports the same authorized scope as escaped CSV and printable PDF', async () => {
    const csv = await call(
      'GET',
      `/organizations/${orgAId}/analytics.csv?groupId=${groupAId}`,
      adminAToken,
    );
    expect(csv.statusCode).toBe(200);
    expect(csv.body).toContain("'=HYPERLINK");
    expect(csv.body).toContain('TEAM AVERAGE');
    expect(csv.body).not.toContain('org-49-');
    const pdf = await call(
      'GET',
      `/organizations/${orgAId}/analytics.pdf?groupId=${groupAId}`,
      adminAToken,
    );
    expect(pdf.statusCode).toBe(200);
    expect(pdf.rawPayload.subarray(0, 4).toString()).toBe('%PDF');
    expect(pdf.headers['content-type']).toContain('application/pdf');
  });
});
