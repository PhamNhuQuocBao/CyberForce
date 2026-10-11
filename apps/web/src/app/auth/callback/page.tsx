'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Loader2 } from 'lucide-react';
import { AccountLinkingModal } from '@/components/auth/AccountLinkingModal';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [status, setStatus] = useState<'verifying' | 'linking' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ username: string; isNewUser: boolean } | null>(null);

  // CF-102: Account Linking State
  const [linkingState, setLinkingState] = useState<{
    email: string;
    provider: string;
    pendingLinkToken: string;
  } | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const isNew = searchParams.get('new_user') === 'true';

    // CF-102: Detect Sub-flow 1.2 Account Linking redirection
    const isLinkRequired = searchParams.get('link_required') === 'true';
    const pendingToken = searchParams.get('pending_token');
    const emailParam = searchParams.get('email');
    const providerParam = searchParams.get('provider') || 'OAuth';

    if (isLinkRequired && pendingToken && emailParam) {
      setStatus('linking');
      setLinkingState({
        email: emailParam,
        provider: providerParam,
        pendingLinkToken: pendingToken,
      });
      return;
    }

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

        // Preserve the existing redirect delay.
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
    <main id="main-content" className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md space-y-4 p-6">
        <h1 className="text-xl font-semibold">
          {status === 'error'
            ? 'Không thể đăng nhập'
            : status === 'success'
              ? `Chào ${userInfo?.username}`
              : status === 'linking'
                ? 'Xác minh tài khoản'
                : 'Đang xác minh phiên đăng nhập'}
        </h1>
        {status === 'verifying' && (
          <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Vui lòng chờ trong giây lát.
          </p>
        )}
        {status === 'error' && (
          <>
            <p role="alert" className="text-sm text-destructive">
              {errorMessage}
            </p>
            <Button variant="outline" onClick={() => router.push('/login')}>
              Về trang đăng nhập
            </Button>
          </>
        )}
        {status === 'success' && (
          <>
            <p role="status" className="text-sm text-muted-foreground">
              Đăng nhập thành công. Đang chuyển đến trang chủ…
            </p>
            <Button onClick={() => router.push('/')}>Tiếp tục</Button>
          </>
        )}
        {linkingState && (
          <AccountLinkingModal
            isOpen={status === 'linking'}
            onClose={() => router.push('/login')}
            email={linkingState.email}
            provider={linkingState.provider}
            pendingLinkToken={linkingState.pendingLinkToken}
            onSuccess={() => router.push('/')}
          />
        )}
      </Card>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-foreground" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
