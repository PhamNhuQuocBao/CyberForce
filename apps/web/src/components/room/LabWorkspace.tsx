'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ApiError, roomsApi, type LabSession } from '@/lib/api';
import { WebTerminal } from './WebTerminal';

export function LabWorkspace({ slug, accessToken }: { slug: string; accessToken: string }) {
  const [lab, setLab] = useState<LabSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [clock, setClock] = useState(Date.now());
  const labId = lab?.instanceId;

  useEffect(() => {
    let active = true;
    roomsApi
      .currentLab(slug, accessToken)
      .then(({ data }) => {
        if (active) setLab(data);
      })
      .catch((cause: unknown) => {
        if (active && (!(cause instanceof ApiError) || cause.statusCode !== 404))
          setError(cause instanceof Error ? cause.message : 'Không thể tải trạng thái máy lab.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, accessToken]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!labId || busy) return;
    let active = true;
    const timer = window.setInterval(() => {
      void roomsApi
        .currentLab(slug, accessToken)
        .then(({ data }) => {
          if (active) setLab(data);
        })
        .catch((cause: unknown) => {
          if (active && cause instanceof ApiError && cause.statusCode === 404) setLab(null);
        });
    }, 30000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [slug, accessToken, labId, busy]);

  const run = async (action: 'spawn' | 'stop' | 'extend') => {
    setBusy(true);
    setError('');
    try {
      if (action === 'spawn') setLab((await roomsApi.spawnLab(slug, accessToken)).data);
      if (action === 'stop') {
        await roomsApi.stopLab(slug, accessToken);
        setLab(null);
      }
      if (action === 'extend') {
        const { data } = await roomsApi.extendLab(slug, accessToken);
        setLab((previous) => (previous ? { ...previous, ...data } : previous));
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Thao tác với máy lab thất bại.');
    } finally {
      setBusy(false);
    }
  };
  const seconds = lab
    ? Math.max(0, Math.ceil((new Date(lab.expiresAt).getTime() - clock) / 1000))
    : 0;
  const remaining = `${Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0')}:${Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  if (loading) return <p role="status">Đang kiểm tra máy lab…</p>;
  const inGrace =
    lab &&
    lab.status === 'running' &&
    seconds === 0 &&
    new Date(lab.expiresAt).getTime() + 180000 > clock;
  return (
    <div className="space-y-4">
      {error && (
        <p
          role="alert"
          className="rounded-btn border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {lab ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-btn border bg-muted/40 p-3 text-sm">
            <div>
              <p className="font-medium">
                {seconds > 0 && lab.status === 'running'
                  ? 'Máy lab đang chạy'
                  : 'Phiên lab đã hết hạn hoặc đang dọn dẹp'}
              </p>
              <p className="text-muted-foreground">
                Target: <code>{lab.targetIp}</code> · Còn lại <time>{remaining}</time>
                {inGrace && ' · Có thể gia hạn trong 3 phút sau khi hết giờ'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={
                  busy ||
                  lab.status !== 'running' ||
                  (!inGrace && seconds === 0) ||
                  lab.extensionCount >= lab.maxExtensions
                }
                onClick={() => void run('extend')}
              >
                Gia hạn 1 giờ ({lab.extensionCount}/{lab.maxExtensions})
              </Button>
              <Button variant="destructive" disabled={busy} onClick={() => void run('stop')}>
                Dừng máy
              </Button>
            </div>
          </div>
          {lab.status === 'running' && seconds > 0 && (
            <WebTerminal slug={slug} accessToken={accessToken} instanceId={lab.instanceId} />
          )}
        </>
      ) : (
        <div className="rounded-btn border bg-muted/30 p-5">
          <p className="mb-3 text-sm text-muted-foreground">
            Khởi chạy máy lab để thực hành. Một tài khoản chỉ có một máy lab tại một thời điểm.
          </p>
          <Button disabled={busy} onClick={() => void run('spawn')}>
            {busy ? 'Đang khởi chạy…' : 'Khởi chạy máy lab'}
          </Button>
        </div>
      )}
    </div>
  );
}
