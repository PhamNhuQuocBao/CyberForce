import { env } from '../../config/env.js';
import { isIP } from 'node:net';
import { prisma } from '../../lib/prisma.js';
import { AuthError } from '../auth/auth.service.js';

function validTargetIp(value: string) {
  if (isIP(value) !== 4) return false;
  const [, second, third] = value.split('.').map(Number);
  return second >= 64 && second <= 127 && !(second === 127 && third >= 240);
}

async function internalRequest(
  url: string,
  token: string,
  method: 'POST' | 'PUT' | 'DELETE',
  body?: object,
) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`internal policy service returned ${response.status}`);
}

async function networkRequest(instanceId: string, method: 'POST' | 'DELETE') {
  await internalRequest(
    `${env.ORCHESTRATOR_URL.replace(/\/$/, '')}/v1/instances/${instanceId}/vpn-network`,
    env.ORCHESTRATOR_TOKEN,
    method,
  );
}

async function gatewayGrant(
  instanceId: string,
  userId: string,
  peerIp: string,
  targetIp: string,
  expiresAt: Date,
) {
  await internalRequest(
    `${env.VPN_GATEWAY_URL.replace(/\/$/, '')}/v1/access/${instanceId}`,
    env.VPN_GATEWAY_TOKEN,
    'PUT',
    { userId, peerIp, targetIp, expiresAt: expiresAt.toISOString() },
  );
}

export async function syncVpnAccess(userId: string) {
  const peer = await prisma.vpnPeer.findUnique({ where: { userId }, select: { ipAddress: true } });
  if (!peer) return;
  const lab = await prisma.labInstance.findFirst({
    where: { userId, status: 'running', expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, ipAddress: true, expiresAt: true },
  });
  if (!lab) return;
  if (!validTargetIp(lab.ipAddress)) {
    throw new AuthError(503, 'Địa chỉ máy lab không hợp lệ.', 'VPN_ACCESS_UNAVAILABLE');
  }
  try {
    await networkRequest(lab.id, 'POST');
    await gatewayGrant(lab.id, userId, peer.ipAddress, lab.ipAddress, lab.expiresAt);
    const stillRunning = await prisma.labInstance.findFirst({
      where: { id: lab.id, userId, status: 'running', expiresAt: { gt: new Date() } },
      select: { id: true },
    });
    if (!stillRunning) await networkRequest(lab.id, 'DELETE');
  } catch (error) {
    try {
      await networkRequest(lab.id, 'DELETE');
    } catch (cleanupError) {
      console.error('VPN access cleanup failed:', cleanupError);
    }
    console.error('VPN access sync failed:', error);
    throw new AuthError(
      503,
      'Quyền truy cập VPN vào máy lab chưa sẵn sàng.',
      'VPN_ACCESS_UNAVAILABLE',
    );
  }
}
