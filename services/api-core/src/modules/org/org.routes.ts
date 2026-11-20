import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate.js';
import {
  addMembership,
  createGroup,
  createOrganization,
  deleteGroup,
  listGroups,
  listManagedOrganizations,
  listMemberships,
  moveMembership,
  removeMembership,
  renameGroup,
} from './org.access.js';
import { orgAnalytics } from './org.analytics.js';
import { analyticsCsv, analyticsPdf } from './org.report.js';

const id = z.object({ id: z.uuid() });
const groupId = z.object({ id: z.uuid(), groupId: z.uuid() });
const memberId = z.object({ id: z.uuid(), userId: z.uuid() });
const name = z.object({ name: z.string().trim().min(1).max(150) }).strict();
const query = z.object({
  groupId: z.uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const orgRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);
  const actor = (request: { user?: { sub: string; role: string } }) => ({
    id: request.user!.sub,
    role: request.user!.role,
  });
  app.get('/organizations', async (request) => ({
    success: true,
    data: await listManagedOrganizations(actor(request)),
  }));
  app.post('/organizations', async (request, reply) => {
    const data = name
      .extend({
        slug: z
          .string()
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
          .max(100),
      })
      .parse(request.body);
    return reply
      .code(201)
      .send({
        success: true,
        data: await createOrganization(actor(request), data.name, data.slug),
      });
  });
  app.get('/organizations/:id/groups', async (request) => {
    const { id: orgId } = id.parse(request.params);
    return { success: true, data: await listGroups(actor(request), orgId) };
  });
  app.post('/organizations/:id/groups', async (request, reply) => {
    const { id: orgId } = id.parse(request.params);
    const data = name.parse(request.body);
    return reply
      .code(201)
      .send({ success: true, data: await createGroup(actor(request), orgId, data.name) });
  });
  app.patch('/organizations/:id/groups/:groupId', async (request) => {
    const params = groupId.parse(request.params);
    const data = name.parse(request.body);
    return {
      success: true,
      data: await renameGroup(actor(request), params.id, params.groupId, data.name),
    };
  });
  app.delete('/organizations/:id/groups/:groupId', async (request) => {
    const params = groupId.parse(request.params);
    await deleteGroup(actor(request), params.id, params.groupId);
    return { success: true };
  });
  app.get('/organizations/:id/memberships', async (request) => {
    const { id: orgId } = id.parse(request.params);
    return { success: true, data: await listMemberships(actor(request), orgId) };
  });
  app.post('/organizations/:id/memberships', async (request, reply) => {
    const { id: orgId } = id.parse(request.params);
    const data = z
      .object({
        username: z.string().min(3).max(50),
        groupId: z.uuid().nullable().default(null),
        role: z.enum(['admin', 'member']).default('member'),
      })
      .strict()
      .parse(request.body);
    return reply
      .code(201)
      .send({
        success: true,
        data: await addMembership(actor(request), orgId, data.username, data.groupId, data.role),
      });
  });
  app.patch('/organizations/:id/memberships/:userId', async (request) => {
    const params = memberId.parse(request.params);
    const data = z.object({ groupId: z.uuid().nullable() }).strict().parse(request.body);
    await moveMembership(actor(request), params.id, params.userId, data.groupId);
    return { success: true };
  });
  app.delete('/organizations/:id/memberships/:userId', async (request) => {
    const params = memberId.parse(request.params);
    await removeMembership(actor(request), params.id, params.userId);
    return { success: true };
  });
  app.get('/organizations/:id/analytics', async (request, reply) => {
    const { id: orgId } = id.parse(request.params);
    const options = query.parse(request.query);
    return reply.header('Cache-Control', 'private, no-store').send({
      success: true,
      data: await orgAnalytics(actor(request), orgId, options),
    });
  });
  app.get('/organizations/:id/analytics.csv', async (request, reply) => {
    const { id: orgId } = id.parse(request.params);
    const { groupId: selectedGroup } = query.parse(request.query);
    const snapshot = await orgAnalytics(actor(request), orgId, {
      groupId: selectedGroup,
      all: true,
    });
    return reply
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', 'attachment; filename="skill-gap.csv"')
      .header('Cache-Control', 'private, no-store')
      .send(analyticsCsv(snapshot));
  });
  app.get('/organizations/:id/analytics.pdf', async (request, reply) => {
    const { id: orgId } = id.parse(request.params);
    const { groupId: selectedGroup } = query.parse(request.query);
    const snapshot = await orgAnalytics(actor(request), orgId, {
      groupId: selectedGroup,
      all: true,
    });
    return reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', 'attachment; filename="skill-gap.pdf"')
      .header('Cache-Control', 'private, no-store')
      .send(await analyticsPdf(snapshot));
  });
};
