'use client';
import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { userApi } from '@/lib/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { initialize, initializationError, user, accessToken } = useAuthStore();
  useEffect(() => {
    void initialize();
  }, [initialize]);
  useEffect(() => {
    if (!user || !accessToken || user.timezone) return;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timezone) return;
    let active = true;
    void userApi
      .updateProfile({ timezone }, accessToken)
      .then(({ data }) => {
        const current = useAuthStore.getState();
        if (active && current.user?.id === user.id && current.accessToken === accessToken)
          useAuthStore.setState({ user: { ...current.user, ...data } });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [user?.id, user?.timezone, accessToken]);
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
