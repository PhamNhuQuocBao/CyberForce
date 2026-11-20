'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LessonContent } from '@/components/room/LessonContent';
import { creatorApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

type QueueItem = Awaited<ReturnType<typeof creatorApi.queue>>['data'][number] & {
  targetTemplateSpec?: { image?: string };
  reviewFingerprint?: string;
  creatorTestRuns?: Array<{
    fingerprint: string;
    verifiedQuestionIds: string[];
    createdAt: string;
  }>;
};

export default function CreatorReviewQueue() {
  const { user, accessToken, isLoading } = useAuthStore();
  const isAdmin = user?.role === 'org_admin' || user?.role === 'superadmin';
  const [items, setItems] = useState<QueueItem[]>([]);
  const [selected, setSelected] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    if (!isAdmin || !accessToken) return;
    const result = await creatorApi.queue(accessToken);
    setItems(result.data);
  }, [isAdmin, accessToken]);
  useEffect(() => {
    void load().catch((reason) =>
      setError(reason instanceof Error ? reason.message : 'Không tải được hàng đợi.'),
    );
  }, [load]);
  const item = items.find((entry) => entry.id === selected) ?? items[0];
  async function decide(decision: 'approved' | 'changes_requested' | 'rejected') {
    if (!item || !accessToken || busy) return;
    if (decision === 'approved' && !window.confirm(`Duyệt và xuất bản "${item.title}"?`)) return;
    setBusy(true);
    setError('');
    try {
      await creatorApi.decide(item.id, decision, feedback, accessToken);
      setFeedback('');
      setSelected('');
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không xử lý được bài.');
    } finally {
      setBusy(false);
    }
  }
  const questions = item?.tasks.flatMap((task) => task.questions) ?? [];
  const proof = item?.creatorTestRuns?.[0];
  const verified = Array.isArray(proof?.verifiedQuestionIds)
    ? questions.filter((question) => proof.verifiedQuestionIds.includes(question.id)).length
    : 0;
  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container space-y-6">
        <Link href="/admin/cms" className="text-link">
          ← Admin CMS
        </Link>
        <header>
          <p className="text-sm text-muted-foreground">Quản trị nội dung</p>
          <h1 className="text-3xl font-semibold">Bài chờ duyệt</h1>
        </header>
        {isLoading ? (
          <p>Đang kiểm tra quyền…</p>
        ) : !isAdmin ? (
          <Card className="p-6">Chỉ quản trị viên có quyền duyệt bài.</Card>
        ) : (
          <>
            {error && (
              <Card className="border-destructive/50 p-4 text-destructive" role="alert">
                {error}
              </Card>
            )}
            {items.length === 0 ? (
              <Card className="p-6">Không có bài nào đang chờ duyệt.</Card>
            ) : (
              <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
                <aside className="space-y-2" aria-label="Danh sách chờ duyệt">
                  {items.map((entry) => (
                    <button
                      key={entry.id}
                      className={`w-full rounded-btn border p-4 text-left text-sm ${item?.id === entry.id ? 'border-primary bg-primary/5' : 'border-input'}`}
                      onClick={() => {
                        setSelected(entry.id);
                        setFeedback('');
                      }}
                    >
                      <strong>{entry.title}</strong>
                      <span className="block text-xs text-muted-foreground">
                        {entry.creator?.username} ·{' '}
                        {new Date(entry.reviewSubmittedAt).toLocaleString('vi-VN')}
                      </span>
                    </button>
                  ))}
                </aside>
                <Card className="space-y-5 p-6">
                  <div>
                    <h2 className="text-xl font-semibold">{item.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      Tác giả: {item.creator?.username} · Image:{' '}
                      {item.targetTemplateSpec?.image ?? 'Chưa có'}
                    </p>
                    <p className="text-sm">
                      Bằng chứng kiểm thử:{' '}
                      {proof?.fingerprint === item.reviewFingerprint
                        ? `${verified}/${questions.length} cờ`
                        : 'Không khớp phiên bản'}
                    </p>
                  </div>
                  {item.tasks.map((task) => (
                    <section key={task.id} className="space-y-2 border-t pt-4">
                      <h3 className="font-semibold">{task.title}</h3>
                      <LessonContent content={task.contentMdx} />
                      <ul className="list-disc pl-5 text-sm">
                        {task.questions.map((question) => (
                          <li key={question.id}>
                            {question.questionText} · {question.flagType} · {question.pointsReward}{' '}
                            EXP
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                  <label className="block space-y-2 text-sm">
                    <span>Nhận xét cho Creator</span>
                    <textarea
                      className="min-h-24 w-full rounded-btn border border-input bg-background p-3"
                      value={feedback}
                      onChange={(event) => setFeedback(event.target.value)}
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button disabled={busy} onClick={() => void decide('approved')}>
                      Duyệt & xuất bản
                    </Button>
                    <Button
                      variant="outline"
                      disabled={busy || !feedback.trim()}
                      onClick={() => void decide('changes_requested')}
                    >
                      Yêu cầu sửa
                    </Button>
                    <Button
                      variant="outline"
                      disabled={busy || !feedback.trim()}
                      onClick={() => void decide('rejected')}
                    >
                      Từ chối
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
