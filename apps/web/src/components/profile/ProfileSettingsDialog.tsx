'use client';

import React, { useState, useRef } from 'react';
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
import { Loader2 } from 'lucide-react';

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

  const wasOpen = useRef(false);

  // Initialize only when opening; preserve drafts during background refreshes.
  React.useEffect(() => {
    if (open && !wasOpen.current) {
      setBio(dossier.bio ?? '');
      setSpecialty(dossier.specialty ?? 'General Cybersecurity Operator');
      setIsPublic(dossier.isPublic ?? true);
      setErrorMsg(null);
    }
    wasOpen.current = open;
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
        const currentToken = useAuthStore.getState().accessToken;
        if (currentToken) setAuth(updatedAuthUser, currentToken);
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
          <DialogDescription>
            Cập nhật giới thiệu, chuyên môn và người có thể xem hồ sơ.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <p role="alert" className="text-sm text-destructive">
              {errorMsg}
            </p>
          )}
          <fieldset>
            <legend className="mb-3 text-sm font-medium">Quyền riêng tư</legend>
            <div className="space-y-3">
              {[
                [true, 'Công khai', 'Mọi người có thể xem kỹ năng, chứng chỉ và thành tích.'],
                [false, 'Riêng tư', 'Chỉ bạn có thể xem hồ sơ năng lực.'],
              ].map(([value, label, description]) => (
                <label
                  key={String(value)}
                  className="flex cursor-pointer items-start gap-3 rounded-btn border p-3"
                >
                  <input
                    type="radio"
                    name="visibility"
                    checked={isPublic === value}
                    onChange={() => setIsPublic(Boolean(value))}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <span>
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                      {description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="space-y-2">
            <label htmlFor="specialty" className="field-label">
              Chuyên môn (nhập hoặc chọn gợi ý)
            </label>
            <Input
              id="specialty"
              list="specialties"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              maxLength={100}
              aria-describedby="specialty-help"
            />
            <p id="specialty-help" className="mt-2 text-xs text-muted-foreground">
              Bạn có thể chọn một gợi ý trong danh sách hoặc nhập chuyên môn khác.
            </p>
            <datalist id="specialties">
              {PRESET_SPECIALTIES.map((preset) => (
                <option key={preset} value={preset} />
              ))}
            </datalist>
          </div>
          <div className="space-y-2">
            <label htmlFor="bio" className="field-label">
              Giới thiệu
            </label>
            <textarea
              id="bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              className="w-full resize-y"
              aria-describedby="bio-count"
            />
            <p id="bio-count" className="text-right text-xs text-muted-foreground">
              {bio.length}/500 ký tự
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Đang lưu…' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
