'use client';

import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL, roomsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';

export function WebTerminal({
  slug,
  accessToken,
  instanceId,
}: {
  slug: string;
  accessToken: string;
  instanceId: string;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Đang kết nối terminal…');
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState('');
  const paste = useRef<() => Promise<void>>(() => Promise.resolve());

  useEffect(() => {
    let disposed = false;
    let socket: WebSocket | undefined;
    let cleanup = () => {};
    const setup = async () => {
      const [{ Terminal }, { FitAddon }] = await Promise.all([
        import('@xterm/xterm'),
        import('@xterm/addon-fit'),
      ]);
      if (disposed || !holder.current) return;
      const terminal = new Terminal({
        cursorBlink: true,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 13,
        theme: { background: '#0b1220', foreground: '#e7edf6', cursor: '#77d6bd' },
        scrollback: 1000,
        convertEol: true,
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
      const data = terminal.onData((value) => {
        if (socket?.readyState === WebSocket.OPEN) socket.send(new TextEncoder().encode(value));
      });
      const selection = terminal.onSelectionChange(() => setSelected(terminal.getSelection()));
      paste.current = async () => {
        try {
          const value = await navigator.clipboard.readText();
          if (socket?.readyState === WebSocket.OPEN) socket.send(new TextEncoder().encode(value));
          terminal.focus();
        } catch {
          setStatus('Không đọc được clipboard. Hãy thử Ctrl+V trong terminal.');
        }
      };
      cleanup = () => {
        observer.disconnect();
        data.dispose();
        selection.dispose();
        terminal.dispose();
        paste.current = () => Promise.resolve();
      };
      try {
        const { data: ticket } = await roomsApi.terminalTicket(slug, accessToken);
        if (disposed) return;
        const endpoint = new URL(`${API_BASE_URL}/rooms/${encodeURIComponent(slug)}/terminal`);
        endpoint.protocol = endpoint.protocol === 'https:' ? 'wss:' : 'ws:';
        socket = new WebSocket(endpoint, ['cf-terminal', ticket.ticket]);
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
        socket.onclose = () => setStatus('Terminal đã ngắt kết nối.');
      } catch {
        setStatus('Không thể mở terminal. Kiểm tra phiên đăng nhập và máy lab.');
      }
    };
    void setup().catch(() => setStatus('Không tải được terminal. Vui lòng kết nối lại.'));
    return () => {
      disposed = true;
      socket?.close();
      cleanup();
    };
  }, [slug, accessToken, instanceId, attempt]);

  return (
    <section className="space-y-2" aria-label="Terminal lab">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span role="status">{status}</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!selected}
            onClick={() =>
              void navigator.clipboard
                .writeText(selected)
                .catch(() => setStatus('Không sao chép được vào clipboard.'))
            }
          >
            Sao chép
          </Button>
          <Button size="sm" variant="outline" onClick={() => void paste.current()}>
            Dán
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setStatus('Đang kết nối terminal…');
              setAttempt((n) => n + 1);
            }}
          >
            Kết nối lại
          </Button>
        </div>
      </div>
      <div
        ref={holder}
        className="h-[360px] overflow-hidden rounded-btn border border-slate-700 bg-[#0b1220] p-2"
        aria-label="Cửa sổ terminal"
      />
      <p className="text-xs text-muted-foreground">
        Ctrl+C gửi tín hiệu tới shell. Chọn văn bản rồi bấm Sao chép; dùng Dán để chuyển nội dung
        clipboard vào terminal.
      </p>
    </section>
  );
}
