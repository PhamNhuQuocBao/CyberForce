'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardDescription } from '@/components/ui/card';
import { authApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { AccountLinkingModal } from '@/components/auth/AccountLinkingModal';
export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null);

  // CF-102: Account Linking State
  const [linkingData, setLinkingData] = useState<{
    email: string;
    provider: string;
    pendingLinkToken: string;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  // Countdown timer for 429 lockout
  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setErrorMessage(null);
          setErrorCode(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMessage(null);
    setErrorCode(null);

    try {
      const res = await authApi.login({ email, password });
      setAuth(res.data.user, res.data.accessToken);
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorCode(err.code);
        setErrorMessage(err.message);

        if (err.statusCode === 429 && err.details?.remainingSeconds) {
          setRemainingSeconds(Number(err.details.remainingSeconds));
        }
        if (err.details?.remainingAttempts !== undefined) {
          setRemainingAttempts(Number(err.details.remainingAttempts));
        }
        if (err.code === 'ACCOUNT_EXISTS_DIFFERENT_PROVIDER' && err.details?.pendingLinkToken) {
          setLinkingData({
            email: (err.details.email as string) || email,
            provider: (err.details.attemptedProvider as string) || 'OAuth',
            pendingLinkToken: err.details.pendingLinkToken as string,
          });
        }
      } else {
        setErrorMessage('Failed to connect to authentication gateway. Please check your network.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    setOauthLoading(provider);
    setErrorMessage(null);
    try {
      const res = await authApi.getOAuthUrl(provider);
      window.location.href = res.data.url;
    } catch (err: unknown) {
      setOauthLoading(null);
      if (err instanceof ApiError) {
        setErrorMessage(`OAuth ${provider} error: ${err.message}`);
      } else {
        setErrorMessage(`Failed to initiate ${provider} authentication.`);
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold tracking-tight">Đăng nhập</h1>
          <CardDescription>Tiếp tục hành trình học tập của bạn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {errorMessage && (
            <div
              role="alert"
              className="rounded-btn border border-destructive p-3 text-sm text-destructive"
            >
              <p>{errorMessage}</p>
              {remainingSeconds !== null && remainingSeconds > 0 && (
                <p className="mt-2 font-mono">Thử lại sau {formatTimer(remainingSeconds)}</p>
              )}
              {remainingAttempts !== null &&
                remainingAttempts > 0 &&
                errorCode !== 'ACCOUNT_LOCKED' && (
                  <p className="mt-2">Còn {remainingAttempts} lần thử trước khi tạm khóa.</p>
                )}
            </div>
          )}
          <div className="grid gap-3">
            {(['google', 'github'] as const).map((provider) => (
              <Button
                key={provider}
                type="button"
                variant="outline"
                onClick={() => handleOAuthLogin(provider)}
                disabled={isLoading || oauthLoading !== null || Boolean(remainingSeconds)}
              >
                {oauthLoading === provider && <Loader2 className="h-4 w-4 animate-spin" />}Tiếp tục
                với {provider === 'google' ? 'Google' : 'GitHub'}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            Hoặc dùng email
            <span className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isLoading}>
            <div className="space-y-2">
              <label htmlFor="email" className="field-label">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="ban@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || Boolean(remainingSeconds)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="field-label">
                Mật khẩu
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || Boolean(remainingSeconds)}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  aria-pressed={showPassword}
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || oauthLoading !== null || Boolean(remainingSeconds)}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Đang xử lý…' : 'Đăng nhập'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="text-link text-foreground">
          Đăng ký
        </Link>
      </p>
      {linkingData && (
        <AccountLinkingModal
          isOpen={!!linkingData}
          onClose={() => setLinkingData(null)}
          email={linkingData.email}
          provider={linkingData.provider}
          pendingLinkToken={linkingData.pendingLinkToken}
          onSuccess={() => router.push('/')}
        />
      )}
    </>
  );
}
