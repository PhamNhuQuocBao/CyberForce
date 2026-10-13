'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError, submissionsApi, type SubmissionResult } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { QuestionHints } from './QuestionHints';

interface Props {
  taskId: string;
  questionNumber: number;
  question: { id: string; text: string; pointsReward: number; isCompleted: boolean };
  answer: string;
  onAnswer: (value: string) => void;
  onCompleted: (result: SubmissionResult) => void;
}

export function QuestionAnswerForm({
  taskId,
  questionNumber,
  question,
  answer,
  onAnswer,
  onCompleted,
}: Props) {
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{
    text: string;
    tone: 'success' | 'error' | 'neutral';
  } | null>(null);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(Date.now);
  const inFlight = useRef(false);
  const seconds = Math.max(0, Math.ceil((lockedUntil - now) / 1000));
  useEffect(() => {
    if (!lockedUntil) return;
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= lockedUntil) {
        setLockedUntil(0);
        setFeedback({ text: 'Bạn có thể nộp lại câu trả lời.', tone: 'neutral' });
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [lockedUntil]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (inFlight.current || seconds || question.isCompleted) return;
    const session = useAuthStore.getState();
    if (!session.accessToken || !session.user) return;
    inFlight.current = true;
    setPending(true);
    setFeedback(null);
    try {
      const { data } = await submissionsApi.submit(
        taskId,
        question.id,
        answer,
        session.accessToken,
      );
      const current = useAuthStore.getState();
      if (current.user?.id !== session.user.id) return;
      if (data.isCorrect) {
        setFeedback({
          text: data.alreadyCompleted
            ? 'Câu hỏi đã hoàn thành trước đó.'
            : `Chính xác! +${data.pointsEarned} EXP`,
          tone: 'success',
        });
        useAuthStore.setState({
          user: { ...current.user, expPoints: Math.max(current.user.expPoints, data.totalExp) },
        });
        onCompleted(data);
      } else
        setFeedback({
          text: `Đáp án chưa đúng cho câu ${questionNumber}. Hãy kiểm tra đúng ô câu hỏi rồi thử lại.`,
          tone: 'error',
        });
    } catch (error) {
      if (useAuthStore.getState().user?.id !== session.user.id) return;
      setFeedback({
        text:
          error instanceof ApiError
            ? error.message
            : 'Không thể nộp bài. Bản nháp vẫn được giữ, hãy thử lại.',
        tone: 'error',
      });
      if (error instanceof ApiError && error.code === 'SUBMISSION_LOCKED') {
        const retry = error.details?.retryAfterSeconds;
        const duration =
          typeof retry === 'number' && Number.isFinite(retry) ? Math.max(1, retry) : 180;
        setNow(Date.now());
        setLockedUntil(Date.now() + duration * 1000);
      }
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return (
    <div className="space-y-3 border-t pt-4">
      <form onSubmit={submit} className="space-y-2">
        <label htmlFor={`answer-${question.id}`} className="block text-sm font-medium">
          Câu {questionNumber}: {question.text}
        </label>
        <p className="text-sm text-muted-foreground">
          Điểm gốc: {question.pointsReward} EXP ·{' '}
          {question.isCompleted ? '✓ Đã hoàn thành' : 'Chưa hoàn thành'}
        </p>
        {!question.isCompleted && (
          <div className="flex flex-wrap gap-2">
            <Input
              id={`answer-${question.id}`}
              value={answer}
              onChange={(event) => onAnswer(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              maxLength={4096}
              required
              disabled={pending || seconds > 0}
              aria-describedby={feedback ? `result-${question.id}` : undefined}
              className="min-w-0 flex-1"
            />
            <Button type="submit" disabled={pending || seconds > 0 || !answer}>
              {pending
                ? 'Đang chấm…'
                : seconds
                  ? `Thử lại sau ${Math.floor(seconds / 60)
                      .toString()
                      .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
                  : 'Nộp đáp án'}
            </Button>
          </div>
        )}
        {feedback && (
          <p
            id={`result-${question.id}`}
            role={feedback.tone === 'error' ? 'alert' : 'status'}
            className={`rounded-btn border p-3 text-sm font-medium ${
              feedback.tone === 'error'
                ? 'border-destructive/50 bg-destructive/10 text-destructive'
                : feedback.tone === 'success'
                  ? 'border-primary/50 bg-primary/10 text-foreground'
                  : 'border-border bg-muted text-foreground'
            }`}
          >
            {feedback.text}
          </p>
        )}
      </form>
      <QuestionHints questionId={question.id} isCompleted={question.isCompleted} />
    </div>
  );
}
