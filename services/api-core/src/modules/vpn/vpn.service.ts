import { generateKeyPairSync } from 'node:crypto';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { AuthError } from '../auth/auth.service.js';
import { syncVpnAccess } from './vpn.access.js';

const localToken = 'cyberforce_local_vpn_gateway_token_2026';
const vpnStart = 2;
const vpnEnd = 4094;

function gatewayConfig() {
  if (
    env.NODE_ENV === 'production' &&
    (env.VPN_GATEWAY_TOKEN === localToken || env.VPN_ENDPOINT === 'localhost:51820')
  )
    throw new AuthError(503, 'VPN chưa được cấu hình.', 'VPN_UNAVAILABLE');
  return env.VPN_GATEWAY_URL.replace(/\/$/, '');
}

async function gatewayRequest(path: string, method: 'GET' | 'PUT' | 'DELETE', body?: object) {
  try {
    const response = await fetch(`${gatewayConfig()}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${env.VPN_GATEWAY_TOKEN}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`gateway returned ${response.status}`);
    return response;
  } catch (error) {
    console.error('VPN gateway request failed:', error);
    throw new AuthError(503, 'VPN chưa sẵn sàng. Vui lòng thử lại sau.', 'VPN_UNAVAILABLE');
  }
}

async function gatewayPublicKey() {
  const response = await gatewayRequest('/v1/public-key', 'GET');
  const data = (await response.json()) as { publicKey?: string };
  if (!data.publicKey || !validKey(data.publicKey))
    throw new AuthError(503, 'Khóa gateway không hợp lệ.', 'VPN_UNAVAILABLE');
  return data.publicKey;
}

function validKey(value: string) {
  const decoded = Buffer.from(value, 'base64');
  return decoded.length === 32 && decoded.toString('base64') === value;
}

function pair() {
  const { privateKey, publicKey } = generateKeyPairSync('x25519');
  const privateJwk = privateKey.export({ format: 'jwk' });
  const publicJwk = publicKey.export({ format: 'jwk' });
  const privateValue = Buffer.from(privateJwk.d!, 'base64url').toString('base64');
  const publicValue = Buffer.from(publicJwk.x!, 'base64url').toString('base64');
  if (!validKey(privateValue) || !validKey(publicValue)) throw new Error('invalid X25519 key pair');
  return { privateValue, publicValue };
}

function allocateAddress(used: Set<string>) {
  for (let index = vpnStart; index <= vpnEnd; index++) {
    const address = `100.127.${240 + Math.floor(index / 256)}.${index % 256}`;
    if (!used.has(address)) return address;
  }
  throw new AuthError(503, 'Dải IP VPN đã hết.', 'VPN_POOL_EXHAUSTED');
}

function configuration(privateKey: string, gatewayKey: string, address: string) {
  return [
    '[Interface]',
    `PrivateKey = ${privateKey}`,
    `Address = ${address}/32`,
    '',
    '[Peer]',
    `PublicKey = ${gatewayKey}`,
    `Endpoint = ${env.VPN_ENDPOINT}`,
    'AllowedIPs = 100.64.0.0/10',
    'PersistentKeepalive = 25',
    '',
  ].join('\n');
}

async function setGatewayPeer(userId: string, publicKey: string, address: string) {
  await gatewayRequest(`/v1/peers/${userId}`, 'PUT', { publicKey, address });
}

async function removeGatewayPeer(userId: string) {
  await gatewayRequest(`/v1/peers/${userId}`, 'DELETE');
}

export async function vpnStatus(userId: string) {
  try {
    await syncVpnAccess(userId);
  } catch (error) {
    console.error('VPN status sync failed:', error);
  }
  const peer = await prisma.vpnPeer.findUnique({
    where: { userId },
    select: { ipAddress: true, createdAt: true, rotatedAt: true },
  });
  return peer
    ? {
        configured: true,
        address: peer.ipAddress,
        createdAt: peer.createdAt,
        rotatedAt: peer.rotatedAt,
      }
    : { configured: false };
}

export async function issueVpnConfig(userId: string, regenerate: boolean) {
  const gatewayKey = await gatewayPublicKey();
  const keys = pair();
  const state: {
    previous: { publicKey: string; ipAddress: string } | null;
    gatewayChanged: boolean;
    address: string;
  } = { previous: null, gatewayChanged: false, address: '' };
  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(4012026)`;
        state.previous = await tx.vpnPeer.findUnique({
          where: { userId },
          select: { publicKey: true, ipAddress: true },
        });
        if (regenerate && !state.previous)
          throw new AuthError(404, 'Bạn chưa có cấu hình VPN.', 'VPN_CONFIG_NOT_FOUND');
        if (!regenerate && state.previous)
          throw new AuthError(
            409,
            'Khóa riêng chỉ tải được lúc tạo. Hãy tạo lại khóa để nhận cấu hình mới.',
            'VPN_ALREADY_CONFIGURED',
          );
        if (state.previous) {
          state.address = state.previous.ipAddress;
        } else {
          const peers = await tx.vpnPeer.findMany({ select: { ipAddress: true } });
          state.address = allocateAddress(new Set(peers.map((peer) => peer.ipAddress)));
        }
        state.gatewayChanged = true;
        await setGatewayPeer(userId, keys.publicValue, state.address);
        if (state.previous) {
          await tx.vpnPeer.update({
            where: { userId },
            data: { publicKey: keys.publicValue, rotatedAt: new Date() },
          });
        } else {
          await tx.vpnPeer.create({
            data: { userId, publicKey: keys.publicValue, ipAddress: state.address },
          });
        }
      },
      { timeout: 15000 },
    );
  } catch (error) {
    if (state.gatewayChanged) {
      try {
        if (state.previous)
          await setGatewayPeer(userId, state.previous.publicKey, state.previous.ipAddress);
        else await removeGatewayPeer(userId);
      } catch (rollbackError) {
        console.error('VPN peer rollback failed:', rollbackError);
      }
    }
    throw error;
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { username: true },
  });
  const safeName = user.username.replace(/[^a-zA-Z0-9_-]/g, '_');
  try {
    await syncVpnAccess(userId);
  } catch (error) {
    console.error('VPN config access sync failed:', error);
  }
  return {
    address: state.address,
    fileName: `cyberforce-${safeName}.conf`,
    configuration: configuration(keys.privateValue, gatewayKey, state.address),
  };
}
