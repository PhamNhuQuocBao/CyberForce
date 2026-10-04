'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { authApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import {
  ShieldAlert,
  KeyRound,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  X,
  RefreshCw,
} from 'lucide-react';

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="linking-dialog-title"
    >
      <Card className="w-full max-w-lg bg-white dark:bg-card border-2 border-brand-dark shadow-neo-lg relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Action Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-brand-dark bg-brand-gray/40 dark:bg-brand-dark/20">
          <div className="flex items-center gap-2">
            <Badge variant="lime" className="font-extrabold text-[10px] tracking-wider">
              SUB-FLOW 1.2
            </Badge>
            <span className="text-xs font-mono font-bold uppercase text-brand-dark dark:text-white">
              ACCOUNT LINKING
            </span>
          </div>

          {/* Sub-flow 1.2.1: Safe Cancel Action */}
          <button
            onClick={onClose}
            className="p-1 rounded-btn hover:bg-brand-gray dark:hover:bg-white/10 text-muted-foreground hover:text-brand-dark dark:hover:text-white transition-colors"
            title="Cancel linking"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-6">
            <div className="mx-auto h-16 w-16 rounded-badge bg-primary border-2 border-brand-dark flex items-center justify-center shadow-neo">
              <CheckCircle2 className="w-8 h-8 text-brand-dark" />
            </div>

            <div className="space-y-2">
              <Badge variant="lime" className="font-extrabold text-[11px]">
                CLEARANCE CONSOLIDATED
              </Badge>
              <h3 className="text-2xl font-extrabold text-brand-dark dark:text-white">
                Account Linked Successfully!
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Your {formattedProvider} identity is now securely linked to{' '}
                <strong className="text-brand-dark dark:text-white font-mono">{email}</strong>.
                Redirecting to Command Center...
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-bold text-brand-dark dark:text-white">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Initializing workspace session...</span>
            </div>
          </div>
        ) : (
          <div className="p-6 md:p-8 space-y-6">
            {/* Context Card Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
                <ShieldAlert className="w-5 h-5" />
                <CardTitle
                  id="linking-dialog-title"
                  className="text-2xl font-extrabold text-brand-dark dark:text-white tracking-tight"
                >
                  Existing Account Detected
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                An account registered with{' '}
                <strong className="text-brand-dark dark:text-white font-mono">{email}</strong>{' '}
                already exists in CyberForce. To link your incoming{' '}
                <span className="font-bold text-brand-dark dark:text-white">
                  {formattedProvider}
                </span>{' '}
                identity, verify ownership using your existing credentials.
              </CardDescription>
            </div>

            {/* Verification Method Switcher */}
            <div className="grid grid-cols-2 p-1 rounded-btn bg-brand-gray/60 dark:bg-brand-dark/40 border border-brand-dark text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMethod('password');
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded-[10px] transition-all flex items-center justify-center gap-2 ${
                  method === 'password'
                    ? 'bg-primary text-brand-dark shadow-neo-sm border border-brand-dark'
                    : 'text-muted-foreground hover:text-brand-dark dark:hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Password</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('otp');
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded-[10px] transition-all flex items-center justify-center gap-2 ${
                  method === 'otp'
                    ? 'bg-primary text-brand-dark shadow-neo-sm border border-brand-dark'
                    : 'text-muted-foreground hover:text-brand-dark dark:hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email OTP</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-btn bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Method 1: Password Form (Sub-flow 1.2.2) */}
            {method === 'password' && (
              <form onSubmit={handleVerifyPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-dark dark:text-white uppercase tracking-wider">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      autoFocus
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-dark dark:hover:text-white"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Enter the password associated with {email}.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    type="submit"
                    variant="lime"
                    size="default"
                    disabled={isLoading || !password}
                    className="w-full sm:flex-1 font-bold flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Link Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>

                  {/* Cancel Button (Sub-flow 1.2.1) */}
                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    onClick={onClose}
                    disabled={isLoading}
                    className="w-full sm:w-auto font-bold"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Method 2: Email OTP Form (Sub-flow 1.2.3, 1.2.4, 1.2.5) */}
            {method === 'otp' && (
              <div className="space-y-4">
                {!otpSent ? (
                  <div className="p-5 rounded-btn border border-brand-dark bg-brand-gray/30 dark:bg-brand-dark/20 text-center space-y-3">
                    <div className="h-10 w-10 mx-auto rounded-badge bg-primary/20 border border-brand-dark flex items-center justify-center">
                      <Mail className="w-5 h-5 text-brand-dark dark:text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-dark dark:text-white">
                        Send Verification Code to Email
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        We will send a 6-digit confirmation code to{' '}
                        <span className="font-mono font-medium text-brand-dark dark:text-white">
                          {email}
                        </span>
                        . Valid for 5 minutes.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="lime"
                      size="default"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      className="w-full font-bold flex items-center justify-center gap-2"
                    >
                      {isSendingOtp ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send 6-Digit OTP</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-brand-dark dark:text-white uppercase tracking-wider">
                          6-Digit Verification Code
                        </label>
                        {resendCooldown > 0 ? (
                          <span className="text-[11px] font-mono font-bold text-muted-foreground">
                            Resend in {resendCooldown}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isSendingOtp}
                            className="text-[11px] font-bold text-brand-dark dark:text-primary hover:underline flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Resend Code</span>
                          </button>
                        )}
                      </div>

                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        disabled={isLoading}
                        autoFocus
                        mono
                        className="text-center text-lg font-mono font-bold tracking-[0.35em]"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Code sent to {email}. Check your spam or inbox folder.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                      <Button
                        type="submit"
                        variant="lime"
                        size="default"
                        disabled={isLoading || otp.length !== 6}
                        className="w-full sm:flex-1 font-bold flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Verifying Code...</span>
                          </>
                        ) : (
                          <>
                            <span>Verify & Link</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>

                      {/* Cancel Button (Sub-flow 1.2.1) */}
                      <Button
                        type="button"
                        variant="outline"
                        size="default"
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full sm:w-auto font-bold"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
