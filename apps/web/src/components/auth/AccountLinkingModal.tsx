'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { authApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Loader2, Eye, EyeOff } from 'lucide-react';
export interface AccountLinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  provider: string; // 'github' | 'google' | etc.
  pendingLinkToken: string;
  onSuccess?: () => void;
}

type VerificationMethod = 'password' | 'otp';

export function AccountLinkingModal({
  isOpen,
  onClose,
  email,
  provider,
  pendingLinkToken,
  onSuccess,
}: AccountLinkingModalProps) {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [method, setMethod] = useState<VerificationMethod>('password');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');

  // Status & Error management
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Timer countdown for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Sub-flow 1.2.3: Send 6-digit OTP code to user's registered email
  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    setErrorMessage(null);
    try {
      await authApi.initiateAccountLinking(pendingLinkToken);
      setOtpSent(true);
      setResendCooldown(60);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to send verification code. Please try again.');
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Sub-flow 1.2.2: Password Verification
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await authApi.verifyLinkPassword(pendingLinkToken, password);
      setAuth(res.data.user, res.data.accessToken);
      setIsSuccess(true);

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/');
        }
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.statusCode === 401) {
          setErrorMessage(
            'Incorrect password. Please verify your credentials or switch to email OTP.',
          );
        } else {
          setErrorMessage(err.message);
        }
      } else {
        setErrorMessage('Failed to verify password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sub-flow 1.2.4 & 1.2.5: OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setErrorMessage('Please enter a valid 6-digit numeric verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await authApi.verifyLinkOtp(pendingLinkToken, cleanOtp);
      setAuth(res.data.user, res.data.accessToken);
      setIsSuccess(true);

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/');
        }
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.statusCode === 401) {
          setErrorMessage('Invalid or expired verification code. Please request a new code.');
        } else {
          setErrorMessage(err.message);
        }
      } else {
        setErrorMessage('Failed to verify code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Capitalize provider name
  const formattedProvider = provider.charAt(0).toUpperCase() + provider.slice(1).toLowerCase();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isSuccess ? 'Đã liên kết tài khoản' : 'Xác minh tài khoản'}</DialogTitle>
          <DialogDescription>
            {isSuccess ? (
              'Đang chuyển đến trang chủ…'
            ) : (
              <>
                Email <span className="break-all">{email}</span> đã được đăng ký. Xác minh tài khoản
                để liên kết với {formattedProvider}.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        {isSuccess ? (
          <p role="status" className="text-sm">
            Liên kết thành công.
          </p>
        ) : (
          <>
            <div className="flex gap-2 border-b pb-3" aria-label="Phương thức xác minh">
              {(['password', 'otp'] as const).map((option) => (
                <Button
                  key={option}
                  variant={method === option ? 'secondary' : 'ghost'}
                  aria-pressed={method === option}
                  onClick={() => {
                    setMethod(option);
                    setErrorMessage(null);
                  }}
                >
                  {option === 'password' ? 'Mật khẩu' : 'Mã qua email'}
                </Button>
              ))}
            </div>
            {errorMessage && (
              <p role="alert" className="text-sm text-destructive">
                {errorMessage}
              </p>
            )}
            {method === 'password' ? (
              <form onSubmit={handleVerifyPassword} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="link-password" className="field-label">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <Input
                      id="link-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={isLoading || !password} className="w-full">
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}Xác minh & liên kết
                </Button>
              </form>
            ) : !otpSent ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Gửi mã xác minh 6 chữ số đến email đã đăng ký.
                </p>
                <Button onClick={handleSendOtp} disabled={isSendingOtp} className="w-full">
                  {isSendingOtp && <Loader2 className="h-4 w-4 animate-spin" />}Gửi mã xác minh
                </Button>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="link-otp" className="field-label">
                    Mã xác minh
                  </label>
                  <Input
                    id="link-otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={isLoading}
                    mono
                  />
                  <p className="text-xs text-muted-foreground">
                    Kiểm tra hộp thư đến hoặc thư rác của bạn.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="link"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || resendCooldown > 0}
                >
                  {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại mã'}
                </Button>
                <Button type="submit" disabled={isLoading || otp.length !== 6} className="w-full">
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}Xác minh & liên kết
                </Button>
              </form>
            )}
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
