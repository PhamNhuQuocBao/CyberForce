'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardDescription } from '@/components/ui/card';
import { authApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live password strength criteria
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !username || !password) return;

    if (!isPasswordValid) {
      setErrorMessage('Please satisfy all password complexity criteria before proceeding.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authApi.register({
        email,
        username,
        password,
      });

      setAuth(res.data.user, res.data.accessToken);
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to connect to registration gateway. Please check your network.');
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
        setErrorMessage(`Failed to initiate ${provider} registration.`);
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold tracking-tight">Tạo tài khoản</h1>
          <CardDescription>Bắt đầu xây dựng năng lực an ninh mạng.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {errorMessage && (
            <div
              role="alert"
              className="rounded-btn border border-destructive p-3 text-sm text-destructive"
            >
              <p>{errorMessage}</p>
            </div>
          )}
          <div className="grid gap-3">
            {(['google', 'github'] as const).map((provider) => (
              <Button
                key={provider}
                type="button"
                variant="outline"
                onClick={() => handleOAuthLogin(provider)}
                disabled={isLoading || oauthLoading !== null}
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
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="username" className="field-label">
                Tên người dùng
              </label>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={50}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Từ 3–50 ký tự. Tên hiển thị trên hồ sơ của bạn.
              </p>
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
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-12"
                  aria-describedby="password-criteria"
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
            <ul id="password-criteria" className="space-y-2 text-xs text-muted-foreground">
              {[
                [hasMinLength, 'Ít nhất 8 ký tự'],
                [hasUppercase, 'Có chữ in hoa'],
                [hasNumber, 'Có chữ số'],
                [hasSpecial, 'Có ký tự đặc biệt'],
              ].map(([met, label]) => (
                <li key={String(label)} className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center" aria-hidden="true">
                    {met ? <Check className="h-4 w-4 text-foreground" /> : '–'}
                  </span>
                  <span className="sr-only">{met ? 'Đã đạt: ' : 'Chưa đạt: '}</span>
                  {label}
                </li>
              ))}
            </ul>
            <Button type="submit" className="w-full" disabled={isLoading || oauthLoading !== null}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Đang xử lý…' : 'Tạo tài khoản'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Đã có tài khoản?{' '}
        <Link href="/login" className="text-link text-foreground">
          Đăng nhập
        </Link>
      </p>
    </>
  );
}
