'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL, roomsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface GuacTunnel {
  connect(data?: string): void;
  disconnect(): void;
  sendMessage(...elements: string[]): void;
  setState(state: number): void;
  oninstruction: ((opcode: string, args: string[]) => void) | null;
  onerror: ((error: { message?: string }) => void) | null;
  onstatechange: ((state: number) => void) | null;
}

interface GuacStream {
  index: number;
}

interface GuacClient {
  connect(data?: string): void;
  disconnect(): void;
  getDisplay(): {
    getElement(): HTMLElement;
    scale(value: number): void;
    getScale(): number;
  };
  sendKeyEvent(pressed: number, keysym: number): void;
  sendMouseState(state: object): void;
  createClipboardStream(mimeType: string): GuacStream;
  onclipboard: ((stream: GuacStream, mimeType: string) => void) | null;
  onerror: ((error: { message?: string }) => void) | null;
  onstatechange: ((state: number) => void) | null;
}

interface GuacInput {
  onkeydown: ((keysym: number) => void) | null;
  onkeyup: ((keysym: number) => void) | null;
}

interface GuacMouse {
  onmousedown: ((state: GuacMouseState) => void) | null;
  onmouseup: ((state: GuacMouseState) => void) | null;
  onmousemove: ((state: GuacMouseState) => void) | null;
}

interface GuacMouseState {
  x: number;
  y: number;
  [button: string]: number | boolean;
}

interface GuacNamespace {
  Tunnel: { new (): GuacTunnel; State: { CONNECTING: number; OPEN: number; CLOSED: number } };
  Parser: {
    new (): {
      receive(data: string): void;
      oninstruction: ((opcode: string, args: string[]) => void) | null;
    };
    toInstruction(elements: string[]): string;
  };
  Client: { new (tunnel: GuacTunnel): GuacClient; State: { CONNECTED: number } };
  Keyboard: new (element: HTMLElement) => GuacInput;
  Mouse: new (element: HTMLElement) => GuacMouse;
  StringWriter: new (stream: GuacStream) => { sendText(text: string): void; sendEnd(): void };
  StringReader: new (stream: GuacStream) => {
    ontext: ((text: string) => void) | null;
    onend: (() => void) | null;
  };
}

function guacamole() {
  return (window as Window & { Guacamole?: GuacNamespace }).Guacamole;
}

function browserTunnel(lib: GuacNamespace, endpoint: string, ticket: string) {
  const tunnel = new lib.Tunnel();
  const parser = new lib.Parser();
  let socket: WebSocket | undefined;
  parser.oninstruction = (opcode, args) => tunnel.oninstruction?.(opcode, args);
  tunnel.connect = () => {
    tunnel.setState(lib.Tunnel.State.CONNECTING);
    socket = new WebSocket(endpoint, ['cf-attackbox', ticket]);
    socket.onopen = () => tunnel.setState(lib.Tunnel.State.OPEN);
    socket.onmessage = (event) => {
      try {
        parser.receive(String(event.data));
      } catch {
        socket?.close();
      }
    };
    socket.onerror = () => tunnel.onerror?.({ message: 'Kết nối AttackBox thất bại.' });
    socket.onclose = () => tunnel.setState(lib.Tunnel.State.CLOSED);
  };
  tunnel.sendMessage = (...elements) => {
    if (socket?.readyState === WebSocket.OPEN) socket.send(lib.Parser.toInstruction(elements));
  };
  tunnel.disconnect = () => socket?.close();
  return tunnel;
}

export function GuacamoleViewer({
  slug,
  accessToken,
  instanceId,
}: {
  slug: string;
  accessToken: string;
  instanceId: string;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const clientRef = useRef<GuacClient>();
  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Đang kiểm tra AttackBox…');
  const [attempt, setAttempt] = useState(0);
  const [remoteClipboard, setRemoteClipboard] = useState('');

  useEffect(() => {
    let active = true;
    roomsApi
      .attackBoxStatus(slug, accessToken)
      .then(({ data }) => {
        if (active) {
          setRunning(data.running);
          setStatus(data.running ? 'Đang kết nối màn hình…' : 'AttackBox chưa chạy.');
        }
      })
      .catch(() => {
        if (active) setStatus('Không thể tải trạng thái AttackBox.');
      });
    return () => {
      active = false;
    };
  }, [slug, accessToken, instanceId]);

  useEffect(() => {
    if (!ready || !running || !holder.current) return;
    const lib = guacamole();
    if (!lib) return;
    let disposed = false;
    let reconnectTimer: number | undefined;
    let keyboard: GuacInput | undefined;
    let mouse: GuacMouse | undefined;
    let observer: ResizeObserver | undefined;
    let client: GuacClient | undefined;
    const connect = async () => {
      try {
        const { data } = await roomsApi.attackBoxTicket(slug, accessToken);
        if (disposed || !holder.current) return;
        const endpoint = new URL(
          `${API_BASE_URL}/rooms/${encodeURIComponent(slug)}/attackbox/stream`,
        );
        endpoint.protocol = endpoint.protocol === 'https:' ? 'wss:' : 'ws:';
        const tunnel = browserTunnel(lib, endpoint.toString(), data.ticket);
        client = new lib.Client(tunnel);
        clientRef.current = client;
        const viewer = client.getDisplay().getElement();
        holder.current.replaceChildren(viewer);
        const currentClient = client;
        const resize = () => {
          if (!holder.current) return;
          const width = Math.max(640, Math.floor(holder.current.clientWidth));
          currentClient.getDisplay().scale(width / 1280);
        };
        observer = new ResizeObserver(resize);
        observer.observe(holder.current);
        keyboard = new lib.Keyboard(holder.current);
        keyboard.onkeydown = (keysym) => currentClient.sendKeyEvent(1, keysym);
        keyboard.onkeyup = (keysym) => currentClient.sendKeyEvent(0, keysym);
        mouse = new lib.Mouse(viewer);
        const sendMouse = (state: GuacMouseState) => {
          const scale = currentClient.getDisplay().getScale();
          currentClient.sendMouseState({
            ...state,
            x: Math.round(state.x / scale),
            y: Math.round(state.y / scale),
          });
        };
        mouse.onmousedown = (state) => {
          holder.current?.focus();
          sendMouse(state);
        };
        mouse.onmouseup = mouse.onmousemove = sendMouse;
        client.onclipboard = (stream, mimeType) => {
          if (!mimeType.startsWith('text/')) return;
          const reader = new lib.StringReader(stream);
          let content = '';
          reader.ontext = (text) => {
            content += text;
          };
          reader.onend = () => setRemoteClipboard(content);
        };
        client.onerror = () => setStatus('Màn hình AttackBox bị gián đoạn.');
        client.onstatechange = (state) => {
          if (!disposed && state === lib.Client.State.CONNECTED) setStatus('Đã kết nối AttackBox');
        };
        tunnel.onstatechange = (state) => {
          if (disposed) return;
          if (state === lib.Tunnel.State.OPEN) {
            setStatus('Đang tải desktop Kali…');
            resize();
          } else if (state === lib.Tunnel.State.CLOSED) {
            if (attempt < 3) {
              setStatus(`Mất kết nối. Đang thử lại (${attempt + 1}/3)…`);
              reconnectTimer = window.setTimeout(() => setAttempt((value) => value + 1), 2000);
            } else setStatus('Không thể kết nối lại AttackBox.');
          }
        };
        client.connect();
      } catch {
        if (!disposed) setStatus('Không thể mở AttackBox. Hãy kiểm tra phiên lab.');
      }
    };
    void connect();
    return () => {
      disposed = true;
      window.clearTimeout(reconnectTimer);
      observer?.disconnect();
      if (keyboard) keyboard.onkeydown = keyboard.onkeyup = null;
      if (mouse) mouse.onmousedown = mouse.onmouseup = mouse.onmousemove = null;
      client?.disconnect();
      clientRef.current = undefined;
      holder.current?.replaceChildren();
    };
  }, [slug, accessToken, instanceId, ready, running, attempt]);

  const change = async (action: 'start' | 'stop') => {
    setBusy(true);
    try {
      if (action === 'start') {
        await roomsApi.startAttackBox(slug, accessToken);
        setRunning(true);
        setStatus('Đang khởi chạy màn hình Kali…');
        setAttempt(0);
      } else {
        await roomsApi.stopAttackBox(slug, accessToken);
        setRunning(false);
        setStatus('AttackBox đã dừng.');
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Thao tác AttackBox thất bại.');
    } finally {
      setBusy(false);
    }
  };

  const paste = async () => {
    const lib = guacamole();
    if (!lib || !clientRef.current) return;
    try {
      const text = await navigator.clipboard.readText();
      const writer = new lib.StringWriter(clientRef.current.createClipboardStream('text/plain'));
      writer.sendText(text);
      writer.sendEnd();
    } catch {
      setStatus('Không thể đọc clipboard trình duyệt.');
    }
  };

  return (
    <section className="space-y-3" aria-label="Kali AttackBox">
      <Script
        src="/vendor/guacamole/1.6.0/all.min.js"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span role="status" className="text-sm text-muted-foreground">
          {status}
        </span>
        <div className="flex gap-2">
          {running ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAttempt((value) => (value >= 3 ? 0 : value + 1))}
              >
                Kết nối lại
              </Button>
              <Button size="sm" variant="outline" onClick={() => void paste()}>
                Dán vào Kali
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!remoteClipboard}
                onClick={() => void navigator.clipboard.writeText(remoteClipboard)}
              >
                Sao chép từ Kali
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={busy}
                onClick={() => void change('stop')}
              >
                Dừng AttackBox
              </Button>
            </>
          ) : (
            <Button disabled={busy} onClick={() => void change('start')}>
              {busy ? 'Đang khởi chạy…' : 'Start AttackBox'}
            </Button>
          )}
        </div>
      </div>
      {running && (
        <>
          <div
            ref={holder}
            tabIndex={0}
            aria-label="Màn hình Kali AttackBox"
            className="aspect-[8/5] min-h-[360px] overflow-hidden rounded-btn border bg-[#111827] outline-offset-2 focus-visible:outline"
          />
          <p className="text-xs text-muted-foreground">
            Sau khi chuyển clipboard vào Kali, dùng Ctrl+Shift+V trong terminal hoặc Ctrl+V trong
            ứng dụng.
          </p>
        </>
      )}
    </section>
  );
}
