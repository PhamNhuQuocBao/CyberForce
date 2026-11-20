'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LessonContent } from '@/components/room/LessonContent';

export function supportedMdxError(content: string): string | null {
  const lines = content.split('\n');
  let calloutLine = 0;
  let fenceLine = 0;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (/^```/.test(line)) fenceLine = fenceLine ? 0 : index + 1;
    if (!fenceLine && /^:::(note|warning)\s*$/.test(line)) calloutLine = index + 1;
    else if (!fenceLine && /^:::\s*$/.test(line)) {
      if (!calloutLine) return `Dòng ${index + 1}: thiếu phần mở callout.`;
      calloutLine = 0;
    }
    if (!fenceLine && /<\/?[A-Z][A-Za-z0-9]*(\s|\/?>)/.test(line))
      return `Dòng ${index + 1}: JSX tùy ý không được hỗ trợ. Dùng Markdown hoặc callout.`;
  }
  if (fenceLine) return `Dòng ${fenceLine}: khối code chưa đóng.`;
  if (calloutLine) return `Dòng ${calloutLine}: callout chưa đóng.`;
  return null;
}

export function MdxLiveEditor({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [lastValid, setLastValid] = useState(value);
  const [view, setView] = useState<'split' | 'edit' | 'preview'>('split');
  const error = supportedMdxError(value);
  useEffect(() => {
    if (!error) setLastValid(value);
  }, [value, error]);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">Nội dung bài học</p>
          <p className="text-xs text-muted-foreground">
            Markdown/MDX an toàn: bảng, code block, <code>:::note</code> và <code>:::warning</code>.
            JSX tùy ý không chạy.
          </p>
        </div>
        <div className="flex gap-1" role="group" aria-label="Chế độ soạn bài">
          {(['split', 'edit', 'preview'] as const).map((mode) => (
            <Button
              key={mode}
              type="button"
              size="sm"
              variant={view === mode ? 'default' : 'outline'}
              onClick={() => setView(mode)}
            >
              {mode === 'split' ? 'Hai cột' : mode === 'edit' ? 'Soạn' : 'Xem trước'}
            </Button>
          ))}
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error} Khung xem trước đang hiển thị bản hợp lệ gần nhất.
        </p>
      )}
      <div className={`grid gap-4 ${view === 'split' ? 'lg:grid-cols-2' : ''}`}>
        {view !== 'preview' && (
          <label className="block space-y-2">
            <span className="sr-only">Mã nội dung bài học</span>
            <textarea
              value={value}
              onChange={(event) => onChange(event.target.value)}
              disabled={disabled}
              spellCheck={false}
              className="min-h-[460px] w-full rounded-btn border border-input bg-background p-4 font-mono text-sm"
              placeholder={'# Tiêu đề\n\n:::note\nGhi chú cho học viên\n:::'}
            />
          </label>
        )}
        {view !== 'edit' && (
          <section
            aria-label="Xem trước như học viên"
            className="min-h-[460px] overflow-auto rounded-btn border border-input bg-background p-4"
          >
            <p className="mb-3 border-b pb-2 text-xs text-muted-foreground">
              Xem trước như học viên{error ? ' · bản hợp lệ gần nhất' : ''}
            </p>
            <LessonContent content={error ? lastValid : value} />
          </section>
        )}
      </div>
    </div>
  );
}
