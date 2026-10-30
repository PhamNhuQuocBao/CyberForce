'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth-store';
import { examsApi, type ExamOverview } from '@/lib/api';

export default function ExamDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { accessToken, isLoading } = useAuthStore();
  const [exam, setExam] = useState<ExamOverview | null>(null);
  const [consent, setConsent] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!accessToken) return;
    let live = true;
    examsApi
      .get(slug, accessToken)
      .then(({ data }) => {
        if (live) setExam(data);
      })
      .catch((reason: unknown) => {
        if (live) setError(reason instanceof Error ? reason.message : 'Không tải được kỳ thi.');
      });
    return () => {
      live = false;
    };
  }, [slug, accessToken]);
  async function start() {
    if (!accessToken || !consent || starting) return;
    setStarting(true);
    setError(null);
    try {
      const { data } = await examsApi.start(slug, accessToken);
      router.push(`/exams/${slug}/session?id=${encodeURIComponent(data.id)}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không bắt đầu được kỳ thi.');
      setStarting(false);
    }
  }
  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container space-y-6">
        <Link href="/exams" className="text-link">
          ← Danh mục kỳ thi
        </Link>
        {isLoading ? (
          <p>Đang tải…</p>
        ) : !accessToken ? (
          <Card className="p-6">Đăng nhập để xem kỳ thi.</Card>
        ) : error && !exam ? (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        ) : (
          exam && (
            <>
              <header>
                <h1 className="text-3xl font-semibold tracking-tight">{exam.title}</h1>
                <p className="mt-2 text-muted-foreground">{exam.description}</p>
              </header>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="space-y-3 p-6">
                  <h2 className="font-semibold">Thông tin kỳ thi</h2>
                  <p>
                    Lộ trình:{' '}
                    <Link className="text-link" href={`/paths/${exam.path.slug}`}>
                      {exam.path.title}
                    </Link>
                  </p>
                  <p>Thời lượng: {exam.durationHours} giờ, không tạm dừng</p>
                  <p>
                    Ngưỡng đạt: {exam.passingScore}/{exam.totalPoints} điểm
                  </p>
                  <p>Số máy mục tiêu: {exam.targetCount}</p>
                  <p className="text-sm text-muted-foreground">
                    Trong lúc thi, nội dung học và gợi ý bị khóa. Đồng hồ tiếp tục chạy khi mất kết
                    nối.
                  </p>
                </Card>
                <Card className="space-y-3 p-6">
                  <h2 className="font-semibold">Điều kiện của bạn</h2>
                  <p>
                    {exam.eligibility.completed}/{exam.eligibility.total} phòng bắt buộc đã hoàn
                    thành
                  </p>
                  {!exam.eligibility.enrolled && <p>Chưa ghi danh lộ trình.</p>}
                  {exam.eligibility.missing.map((room) => (
                    <p key={room.slug}>
                      <Link className="text-link" href={`/rooms/${room.slug}`}>
                        {room.title} ↗
                      </Link>
                    </p>
                  ))}
                  {exam.retryAt && (
                    <p>Được thi lại sau {new Date(exam.retryAt).toLocaleString('vi-VN')}</p>
                  )}
                  {exam.activeSession ? (
                    <Button asChild>
                      <Link href={`/exams/${slug}/session?id=${exam.activeSession.id}`}>
                        Tiếp tục phiên thi
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <label className="flex items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(event) => setConsent(event.target.checked)}
                          className="mt-1"
                        />
                        Tôi cam kết tuân thủ quy chế và hiểu rằng đồng hồ bắt đầu ngay khi xác nhận.
                      </label>
                      <Button
                        disabled={
                          !exam.eligibility.eligible ||
                          Boolean(exam.retryAt) ||
                          !consent ||
                          starting
                        }
                        onClick={start}
                      >
                        {starting ? 'Đang cấp phát…' : 'Đồng ý và bắt đầu'}
                      </Button>
                    </>
                  )}
                </Card>
              </div>
              {error && (
                <p role="alert" className="text-destructive">
                  {error}
                </p>
              )}
            </>
          )
        )}
      </main>
    </>
  );
}
