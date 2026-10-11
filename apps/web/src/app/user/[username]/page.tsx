'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Loader2, Lock, Share2, Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Navbar } from '@/components/layout/Navbar';
import { SkillRadarChart } from '@/components/profile/SkillRadarChart';
import { ProfileSettingsDialog } from '@/components/profile/ProfileSettingsDialog';
import { userApi, type UserDossierResponse } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
const skills = [
  ['webExploitation', 'Web Exploitation'],
  ['cloudSecurity', 'Cloud Security'],
  ['networkPentest', 'Network Pentest'],
  ['devSecOps', 'DevSecOps'],
  ['cryptography', 'Cryptography'],
  ['reverseEngineering', 'Reverse Engineering'],
  ['osint', 'OSINT'],
  ['binaryExploitation', 'Binary Exploitation'],
] as const;
export default function UserProfilePage() {
  const params = useParams();
  const rawUsername = params?.username as string;
  const username = decodeURIComponent(rawUsername || '');

  const { accessToken, isLoading: authLoading, initialize } = useAuthStore();
  const [dossier, setDossier] = useState<UserDossierResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrivacyWarningOpen, setIsPrivacyWarningOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeCertModal, setActiveCertModal] = useState<string | null>(null);

  // Initialize auth store on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Fetch dossier
  const fetchDossier = useCallback(async () => {
    if (!username) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await userApi.getProfile(username, accessToken ?? undefined);
      setDossier(res.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operator not found or network error';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [username, accessToken]);

  useEffect(() => {
    if (!authLoading) {
      fetchDossier();
    }
  }, [authLoading, fetchDossier]);

  // Handle Copy Share Link
  const handleCopyLink = () => {
    if (!dossier) return;

    // If profile is private and user is the owner, prompt warning modal
    if (!dossier.isPublic && dossier.isSelf) {
      setIsPrivacyWarningOpen(true);
      return;
    }

    executeCopy();
  };

  const executeCopy = () => {
    const url =
      typeof window !== 'undefined'
        ? window.location.href
        : `https://cyberforce.io/user/${username}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success('Public CV link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Quick switch from private to public
  const handleQuickMakePublic = async () => {
    if (!accessToken) return;
    try {
      await userApi.updateProfile({ isPublic: true }, accessToken);
      toast.success('Profile switched to PUBLIC successfully!');
      setIsPrivacyWarningOpen(false);
      fetchDossier();
    } catch {
      toast.error('Failed to change privacy settings');
    }
  };

  if (isLoading || authLoading)
    return (
      <>
        <Navbar />
        <main id="main-content" className="page-container py-24" role="status">
          <Loader2 className="mb-4 h-6 w-6 animate-spin" />
          <p>Đang tải hồ sơ {username}…</p>
        </main>
      </>
    );
  if (error || !dossier)
    return (
      <>
        <Navbar />
        <main id="main-content" className="page-container">
          <Card className="mx-auto max-w-lg p-6">
            <h1 className="text-2xl font-semibold">Không thể tải hồ sơ</h1>
            <p className="mt-3 break-words text-sm text-muted-foreground" role="alert">
              {error || 'Không tìm thấy người dùng này.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={fetchDossier}>Thử lại</Button>
              <Button asChild variant="outline">
                <Link href="/">Về trang chủ</Link>
              </Button>
            </div>
          </Card>
        </main>
      </>
    );
  if (!dossier.isPublic && !dossier.isSelf)
    return (
      <>
        <Navbar />
        <main id="main-content" className="page-container">
          <Card className="mx-auto max-w-lg p-8">
            <Lock className="mb-5 h-6 w-6 text-muted-foreground" />
            <h1 className="text-2xl font-semibold">Hồ sơ riêng tư</h1>
            <p className="mt-3 break-words text-sm leading-relaxed text-muted-foreground">
              @{username} chưa chia sẻ hồ sơ công khai. Kỹ năng, thành tích và chứng chỉ chỉ hiển
              thị với chủ tài khoản.
            </p>
            <p className="mt-6 text-sm">Đây là hồ sơ của bạn?</p>
            <Button asChild className="mt-3">
              <Link href="/login">Đăng nhập để xem hồ sơ</Link>
            </Button>
          </Card>
        </main>
      </>
    );
  const telemetry = dossier.telemetry || {
    webExploitation: 0,
    cloudSecurity: 0,
    networkPentest: 0,
    devSecOps: 0,
    cryptography: 0,
    reverseEngineering: 0,
    osint: 0,
    binaryExploitation: 0,
  };
  return (
    <div className="min-h-screen">
      <Navbar />
      <main id="main-content" className="page-container space-y-6">
        {!dossier.isPublic && dossier.isSelf && (
          <section
            className="flex flex-col justify-between gap-4 rounded-card border bg-card p-4 sm:flex-row sm:items-center"
            aria-label="Quyền riêng tư"
          >
            <div>
              <p className="font-medium">Hồ sơ đang ở chế độ riêng tư</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Chỉ bạn có thể xem thông tin bên dưới.
              </p>
            </div>
            <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
              Thay đổi quyền riêng tư
            </Button>
          </section>
        )}
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <p className="mb-2 text-sm text-muted-foreground">
                Hồ sơ năng lực · {dossier.isPublic ? 'Công khai' : 'Riêng tư'}
              </p>
              <h1 className="break-words text-3xl font-semibold tracking-tight">
                {dossier.username}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {dossier.specialty || 'An ninh mạng tổng quát'}
              </p>
              {dossier.bio && (
                <p className="mt-4 max-w-2xl whitespace-pre-wrap break-words text-sm leading-7">
                  {dossier.bio}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {dossier.isSelf && (
                <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
                  <Settings className="h-4 w-4" />
                  Chỉnh sửa
                </Button>
              )}
              <Button variant="outline" onClick={handleCopyLink}>
                {copiedLink ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                {copiedLink ? 'Đã sao chép' : 'Chia sẻ'}
              </Button>
            </div>
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-6 border-t pt-6 md:grid-cols-4">
            {[
              ['Cấp bậc', dossier.rankTier || 'Chưa có'],
              ['Điểm kinh nghiệm', `${dossier.expPoints?.toLocaleString() ?? 0} EXP`],
              ['Chuỗi học tập', `${dossier.streakDays ?? 0} ngày`],
              ['Lab hoàn thành', dossier.labsCleared ?? 0],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="mt-2 text-lg font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Năng lực đã tích lũy</CardTitle>
              <p className="text-sm text-muted-foreground">Điểm kỹ năng theo 8 lĩnh vực</p>
            </CardHeader>
            <CardContent>
              <SkillRadarChart telemetry={telemetry} />
              <dl className="mt-4 divide-y">
                {skills.map(([key, label]) => (
                  <div key={key} className="flex justify-between gap-4 py-3 text-sm">
                    <dt>{label}</dt>
                    <dd className="shrink-0 font-mono">{telemetry[key]} điểm</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chứng chỉ</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {dossier.certificates?.length || 0} chứng chỉ đã cấp
                </p>
              </CardHeader>
              <CardContent>
                {dossier.certificates?.length ? (
                  <ul className="divide-y">
                    {dossier.certificates.map((cert) => (
                      <li key={cert.code} className="py-4 first:pt-0">
                        <h3 className="font-medium">{cert.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Cấp ngày {cert.issuedAt} · Kết quả {cert.scorePercentage}%
                        </p>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <span className="break-all font-mono text-xs text-muted-foreground">
                            {cert.code}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveCertModal(cert.verificationHash)}
                          >
                            Xem mã xác minh
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-3 text-sm text-muted-foreground">Chưa có chứng chỉ được cấp.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Thành tích</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Đã đạt {dossier.badges?.filter((b) => b.isUnlocked).length || 0} /{' '}
                  {dossier.badges?.length || 0} thành tích
                </p>
              </CardHeader>
              <CardContent>
                {dossier.badges?.length ? (
                  <ul className="divide-y">
                    {dossier.badges.map((badge) => (
                      <li
                        key={badge.id}
                        className="flex items-start justify-between gap-4 py-4 first:pt-0"
                      >
                        <div>
                          <h3 className="text-sm font-medium">{badge.name}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {badge.description}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {badge.isUnlocked ? 'Đã đạt' : 'Chưa đạt'}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-3 text-sm text-muted-foreground">Chưa có thành tích.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Lộ trình học tập</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {dossier.completedPaths?.length ? (
                  dossier.completedPaths.map((path) => (
                    <div key={path.title}>
                      <div className="mb-3 flex flex-wrap justify-between gap-2 text-sm">
                        <h3 className="font-medium">{path.title}</h3>
                        <span className="text-muted-foreground">
                          {path.completedRooms}/{path.totalRooms} phòng ·{' '}
                          {path.completionPercentage}%
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={path.title}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={path.completionPercentage}
                        className="h-2 overflow-hidden rounded-btn bg-muted"
                      >
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${Math.min(100, Math.max(0, path.completionPercentage))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa có lộ trình hoàn thành.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <ProfileSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        dossier={dossier}
        onProfileUpdated={(updated) =>
          setDossier((prev) => (prev ? { ...prev, ...updated } : null))
        }
      />
      <Dialog open={isPrivacyWarningOpen} onOpenChange={setIsPrivacyWarningOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hồ sơ chưa công khai</DialogTitle>
            <DialogDescription>
              Người nhận liên kết sẽ thấy thông báo riêng tư. Bạn có thể sao chép liên kết hoặc thay
              đổi chế độ hiển thị.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPrivacyWarningOpen(false);
                executeCopy();
              }}
            >
              Sao chép liên kết
            </Button>
            <Button onClick={handleQuickMakePublic}>Chuyển sang công khai</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!activeCertModal} onOpenChange={() => setActiveCertModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mã xác minh chứng chỉ</DialogTitle>
            <DialogDescription>Mã được lưu cùng chứng chỉ trong hồ sơ của bạn.</DialogDescription>
          </DialogHeader>
          <p className="break-all rounded-btn bg-muted p-4 font-mono text-xs">{activeCertModal}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveCertModal(null)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
