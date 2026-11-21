'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ctfApi, type CtfEventDetail, type CtfScoreboard } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

export default function CtfEventPage() {
  const { slug } = useParams<{ slug: string }>();
  const { accessToken, isLoading: authLoading } = useAuthStore();
  const [event, setEvent] = useState<CtfEventDetail | null>(null);
  const [board, setBoard] = useState<CtfScoreboard | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    const [detail, scoreboard] = await Promise.all([
      ctfApi.get(slug, accessToken ?? undefined),
      ctfApi.scoreboard(slug),
    ]);
    setEvent(detail.data);
    setBoard(scoreboard.data);
  }, [slug, accessToken]);
  useEffect(() => {
    let active = true;
    const load = () => {
      void Promise.all([ctfApi.get(slug, accessToken ?? undefined), ctfApi.scoreboard(slug)])
        .then(([detail, scoreboard]) => {
          if (active) {
            setEvent(detail.data);
            setBoard(scoreboard.data);
            setError(null);
          }
        })
        .catch((reason: unknown) => {
          if (active)
            setError(reason instanceof Error ? reason.message : 'Không tải được giải CTF.');
        });
    };
    load();
    const timer = window.setInterval(load, 15_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [slug, accessToken]);
  const join = async () => {
    if (!accessToken) return;
    setBusy('join');
    try {
      await ctfApi.join(slug, accessToken);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể tham gia.');
    } finally {
      setBusy(null);
    }
  };
  const submit = async (challengeId: string) => {
    if (!accessToken || !answers[challengeId]) return;
    setBusy(challengeId);
    try {
      const { data } = await ctfApi.submit(slug, challengeId, answers[challengeId], accessToken);
      setFeedback((current) => ({
        ...current,
        [challengeId]:
          data.status === 'accepted'
            ? `Đúng! +${data.points} điểm${data.frozen ? ' · Bảng điểm đang đóng băng' : ''}`
            : data.status === 'duplicate'
              ? 'Bạn đã giải câu này.'
              : 'Cờ chưa đúng.',
      }));
      if (data.status === 'accepted') {
        setAnswers((current) => ({ ...current, [challengeId]: '' }));
        await refresh();
      }
    } catch (reason) {
      setFeedback((current) => ({
        ...current,
        [challengeId]: reason instanceof Error ? reason.message : 'Không thể nộp cờ.',
      }));
    } finally {
      setBusy(null);
    }
  };
  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container space-y-6">
        <Link href="/arena" className="text-sm underline">
          ← Tất cả giải CTF
        </Link>
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        {!event ? (
          !error && <p>Đang tải…</p>
        ) : (
          <>
            <header>
              <h1 className="text-3xl font-semibold tracking-tight">{event.title}</h1>
              <p className="mt-2 text-muted-foreground">{event.description}</p>
              <p className="mt-2 text-sm">
                {new Date(event.startsAt).toLocaleString('vi-VN')} –{' '}
                {new Date(event.endsAt).toLocaleString('vi-VN')}
              </p>
            </header>
            {board?.frozen && (
              <Card className="border-primary p-4" role="status">
                Bảng xếp hạng đang đóng băng. Bài giải vẫn được ghi nhận; thứ hạng sẽ cập nhật khi
                ban tổ chức mở lại.
              </Card>
            )}
            {!authLoading && !accessToken && (
              <Card className="p-4">
                Đăng nhập để tham gia và nộp cờ.{' '}
                <Link href="/login" className="underline">
                  Đăng nhập
                </Link>
              </Card>
            )}
            {accessToken && !event.joined && new Date(event.endsAt).getTime() > Date.now() && (
              <Button onClick={join} disabled={busy !== null}>
                Tham gia giải
              </Button>
            )}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <section aria-label="Thử thách" className="space-y-4">
                {event.challenges.length === 0 && (
                  <Card className="p-6">Thử thách sẽ mở khi giải bắt đầu.</Card>
                )}
                {event.challenges.map((challenge) => (
                  <Card key={challenge.id} className="space-y-3 p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h2 className="text-lg font-semibold">{challenge.title}</h2>
                      <span className="font-semibold">{challenge.points} điểm</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {challenge.description}
                    </p>
                    {event.solvedIds.includes(challenge.id) ? (
                      <p className="text-sm text-[#486B16] dark:text-primary">Đã giải</p>
                    ) : (
                      event.joined &&
                      new Date(event.endsAt).getTime() > Date.now() && (
                        <form
                          className="flex gap-2"
                          onSubmit={(e) => {
                            e.preventDefault();
                            void submit(challenge.id);
                          }}
                        >
                          <label className="sr-only" htmlFor={`flag-${challenge.id}`}>
                            Cờ cho {challenge.title}
                          </label>
                          <input
                            id={`flag-${challenge.id}`}
                            className="min-h-11 min-w-0 flex-1 rounded-md border bg-background px-3 py-2"
                            value={answers[challenge.id] ?? ''}
                            onChange={(e) =>
                              setAnswers((current) => ({
                                ...current,
                                [challenge.id]: e.target.value,
                              }))
                            }
                            autoComplete="off"
                          />
                          <Button type="submit" disabled={busy !== null || !answers[challenge.id]}>
                            Nộp cờ
                          </Button>
                        </form>
                      )
                    )}
                    {feedback[challenge.id] && (
                      <p role="status" className="text-sm">
                        {feedback[challenge.id]}
                      </p>
                    )}
                  </Card>
                ))}
              </section>
              <section aria-label="Bảng xếp hạng">
                <Card className="p-5">
                  <h2 className="mb-3 text-lg font-semibold">Bảng xếp hạng</h2>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Bằng điểm: người đạt mốc điểm trước đứng trên.
                  </p>
                  {board?.entries.length ? (
                    <ol className="space-y-2">
                      {board.entries.map((row) => (
                        <li
                          key={row.username}
                          className="grid grid-cols-[2rem_minmax(0,1fr)_auto] gap-2 border-b pb-2 text-sm"
                        >
                          <span>#{row.rank}</span>
                          <span className="truncate">
                            {row.username}
                            <small className="block text-muted-foreground">
                              {row.reachedAt
                                ? `Đạt điểm lúc ${new Date(row.reachedAt).toLocaleString('vi-VN')}`
                                : 'Chưa ghi điểm'}
                            </small>
                          </span>
                          <strong>{row.score}</strong>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-sm text-muted-foreground">Chưa có người tham gia.</p>
                  )}
                </Card>
              </section>
            </div>
          </>
        )}
      </main>
    </>
  );
}
