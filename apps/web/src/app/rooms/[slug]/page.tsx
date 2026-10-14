'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth-store';
import { ApiError, roomsApi, type RoomDetail } from '@/lib/api';
import { SplitPaneWorkspace } from '@/components/room/SplitPaneWorkspace';

export default function RoomPage() {
  const { slug } = useParams<{ slug: string }>();
  const { accessToken, user, isLoading: authLoading } = useAuthStore();
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (authLoading || !accessToken) return;
    let active = true;
    setLoading(true);
    setError(null);
    setRoom(null);
    roomsApi
      .getRoom(slug, accessToken)
      .then((result) => {
        if (active) setRoom(result.data);
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            cause instanceof ApiError
              ? cause.message
              : 'Không thể tải phòng học. Kiểm tra kết nối và thử lại.',
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, accessToken, authLoading, retry]);
  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6">
        <Link
          href={room?.path ? `/paths/${encodeURIComponent(room.path.slug)}` : '/paths'}
          className="text-link inline-flex min-h-11 items-center text-sm"
        >
          ← {room?.path?.title ?? 'Danh mục lộ trình'}
        </Link>
        {authLoading ? (
          <p role="status">Đang kiểm tra phiên đăng nhập…</p>
        ) : !accessToken || !user ? (
          <section className="space-y-4">
            <h1 className="text-2xl font-semibold">Đăng nhập để học</h1>
            <p>Nội dung và tiến độ phòng học gắn với tài khoản của bạn.</p>
            <Button asChild>
              <Link href="/login">Đăng nhập</Link>
            </Button>
          </section>
        ) : loading ? (
          <p role="status">Đang tải phòng học…</p>
        ) : error ? (
          <section className="space-y-4">
            <h1 className="text-2xl font-semibold">Chưa thể mở phòng học</h1>
            <p role="alert">{error}</p>
            <Button variant="outline" onClick={() => setRetry((value) => value + 1)}>
              Thử lại
            </Button>
          </section>
        ) : (
          room && (
            <>
              <header className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {room.hasLab ? 'Phòng thực hành' : 'Phòng lý thuyết'} · {room.difficulty} ·{' '}
                  {room.estimatedMinutes} phút
                </p>
                <h1 className="text-3xl font-semibold">{room.title}</h1>
                {room.description && (
                  <p className="max-w-3xl text-muted-foreground">{room.description}</p>
                )}
                <p className="text-sm">
                  {room.completedQuestions}/{room.totalQuestions} câu hỏi hoàn thành ·{' '}
                  {room.pointsReward} EXP
                </p>
              </header>
              <SplitPaneWorkspace
                key={`${user.id}:${room.id}`}
                room={room}
                userId={user.id}
                accessToken={accessToken}
                onCompleted={(result) =>
                  setRoom((previous) => {
                    if (!previous) return previous;
                    const tasks = previous.tasks.map((task) => ({
                      ...task,
                      questions: task.questions.map((question) =>
                        question.id === result.questionId
                          ? { ...question, isCompleted: true }
                          : question,
                      ),
                    }));
                    return {
                      ...previous,
                      tasks,
                      completedQuestions: tasks
                        .flatMap((task) => task.questions)
                        .filter((question) => question.isCompleted).length,
                    };
                  })
                }
              />
            </>
          )
        )}
      </main>
    </>
  );
}
