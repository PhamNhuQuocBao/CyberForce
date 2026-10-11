'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/lib/auth-store';
import { pathsApi, type PathListItem } from '@/lib/api';

const categories = ['all', 'Offense', 'Defense', 'Cloud', 'Pentest'];
export default function LearningPathsCatalogPage() {
  const { accessToken, isLoading: authLoading } = useAuthStore();
  const [paths, setPaths] = useState<PathListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    setLoading(true);
    setError(null);
    pathsApi
      .listPaths({ category }, accessToken)
      .then((res) => {
        if (active) setPaths(res.data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Không thể tải lộ trình.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [category, accessToken, authLoading, retry]);

  const filteredPaths = useMemo(
    () =>
      paths.filter((path) =>
        `${path.title} ${path.description ?? ''} ${path.category}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
      ),
    [paths, search],
  );

  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">Lộ trình học tập</h1>
          <p className="max-w-2xl text-muted-foreground">
            Khám phá nội dung theo chuyên môn, xem điều kiện tiên quyết và theo dõi tiến độ của bạn.
          </p>
        </header>
        <div className="space-y-4">
          <div className="max-w-md space-y-2">
            <label htmlFor="path-search" className="text-sm font-medium">
              Tìm lộ trình
            </label>
            <Input
              id="path-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tên, nội dung hoặc chuyên môn"
            />
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Chuyên môn">
            {categories.map((item) => (
              <Button
                key={item}
                variant={category === item ? 'secondary' : 'outline'}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item === 'all' ? 'Tất cả' : item}
              </Button>
            ))}
          </div>
        </div>
        {loading || authLoading ? (
          <p role="status">Đang tải lộ trình…</p>
        ) : error ? (
          <Card className="space-y-4 p-6">
            <p role="alert" className="text-destructive">
              {error}
            </p>
            <Button variant="outline" onClick={() => setRetry((value) => value + 1)}>
              Thử lại
            </Button>
          </Card>
        ) : filteredPaths.length === 0 ? (
          <Card className="space-y-3 p-6">
            <h2 className="font-medium">Không tìm thấy lộ trình</h2>
            <p className="text-sm text-muted-foreground">Thử từ khóa hoặc chuyên môn khác.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setCategory('all');
              }}
            >
              Xóa bộ lọc
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredPaths.map((path) => (
              <Card key={path.id} className="flex flex-col gap-5 p-6">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {path.category} · {path.difficultyLevel}
                  </p>
                  <h2 className="text-xl font-semibold">{path.title}</h2>
                  {path.description && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {path.description}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {path.modulesCount} học phần · {path.roomsCount} phòng · {path.estimatedHours}{' '}
                    giờ
                  </p>
                </div>
                {accessToken && (
                  <div className="mt-auto space-y-2 text-sm">
                    <p>
                      {path.completedRoomsCount}/{path.roomsCount} phòng hoàn thành ·{' '}
                      {path.progressPercentage}%
                    </p>
                    <progress
                      className="h-2 w-full accent-primary"
                      value={path.progressPercentage}
                      max={100}
                      aria-label={`Tiến độ ${path.title}`}
                    />
                    <p className="text-muted-foreground">
                      {path.status === 'mastered'
                        ? 'Đã hoàn thành'
                        : path.status === 'in_progress'
                          ? 'Đang học'
                          : path.isEnrolled
                            ? 'Đã đăng ký · Chưa bắt đầu'
                            : 'Chưa đăng ký'}
                    </p>
                    {path.nextUpRoom && (
                      <p className="text-muted-foreground">Tiếp theo: {path.nextUpRoom.title}</p>
                    )}
                  </div>
                )}
                <Button asChild variant="outline" className="mt-auto">
                  <Link href={`/paths/${encodeURIComponent(path.slug)}`}>Xem lộ trình</Link>
                </Button>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
