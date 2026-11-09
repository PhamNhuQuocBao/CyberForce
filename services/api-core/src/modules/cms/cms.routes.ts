import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import {
  cmsKind,
  cmsId,
  cmsListQuery,
  updateInput,
  statusInput,
  deleteInput,
} from './cms.schemas.js';
import {
  listCms,
  getCms,
  createCms,
  updateCms,
  changeCmsStatus,
  deleteCms,
} from './cms.service.js';

export const cmsRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', requireRole(['superadmin', 'org_admin']));

  app.get('/:kind', async (request) => {
    const { kind } = z.object({ kind: cmsKind }).parse(request.params);
    const query = cmsListQuery.parse(request.query);
    return { success: true, data: await listCms(kind, query) };
  });
  app.get('/:kind/:id', async (request) => {
    const { kind, id } = cmsId.parse(request.params);
    return { success: true, data: await getCms(kind, id) };
  });
  app.post('/:kind', { bodyLimit: 524288 }, async (request, reply) => {
    const { kind } = z.object({ kind: cmsKind }).parse(request.params);
    const id = await createCms(kind, request.body, request.user!.sub);
    return reply.code(201).send({ success: true, data: await getCms(kind, id) });
  });
  app.put('/:kind/:id', { bodyLimit: 524288 }, async (request) => {
    const { kind, id } = cmsId.parse(request.params);
    const { version, data } = updateInput.parse(request.body);
    await updateCms(kind, id, version, data, request.user!.sub);
    return { success: true, data: await getCms(kind, id) };
  });
  app.patch('/:kind/:id/status', async (request) => {
    const { kind, id } = cmsId.parse(request.params);
    const { version, status } = statusInput.parse(request.body);
    await changeCmsStatus(kind, id, version, status, request.user!.sub);
    return { success: true, data: await getCms(kind, id) };
  });
  app.delete('/:kind/:id', async (request) => {
    const { kind, id } = cmsId.parse(request.params);
    const { version } = deleteInput.parse(request.body);
    await deleteCms(kind, id, version, request.user!.sub);
    return { success: true };
  });
};
