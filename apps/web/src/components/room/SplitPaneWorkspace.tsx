'use client';
import { useEffect, useRef, useState } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { QuestionAnswerForm } from './QuestionAnswerForm';
import type { RoomDetail, SubmissionResult } from '@/lib/api';
import { LessonContent } from './LessonContent';
import { readWorkspace } from './workspace-state';

export function SplitPaneWorkspace({
  room,
  userId,
  onCompleted,
}: {
  room: RoomDetail;
  userId: string;
  onCompleted: (result: SubmissionResult) => void;
}) {
  const storageKey = `cf-room-v1:${userId}:${room.id}`;
  const [state, setState] = useState(() => readWorkspace(null));
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [offline, setOffline] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const [tab, setTab] = useState<'lesson' | 'lab'>('lesson');
  const [expandedLab, setExpandedLab] = useState(false);
  const restoredScroll = useRef(0);
  const lessonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = readWorkspace(localStorage.getItem(storageKey));
      restoredScroll.current = stored.scroll;
      setState(stored);
    } catch {
      setStorageError(true);
    }
    setReady(true);
    const media = window.matchMedia('(min-width: 1024px)');
    const resize = () => setDesktop(media.matches);
    const connection = () => setOffline(!navigator.onLine);
    resize();
    connection();
    media.addEventListener('change', resize);
    window.addEventListener('online', connection);
    window.addEventListener('offline', connection);
    return () => {
      media.removeEventListener('change', resize);
      window.removeEventListener('online', connection);
      window.removeEventListener('offline', connection);
    };
  }, [storageKey]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      setStorageError(true);
    }
  }, [state, ready, storageKey]);

  useEffect(() => {
    if (ready && lessonRef.current) lessonRef.current.scrollTop = restoredScroll.current;
  }, [ready]);

  if (!ready) return <p role="status">Đang khôi phục bản nháp…</p>;
  const showLesson = !room.hasLab || (desktop ? !expandedLab : tab === 'lesson');
  const showLab = room.hasLab && (desktop || tab === 'lab');
  return (
    <section className="space-y-4" aria-label="Không gian học tập">
      {offline && (
        <p role="status" className="rounded-btn border p-3 text-sm">
          Mất kết nối mạng. Bạn vẫn có thể đọc nội dung đã tải và soạn câu trả lời.{' '}
          {storageError
            ? 'Trình duyệt không lưu được bản nháp.'
            : 'Bản nháp được lưu trên trình duyệt này.'}
        </p>
      )}
      {storageError && (
        <p role="alert" className="text-sm text-destructive">
          Không lưu được bản nháp trên thiết bị. Giữ trang này mở hoặc sao chép câu trả lời trước
          khi rời trang.
        </p>
      )}
      {room.hasLab && !desktop && (
        <div className="flex gap-2" role="group" aria-label="Chọn vùng làm việc">
          <Button
            variant={tab === 'lesson' ? 'secondary' : 'outline'}
            aria-pressed={tab === 'lesson'}
            onClick={() => setTab('lesson')}
          >
            Bài học
          </Button>
          <Button
            variant={tab === 'lab' ? 'secondary' : 'outline'}
            aria-pressed={tab === 'lab'}
            onClick={() => setTab('lab')}
          >
            Thực hành
          </Button>
        </div>
      )}
      <Group
        orientation="horizontal"
        defaultLayout={state.layout}
        disabled={!desktop || expandedLab || !room.hasLab}
        onLayoutChanged={(layout) => {
          if (desktop && !expandedLab && room.hasLab)
            setState((previous) => ({ ...previous, layout }));
        }}
        className={`rounded-card border bg-card ${!showLab ? 'room-lesson-only' : !showLesson ? 'room-lab-only' : ''}`}
        style={{ height: 'min(75dvh, 900px)', minHeight: 360 }}
      >
        <Panel
          id="lesson"
          defaultSize="45%"
          minSize={desktop && room.hasLab ? '30%' : 0}
          className={!showLesson ? '!hidden' : !desktop || !room.hasLab ? '!flex-[1_1_100%]' : ''}
        >
          <div
            ref={lessonRef}
            className="h-full overflow-y-auto p-4 sm:p-6"
            aria-label="Nội dung và câu hỏi"
            tabIndex={0}
            onScroll={(event) => {
              const scroll = event.currentTarget.scrollTop;
              setState((previous) => ({ ...previous, scroll }));
            }}
          >
            <h2 className="mb-4 text-xl font-semibold">Nhiệm vụ</h2>
            {room.tasks.length === 0 && (
              <p className="text-muted-foreground">Phòng chưa có nhiệm vụ.</p>
            )}
            <div className="divide-y">
              {room.tasks.map((task) => (
                <section key={task.id} className="py-4">
                  <h3>
                    <button
                      className="flex min-h-11 w-full items-center justify-between gap-3 text-left font-medium"
                      aria-expanded={!state.closed[task.id]}
                      aria-controls={`task-${task.id}`}
                      onClick={() =>
                        setState((previous) => ({
                          ...previous,
                          closed: { ...previous.closed, [task.id]: !previous.closed[task.id] },
                        }))
                      }
                    >
                      <span>
                        {task.order}. {task.title}
                      </span>
                      <span aria-hidden="true">{state.closed[task.id] ? '+' : '−'}</span>
                    </button>
                  </h3>
                  <div
                    id={`task-${task.id}`}
                    hidden={Boolean(state.closed[task.id])}
                    className="space-y-6 pt-4"
                  >
                    <LessonContent content={task.content} />
                    {task.questions.map((question) => (
                      <QuestionAnswerForm
                        key={question.id}
                        taskId={task.id}
                        question={question}
                        answer={state.answers[question.id] ?? ''}
                        onCompleted={onCompleted}
                        onAnswer={(answer) =>
                          setState((previous) => ({
                            ...previous,
                            answers: { ...previous.answers, [question.id]: answer },
                          }))
                        }
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
            <p id="submission-status" className="mt-6 text-sm text-muted-foreground">
              Bản nháp được lưu trên trình duyệt này. Mở gợi ý chưa khả dụng.
            </p>
          </div>
        </Panel>
        {room.hasLab && (
          <>
            <Separator
              className={
                desktop && !expandedLab
                  ? 'w-2 bg-muted transition-colors hover:bg-primary focus-visible:bg-primary'
                  : '!hidden'
              }
              aria-label="Thay đổi chiều rộng bài học và thực hành"
            />
            <Panel
              id="lab"
              defaultSize="55%"
              minSize={desktop ? '30%' : 0}
              className={!showLab ? '!hidden' : !desktop || expandedLab ? '!flex-[1_1_100%]' : ''}
            >
              <div className="h-full overflow-auto p-4 sm:p-6">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold">Thực hành</h2>
                  {desktop && (
                    <Button variant="outline" onClick={() => setExpandedLab(!expandedLab)}>
                      {expandedLab ? 'Trở về chia đôi' : 'Mở rộng vùng thực hành'}
                    </Button>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Phòng này có bài thực hành trên máy lab. Dịch vụ khởi chạy máy và terminal chưa
                  khả dụng.
                </p>
                <Button className="mt-4" disabled>
                  Khởi chạy máy (chưa khả dụng)
                </Button>
              </div>
            </Panel>
          </>
        )}
      </Group>
    </section>
  );
}
