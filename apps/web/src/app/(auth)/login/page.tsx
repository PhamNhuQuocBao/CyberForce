'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Eye, EyeOff, Lock, AlertTriangle, ArrowRight, Loader2, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null);

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
    <Card className="w-full bg-white dark:bg-card border-2 border-brand-dark shadow-neo-lg">
      {/* Switcher Header Tabs */}
      <div className="grid grid-cols-2 border-b-2 border-brand-dark bg-brand-gray/50 dark:bg-brand-dark/20 text-center font-bold text-sm">
        <div className="py-4 bg-white dark:bg-card text-brand-dark dark:text-white border-r-2 border-brand-dark flex items-center justify-center gap-2">
          <Badge variant="lime" className="h-5 px-1.5 text-[10px]">
            ACTIVE
          </Badge>
          <span>Sign In</span>
        </div>
        <Link
          href="/register"
          className="py-4 text-muted-foreground hover:text-brand-dark dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-1.5"
        >
          <span>Create Account</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <CardHeader className="space-y-1 pt-8 pb-4">
        <CardTitle className="text-3xl font-extrabold tracking-tight text-brand-dark dark:text-white">
          Operator Login
        </CardTitle>
        <CardDescription className="text-sm font-medium text-muted-foreground">
          Enter your security credentials to access your dedicated sandboxes.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Error / Lockout Alert Banner */}
        {errorMessage && (
          <div
            className={`p-4 rounded-btn border-2 border-brand-dark shadow-neo-sm font-sans flex items-start gap-3 ${
              errorCode === 'ACCOUNT_LOCKED'
                ? 'bg-amber-100 text-amber-950 dark:bg-amber-950/40 dark:text-amber-200'
                : errorCode === 'ACCOUNT_EXISTS_DIFFERENT_PROVIDER'
                  ? 'bg-blue-100 text-blue-950 dark:bg-blue-950/40 dark:text-blue-200'
                  : 'bg-rose-100 text-rose-950 dark:bg-rose-950/40 dark:text-rose-200'
            }`}
          >
            {errorCode === 'ACCOUNT_LOCKED' ? (
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            )}

            <div className="text-xs space-y-1 flex-1">
              <div className="font-extrabold uppercase tracking-wide">
                {errorCode === 'ACCOUNT_LOCKED'
                  ? 'Security Lockout Enforced'
                  : errorCode === 'ACCOUNT_EXISTS_DIFFERENT_PROVIDER'
                    ? 'Account Link Required'
                    : 'Authentication Failure'}
              </div>
              <div className="font-medium leading-relaxed">{errorMessage}</div>

              {remainingSeconds !== null && remainingSeconds > 0 && (
                <div className="font-mono font-extrabold text-sm pt-1 text-amber-900 dark:text-amber-300">
                  ⏳ Unlocks in: {formatTimer(remainingSeconds)}
                </div>
              )}

              {remainingAttempts !== null &&
                remainingAttempts > 0 &&
                errorCode !== 'ACCOUNT_LOCKED' && (
                  <div className="font-mono text-[11px] pt-0.5 text-rose-800 dark:text-rose-300">
                    ⚠️ {remainingAttempts} attempts remaining before temporary 15m lockout.
                  </div>
                )}
            </div>
          </div>
        )}

        {/* 1-Click OAuth Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading || oauthLoading !== null || Boolean(remainingSeconds)}
            className="w-full h-12 flex items-center justify-center gap-2.5 font-bold text-xs"
          >
            {oauthLoading === 'google' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthLogin('github')}
            disabled={isLoading || oauthLoading !== null || Boolean(remainingSeconds)}
            className="w-full h-12 flex items-center justify-center gap-2.5 font-bold text-xs"
          >
            {oauthLoading === 'github' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            )}
            <span>Continue with GitHub</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-brand-dark/20 dark:border-white/15"></div>
          <span className="flex-shrink mx-4 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground bg-white dark:bg-card px-2">
            Or with email & password
          </span>
          <div className="flex-grow border-t border-brand-dark/20 dark:border-white/15"></div>
        </div>

        {/* Email Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-dark dark:text-white flex items-center justify-between">
              <span>Email Address</span>
              <span className="text-[10px] text-muted-foreground font-mono font-normal">
                REQUIRED
              </span>
            </label>
            <Input
              type="email"
              placeholder="operator@cyberforce.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || Boolean(remainingSeconds)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-dark dark:text-white">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-muted-foreground hover:text-brand-dark dark:hover:text-white hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || Boolean(remainingSeconds)}
                required
                className="h-11 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-dark dark:hover:text-white transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded-badge border-2 border-brand-dark accent-brand-lime cursor-pointer"
            />
            <label
              htmlFor="remember"
              className="text-xs font-medium text-brand-dark dark:text-white cursor-pointer select-none"
            >
              Keep session active on this device
            </label>
          </div>

          <Button
            type="submit"
            variant="lime"
            size="lg"
            disabled={isLoading || Boolean(remainingSeconds)}
            className="w-full mt-2 h-13 text-sm font-extrabold tracking-wide uppercase flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Authenticate & Enter Range</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="bg-brand-gray/40 dark:bg-white/5 border-t border-brand-dark/15 dark:border-white/10 p-5 flex items-center justify-between text-xs text-muted-foreground">
        <span>Protected with Argon2id + Redis Anti-Bruteforce</span>
        <span className="font-mono text-[11px] font-bold text-brand-dark dark:text-white">
          v1.0.0
        </span>
      </CardFooter>
    </Card>
  );
}
