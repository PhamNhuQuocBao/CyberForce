'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHead, TableCell } from '@/components/ui/table';
import { Navbar } from '@/components/layout/Navbar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { rolesApi, type RoleRequestItem } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Loader2, RefreshCw, X } from 'lucide-react';
const statusLabels = {
  all: 'Tất cả',
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Đã từ chối',
};
export default function AdminRolesPage() {
  const router = useRouter();
  const { user, accessToken, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const requestVersion = useRef(0);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [requests, setRequests] = useState<RoleRequestItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>(
    'pending',
  );
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Reject modal state
  const [rejectingItem, setRejectingItem] = useState<RoleRequestItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const isAdmin = user && (user.role === 'superadmin' || user.role === 'org_admin');

  const fetchRequests = useCallback(async () => {
    if (!accessToken || !isAdmin) return;

    const version = ++requestVersion.current;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await rolesApi.getAdminRequests(
        {
          status: filterStatus === 'all' ? undefined : filterStatus,
          limit: 20,
          page,
        },
        accessToken,
      );
      if (version !== requestVersion.current) return;
      if (res.pagination.totalPages > 0 && page > res.pagination.totalPages) {
        setPage(res.pagination.totalPages);
        return;
      }
      setRequests(res.data);
      setPagination(res.pagination);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch role applications.';
      if (version === requestVersion.current) setErrorMessage(msg);
    } finally {
      if (version === requestVersion.current) setIsLoading(false);
    }
  }, [accessToken, isAdmin, filterStatus, page]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin) {
      fetchRequests();
    }
    return () => {
      requestVersion.current += 1;
    };
  }, [authLoading, isAuthenticated, isAdmin, fetchRequests]);

  // Handle Approve
  const handleApprove = async (item: RoleRequestItem) => {
    if (!accessToken) return;

    setActionLoadingId(item.id);
    setNotification(null);
    try {
      const res = await rolesApi.reviewRequest(
        {
          requestId: item.id,
          action: 'approve',
        },
        accessToken,
      );

      setNotification({
        type: 'success',
        message: res.message || `Approved @${item.user?.username || 'user'} as Creator.`,
      });
      fetchRequests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval failed.';
      setNotification({ type: 'error', message: msg });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Reject Submit
  const handleRejectConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !rejectingItem) return;

    setActionLoadingId(rejectingItem.id);
    setNotification(null);
    try {
      const res = await rolesApi.reviewRequest(
        {
          requestId: rejectingItem.id,
          action: 'reject',
          rejectionReason: rejectionReason.trim(),
        },
        accessToken,
      );

      setNotification({
        type: 'success',
        message: res.message || `Application rejected for @${rejectingItem.user?.username}.`,
      });
      setRejectingItem(null);
      setRejectionReason('');
      fetchRequests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rejection failed.';
      setNotification({ type: 'error', message: msg });
    } finally {
      setActionLoadingId(null);
    }
  };

  if (authLoading)
    return (
      <>
        <Navbar />
        <main id="main-content" className="page-container">
          <p role="status">Đang kiểm tra phiên đăng nhập…</p>
        </main>
      </>
    );

  if (!isAuthenticated || !isAdmin)
    return (
      <>
        <Navbar />
        <main id="main-content" className="page-container">
          <Card className="mx-auto max-w-lg space-y-4 p-8">
            <p className="text-sm text-muted-foreground">Quản trị quyền truy cập</p>
            <h1 className="text-2xl font-semibold">Bạn chưa có quyền truy cập</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Chỉ quản trị viên được xem và duyệt yêu cầu Creator. Nếu bạn có quyền, hãy đăng nhập
              bằng tài khoản quản trị.
            </p>
            <Button onClick={() => router.push('/')} variant="outline">
              Về trang chủ
            </Button>
          </Card>
        </main>
      </>
    );
  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="mb-2 text-sm text-muted-foreground">Quản trị</p>
            <h1 className="text-3xl font-semibold tracking-tight">Duyệt quyền Creator</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Xem kinh nghiệm, chuyên môn và ý tưởng của người đăng ký trước khi cấp quyền xây dựng
              nội dung.
            </p>
          </div>
          <Button variant="outline" onClick={fetchRequests} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Tải lại
          </Button>
        </div>
        {notification && (
          <div
            role={notification.type === 'error' ? 'alert' : 'status'}
            className="flex items-center justify-between gap-3 rounded-btn border bg-card p-3 text-sm"
          >
            <p className={notification.type === 'error' ? 'text-destructive' : ''}>
              {notification.message}
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotification(null)}
              aria-label="Đóng thông báo"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex flex-wrap gap-1 border-b" aria-label="Lọc theo trạng thái">
          {(['pending', 'all', 'approved', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setFilterStatus(tab);
                setPage(1);
              }}
              aria-pressed={filterStatus === tab}
              className={`min-h-11 border-b-2 px-3 py-3 text-sm ${filterStatus === tab ? 'border-foreground font-medium text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {statusLabels[tab]}
            </button>
          ))}
        </div>
        {isLoading ? (
          <div
            role="status"
            className="flex items-center gap-3 py-12 text-sm text-muted-foreground"
          >
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang tải yêu cầu…
          </div>
        ) : errorMessage ? (
          <Card className="space-y-4 p-6">
            <p role="alert" className="text-sm text-destructive">
              {errorMessage}
            </p>
            <Button variant="outline" onClick={fetchRequests}>
              Thử lại
            </Button>
          </Card>
        ) : requests.length === 0 ? (
          <Card className="p-8">
            <h2 className="font-medium">
              Không có yêu cầu{' '}
              {filterStatus === 'all' ? '' : statusLabels[filterStatus].toLowerCase()}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Các yêu cầu phù hợp với bộ lọc sẽ xuất hiện tại đây.
            </p>
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Đang hiển thị {requests.length}/{pagination.total} yêu cầu · Trang {page}/
              {Math.max(1, pagination.totalPages)}
            </p>
            <Table>
              <caption className="sr-only">Yêu cầu cấp quyền Creator</caption>
              <thead className="hidden md:table-header-group">
                <tr>
                  <TableHead>Người đăng ký</TableHead>
                  <TableHead>Hồ sơ đăng ký</TableHead>
                  <TableHead>Trạng thái & thao tác</TableHead>
                </tr>
              </thead>
              <tbody className="block md:table-row-group">
                {requests.map((item) => {
                  const isActionRunning = actionLoadingId === item.id;
                  return (
                    <tr key={item.id} className="block border-b last:border-0 md:table-row">
                      <TableCell className="block border-0 pb-2 md:table-cell md:w-1/4 md:pb-4">
                        <Link
                          className="text-link break-all font-medium"
                          href={`/user/${encodeURIComponent(item.user?.username || '')}`}
                        >
                          @{item.user?.username || 'Không rõ người dùng'}
                        </Link>
                        <p className="mt-2 break-all text-xs text-muted-foreground">
                          {item.user?.email}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.user?.rankTier || 'Novice'} ·{' '}
                          {item.user?.expPoints?.toLocaleString() ?? 0} EXP
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground">
                          Gửi ngày {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </TableCell>
                      <TableCell className="block border-0 md:table-cell">
                        <p className="font-medium">{item.specialty}</p>
                        <details className="mt-3">
                          <summary className="cursor-pointer py-2 text-sm underline underline-offset-4">
                            Kinh nghiệm & ý tưởng
                          </summary>
                          <p className="whitespace-pre-wrap break-words py-3 text-sm leading-relaxed text-muted-foreground">
                            {item.motivation}
                          </p>
                        </details>
                        {item.portfolioUrl ? (
                          <a
                            href={item.portfolioUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-link inline-flex min-h-11 items-center text-sm"
                          >
                            Xem portfolio (mở tab mới)
                          </a>
                        ) : (
                          <p className="mt-3 text-xs text-muted-foreground">
                            Chưa cung cấp portfolio
                          </p>
                        )}
                        {item.rejectionReason && (
                          <p className="mt-3 text-sm text-destructive">
                            Lý do từ chối: {item.rejectionReason}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="block border-0 pt-2 md:table-cell md:w-56 md:pt-4">
                        <p className="text-sm">
                          {statusLabels[item.status as keyof typeof statusLabels] || item.status}
                        </p>
                        {item.status === 'pending' && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              disabled={isActionRunning}
                              onClick={() => handleApprove(item)}
                            >
                              {isActionRunning && <Loader2 className="h-4 w-4 animate-spin" />}Duyệt
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isActionRunning}
                              onClick={() => {
                                setRejectingItem(item);
                                setRejectionReason('');
                              }}
                            >
                              Từ chối
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <nav aria-label="Phân trang yêu cầu" className="flex items-center gap-3">
              <Button
                variant="outline"
                disabled={isLoading || page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Trang trước
              </Button>
              <Button
                variant="outline"
                disabled={isLoading || page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Trang sau
              </Button>
            </nav>
          </>
        )}
      </main>
      <Dialog open={!!rejectingItem} onOpenChange={(open) => !open && setRejectingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối yêu cầu</DialogTitle>
            <DialogDescription>
              Gửi lý do để @{rejectingItem?.user?.username} có thể bổ sung và cải thiện hồ sơ.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRejectConfirm} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="rejection-reason" className="field-label">
                Lý do từ chối
              </label>
              <textarea
                id="rejection-reason"
                rows={4}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                aria-describedby="rejection-help"
                className="w-full"
              />
              <p id="rejection-help" className="text-xs text-muted-foreground">
                Nhập ít nhất 5 ký tự.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={actionLoadingId !== null}
                onClick={() => setRejectingItem(null)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={rejectionReason.trim().length < 5 || actionLoadingId !== null}
              >
                {actionLoadingId && <Loader2 className="h-4 w-4 animate-spin" />}Xác nhận từ chối
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
