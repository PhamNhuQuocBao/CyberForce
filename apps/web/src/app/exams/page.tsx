'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth-store';
import { examsApi } from '@/lib/api';

type ListedExam = Awaited<ReturnType<typeof examsApi.list>>['data'][number];
export default function ExamsPage() {
  const { accessToken, isLoading } = useAuthStore();
  const [exams, setExams] = useState<ListedExam[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!accessToken) return;
    let live = true;
    examsApi
      .list(accessToken)
      .then(({ data }) => {
        if (live) setExams(data);
      })
      .catch((reason: unknown) => {
        if (live) setError(reason instanceof Error ? reason.message : 'Không tải được kỳ thi.');
      });
    return () => {
      live = false;
    };
  }, [accessToken]);
  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container space-y-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">Kỳ thi Capstone</h1>
          <p className="mt-2 text-muted-foreground">
            Hoàn thành lộ trình học và chứng minh kỹ năng qua bài thi thực hành.
          </p>
        </header>
        {isLoading ? (
          <p>Đang tải…</p>
        ) : !accessToken ? (
          <Card className="p-6">
            <p>Đăng nhập để xem điều kiện dự thi.</p>
            <Button asChild className="mt-4">
              <Link href="/login">Đăng nhập</Link>
            </Button>
          </Card>
        ) : error ? (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        ) : exams.length === 0 ? (
          <Card className="p-6">Chưa có kỳ thi được mở.</Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {exams.map((exam) => (
              <Card key={exam.id} className="space-y-3 p-6">
                <h2 className="text-xl font-semibold">{exam.title}</h2>
                <p className="text-sm text-muted-foreground">{exam.description}</p>
                <p className="text-sm">
                  {exam.path.title} · {exam.durationHours} giờ
                </p>
                <p className="text-sm">
                  Đã hoàn thành {exam.eligibility.completed}/{exam.eligibility.total} phòng bắt buộc
                </p>
                <Button asChild variant="outline">
                  <Link href={`/exams/${exam.slug}`}>Xem kỳ thi</Link>
                </Button>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
