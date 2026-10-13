import { randomBytes, randomUUID } from 'node:crypto';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redis.js';
import { AuthError } from '../auth/auth.service.js';
import { getRoom } from './rooms.service.js';

const activeStatuses = ['provisioning', 'running', 'terminating'] as const;
const localToken = 'cyberforce_local_orchestrator_token_2026';
const releaseLockScript = `if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end`;

async function withUserLock<T>(userId: string, action: () => Promise<T>) {
  const key = `lab:lock:${userId}`;
  const token = randomUUID();
  const acquired = await redis.set(key, token, 'PX', 30000, 'NX');
  if (acquired !== 'OK')
    throw new AuthError(
      409,
      'Một thao tác với máy lab của bạn đang chạy.',
      'LAB_OPERATION_IN_PROGRESS',
    );
  try {
    return await action();
  } finally {
    try {
      await redis.eval(releaseLockScript, 1, key, token);
    } catch (error) {
      console.error('Lab lock release failed:', error);
    }
  }
}

function orchestratorConfig() {
  if (env.NODE_ENV === 'production' && env.ORCHESTRATOR_TOKEN === localToken)
    throw new AuthError(503, 'Dịch vụ lab chưa được cấu hình.', 'LAB_UNAVAILABLE');
  return env.ORCHESTRATOR_URL.replace(/\/$/, '');
}

async function orchestratorRequest(path: string, method: 'POST' | 'DELETE', body?: object) {
  const url = `${orchestratorConfig()}${path}`;
  try {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${env.ORCHESTRATOR_TOKEN}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error(`orchestrator returned ${response.status}`);
    return response;
  } catch (error) {
    console.error('Lab orchestrator request failed:', error);
    throw new AuthError(503, 'Máy lab chưa sẵn sàng. Vui lòng thử lại sau.', 'LAB_UNAVAILABLE');
  }
}

async function stopInOrchestrator(id: string) {
  await orchestratorRequest(`/v1/instances/${id}`, 'DELETE');
}

export async function spawnLab(slug: string, userId: string) {
  const room = await getRoom(slug, userId);
  return withUserLock(userId, async () => {
    const existing = await prisma.labInstance.findFirst({
      where: { userId, status: { in: [...activeStatuses] } },
      select: { room: { select: { title: true } } },
    });
    if (existing)
      throw new AuthError(
        409,
        `Bạn đã có máy lab đang chạy trong "${existing.room.title}".`,
        'LAB_ALREADY_ACTIVE',
      );

    const template = await prisma.room.findUniqueOrThrow({
      where: { id: room.id },
      select: { targetTemplateSpec: true },
    });
    const spec = template.targetTemplateSpec;
    const image =
      spec && typeof spec === 'object' && !Array.isArray(spec) && 'image' in spec
        ? spec.image
        : null;
    if (
      typeof image !== 'string' ||
      !/^cyberforce\/[a-z0-9][a-z0-9._/-]*:[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(image)
    )
      throw new AuthError(409, 'Phòng này chưa có Docker image hợp lệ.', 'LAB_IMAGE_UNAVAILABLE');

    const id = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.labInstance.create({
      data: {
        id,
        userId,
        roomId: room.id,
        ipAddress: '0.0.0.0',
        dynamicSalt: randomBytes(16).toString('hex'),
        expiresAt,
      },
    });
    try {
      const response = await orchestratorRequest('/v1/instances', 'POST', {
        instanceId: id,
        image,
      });
      const data = (await response.json()) as {
        instanceId?: string;
        containerId?: string;
        targetIp?: string;
      };
      if (
        data.instanceId !== id ||
        !data.containerId ||
        !/^100\.(6[4-9]|[7-9][0-9]|1[01][0-9]|12[0-7])\.\d{1,3}\.\d{1,3}$/.test(data.targetIp ?? '')
      )
        throw new Error('invalid orchestrator response');
      await prisma.labInstance.update({
        where: { id },
        data: { status: 'running', ipAddress: data.targetIp!, containerId: data.containerId },
      });
      return {
        instanceId: id,
        roomId: room.id,
        targetIp: data.targetIp,
        status: 'running',
        allocatedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        remainingSeconds: 3600,
      };
    } catch (error) {
      try {
        await stopInOrchestrator(id);
        await prisma.labInstance.update({ where: { id }, data: { status: 'terminated' } });
      } catch (cleanupError) {
        console.error('Lab cleanup failed:', cleanupError);
      }
      if (error instanceof AuthError) throw error;
      console.error('Lab spawn failed:', error);
      throw new AuthError(503, 'Máy lab chưa sẵn sàng. Vui lòng thử lại sau.', 'LAB_UNAVAILABLE');
    }
  });
}

export async function stopLab(slug: string, userId: string) {
  return withUserLock(userId, async () => {
    const instance = await prisma.labInstance.findFirst({
      where: { userId, room: { slug }, status: { in: [...activeStatuses] } },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    if (!instance)
      throw new AuthError(404, 'Bạn không có máy lab đang chạy trong phòng này.', 'LAB_NOT_FOUND');
    await prisma.labInstance.update({
      where: { id: instance.id },
      data: { status: 'terminating' },
    });
    await stopInOrchestrator(instance.id);
    await prisma.labInstance.update({ where: { id: instance.id }, data: { status: 'terminated' } });
    return { instanceId: instance.id, status: 'terminated' };
  });
}
