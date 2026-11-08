'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/auth-store';
import { examsApi, type ExamSessionView } from '@/lib/api';

function clock(seconds: number) {
  const value = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(value / 3600)).padStart(2, '0')}:${String(Math.floor((value % 3600) / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

function ExamSessionContent() {
  const { slug } = useParams<{ slug: string }>();
  const id = useSearchParams().get('id');
  const { accessToken, isLoading } = useAuthStore();
  const [session, setSession] = useState<ExamSessionView | null>(null);
  const [now, setNow] = useState(Date.now());
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!accessToken || !id) return;
    let live = true;
    async function sync() {
      try {
        const { data } = await examsApi.session(id!, accessToken!);
        if (live) {
          setSession(data);
          setOffset(new Date(data.serverTime).getTime() - Date.now());
          setError(null);
          setSelected((current) => current ?? data.objectives[0]?.id ?? null);
        }
      } catch (reason) {
        if (live)
          setError(
            reason instanceof Error ? reason.message : 'Mất kết nối. Đồng hồ vẫn tiếp tục chạy.',
          );
      }
    }
    void sync();
    const poll = setInterval(() => {
      void sync();
    }, 30000);
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      live = false;
      clearInterval(poll);
      clearInterval(timer);
    };
  }, [id, accessToken]);
  const objective = session?.objectives.find((item) => item.id === selected);
  const remaining = session ? (new Date(session.expiresAt).getTime() - now - offset) / 1000 : 0;
  const running = session?.status === 'running' && remaining > 0;
  async function submit() {
    if (!session || !accessToken || !objective || !answer || !running || submitting) return;
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      const { data } = await examsApi.submit(session.id, objective.id, answer, accessToken);
      setMessage(data.accepted ? 'Cờ đã được ghi nhận.' : 'Cờ chưa chính xác.');
      if (data.accepted) {
        setAnswer('');
        const refreshed = await examsApi.session(session.id, accessToken);
        setSession(refreshed.data);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không nộp được cờ.');
    } finally {
      setSubmitting(false);
    }
  }
  async function finish() {
    if (
      !session ||
      !accessToken ||
      finishing ||
      !confirm(
        `Kết thúc bài thi? Bạn đã nộp ${session.submissions.length}/${session.objectives.length} nhiệm vụ. Sau khi kết thúc, bạn không thể sửa bài.`,
      )
    )
      return;
    setFinishing(true);
    setError(null);
    try {
      const { data } = await examsApi.finish(session.id, accessToken);
      setSession(data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Chưa xác nhận được kết quả.');
    } finally {
      setFinishing(false);
    }
  }
  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container space-y-6">
        <Link href={`/exams/${slug}`} className="text-link">
          ← Chi tiết kỳ thi
        </Link>
        {isLoading ? (
          <p>Đang tải…</p>
        ) : !accessToken ? (
          <Card className="p-6">Đăng nhập lại để tiếp tục phiên thi. Đồng hồ không tạm dừng.</Card>
        ) : !id ? (
          <Card className="p-6">Thiếu mã phiên thi.</Card>
        ) : !session ? (
          <p role="status">Đang đồng bộ phiên thi…</p>
        ) : (
          <>
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">{session.exam.title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Hạn nộp {new Date(session.expiresAt).toLocaleString('vi-VN')} · Điểm{' '}
                  {session.score}/{session.totalPoints}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <strong aria-live="off" className="font-mono text-2xl">
                  {clock(remaining)}
                </strong>
                {running && (
                  <Button variant="outline" disabled={finishing} onClick={finish}>
                    Kết thúc bài
                  </Button>
                )}
              </div>
            </header>
            {!running && (
              <Card className="space-y-2 p-6">
                <h2 className="font-semibold">
                  {session.status === 'expired' || remaining <= 0
                    ? 'Đã hết giờ'
                    : session.status === 'finished'
                      ? 'Đã kết thúc'
                      : 'Phiên thi chưa sẵn sàng'}
                </h2>
                {session.passed !== null && (
                  <p>
                    {session.passed ? 'Đạt' : 'Chưa đạt'} · {session.score}/{session.totalPoints}{' '}
                    điểm · Ngưỡng {session.exam.passingScore}
                  </p>
                )}
              </Card>
            )}
            <div className="grid gap-4 lg:grid-cols-[45%_55%]">
              <Card className="space-y-4 p-6">
                <h2 className="text-lg font-semibold">Nhiệm vụ</h2>
                <div className="flex flex-wrap gap-2">
                  {session.objectives.map((item, index) => (
                    <Button
                      key={item.id}
                      size="sm"
                      variant={selected === item.id ? 'secondary' : 'outline'}
                      onClick={() => {
                        setSelected(item.id);
                        setAnswer('');
                        setMessage(null);
                      }}
                    >
                      {index + 1}.{' '}
                      {session.submissions.some((s) => s.objectiveId === item.id) ? '✓' : '○'}
                    </Button>
                  ))}
                </div>
                {objective && (
                  <section className="space-y-3">
                    <h3 className="font-semibold">{objective.title}</h3>
                    <p className="text-sm text-muted-foreground">{objective.description}</p>
                    <p className="text-sm">
                      {objective.points} điểm ·{' '}
                      {session.targets?.find((target) => target.id === objective.targetId)?.name}
                    </p>
                    <label htmlFor="exam-flag" className="block text-sm font-medium">
                      Cờ
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="exam-flag"
                        value={answer}
                        onChange={(event) => setAnswer(event.target.value)}
                        disabled={
                          !running ||
                          session.submissions.some((s) => s.objectiveId === objective.id)
                        }
                        autoComplete="off"
                      />
                      <Button
                        onClick={submit}
                        disabled={
                          !running ||
                          !answer ||
                          submitting ||
                          session.submissions.some((s) => s.objectiveId === objective.id)
                        }
                      >
                        {submitting ? 'Đang nộp…' : 'Nộp cờ'}
                      </Button>
                    </div>
                    <p className="text-sm">
                      {session.submissions.some((s) => s.objectiveId === objective.id)
                        ? 'Đã được ghi nhận'
                        : 'Chưa nộp'}
                    </p>
                  </section>
                )}
              </Card>
              <Card className="space-y-4 p-6">
                <h2 className="text-lg font-semibold">Mạng mục tiêu</h2>
                <p className="text-sm text-muted-foreground">
                  Kết nối VPN đã thiết lập trước khi thi để truy cập các IP dưới đây.
                </p>
                {session.targets?.map((target) => (
                  <div key={target.id} className="rounded-md border p-4">
                    <strong>{target.name}</strong>
                    <p className="mt-1 font-mono text-sm">{target.targetIp}</p>
                  </div>
                ))}
                <Link href="/access/vpn" className="text-link text-sm">
                  Xem hướng dẫn VPN
                </Link>
              </Card>
            </div>
          </>
        )}
        {message && <p role="status">{message}</p>}
        {error && (
          <p role="alert" className="text-destructive">
            {error} Đồng hồ vẫn tiếp tục chạy.
          </p>
        )}
      </main>
    </>
  );
}

export default function ExamSessionPage() {
  return (
    <Suspense fallback={<p className="page-container">Đang tải phiên thi…</p>}>
      <ExamSessionContent />
    </Suspense>
  );
}
