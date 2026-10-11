'use client';

import React, { useState, useEffect } from 'react';
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
import { rolesApi, type RoleRequestItem } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Loader2 } from 'lucide-react';

interface BecomeCreatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BecomeCreatorDialog({ isOpen, onClose }: BecomeCreatorDialogProps) {
  const { accessToken, user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState<RoleRequestItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form fields
  const [specialty, setSpecialty] = useState('Web Exploitation');
  const [motivation, setMotivation] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  useEffect(() => {
    if (!isOpen || !accessToken) return;

    async function loadRequests() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await rolesApi.getMyRequests(accessToken!);
        if (res.data && res.data.length > 0) {
          setExistingRequest(res.data[0]); // Most recent request
        } else {
          setExistingRequest(null);
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Không thể tải yêu cầu Creator. Vui lòng mở lại hộp thoại để thử lại.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadRequests();
  }, [isOpen, accessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    if (motivation.trim().length < 10) {
      setErrorMessage('Motivation must be at least 10 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await rolesApi.submitCreatorRequest(
        {
          specialty,
          motivation: motivation.trim(),
          portfolioUrl: portfolioUrl.trim() || undefined,
        },
        accessToken,
      );

      setSuccessMessage('Your Creator application has been submitted for Admin review.');
      setExistingRequest(res.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit application.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = existingRequest && existingRequest.status === 'pending';
  const isApproved = existingRequest && existingRequest.status === 'approved';
  const isRejected = existingRequest && existingRequest.status === 'rejected';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đăng ký trở thành Creator</DialogTitle>
          <DialogDescription>
            Chia sẻ chuyên môn và ý tưởng nội dung để quản trị viên xem xét.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <p role="status" className="flex items-center gap-2 py-8 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải yêu cầu…
          </p>
        ) : isPending ? (
          <div className="space-y-4">
            <p role="status" className="font-medium">
              Yêu cầu đang chờ duyệt
            </p>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Ngày gửi</dt>
                <dd>{new Date(existingRequest.createdAt).toLocaleDateString('vi-VN')}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Chuyên môn</dt>
                <dd>{existingRequest.specialty}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Kinh nghiệm & ý tưởng</dt>
                <dd className="mt-1 whitespace-pre-wrap break-words leading-relaxed">
                  {existingRequest.motivation}
                </dd>
              </div>
            </dl>
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </div>
        ) : isApproved && user?.role === 'creator' ? (
          <div className="space-y-4">
            <p role="status">Bạn đã được cấp quyền Creator.</p>
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <p role="alert" className="text-sm text-destructive">
                {errorMessage}
              </p>
            )}
            {isRejected && (
              <div className="rounded-btn border p-3 text-sm">
                <p className="font-medium">Phản hồi lần đăng ký trước</p>
                <p className="mt-1 text-muted-foreground">
                  {existingRequest.rejectionReason || 'Yêu cầu chưa được chấp thuận.'}
                </p>
              </div>
            )}
            {successMessage && (
              <p role="status" className="text-sm">
                {successMessage}
              </p>
            )}
            <div className="space-y-2">
              <label htmlFor="creator-specialty" className="field-label">
                Chuyên môn
              </label>
              <select
                id="creator-specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="min-h-11 w-full"
              >
                <option value="Web Exploitation">Web Exploitation</option>
                <option value="Web Exploitation & AppSec">Web Exploitation & AppSec</option>
                <option value="Binary Exploitation & Pwn">
                  Binary Exploitation & Reverse Engineering
                </option>
                <option value="Active Directory & Cloud">Active Directory & Cloud</option>
                <option value="Digital Forensics & Incident Response">
                  Digital Forensics & Incident Response
                </option>
                <option value="Cryptography & Steganography">Cryptography & Steganography</option>
                <option value="DevSecOps & CI/CD Security">DevSecOps & CI/CD Security</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="creator-motivation" className="field-label">
                Kinh nghiệm & ý tưởng
              </label>
              <textarea
                id="creator-motivation"
                rows={4}
                required
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                className="w-full"
                aria-describedby="motivation-help"
              />
              <p id="motivation-help" className="text-xs text-muted-foreground">
                Ít nhất 10 ký tự. Mô tả kinh nghiệm và nội dung bạn muốn xây dựng.
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="creator-portfolio" className="field-label">
                Portfolio (không bắt buộc)
              </label>
              <Input
                id="creator-portfolio"
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/username"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting || motivation.trim().length < 10}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Đang gửi…' : 'Gửi yêu cầu'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
