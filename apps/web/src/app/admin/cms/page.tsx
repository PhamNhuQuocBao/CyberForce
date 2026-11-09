'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cmsApi, type CmsItem, type CmsKind, type CmsStatus } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

const labels: Record<CmsKind, string> = {
  paths: 'Lộ trình',
  modules: 'Module',
  rooms: 'Phòng',
  tasks: 'Task',
  questions: 'Câu hỏi',
};
const kinds = Object.keys(labels) as CmsKind[];
const statuses: Record<CmsStatus, string> = {
  draft: 'Bản nháp',
  published: 'Đã xuất bản',
  archived: 'Đã lưu trữ',
};

export default function CmsPage() {
  const { user, accessToken, isLoading: authLoading } = useAuthStore();
  const isAdmin = user?.role === 'superadmin' || user?.role === 'org_admin';
  const [kind, setKind] = useState<CmsKind>('paths');
  const [status, setStatus] = useState<CmsStatus | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<CmsItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialKind = params.get('kind');
    const initialStatus = params.get('status');
    if (initialKind && kinds.includes(initialKind as CmsKind)) setKind(initialKind as CmsKind);
    if (initialStatus && initialStatus in statuses) setStatus(initialStatus as CmsStatus);
    setSearch(params.get('search') ?? '');
    setPage(Math.max(1, Number(params.get('page')) || 1));
  }, []);

  const load = useCallback(async () => {
    if (!isAdmin || !accessToken) return;
    setLoading(true);
    setError('');
    try {
      const result = await cmsApi.list(kind, accessToken, { page, status, search });
      setItems(result.data.items);
      setTotal(result.data.total);
      setTotalPages(result.data.totalPages);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không tải được danh mục.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAdmin, kind, page, search, status]);

  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('kind', kind);
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    if (page > 1) params.set('page', String(page));
    window.history.replaceState(null, '', `/admin/cms?${params}`);
  }, [kind, status, search, page]);

  const backParams = new URLSearchParams({ kind });
  if (status) backParams.set('status', status);
  if (search) backParams.set('search', search);
  if (page > 1) backParams.set('page', String(page));
  const returnTo = encodeURIComponent(`/admin/cms?${backParams}`);
  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Quản trị nội dung</p>
            <h1 className="text-3xl font-semibold">Admin CMS</h1>
          </div>
          {isAdmin && (
            <Button asChild>
              <Link href={`/admin/cms/${kind}/new?from=${returnTo}`}>
                Tạo {labels[kind].toLowerCase()}
              </Link>
            </Button>
          )}
        </header>
        {authLoading ? (
          <p>Đang kiểm tra quyền…</p>
        ) : !isAdmin ? (
          <Card className="p-6">
            <h2 className="font-semibold">Không đủ quyền</h2>
            <p className="mt-2 text-sm text-muted-foreground">Chỉ quản trị viên có thể mở CMS.</p>
          </Card>
        ) : (
          <>
            <nav aria-label="Loại nội dung" className="flex flex-wrap gap-2">
              {kinds.map((value) => (
                <Button
                  key={value}
                  variant={kind === value ? 'default' : 'outline'}
                  onClick={() => {
                    setKind(value);
                    setPage(1);
                  }}
                >
                  {labels[value]}
                </Button>
              ))}
            </nav>
            <div className="grid gap-3 sm:grid-cols-[1fr_190px]">
              <Input
                aria-label="Tìm nội dung"
                placeholder="Tìm theo tên…"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
              <select
                aria-label="Lọc trạng thái"
                className="h-10 rounded-btn border border-input bg-background px-3 text-sm"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as CmsStatus | '');
                  setPage(1);
                }}
              >
                <option value="">Mọi trạng thái</option>
                {Object.entries(statuses).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}{' '}
                <Button variant="outline" size="sm" onClick={() => void load()}>
                  Thử lại
                </Button>
              </p>
            )}
            <Card className="overflow-hidden">
              <div className="border-b px-5 py-3 text-sm text-muted-foreground">
                {loading ? 'Đang tải…' : `${total} mục`}
              </div>
              {items.length ? (
                <ul className="divide-y">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                    >
                      <div className="min-w-0">
                        <h2 className="truncate font-medium">{item.title ?? item.questionText}</h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.slug ?? item.id} · {statuses[item.status]} ·{' '}
                          {new Date(item.updatedAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/cms/${kind}/${item.id}?from=${returnTo}`}>
                          Chỉnh sửa
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                !loading && (
                  <p className="p-6 text-sm text-muted-foreground">
                    Chưa có nội dung phù hợp. Tạo mục đầu tiên để bắt đầu.
                  </p>
                )
              )}
            </Card>
            <div className="flex items-center justify-between text-sm">
              <span>
                Trang {page}/{Math.max(1, totalPages)}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Trước
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
