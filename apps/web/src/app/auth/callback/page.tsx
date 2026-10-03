'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Loader2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ username: string; isNewUser: boolean } | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const isNew = searchParams.get('new_user') === 'true';

    if (!token) {
      setStatus('error');
      setErrorMessage('No authentication token received from OAuth identity provider.');
      return;
    }

    async function verifyAndLoad() {
      try {
        const profileRes = await authApi.getMe(token!);
        setAuth(profileRes.data, token!);
        setUserInfo({
          username: profileRes.data.username,
          isNewUser: isNew,
        });
        setStatus('success');

        // Redirect after brief celebration
        const timer = setTimeout(() => {
          router.push('/');
        }, 1500);
        return () => clearTimeout(timer);
      } catch (err: unknown) {
        setStatus('error');
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Failed to verify session with CyberForce authentication gateway.',
        );
      }
    }

    verifyAndLoad();
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen bg-canvas bg-neo-grid flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-card border-2 border-brand-dark shadow-neo-lg text-center overflow-hidden">
        {status === 'verifying' && (
          <div className="p-10 space-y-4 flex flex-col items-center">
            <div className="h-14 w-14 rounded-badge bg-primary border-2 border-brand-dark flex items-center justify-center shadow-neo">
              <Loader2 className="w-7 h-7 text-brand-dark animate-spin" />
            </div>
            <h2 className="text-2xl font-extrabold text-brand-dark dark:text-white">
              Verifying Security Clearance
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              Validating cryptographic tokens and loading operator profile...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="p-8 md:p-10 space-y-6">
            <div className="mx-auto h-16 w-16 rounded-badge bg-primary border-2 border-brand-dark flex items-center justify-center shadow-neo">
              <CheckCircle2 className="w-8 h-8 text-brand-dark" />
            </div>

            <div className="space-y-2">
              <Badge variant="lime" className="font-extrabold text-[11px]">
                {userInfo?.isNewUser ? 'NEW OPERATOR ENROLLED' : 'CLEARANCE VERIFIED'}
              </Badge>
              <h2 className="text-2xl font-extrabold text-brand-dark dark:text-white">
                Welcome, {userInfo?.username}!
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your isolated cyber range session is authenticated. Transferring to headquarters...
              </p>
            </div>

            <Button
              variant="lime"
              size="lg"
              onClick={() => router.push('/')}
              className="w-full font-bold flex items-center justify-center gap-2"
            >
              <span>Enter Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="p-8 md:p-10 space-y-6">
            <div className="mx-auto h-16 w-16 rounded-badge bg-rose-100 dark:bg-rose-950/50 border-2 border-brand-dark flex items-center justify-center shadow-neo">
              <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-brand-dark dark:text-white">
                Authentication Error
              </h2>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errorMessage}</p>
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/login')}
              className="w-full font-bold"
            >
              Return to Login
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-dark" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
