'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { rolesApi, type RoleRequestItem } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import {
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  Inbox,
} from 'lucide-react';

export default function AdminRolesPage() {
  const router = useRouter();
  const { user, accessToken, isAuthenticated } = useAuthStore();

  const [requests, setRequests] = useState<RoleRequestItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>(
    'pending',
  );
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Reject modal state
  const [rejectingItem, setRejectingItem] = useState<RoleRequestItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const isAdmin = user && (user.role === 'superadmin' || user.role === 'org_admin');

  const fetchRequests = useCallback(async () => {
    if (!accessToken || !isAdmin) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await rolesApi.getAdminRequests(
        {
          status: filterStatus === 'all' ? undefined : filterStatus,
          limit: 50,
        },
        accessToken,
      );
      setRequests(res.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch role applications.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, isAdmin, filterStatus]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchRequests();
    }
  }, [isAuthenticated, isAdmin, fetchRequests]);

  // Handle Approve
  const handleApprove = async (item: RoleRequestItem) => {
    if (!accessToken) return;

    setActionLoadingId(item.id);
    setNotification(null);
    try {
      const res = await rolesApi.reviewRequest(
        {
          requestId: item.id,
          action: 'approve',
        },
        accessToken,
      );

      setNotification({
        type: 'success',
        message: res.message || `Approved @${item.user?.username || 'user'} as Creator.`,
      });
      fetchRequests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval failed.';
      setNotification({ type: 'error', message: msg });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Reject Submit
  const handleRejectConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !rejectingItem) return;

    setActionLoadingId(rejectingItem.id);
    setNotification(null);
    try {
      const res = await rolesApi.reviewRequest(
        {
          requestId: rejectingItem.id,
          action: 'reject',
          rejectionReason: rejectionReason.trim(),
        },
        accessToken,
      );

      setNotification({
        type: 'success',
        message: res.message || `Application rejected for @${rejectingItem.user?.username}.`,
      });
      setRejectingItem(null);
      setRejectionReason('');
      fetchRequests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rejection failed.';
      setNotification({ type: 'error', message: msg });
    } finally {
      setActionLoadingId(null);
    }
  };

  // RBAC Access Denied Fallback (US-01.04 Scenario 2)
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-canvas bg-neo-grid flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white dark:bg-card border-2 border-brand-dark shadow-neo-lg text-center p-8 space-y-6">
          <div className="mx-auto w-16 h-16 rounded-badge bg-rose-100 dark:bg-rose-950/60 border-2 border-brand-dark flex items-center justify-center shadow-neo">
            <ShieldAlert className="w-8 h-8 text-rose-600 dark:text-rose-400" />
          </div>

          <div className="space-y-2">
            <Badge
              variant="outline"
              className="bg-rose-100 text-rose-800 border-rose-500 font-mono text-[10px] font-extrabold"
            >
              403 FORBIDDEN
            </Badge>
            <h1 className="text-2xl font-extrabold text-brand-dark dark:text-white font-mono">
              Access Denied
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your security clearance level is insufficient. This console is restricted strictly to{' '}
              <strong>Platform Administrators</strong>.
            </p>
          </div>

          <Button
            variant="lime"
            onClick={() => router.push('/')}
            className="w-full font-bold flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Command Center</span>
          </Button>
        </Card>
      </div>
    );
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-canvas bg-neo-grid py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-muted-foreground hover:text-brand-dark dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>HQ / Command Center</span>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchRequests}
            disabled={isLoading}
            className="flex items-center gap-1.5 font-mono text-xs font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Registry</span>
          </Button>
        </div>

        {/* Header HUD */}
        <Card className="bg-white dark:bg-card border-2 border-brand-dark shadow-neo p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-[12px] bg-brand-lime border-2 border-brand-dark flex items-center justify-center shadow-neo-sm shrink-0">
                <ShieldCheck className="w-7 h-7 text-brand-dark" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-dark dark:text-white font-mono">
                    RBAC Clearance Console
                  </h1>
                  <Badge variant="lime" className="font-mono text-[10px] font-extrabold">
                    ADMIN ONLY
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                  Review and verify candidate dossiers applying for{' '}
                  <strong>Lab Creator Clearance</strong>. Approved members gain access to challenge
                  design tools and VM container orchestration.
                </p>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-brand-gray/60 border-2 border-brand-dark rounded-[10px] shadow-neo-sm text-center">
                <span className="text-[10px] font-mono text-muted-foreground block uppercase font-bold">
                  Pending Applications
                </span>
                <span className="text-xl font-extrabold font-mono text-brand-dark dark:text-white">
                  {pendingCount}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Global Notifications */}
        {notification && (
          <div
            className={`p-4 rounded-[10px] border-2 border-brand-dark shadow-neo-sm flex items-center justify-between gap-3 text-xs font-bold ${
              notification.type === 'success'
                ? 'bg-brand-lime/30 text-brand-dark'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-700" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-700" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-muted-foreground hover:text-brand-dark"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 border-b-2 border-brand-dark pb-3 overflow-x-auto">
          {(['pending', 'all', 'approved', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`h-9 px-4 rounded-[8px] font-mono text-xs font-extrabold uppercase transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                filterStatus === tab
                  ? 'bg-brand-dark text-brand-lime border-2 border-brand-dark shadow-neo-sm -translate-y-0.5'
                  : 'bg-white hover:bg-brand-gray text-brand-dark border-2 border-brand-dark/20 hover:border-brand-dark'
              }`}
            >
              <span>{tab}</span>
              {tab === 'pending' && pendingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand-lime text-brand-dark text-[10px] flex items-center justify-center font-extrabold">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-dark dark:text-white" />
            <p className="text-xs font-mono text-muted-foreground">
              Querying security clearance registry...
            </p>
          </div>
        ) : errorMessage ? (
          <Card className="p-8 text-center border-2 border-brand-dark bg-rose-50 text-rose-800 space-y-3">
            <AlertTriangle className="w-8 h-8 mx-auto text-rose-600" />
            <p className="text-xs font-bold font-mono">{errorMessage}</p>
            <Button variant="outline" size="sm" onClick={fetchRequests} className="font-bold">
              Try Again
            </Button>
          </Card>
        ) : requests.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed border-brand-dark/30 bg-white/50 space-y-3">
            <Inbox className="w-10 h-10 mx-auto text-muted-foreground/60" />
            <h3 className="text-base font-bold text-brand-dark dark:text-white font-mono">
              No Applications in Registry
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              There are currently no {filterStatus !== 'all' ? filterStatus : ''} Creator clearance
              requests to display.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((item) => {
              const isActionRunning = actionLoadingId === item.id;

              return (
                <Card
                  key={item.id}
                  className="bg-white dark:bg-card border-2 border-brand-dark shadow-neo p-5 sm:p-6 space-y-4 transition-all"
                >
                  {/* Top Bar: Applicant Info & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-dark/15 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[8px] bg-brand-dark text-brand-lime border border-brand-dark flex items-center justify-center font-mono font-extrabold text-sm shrink-0">
                        {item.user?.username ? item.user.username[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/user/${encodeURIComponent(item.user?.username || '')}`}
                            className="font-extrabold text-sm text-brand-dark dark:text-white hover:underline flex items-center gap-1 font-mono"
                          >
                            <span>@{item.user?.username || 'Unknown Operator'}</span>
                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                          </Link>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-lime text-brand-dark font-extrabold border border-brand-dark/20">
                            {item.user?.rankTier || 'Novice'}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-muted-foreground">
                          {item.user?.email} • {item.user?.expPoints?.toLocaleString() ?? 0} EXP
                        </p>
                      </div>
                    </div>

                    {/* Status Badge & Timestamp */}
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </span>

                      {item.status === 'pending' && (
                        <Badge
                          variant="outline"
                          className="bg-amber-100 text-amber-900 border-amber-500 font-mono text-[10px] font-extrabold"
                        >
                          PENDING
                        </Badge>
                      )}
                      {item.status === 'approved' && (
                        <Badge variant="lime" className="font-mono text-[10px] font-extrabold">
                          APPROVED
                        </Badge>
                      )}
                      {item.status === 'rejected' && (
                        <Badge
                          variant="outline"
                          className="bg-rose-100 text-rose-900 border-rose-500 font-mono text-[10px] font-extrabold"
                        >
                          REJECTED
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Specialty & Motivation */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold block">
                        Domain Specialty
                      </span>
                      <span className="inline-block px-2.5 py-1 bg-brand-gray border border-brand-dark/20 rounded-[6px] font-mono text-xs font-extrabold text-brand-dark">
                        {item.specialty}
                      </span>
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold block">
                        Experience & Challenge Concept
                      </span>
                      <p className="text-xs text-brand-dark/90 dark:text-white/90 leading-relaxed bg-brand-gray/30 p-3 rounded-[8px] border border-brand-dark/10">
                        &ldquo;{item.motivation}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Portfolio Link & Review Information */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div>
                      {item.portfolioUrl ? (
                        <a
                          href={item.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-primary hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>
                            Inspect Candidate Portfolio (
                            {item.portfolioUrl.replace(/https?:\/\//, '').slice(0, 30)}...)
                          </span>
                        </a>
                      ) : (
                        <span className="text-[11px] font-mono text-muted-foreground">
                          No external portfolio provided
                        </span>
                      )}

                      {item.rejectionReason && (
                        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium pt-1">
                          Reason: {item.rejectionReason}
                        </p>
                      )}
                    </div>

                    {/* Action Controls for Pending Items */}
                    {item.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isActionRunning}
                          onClick={() => {
                            setRejectingItem(item);
                            setRejectionReason('');
                          }}
                          className="font-mono text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-300"
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          <span>Reject</span>
                        </Button>

                        <Button
                          variant="lime"
                          size="sm"
                          disabled={isActionRunning}
                          onClick={() => handleApprove(item)}
                          className="font-mono text-xs font-extrabold flex items-center gap-1"
                        >
                          {isActionRunning ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>Approve Clearance</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject Reason Dialog */}
      <Dialog open={!!rejectingItem} onOpenChange={(open) => !open && setRejectingItem(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-card border-2 border-brand-dark shadow-neo-lg rounded-[14px] p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-extrabold font-mono text-brand-dark dark:text-white flex items-center gap-2">
              <X className="w-5 h-5 text-rose-600" />
              <span>Reject Application</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide feedback for @{rejectingItem?.user?.username}. This note will be visible on
              their application status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRejectConfirm} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-dark dark:text-white font-mono">
                Rejection Reason / Guidance *
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Please solve at least 5 medium rooms, or provide public writeups before applying."
                className="w-full p-2.5 bg-white dark:bg-brand-dark/40 border-2 border-brand-dark rounded-[10px] shadow-neo-sm font-sans text-xs text-brand-dark dark:text-white outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <Button type="button" variant="outline" onClick={() => setRejectingItem(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={rejectionReason.trim().length < 5}
                className="font-bold"
              >
                Confirm Rejection
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
