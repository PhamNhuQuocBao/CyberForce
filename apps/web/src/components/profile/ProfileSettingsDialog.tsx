'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { userApi, type UserProfile, type UserDossierResponse } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import { Globe, Lock, Loader2 } from 'lucide-react';

interface ProfileSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dossier: UserDossierResponse;
  onProfileUpdated: (updated: Partial<UserDossierResponse>) => void;
}

const PRESET_SPECIALTIES = [
  'Web Penetration & Cloud Sec',
  'DevSecOps & Infrastructure Hardening',
  'Binary Exploitation & Reverse Eng',
  'Network Red Teaming & OSINT',
  'General Cybersecurity Operator',
];

export function ProfileSettingsDialog({
  open,
  onOpenChange,
  dossier,
  onProfileUpdated,
}: ProfileSettingsDialogProps) {
  const { accessToken, user, setAuth } = useAuthStore();
  const [bio, setBio] = useState(dossier.bio ?? '');
  const [specialty, setSpecialty] = useState(dossier.specialty ?? 'General Cybersecurity Operator');
  const [isPublic, setIsPublic] = useState(dossier.isPublic ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state if dossier changes while opened
  React.useEffect(() => {
    if (open) {
      setBio(dossier.bio ?? '');
      setSpecialty(dossier.specialty ?? 'General Cybersecurity Operator');
      setIsPublic(dossier.isPublic ?? true);
      setErrorMsg(null);
    }
  }, [open, dossier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      toast.error('Authentication session expired. Please sign in again.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const res = await userApi.updateProfile(
        {
          bio: bio.trim() || null,
          specialty: specialty.trim() || undefined,
          isPublic,
        },
        accessToken,
      );

      // Update auth store cached user
      if (user) {
        const updatedAuthUser: UserProfile = {
          ...user,
          bio: res.data.bio,
          specialty: res.data.specialty,
          isPublic: res.data.isPublic,
        };
        setAuth(updatedAuthUser, accessToken);
      }

      // Notify parent page
      onProfileUpdated({
        bio: res.data.bio,
        specialty: res.data.specialty ?? undefined,
        isPublic: res.data.isPublic ?? true,
      });

      toast.success('Dossier telemetry & privacy preferences updated!');
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile settings';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-lime border border-brand-dark" />
            <DialogTitle>OPERATOR SETTINGS // PRIVACY SHIELD</DialogTitle>
          </div>
          <DialogDescription>
            Configure how your cybersecurity capability dossier and telemetry are exposed to
            visitors and recruiters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {errorMsg && (
            <div className="p-3 bg-red-50 border-2 border-red-500 rounded-btn text-xs text-red-600 font-mono">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Privacy Toggle Matrix */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-brand-dark dark:text-white flex items-center justify-between">
              <span>Dossier Exposure Mode</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                US-01.03 Sub-flow 2.2
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Public Choice */}
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`p-3.5 rounded-card border-2 text-left transition-all duration-150 relative ${
                  isPublic
                    ? 'border-brand-dark bg-brand-lime shadow-neo-sm text-brand-dark font-bold'
                    : 'border-brand-dark/20 bg-white hover:border-brand-dark text-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 font-extrabold text-sm">
                    <Globe className="w-4 h-4" />
                    <span>PUBLIC CV</span>
                  </div>
                  {isPublic && (
                    <span className="text-[10px] bg-brand-dark text-white px-2 py-0.5 rounded-badge font-mono">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-85 leading-relaxed font-sans font-medium">
                  Full 8-axis radar telemetry, verified certificates, and badges are viewable by
                  recruiters.
                </p>
              </button>

              {/* Private Choice */}
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`p-3.5 rounded-card border-2 text-left transition-all duration-150 relative ${
                  !isPublic
                    ? 'border-brand-dark bg-brand-dark text-white shadow-neo-sm font-bold'
                    : 'border-brand-dark/20 bg-white hover:border-brand-dark text-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 font-extrabold text-sm">
                    <Lock className="w-4 h-4 text-brand-lime" />
                    <span className={!isPublic ? 'text-white' : ''}>CLASSIFIED (PRIVATE)</span>
                  </div>
                  {!isPublic && (
                    <span className="text-[10px] bg-brand-lime text-brand-dark px-2 py-0.5 rounded-badge font-mono font-bold">
                      SHIELD ON
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-85 leading-relaxed font-sans font-medium">
                  Hides telemetry from outside visitors. Displays the classified shield screen
                  (Wireframe 2.2).
                </p>
              </button>
            </div>
          </div>

          {/* Specialty */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-brand-dark dark:text-white flex items-center justify-between">
              <span>Primary Technical Specialty</span>
              <span className="text-[10px] text-muted-foreground">Appears on CV header</span>
            </label>
            <Input
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="e.g. Web Penetration & Cloud Sec"
              maxLength={100}
              className="font-mono text-sm border-2 border-brand-dark rounded-btn"
            />
            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRESET_SPECIALTIES.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSpecialty(preset)}
                  className={`text-[11px] px-2.5 py-1 rounded-badge border transition-colors ${
                    specialty === preset
                      ? 'bg-brand-dark text-white border-brand-dark font-bold'
                      : 'bg-brand-gray text-brand-dark border-brand-dark/20 hover:border-brand-dark font-medium'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-brand-dark dark:text-white">
              <span>Operator Briefing / Bio</span>
              <span
                className={`text-[10px] ${bio.length > 450 ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}
              >
                {bio.length}/500 chars
              </span>
            </div>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Add tactical summary, CTF achievements, target certifications, or career interests..."
              maxLength={500}
              className="w-full p-3 rounded-btn border-2 border-brand-dark font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark resize-none dark:bg-card dark:text-white dark:border-white/20"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
