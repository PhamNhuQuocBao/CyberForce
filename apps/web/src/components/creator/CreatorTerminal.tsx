'use client';

import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL, creatorApi } from '@/lib/api';

export function CreatorTerminal({
  roomId,
  instanceId,
  token,
}: {
  roomId: string;
  instanceId: string;
  token: string;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Đang kết nối…');
  useEffect(() => {
    let disposed = false;
    let socket: WebSocket | undefined;
    let cleanup = () => {};
    void (async () => {
      const [{ Terminal }, { FitAddon }] = await Promise.all([
        import('@xterm/xterm'),
        import('@xterm/addon-fit'),
      ]);
      if (disposed || !holder.current) return;
      const terminal = new Terminal({
        cursorBlink: true,
        convertEol: true,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 13,
        theme: { background: '#0b1220', foreground: '#e7edf6' },
      });
      const fit = new FitAddon();
      terminal.loadAddon(fit);
      terminal.open(holder.current);
      fit.fit();
      const resize = () => {
        fit.fit();
        if (socket?.readyState === WebSocket.OPEN)
          socket.send(JSON.stringify({ rows: terminal.rows, cols: terminal.cols }));
      };
      const observer = new ResizeObserver(resize);
      observer.observe(holder.current);
      const input = terminal.onData((data) => {
        if (socket?.readyState === WebSocket.OPEN) socket.send(new TextEncoder().encode(data));
      });
      cleanup = () => {
        observer.disconnect();
        input.dispose();
        terminal.dispose();
      };
      try {
        const { data } = await creatorApi.terminalTicket(roomId, token);
        if (disposed) return;
        const endpoint = new URL(`${API_BASE_URL}/creator/rooms/${roomId}/test/terminal`);
        endpoint.protocol = endpoint.protocol === 'https:' ? 'wss:' : 'ws:';
        socket = new WebSocket(endpoint, ['cf-terminal', data.ticket]);
        socket.binaryType = 'arraybuffer';
        socket.onopen = () => {
          setStatus('Đã kết nối');
          resize();
          terminal.focus();
        };
        socket.onmessage = (event) => {
          if (event.data instanceof ArrayBuffer) terminal.write(new Uint8Array(event.data));
          else terminal.write(String(event.data));
        };
        socket.onerror = () => setStatus('Không thể kết nối terminal.');
        socket.onclose = () => setStatus('Terminal đã ngắt.');
      } catch {
        setStatus('Không mở được terminal.');
      }
    })().catch(() => setStatus('Không tải được terminal.'));
    return () => {
      disposed = true;
      socket?.close();
      cleanup();
    };
  }, [roomId, instanceId, token]);
  return (
    <section aria-label="Terminal chạy thử" className="space-y-2">
      <p className="text-xs text-muted-foreground" role="status">
        {status}
      </p>
      <div
        ref={holder}
        className="h-[330px] overflow-hidden rounded-btn border border-input bg-[#0b1220] p-2"
      />
    </section>
  );
}
