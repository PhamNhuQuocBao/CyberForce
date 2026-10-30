import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import WebSocket from 'ws';
import { buildApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { generateTokens } from '../../lib/security.js';
import { vpnLiveStatus } from './vpn.service.js';

describe('CF-401 VPN configuration', () => {
  const app = buildApp();
  const suffix = `vpn-${Date.now()}`;
  const peers = new Map<string, { publicKey: string; address: string }>();
  const fetchMock = vi.spyOn(globalThis, 'fetch');
  const gatewayKey = Buffer.alloc(32, 4).toString('base64');
  let userId = '';
  let otherId = '';
  let token = '';
  let otherToken = '';
  let gatewayAvailable = true;

  beforeAll(async () => {
    await app.ready();
    const user = await prisma.user.create({
      data: { email: `${suffix}@test.invalid`, username: suffix },
    });
    const other = await prisma.user.create({
      data: { email: `other-${suffix}@test.invalid`, username: `other-${suffix}` },
    });
    userId = user.id;
    otherId = other.id;
    token = generateTokens(user).accessToken;
    otherToken = generateTokens(other).accessToken;
    fetchMock.mockImplementation(async (input, init) => {
      if (!gatewayAvailable) return new Response(null, { status: 503 });
      const url = String(input);
      if (url.endsWith('/v1/public-key'))
        return new Response(JSON.stringify({ publicKey: gatewayKey }));
      if (url.endsWith('/status')) {
        const item = peers.get(url.split('/').at(-2)!);
        return item
          ? new Response(
              JSON.stringify({ address: item.address, publicKey: item.publicKey, connected: true }),
            )
          : new Response(null, { status: 404 });
      }
      const id = url.split('/').at(-1)!;
      if (init?.method === 'DELETE') {
        peers.delete(id);
        return new Response(null, { status: 204 });
      }
      if (init?.method === 'PUT') {
        peers.set(id, JSON.parse(String(init.body)));
        return new Response(null, { status: 204 });
      }
      return new Response(null, { status: 404 });
    });
  });

  afterAll(async () => {
    fetchMock.mockRestore();
    await prisma.vpnPeer.deleteMany({ where: { userId: { in: [userId, otherId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userId, otherId] } } });
    await app.close();
  });

  it('requires login and does not disclose private keys in status', async () => {
    expect((await app.inject({ method: 'GET', url: '/api/v1/vpn/status' })).statusCode).toBe(401);
    expect(
      (await app.inject({ method: 'POST', url: '/api/v1/vpn/config/download' })).statusCode,
    ).toBe(401);
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/vpn/status',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(response.json().data).toEqual({ configured: false });
    expect(response.headers['cache-control']).toBe('private, no-store');
  });

  it('issues a one-time config and rotates the active public key', async () => {
    const headers = { authorization: `Bearer ${token}` };
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/vpn/config/download',
      headers,
    });
    expect(created.statusCode).toBe(200);
    expect(created.headers['cache-control']).toBe('private, no-store');
    const first = created.json().data as { address: string; configuration: string };
    expect(first.address).toBe('100.127.240.2');
    expect(first.configuration).toContain(`Address = ${first.address}/32`);
    expect(first.configuration).toContain(`PublicKey = ${gatewayKey}`);
    expect(first.configuration).toContain('AllowedIPs = 100.64.0.0/10');
    const stored = await prisma.vpnPeer.findUniqueOrThrow({ where: { userId } });
    expect(stored.publicKey).toBe(peers.get(userId)?.publicKey);
    expect(first.configuration).not.toContain(stored.publicKey);
    expect(
      (await app.inject({ method: 'POST', url: '/api/v1/vpn/config/download', headers }))
        .statusCode,
    ).toBe(409);
    const status = await app.inject({ method: 'GET', url: '/api/v1/vpn/status', headers });
    expect(status.json().data).toMatchObject({ configured: true, address: first.address });
    expect(status.body).not.toContain('PrivateKey');

    const rotated = await app.inject({
      method: 'POST',
      url: '/api/v1/vpn/config/regenerate',
      headers,
    });
    expect(rotated.statusCode).toBe(200);
    expect(rotated.json().data.address).toBe(first.address);
    expect(peers.get(userId)?.publicKey).not.toBe(stored.publicKey);
    expect((await prisma.vpnPeer.findUniqueOrThrow({ where: { userId } })).publicKey).toBe(
      peers.get(userId)?.publicKey,
    );
  });

  it('isolates users and keeps the database unchanged when gateway is unavailable', async () => {
    const headers = { authorization: `Bearer ${otherToken}` };
    gatewayAvailable = false;
    const failed = await app.inject({
      method: 'POST',
      url: '/api/v1/vpn/config/download',
      headers,
    });
    expect(failed.statusCode).toBe(503);
    expect(await prisma.vpnPeer.findUnique({ where: { userId: otherId } })).toBeNull();
    gatewayAvailable = true;
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/vpn/config/download',
      headers,
    });
    expect(created.statusCode).toBe(200);
    expect(created.json().data.address).toBe('100.127.240.3');
  });

  it('reports only the signed-in peer and protects stream tickets', async () => {
    expect(
      (await app.inject({ method: 'POST', url: '/api/v1/vpn/status-ticket' })).statusCode,
    ).toBe(401);
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/vpn/status-ticket',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().data.ticket).toMatch(/^[0-9a-f]{64}$/);
    expect(await vpnLiveStatus(userId)).toEqual({ connected: true, address: '100.127.240.2' });
    expect(await vpnLiveStatus(otherId)).toEqual({ connected: true, address: '100.127.240.3' });
  });

  it('streams status with a one-use ticket and rejects a replay', async () => {
    const address = await app.listen({ host: '127.0.0.1', port: 0 });
    const ticketResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/vpn/status-ticket',
      headers: { authorization: `Bearer ${token}` },
    });
    const ticket = ticketResponse.json().data.ticket as string;
    const url = `${address.replace(/^http/, 'ws')}/api/v1/vpn/status-stream`;
    const open = () =>
      new WebSocket(url, ['cf-vpn-status', ticket], { origin: 'http://localhost:3000' });
    const socket = open();
    const message = await new Promise<string>((resolve, reject) => {
      socket.once('message', (data) => resolve(String(data)));
      socket.once('error', reject);
    });
    expect(JSON.parse(message)).toEqual({
      type: 'VPN_STATUS_CHANGE',
      data: { connected: true, address: '100.127.240.2' },
    });
    socket.close();
    const replay = open();
    const code = await new Promise<number>((resolve, reject) => {
      replay.once('close', resolve);
      replay.once('error', reject);
    });
    expect(code).toBe(1008);
    const second = await app.inject({
      method: 'POST',
      url: '/api/v1/vpn/status-ticket',
      headers: { authorization: `Bearer ${otherToken}` },
    });
    const wrongOrigin = new WebSocket(url, ['cf-vpn-status', second.json().data.ticket], {
      origin: 'http://untrusted.invalid',
    });
    const rejected = await new Promise<number>((resolve, reject) => {
      wrongOrigin.once('close', resolve);
      wrongOrigin.once('error', reject);
    });
    expect(rejected).toBe(1008);
  });
});
