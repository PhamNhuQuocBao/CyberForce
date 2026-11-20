import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import {
  listCreatorRooms,
  creatorRoomDetail,
  createCreatorRoom,
  updateCreatorRoom,
  saveCreatorTask,
  saveCreatorQuestion,
} from './creator.content.js';
import {
  uploadCreatorAttachment,
  downloadCreatorAttachment,
  removeCreatorAttachment,
} from './creator.storage.js';
import {
  creatorTestStatus,
  startCreatorTest,
  stopCreatorTest,
  checkCreatorFlag,
  submitCreatorReview,
  adminReviewQueue,
  decideCreatorReview,
  issueCreatorTerminalTicket,
} from './creator.test-session.js';
import { connectCreatorTerminal } from './creator.terminal.js';
import { prisma } from '../../lib/prisma.js';

const idParam = z.object({ id: z.uuid() });
const childParam = z.object({ id: z.uuid(), childId: z.uuid() });
const fileParam = z.object({ id: z.uuid(), fileId: z.uuid() });
const versioned = z.object({ version: z.iso.datetime(), data: z.unknown() }).strict();
const flagInput = z.object({ answer: z.string().min(1).max(4096) }).strict();

export const creatorRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', requireRole(['creator', 'instructor', 'org_admin', 'superadmin']));
  app.addContentTypeParser(
    'application/octet-stream',
    { parseAs: 'buffer', bodyLimit: 10 * 1024 * 1024 },
    (_request, body, done) => done(null, body),
  );

  app.get('/rooms', async (request) => ({
    success: true,
    data: await listCreatorRooms(request.user!.sub),
  }));
  app.get('/catalog', async () => ({
    success: true,
    data: await prisma.learningPath.findMany({
      where: { status: 'published', isPublished: true },
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        title: true,
        modules: {
          where: { status: 'published' },
          orderBy: { orderIndex: 'asc' },
          select: { id: true, title: true },
        },
      },
    }),
  }));
  app.post('/rooms', { bodyLimit: 524288 }, async (request, reply) => {
    const id = await createCreatorRoom(request.body, request.user!.sub);
    return reply
      .code(201)
      .send({ success: true, data: await creatorRoomDetail(id, request.user!.sub) });
  });
  app.get('/rooms/:id', async (request, reply) => {
    const { id } = idParam.parse(request.params);
    return reply
      .header('Cache-Control', 'private, no-store')
      .send({ success: true, data: await creatorRoomDetail(id, request.user!.sub) });
  });
  app.put('/rooms/:id', { bodyLimit: 524288 }, async (request) => {
    const { id } = idParam.parse(request.params);
    const { version, data } = versioned.parse(request.body);
    await updateCreatorRoom(id, request.user!.sub, version, data);
    return { success: true, data: await creatorRoomDetail(id, request.user!.sub) };
  });
  app.post('/rooms/:id/tasks', { bodyLimit: 524288 }, async (request) => {
    const { id } = idParam.parse(request.params);
    const taskId = await saveCreatorTask(id, null, request.user!.sub, request.body);
    return { success: true, data: await creatorRoomDetail(id, request.user!.sub), taskId };
  });
  app.put('/rooms/:id/tasks/:childId', { bodyLimit: 524288 }, async (request) => {
    const { id, childId } = childParam.parse(request.params);
    const { version, data } = versioned.parse(request.body);
    await saveCreatorTask(id, childId, request.user!.sub, data, version);
    return { success: true, data: await creatorRoomDetail(id, request.user!.sub) };
  });
  app.post('/rooms/:id/questions', async (request) => {
    const { id } = idParam.parse(request.params);
    const questionId = await saveCreatorQuestion(id, null, request.user!.sub, request.body);
    return { success: true, data: await creatorRoomDetail(id, request.user!.sub), questionId };
  });
  app.put('/rooms/:id/questions/:childId', async (request) => {
    const { id, childId } = childParam.parse(request.params);
    const { version, data } = versioned.parse(request.body);
    await saveCreatorQuestion(id, childId, request.user!.sub, data, version);
    return { success: true, data: await creatorRoomDetail(id, request.user!.sub) };
  });
  app.post('/rooms/:id/attachments', { bodyLimit: 10 * 1024 * 1024 }, async (request, reply) => {
    const { id } = idParam.parse(request.params);
    const { filename, mime } = z
      .object({ filename: z.string().min(1).max(255), mime: z.string().max(100) })
      .parse(request.query);
    const item = await uploadCreatorAttachment(
      id,
      request.user!.sub,
      filename,
      mime,
      request.body as Buffer,
    );
    return reply.code(201).send({ success: true, data: item });
  });
  app.get('/rooms/:id/attachments/:fileId', async (request, reply) => {
    const { id, fileId } = fileParam.parse(request.params);
    const { item, bytes } = await downloadCreatorAttachment(id, fileId, request.user!.sub);
    return reply
      .header('Content-Type', item.mimeType)
      .header('Content-Length', String(bytes.length))
      .header(
        'Content-Disposition',
        `attachment; filename="${item.filename.replace(/["\\\r\n]/g, '_')}"`,
      )
      .header('Cache-Control', 'private, no-store')
      .send(bytes);
  });
  app.delete('/rooms/:id/attachments/:fileId', async (request) => {
    const { id, fileId } = fileParam.parse(request.params);
    await removeCreatorAttachment(id, fileId, request.user!.sub);
    return { success: true };
  });
  app.get('/rooms/:id/test', async (request) => {
    const { id } = idParam.parse(request.params);
    return { success: true, data: await creatorTestStatus(id, request.user!.sub) };
  });
  app.post('/rooms/:id/test', async (request, reply) => {
    const { id } = idParam.parse(request.params);
    return reply
      .code(201)
      .send({ success: true, data: await startCreatorTest(id, request.user!.sub) });
  });
  app.delete('/rooms/:id/test', async (request) => {
    const { id } = idParam.parse(request.params);
    return { success: true, data: await stopCreatorTest(id, request.user!.sub) };
  });
  app.post('/rooms/:id/test/flags/:childId', async (request) => {
    const { id, childId } = childParam.parse(request.params);
    const { answer } = flagInput.parse(request.body);
    return { success: true, data: await checkCreatorFlag(id, childId, request.user!.sub, answer) };
  });
  app.post('/rooms/:id/test/terminal-ticket', async (request, reply) => {
    const { id } = idParam.parse(request.params);
    return reply.header('Cache-Control', 'private, no-store').send({
      success: true,
      data: await issueCreatorTerminalTicket(
        id,
        request.user!.sub,
        request.user!.jti,
        request.user!.exp,
      ),
    });
  });
  app.get('/rooms/:id/test/terminal', { websocket: true }, (socket, request) => {
    const { id } = idParam.parse(request.params);
    const ticket =
      String(request.headers['sec-websocket-protocol'] ?? '')
        .split(',')
        .map((part) => part.trim())
        .find((part) => /^[0-9a-f]{64}$/.test(part)) ?? '';
    connectCreatorTerminal(socket, request, id, ticket);
  });
  app.post('/rooms/:id/submit-review', async (request) => {
    const { id } = idParam.parse(request.params);
    return { success: true, data: await submitCreatorReview(id, request.user!.sub) };
  });
};

export const creatorReviewRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', requireRole(['org_admin', 'superadmin']));
  app.get('/', async () => ({ success: true, data: await adminReviewQueue() }));
  app.post('/:id/decision', async (request) => {
    const { id } = idParam.parse(request.params);
    const { decision, feedback } = z
      .object({
        decision: z.enum(['approved', 'changes_requested', 'rejected']),
        feedback: z.string().max(5000).optional(),
      })
      .strict()
      .parse(request.body);
    return {
      success: true,
      data: await decideCreatorReview(id, request.user!.sub, decision, feedback),
    };
  });
};
