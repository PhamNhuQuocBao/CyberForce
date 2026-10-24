'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/lib/auth-store';
import { vpnApi, type VpnConfiguration, type VpnStatus } from '@/lib/api';

function downloadConfig(data: VpnConfiguration) {
  const url = URL.createObjectURL(new Blob([data.configuration], { type: 'text/plain' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = data.fileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export default function VpnAccessPage() {
  const { accessToken, isLoading: authLoading, initializationError } = useAuthStore();
  const requestId = useRef(0);
  const [status, setStatus] = useState<VpnStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmRotation, setConfirmRotation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (authLoading || !accessToken) {
      requestId.current += 1;
      setStatus(null);
      setLoading(false);
      return;
    }
    const id = ++requestId.current;
    setStatus(null);
    setLoading(true);
    setError(null);
    vpnApi
      .status(accessToken)
      .then(({ data }) => {
        if (id === requestId.current) setStatus(data);
      })
      .catch((cause: unknown) => {
        if (id === requestId.current)
          setError(cause instanceof Error ? cause.message : 'Không thể tải trạng thái VPN.');
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
    return () => {
      requestId.current += 1;
    };
  }, [accessToken, authLoading, retry]);

  async function createOrRotate(regenerate: boolean) {
    if (!accessToken || busy) return;
    const sessionVersion = useAuthStore.getState().sessionVersion;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const { data } = regenerate
        ? await vpnApi.regenerate(accessToken)
        : await vpnApi.create(accessToken);
      if (useAuthStore.getState().sessionVersion !== sessionVersion) return;
      downloadConfig(data);
      setConfirmRotation(false);
      setStatus({ configured: true, address: data.address });
      setNotice(
        regenerate
          ? 'Khóa cũ đã bị thu hồi. Hãy kích hoạt tệp cấu hình mới.'
          : 'Đã tải cấu hình. Hãy giữ tệp này ở nơi an toàn; khóa riêng không thể tải lại.',
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tạo cấu hình VPN.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-medium text-primary">Kết nối từ máy cá nhân</p>
          <h1 className="text-3xl font-semibold tracking-tight">Truy cập VPN</h1>
          <p className="max-w-2xl text-muted-foreground">
            Tạo cấu hình WireGuard riêng để kết nối với cổng VPN CyberForce.
          </p>
        </header>

        {!accessToken && !authLoading ? (
          <Card className="space-y-4 p-6">
            <p>{initializationError || 'Đăng nhập để tạo cấu hình VPN cá nhân.'}</p>
            <Button asChild>
              <Link href="/login">Đăng nhập</Link>
            </Button>
          </Card>
        ) : loading || authLoading ? (
          <p role="status">Đang tải trạng thái VPN…</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
            <Card className="space-y-5 p-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">WireGuard</h2>
                <p className="text-sm text-muted-foreground">
                  {status?.configured
                    ? `Đã cấp IP ${status.address}. Khóa riêng chỉ có trong tệp đã tải lúc tạo.`
                    : 'Chưa có cấu hình. Tạo khóa và tải tệp .conf một lần.'}
                </p>
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              {notice && (
                <p role="status" className="text-sm text-foreground">
                  {notice}
                </p>
              )}
              {error && !status && (
                <Button variant="outline" onClick={() => setRetry((value) => value + 1)}>
                  Thử lại
                </Button>
              )}
              {!status?.configured && (
                <Button disabled={busy || !status} onClick={() => createOrRotate(false)}>
                  {busy ? 'Đang tạo…' : 'Tạo và tải cấu hình'}
                </Button>
              )}
              {status?.configured && !confirmRotation && (
                <Button variant="outline" disabled={busy} onClick={() => setConfirmRotation(true)}>
                  Tạo lại khóa
                </Button>
              )}
              {confirmRotation && (
                <div className="space-y-3 rounded-lg border border-destructive/40 p-4">
                  <p className="text-sm">
                    Khóa cũ sẽ bị thu hồi ngay. Kết nối hiện tại sẽ ngắt và bạn phải dùng tệp mới.
                  </p>
                  <div className="flex gap-2">
                    <Button disabled={busy} onClick={() => createOrRotate(true)}>
                      {busy ? 'Đang tạo lại…' : 'Xác nhận tạo lại'}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() => setConfirmRotation(false)}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
            </Card>
            <Card className="space-y-4 p-6">
              <h2 className="text-xl font-semibold">Kích hoạt trong 3 bước</h2>
              <ol className="list-decimal space-y-3 pl-5 text-sm text-muted-foreground">
                <li>Cài ứng dụng WireGuard trên máy cá nhân.</li>
                <li>
                  Lưu tệp cấu hình an toàn. Trên Linux, đổi tên tệp thành{' '}
                  <code className="text-foreground">cf-vpn.conf</code>.
                </li>
                <li>
                  Chạy <code className="text-foreground">sudo wg-quick up ./cf-vpn.conf</code>.
                </li>
              </ol>
              <p className="text-sm text-muted-foreground">
                Hiện cấu hình kết nối tới cổng VPN. Truy cập máy lab từ máy cá nhân sẽ được mở ở
                giai đoạn tiếp theo.
              </p>
            </Card>
          </div>
        )}
      </main>
    </>
  );
}
