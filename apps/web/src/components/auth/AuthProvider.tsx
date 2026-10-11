'use client';
import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { initialize, initializationError } = useAuthStore();
  useEffect(() => {
    void initialize();
  }, [initialize]);
  return (
    <>
      {initializationError && (
        <div role="alert" className="border-b bg-card p-4 text-sm">
          {initializationError}{' '}
          <Button variant="outline" onClick={() => void initialize()}>
            Thử lại
          </Button>
        </div>
      )}
      {children}
    </>
  );
}
