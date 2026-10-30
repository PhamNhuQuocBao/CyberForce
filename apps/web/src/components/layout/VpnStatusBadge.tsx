'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { API_BASE_URL, vpnApi } from '@/lib/api';

type Status = { connected: boolean; address: string | null };

export function VpnStatusBadge({ userId, accessToken }: { userId: string; accessToken: string }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let disposed = false;
    let socket: WebSocket | undefined;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let wasConnected: boolean | null = null;
    setStatus(null);
    setUnavailable(false);
    const connect = async () => {
      try {
        const { data } = await vpnApi.statusTicket(accessToken);
        if (disposed) return;
        const endpoint = new URL(`${API_BASE_URL}/vpn/status-stream`);
        endpoint.protocol = endpoint.protocol === 'https:' ? 'wss:' : 'ws:';
        socket = new WebSocket(endpoint, ['cf-vpn-status', data.ticket]);
        socket.onmessage = (event) => {
          if (disposed) return;
          try {
            const message = JSON.parse(String(event.data)) as { type: string; data?: Status };
            if (message.type === 'VPN_STATUS_CHANGE' && message.data) {
              const next = message.data;
              if (next.connected && wasConnected === false)
                toast.success('VPN đã kết nối. Bạn có thể truy cập máy lab.');
              wasConnected = next.connected;
              setStatus(next);
              setUnavailable(false);
            } else if (message.type === 'VPN_STATUS_UNAVAILABLE') {
              setUnavailable(true);
            }
          } catch {
            setUnavailable(true);
          }
        };
        socket.onerror = () => socket?.close();
        socket.onclose = () => {
          if (disposed) return;
          setUnavailable(true);
          retry = setTimeout(() => void connect(), 3000);
        };
      } catch {
        if (disposed) return;
        setUnavailable(true);
        retry = setTimeout(() => void connect(), 3000);
      }
    };
    void connect();
    return () => {
      disposed = true;
      if (retry) clearTimeout(retry);
      socket?.close();
    };
  }, [userId, accessToken]);

  const waiting = unavailable || !status;
  const connected = !waiting && status.connected;
  return (
    <Link
      href="/access/vpn"
      className="hidden items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-muted md:flex"
      aria-label={
        waiting
          ? 'Trạng thái VPN đang được kiểm tra'
          : connected
            ? `VPN đã kết nối, IP ${status.address}`
            : 'VPN chưa kết nối'
      }
    >
      <span
        className={`h-2 w-2 rounded-full ${waiting ? 'bg-amber-500' : connected ? 'bg-green-500' : 'bg-red-500'}`}
        aria-hidden="true"
      />
      <span>
        {waiting
          ? 'VPN: đang kiểm tra'
          : connected
            ? `VPN: ${status.address}`
            : 'VPN: chưa kết nối'}
      </span>
    </Link>
  );
}
