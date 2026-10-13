'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { ApiError, hintsApi, type QuestionHintsState } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { LessonContent } from './LessonContent';

type Hint = QuestionHintsState['hints'][number];
const label = (tier: number) => (tier === 3 ? 'Lời giải chi tiết' : `Gợi ý ${tier}`);

export function QuestionHints({
  questionId,
  isCompleted,
}: {
  questionId: string;
  isCompleted: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState<QuestionHintsState | null>(null);
  const [selected, setSelected] = useState<Hint | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);
  const inFlight = useRef(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const load = useCallback(async () => {
    const session = useAuthStore.getState();
    if (!session.accessToken || !session.user) return;
    const id = ++requestId.current;
    setPending(true);
    setError('');
    try {
      const result = await hintsApi.get(questionId, session.accessToken);
      if (id === requestId.current && useAuthStore.getState().user?.id === session.user.id)
        setState(result.data);
    } catch (cause) {
      if (id === requestId.current && useAuthStore.getState().user?.id === session.user.id)
        setError(cause instanceof ApiError ? cause.message : 'Không tải được gợi ý. Hãy thử lại.');
    } finally {
      if (id === requestId.current) setPending(false);
    }
  }, [questionId]);

  useEffect(() => {
    if (expanded) {
      setSelected(null);
      void load();
    }
    return () => {
      requestId.current++;
    };
  }, [expanded, isCompleted, load]);

  async function unlock(hint: Hint) {
    const session = useAuthStore.getState();
    if (!session.accessToken || !session.user || inFlight.current) return;
    inFlight.current = true;
    const id = ++requestId.current;
    setPending(true);
    setError('');
    try {
      const result = await hintsApi.unlock(questionId, hint.tier, hint.cost, session.accessToken);
      if (id !== requestId.current || useAuthStore.getState().user?.id !== session.user.id) return;
      setState(result.data);
      setSelected(null);
    } catch (cause) {
      if (id !== requestId.current || useAuthStore.getState().user?.id !== session.user.id) return;
      if (cause instanceof ApiError && cause.code === 'HINT_COST_CHANGED') {
        setSelected(null);
        await load();
        setError('Chi phí đã thay đổi. Hãy kiểm tra mức mới và mở lại gợi ý.');
      } else
        setError(
          cause instanceof ApiError
            ? cause.message
            : 'Chưa xác nhận mở gợi ý. Thử lại để kiểm tra trạng thái; gợi ý chỉ tính phí một lần.',
        );
    } finally {
      inFlight.current = false;
      if (id === requestId.current) setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        aria-expanded={expanded}
        aria-controls={`hints-${questionId}`}
        disabled={pending}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Thu gọn gợi ý' : 'Gợi ý & lời giải'}
      </Button>
      {expanded && (
        <div id={`hints-${questionId}`} className="space-y-3 rounded-card border p-4">
          {pending && (
            <p role="status" className="text-sm text-muted-foreground">
              Đang tải gợi ý…
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {error && !selected && (
            <Button type="button" variant="outline" disabled={pending} onClick={() => void load()}>
              Tải lại gợi ý
            </Button>
          )}
          {state && (
            <>
              <p className="text-sm text-muted-foreground" role="status">
                {state.isCompleted
                  ? 'Câu đã hoàn thành: xem gợi ý và lời giải miễn phí.'
                  : `Điểm thưởng còn lại: ${state.pointsAvailable} EXP. Tổng EXP đã tích lũy không bị trừ.`}
              </p>
              {state.hints.length === 0 && <p className="text-sm">Câu hỏi này chưa có gợi ý.</p>}
              {state.hints.map((hint) => (
                <div key={hint.tier} className="space-y-2 border-t pt-3">
                  {hint.unlocked ? (
                    <>
                      <h4 className="text-sm font-medium">{label(hint.tier)} · Đã mở</h4>
                      <LessonContent content={hint.content ?? ''} />
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={pending || !hint.available}
                        onClick={() => (state.isCompleted ? void unlock(hint) : setSelected(hint))}
                      >
                        {label(hint.tier)} ·{' '}
                        {hint.cost ? `Giảm ${hint.cost} EXP thưởng` : 'Miễn phí'}
                      </Button>
                      {!hint.available && (
                        <p className="text-sm text-muted-foreground">
                          Mở các gợi ý trước đó để tiếp tục.
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open && !pending) setSelected(null);
        }}
      >
        <DialogContent
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            cancelRef.current?.focus();
          }}
        >
          <DialogTitle>Mở {selected ? label(selected.tier).toLowerCase() : 'gợi ý'}?</DialogTitle>
          <DialogDescription>
            Điểm thưởng câu hỏi giảm {selected?.cost ?? 0} EXP: {state?.pointsAvailable ?? 0} →{' '}
            {Math.max(0, (state?.pointsAvailable ?? 0) - (selected?.cost ?? 0))} EXP. Tổng EXP và
            cấp bậc đã tích lũy được giữ nguyên. Không thể hoàn lại chi phí sau khi mở.
          </DialogDescription>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              ref={cancelRef}
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setSelected(null)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={() => {
                if (selected) void unlock(selected);
              }}
            >
              {pending ? 'Đang mở…' : 'Xác nhận mở gợi ý'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
