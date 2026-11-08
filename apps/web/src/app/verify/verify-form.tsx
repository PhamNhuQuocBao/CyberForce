'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function VerifyForm({ initialCode = '' }: { initialCode?: string }) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (normalized) router.push(`/verify/${encodeURIComponent(normalized)}`);
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="block flex-1 space-y-2">
        <span className="field-label">Mã chứng chỉ</span>
        <Input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="CF-CERT-2026-…"
          autoCapitalize="characters"
          autoComplete="off"
          maxLength={50}
          required
        />
      </label>
      <Button type="submit" className="min-h-10">
        Tra cứu
      </Button>
    </form>
  );
}
