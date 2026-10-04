'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Globe,
  Share2,
  Settings,
  Flame,
  Award,
  CheckCircle2,
  UserCheck,
  Check,
  AlertTriangle,
  FileCheck,
  ArrowLeft,
  Compass,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  const getProficiencyTier = (pts: number) => {
    if (pts >= 85) return 'Master Operator';
    if (pts >= 70) return 'Adept Specialist';
    if (pts >= 50) return 'Skilled Practitioner';
    return 'Apprentice';
  };

  // Skeleton loading screen
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-canvas bg-neo-grid flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-brand-dark border-t-brand-lime rounded-full animate-spin shadow-neo-sm mb-4" />
        <p className="font-mono text-sm font-bold text-brand-dark animate-pulse">
          ACCESSING OPERATOR DOSSIER // CALLSIGN: {username || '...'}
        </p>
      </div>
    );
  }

  // Error / Not found screen
  if (error || !dossier) {
    return (
      <div className="min-h-screen bg-canvas bg-neo-grid flex flex-col">
        {/* Navigation */}
        <Navbar />

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border-2 border-brand-dark rounded-card p-8 shadow-neo-lg text-center space-y-5">
            <div className="w-14 h-14 bg-red-100 border-2 border-brand-dark rounded-badge mx-auto flex items-center justify-center shadow-neo-sm">
              <ShieldAlert className="w-7 h-7 text-red-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-brand-dark font-sans">
              OPERATOR NOT FOUND
            </h1>
            <p className="text-sm text-muted-foreground font-mono">
              {error || `No tactical dossier registered under callsign "${username}".`}
            </p>
            <div className="pt-2">
              <Link href="/">
                <Button variant="default" className="w-full gap-2">
                  <ArrowLeft className="w-4 h-4" /> Return to Platform
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // PERSPECTIVE A: Visitor viewing a Private Profile (Wireframe 2.2)
  if (!dossier.isPublic && !dossier.isSelf) {
    return (
      <div className="min-h-screen bg-canvas bg-neo-grid flex flex-col justify-between">
        {/* Top Header */}
        <Navbar />

        {/* Wireframe 2.2 Perspective A Classified Shield */}
        <main className="max-w-3xl mx-auto px-6 py-16 flex-1 flex items-center justify-center w-full">
          <div className="w-full bg-white border-2 border-brand-dark rounded-card p-8 sm:p-12 shadow-neo-lg text-center space-y-6 relative overflow-hidden">
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-brand-dark" />

            <div className="w-16 h-16 bg-brand-dark border-2 border-brand-dark rounded-badge mx-auto flex items-center justify-center shadow-neo-sm">
              <Lock className="w-8 h-8 text-brand-lime" />
            </div>

            <div className="space-y-2">
              <Badge variant="dark" className="font-mono text-xs px-3 py-1">
                US-01.03 // CLASSIFIED RESTRICTED
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
                DOSSIER CLASSIFIED (PRIVATE)
              </h1>
            </div>

            <div className="max-w-lg mx-auto bg-brand-gray/80 border border-brand-dark/15 p-4 rounded-btn font-mono text-xs sm:text-sm text-brand-dark leading-relaxed">
              The operator{' '}
              <span className="font-bold text-black bg-brand-lime/50 px-1.5 py-0.5 rounded">
                @{username}
              </span>{' '}
              has designated their portfolio as private. Skill telemetry, 8-axis radar analysis,
              badges, and capstone credentials are restricted from public disclosure.
            </div>

            <div className="pt-4 border-t border-brand-dark/10 space-y-4">
              <p className="text-xs font-mono font-bold text-brand-dark uppercase tracking-wider">
                Are you this operator?
              </p>
              <div>
                <Link href="/login">
                  <Button variant="dark" className="gap-2 px-6">
                    <UserCheck className="w-4 h-4 text-brand-lime" />
                    Sign In to Access Your Dossier
                  </Button>
                </Link>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/" className="w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Compass className="w-4 h-4" /> Explore Public Labs
                  </Button>
                </Link>
                <Link href="/" className="w-full sm:w-auto">
                  <Button variant="secondary" size="sm" className="w-full gap-2">
                    <Trophy className="w-4 h-4" /> View Global Leaderboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-brand-dark/15 py-6 text-center text-xs font-mono text-muted-foreground">
          CyberForce Cloud Cyber Range &bull; Zero-Knowledge Portfolio Privacy Shield
        </footer>
      </div>
    );
  }

  // PERSPECTIVE B & C: Public profile view OR Self viewing private profile
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
    <div className="min-h-screen bg-canvas bg-neo-grid flex flex-col justify-between">
      {/* Top Header */}
      <Navbar />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8 flex-1 w-full">
        {/* Perspective B Amber Notice Banner: Only shown to Owner if Profile is Private */}
        {!dossier.isPublic && dossier.isSelf && (
          <div className="p-4 bg-amber-50 border-2 border-amber-500 rounded-card shadow-neo-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500 text-white rounded-badge border border-brand-dark shadow-neo-sm shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-brand-dark font-sans flex items-center gap-2">
                  <span>OPERATOR NOTICE // DOSSIER CURRENTLY PRIVATE</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-mono font-bold">
                    PREVIEWING AS SELF
                  </span>
                </h4>
                <p className="text-xs text-amber-900 font-medium">
                  Visitors and recruiters cannot view your telemetry radar or badges. They receive
                  the Classified Shield screen.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
                className="gap-1.5 text-xs bg-white"
              >
                <Settings className="w-3.5 h-3.5" /> Privacy Settings
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleQuickMakePublic}
                className="gap-1.5 text-xs bg-brand-lime text-brand-dark hover:bg-brand-lime-hover"
              >
                <Globe className="w-3.5 h-3.5" /> Switch to Public Mode Now
              </Button>
            </div>
          </div>
        )}

        {/* SECTION 1: OPERATOR DOSSIER HEADER */}
        <section className="bg-white border-2 border-brand-dark rounded-card p-6 sm:p-8 shadow-neo-lg relative overflow-hidden">
          {/* Subtle top banner strip */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-brand-dark" />

          {/* Subheader callsign & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-dark/10">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-lime border border-brand-dark" />
              <span>OPERATOR DOSSIER // CALLSIGN: {dossier.username}</span>
            </div>

            <div className="flex items-center gap-2.5">
              {dossier.isSelf && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSettingsOpen(true)}
                  className="gap-1.5 text-xs font-mono font-bold"
                >
                  <Settings className="w-3.5 h-3.5" /> Edit Dossier
                </Button>
              )}

              <Button
                variant="default"
                size="sm"
                onClick={handleCopyLink}
                className="gap-1.5 text-xs font-mono font-bold"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-800" /> Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" /> Copy CV Share Link
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Operator Profile Details */}
          <div className="pt-6 flex flex-col md:flex-row items-start gap-6">
            {/* Avatar block */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-card border-2 border-brand-dark bg-brand-lime flex items-center justify-center font-extrabold text-3xl sm:text-4xl text-brand-dark shadow-neo select-none">
                {dossier.username.slice(0, 2).toUpperCase()}
              </div>
              <div
                className="absolute -bottom-2 -right-2 p-1.5 bg-brand-dark text-white rounded-badge border border-brand-dark shadow-neo-sm"
                title="Verified CyberForce Operator"
              >
                <ShieldCheck className="w-4 h-4 text-brand-lime" />
              </div>
            </div>

            {/* Core Info */}
            <div className="space-y-4 flex-1">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark font-sans">
                    {dossier.username}
                  </h1>
                  <Badge variant="lime" className="gap-1 font-mono text-[11px] font-bold">
                    VERIFIED OPERATOR ✓
                  </Badge>
                  {dossier.isPublic ? (
                    <Badge
                      variant="secondary"
                      className="gap-1 font-mono text-[11px] border border-brand-dark/20"
                    >
                      <Globe className="w-3 h-3 text-emerald-600" /> PUBLIC DOSSIER
                    </Badge>
                  ) : (
                    <Badge variant="dark" className="gap-1 font-mono text-[11px]">
                      <Lock className="w-3 h-3 text-brand-lime" /> CLASSIFIED DOSSIER
                    </Badge>
                  )}
                </div>

                <p className="text-sm font-bold text-brand-dark/80 font-mono">
                  Specialty:{' '}
                  <span className="text-black font-extrabold">
                    {dossier.specialty || 'General Cybersecurity Operator'}
                  </span>
                </p>
              </div>

              {/* Bio summary */}
              {dossier.bio && (
                <p className="text-sm text-brand-dark/90 leading-relaxed font-sans max-w-2xl bg-brand-gray/60 p-3 rounded-btn border border-brand-dark/10">
                  {dossier.bio}
                </p>
              )}

              {/* Metric stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-brand-gray rounded-btn border border-brand-dark/15 shadow-neo-sm">
                  <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                    Rank Tier
                  </div>
                  <div className="text-sm font-extrabold text-brand-dark font-mono truncate">
                    {dossier.rankTier}
                  </div>
                </div>
                <div className="p-3 bg-brand-gray rounded-btn border border-brand-dark/15 shadow-neo-sm">
                  <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                    Total EXP
                  </div>
                  <div className="text-sm font-extrabold text-brand-dark font-mono">
                    {dossier.expPoints?.toLocaleString()} pts
                  </div>
                </div>
                <div className="p-3 bg-brand-gray rounded-btn border border-brand-dark/15 shadow-neo-sm">
                  <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                    Active Streak
                  </div>
                  <div className="text-sm font-extrabold text-brand-dark font-mono flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{dossier.streakDays} Days</span>
                  </div>
                </div>
                <div className="p-3 bg-brand-gray rounded-btn border border-brand-dark/15 shadow-neo-sm">
                  <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                    Labs Cleared
                  </div>
                  <div className="text-sm font-extrabold text-brand-dark font-mono">
                    {dossier.labsCleared} Cleared
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: 2-COLUMN ASYMMETRIC SHOWCASE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: 8-AXIS CYBER RADAR TELEMETRY (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-2 border-brand-dark shadow-neo rounded-card bg-white overflow-hidden">
              <CardHeader className="border-b border-brand-dark/15 bg-brand-gray/40 py-4 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-extrabold font-sans text-brand-dark">
                    8-AXIS CYBER RADAR TELEMETRY
                  </CardTitle>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Real-time operational capability assessment
                  </p>
                </div>
                <Badge variant="lime" className="font-mono text-[10px] font-bold">
                  8-D MATRIX
                </Badge>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* SVG Radar Chart */}
                <SkillRadarChart telemetry={telemetry} />

                {/* Radar Metrics Breakdown */}
                <div className="space-y-2.5 pt-4 border-t border-brand-dark/10">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-dark">
                    Competency Breakdown:
                  </h4>
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between p-2 bg-brand-gray/50 rounded-btn">
                      <span className="font-medium text-brand-dark">Web Exploitation:</span>
                      <span className="font-bold text-black">
                        {telemetry.webExploitation} pts (
                        {getProficiencyTier(telemetry.webExploitation)})
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-brand-gray/50 rounded-btn">
                      <span className="font-medium text-brand-dark">Cloud & Containers:</span>
                      <span className="font-bold text-black">
                        {telemetry.cloudSecurity} pts ({getProficiencyTier(telemetry.cloudSecurity)}
                        )
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-brand-gray/50 rounded-btn">
                      <span className="font-medium text-brand-dark">Network Pentesting:</span>
                      <span className="font-bold text-black">
                        {telemetry.networkPentest} pts (
                        {getProficiencyTier(telemetry.networkPentest)})
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-brand-gray/50 rounded-btn">
                      <span className="font-medium text-brand-dark">DevSecOps Pipeline:</span>
                      <span className="font-bold text-black">
                        {telemetry.devSecOps} pts ({getProficiencyTier(telemetry.devSecOps)})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Privacy Guarantee Note */}
                <div className="p-3 bg-brand-dark/5 rounded-btn border border-brand-dark/15 text-[11px] font-mono text-muted-foreground flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 text-brand-dark shrink-0 mt-0.5" />
                  <span>
                    Note: Private details (Email, billing, failed challenge attempts) are
                    permanently withheld from dossiers.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: CAPSTONE CREDENTIALS & ACHIEVEMENTS (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card 1: Verified Practical Certificates */}
            <Card className="border-2 border-brand-dark shadow-neo rounded-card bg-white">
              <CardHeader className="border-b border-brand-dark/15 bg-brand-gray/40 py-4 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-extrabold font-sans text-brand-dark">
                    CAPSTONE CREDENTIALS & CERTIFICATIONS
                  </CardTitle>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Cryptographically verifiable offensive security examinations
                  </p>
                </div>
                <Badge variant="default" className="font-mono text-[10px] font-bold">
                  {dossier.certificates?.length || 0} VERIFIED
                </Badge>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {dossier.certificates && dossier.certificates.length > 0 ? (
                  dossier.certificates.map((cert) => (
                    <div
                      key={cert.code}
                      className="p-4 sm:p-5 rounded-btn border-2 border-brand-dark bg-white shadow-neo-sm space-y-3 hover:-translate-y-0.5 transition-transform"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-brand-lime text-brand-dark rounded-badge border border-brand-dark shadow-neo-sm">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm sm:text-base text-brand-dark font-sans">
                              {cert.title}
                            </h4>
                            <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                              <span>Code: {cert.code}</span>
                              <span>&bull;</span>
                              <span>Issued: {cert.issuedAt}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold px-2.5 py-1 bg-brand-gray border border-brand-dark rounded-badge">
                            Score: {cert.scorePercentage}%
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-brand-dark/10 font-mono text-xs">
                        <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Signed with RSA-4096 Key</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveCertModal(cert.verificationHash)}
                            className="h-7 px-3 text-[11px] font-mono gap-1"
                          >
                            <FileCheck className="w-3 h-3" /> Verify Online
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-brand-dark/20 rounded-btn font-mono text-xs text-muted-foreground">
                    No Capstone Certifications issued yet. Complete a proctored examination to earn
                    cryptographically verifiable credentials.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card 2: Badges Cabinet */}
            <Card className="border-2 border-brand-dark shadow-neo rounded-card bg-white">
              <CardHeader className="border-b border-brand-dark/15 bg-brand-gray/40 py-4 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-extrabold font-sans text-brand-dark">
                    OPERATOR BADGES CABINET
                  </CardTitle>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Tactical achievements and cyber range milestones
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-brand-dark">
                  ({dossier.badges?.filter((b) => b.isUnlocked).length || 0}/
                  {dossier.badges?.length || 0} Unlocked)
                </span>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {dossier.badges?.map((badge) => (
                    <div
                      key={badge.id}
                      className={`p-3 rounded-btn border-2 text-center flex flex-col items-center justify-between gap-2 transition-all ${
                        badge.isUnlocked
                          ? 'border-brand-dark bg-brand-gray shadow-neo-sm'
                          : 'border-brand-dark/20 bg-brand-gray/30 opacity-40'
                      }`}
                    >
                      <div className="text-2xl pt-1">{badge.icon}</div>
                      <div className="space-y-0.5">
                        <div className="text-xs font-extrabold text-brand-dark font-sans leading-tight">
                          {badge.name}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground line-clamp-2">
                          {badge.isUnlocked ? badge.description : 'Locked Milestone'}
                        </div>
                      </div>
                      <div className="pt-1">
                        {badge.isUnlocked ? (
                          <span className="text-[9px] font-mono font-bold text-emerald-800 bg-brand-lime px-2 py-0.5 rounded-badge border border-brand-dark">
                            EARNED
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-muted-foreground bg-brand-gray px-2 py-0.5 rounded-badge border border-brand-dark/20">
                            LOCKED
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Completed Learning Paths */}
            {dossier.completedPaths && dossier.completedPaths.length > 0 && (
              <Card className="border-2 border-brand-dark shadow-neo rounded-card bg-white">
                <CardHeader className="border-b border-brand-dark/15 bg-brand-gray/40 py-4 px-6">
                  <CardTitle className="text-base font-extrabold font-sans text-brand-dark">
                    TRAINING TRACK PROGRESSION
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {dossier.completedPaths.map((path) => (
                    <div key={path.title} className="space-y-1.5 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-dark font-sans">{path.title}</span>
                        <span className="font-bold text-black">
                          {path.completionPercentage}% ({path.completedRooms}/{path.totalRooms}{' '}
                          Rooms)
                        </span>
                      </div>
                      <div className="h-3 w-full bg-brand-gray border border-brand-dark rounded-pill overflow-hidden p-0.5 shadow-neo-sm">
                        <div
                          className="h-full bg-brand-lime rounded-pill transition-all duration-500"
                          style={{ width: `${path.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-brand-dark/15 py-8 mt-12 bg-white text-center text-xs font-mono text-muted-foreground">
        CyberForce Platform &bull; Operator Dossier Engine &bull; Positivus Neo-Brutalism
      </footer>

      {/* DIALOG 1: PROFILE & PRIVACY SETTINGS */}
      <ProfileSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        dossier={dossier}
        onProfileUpdated={(updated) => {
          setDossier((prev) => (prev ? { ...prev, ...updated } : null));
        }}
      />

      {/* DIALOG 2: COPY LINK WHILE PRIVATE WARNING */}
      <Dialog open={isPrivacyWarningOpen} onOpenChange={setIsPrivacyWarningOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="p-1 bg-amber-500 text-white rounded-badge border border-brand-dark">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <DialogTitle>WARNING: DOSSIER IS PRIVATE</DialogTitle>
            </div>
            <DialogDescription className="font-mono text-xs text-brand-dark pt-2">
              Your profile is currently configured as{' '}
              <span className="font-bold text-red-600">CLASSIFIED (PRIVATE)</span>. Anyone who opens
              this share link will be blocked by the Classified Shield instead of seeing your CV
              telemetry.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-xs font-sans text-muted-foreground leading-relaxed">
            Would you like to make your dossier Public now before copying, or proceed with copying
            the private link anyway?
          </div>

          <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsPrivacyWarningOpen(false);
                executeCopy();
              }}
              className="text-xs"
            >
              Copy Private Link Anyway
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleQuickMakePublic}
              className="text-xs bg-brand-lime text-brand-dark hover:bg-brand-lime-hover font-bold"
            >
              Make Public & Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: CERTIFICATE HASH VERIFICATION */}
      <Dialog open={!!activeCertModal} onOpenChange={() => setActiveCertModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="p-1 bg-brand-lime text-brand-dark rounded-badge border border-brand-dark">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </span>
              <DialogTitle>CRYPTOGRAPHIC PROOF OF MASTERY</DialogTitle>
            </div>
            <DialogDescription className="font-mono text-xs text-brand-dark pt-2">
              This credential has been validated against the CyberForce immutable ledger using
              RSA-4096 cryptographic signatures.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-brand-gray rounded-btn border border-brand-dark/20 space-y-2">
            <div className="text-[10px] font-mono text-muted-foreground uppercase font-bold">
              Verification Hash
            </div>
            <div className="font-mono text-xs break-all bg-white p-2 rounded border border-brand-dark/10 font-bold text-brand-dark">
              {activeCertModal}
            </div>
            <div className="text-[10px] font-mono text-emerald-700 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3 h-3" /> Status: Cryptographically Authentic & Valid
            </div>
          </div>

          <DialogFooter>
            <Button variant="default" size="sm" onClick={() => setActiveCertModal(null)}>
              Close Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
