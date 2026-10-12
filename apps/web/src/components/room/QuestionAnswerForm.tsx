'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError, submissionsApi, type SubmissionResult } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

interface Props {
  taskId: string;
  question: { id: string; text: string; pointsReward: number; isCompleted: boolean };
  answer: string;
  onAnswer: (value: string) => void;
  onCompleted: (result: SubmissionResult) => void;
}

export function QuestionAnswerForm({ taskId, question, answer, onAnswer, onCompleted }: Props) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
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
        setMessage('Bạn có thể nộp lại câu trả lời.');
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
    setMessage('');
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
        setMessage(
          data.alreadyCompleted
            ? 'Câu hỏi đã hoàn thành trước đó.'
            : `Chính xác! +${data.pointsEarned} EXP`,
        );
        useAuthStore.setState({
          user: { ...current.user, expPoints: Math.max(current.user.expPoints, data.totalExp) },
        });
        onCompleted(data);
      } else setMessage('Đáp án chưa đúng. Hãy kiểm tra và thử lại.');
    } catch (error) {
      if (useAuthStore.getState().user?.id !== session.user.id) return;
      setMessage(
        error instanceof ApiError
          ? error.message
          : 'Không thể nộp bài. Bản nháp vẫn được giữ, hãy thử lại.',
      );
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
    <form onSubmit={submit} className="space-y-2 border-t pt-4">
      <label htmlFor={`answer-${question.id}`} className="block text-sm font-medium">
        {question.text}
      </label>
      <p className="text-sm text-muted-foreground">
        {question.pointsReward} EXP · {question.isCompleted ? '✓ Đã hoàn thành' : 'Chưa hoàn thành'}
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
            aria-describedby={`result-${question.id}`}
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
      <p
        id={`result-${question.id}`}
        role="status"
        className={`text-sm ${question.isCompleted ? 'text-primary' : 'text-muted-foreground'}`}
      >
        {message}
      </p>
    </form>
  );
}
