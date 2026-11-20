'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { creatorApi, type CreatorRoom } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

const labels: Record<string, string> = {
  editing: 'Đang soạn',
  pending_review: 'Chờ duyệt',
  changes_requested: 'Cần sửa',
  rejected: 'Đã từ chối',
  approved: 'Đã duyệt',
};

export default function CreatorHome() {
  const { user, accessToken, isLoading } = useAuthStore();
  const allowed = user && ['creator', 'instructor', 'org_admin', 'superadmin'].includes(user.role);
  const [rooms, setRooms] = useState<CreatorRoom[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!accessToken || !allowed) return;
    let live = true;
    void creatorApi
      .list(accessToken)
      .then((result) => {
        if (live) setRooms(result.data);
      })
      .catch((reason) => {
        if (live) setError(reason instanceof Error ? reason.message : 'Không tải được bài lab.');
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [accessToken, allowed]);
  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Creator Studio</p>
            <h1 className="text-3xl font-semibold">Bài lab của tôi</h1>
          </div>
          {allowed && (
            <Button asChild>
              <Link href="/creator/rooms/new">Tạo bài lab</Link>
            </Button>
          )}
        </header>
        {isLoading ? (
          <p>Đang kiểm tra quyền…</p>
        ) : !allowed ? (
          <Card className="p-6">
            Chỉ Creator, Instructor và quản trị viên có quyền soạn bài lab.
          </Card>
        ) : loading ? (
          <p>Đang tải bài lab…</p>
        ) : error ? (
          <Card className="p-6 text-destructive" role="alert">
            {error}
          </Card>
        ) : rooms.length === 0 ? (
          <Card className="p-8 text-center">
            <p>Bạn chưa có bài lab nào.</p>
            <Button className="mt-4" asChild>
              <Link href="/creator/rooms/new">Tạo bài đầu tiên</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {rooms.map((room) => (
              <Card key={room.id} className="space-y-3 p-5">
                <div className="flex justify-between gap-3">
                  <h2 className="text-lg font-semibold">{room.title}</h2>
                  <span className="text-xs text-muted-foreground">
                    {labels[room.reviewStatus] ?? room.reviewStatus}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Cập nhật {new Date(room.updatedAt).toLocaleString('vi-VN')}
                </p>
                {room.reviewFeedback && (
                  <p className="text-sm text-destructive">Nhận xét: {room.reviewFeedback}</p>
                )}
                <Button asChild variant="outline">
                  <Link href={`/creator/rooms/${room.id}`}>Mở bài</Link>
                </Button>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
