'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { rolesApi, type RoleRequestItem } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Sparkles, Clock, AlertCircle, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

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
      } catch {
        // Ignored fallback
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
      <DialogContent className="sm:max-w-lg bg-white dark:bg-card border-2 border-brand-dark shadow-neo-lg rounded-[14px] p-6 overflow-hidden">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-[8px] bg-brand-lime border-2 border-brand-dark flex items-center justify-center shadow-neo-sm">
              <Sparkles className="w-4 h-4 text-brand-dark" />
            </div>
            <DialogTitle className="text-xl font-extrabold text-brand-dark dark:text-white font-mono">
              Apply for Creator Clearance
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Elevate from an Operator to a <strong>Lab Creator</strong>. Build custom attack/defense
            rooms, author challenge scenarios, and train the next generation of security
            researchers.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-dark dark:text-white" />
            <p className="text-xs font-mono text-muted-foreground">
              Checking application registry...
            </p>
          </div>
        ) : isPending ? (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-600/40 rounded-[10px] space-y-3">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="bg-amber-100 text-amber-900 border-amber-500 font-mono text-[10px] font-extrabold flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>STATUS: PENDING REVIEW</span>
                </Badge>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {new Date(existingRequest.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-brand-dark dark:text-white">
                  Specialty:{' '}
                  <span className="font-mono text-primary font-extrabold">
                    {existingRequest.specialty}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  &ldquo;{existingRequest.motivation}&rdquo;
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Your dossier is currently undergoing clearance verification by the platform
              administration team. Once approved, your role will be upgraded to{' '}
              <strong>Creator</strong> and the <em>Lab Creator Studio</em> will unlock
              automatically.
            </p>

            <Button variant="outline" onClick={onClose} className="w-full font-bold">
              Close
            </Button>
          </div>
        ) : isApproved && user?.role === 'creator' ? (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-brand-lime border-2 border-brand-dark flex items-center justify-center shadow-neo-sm">
              <CheckCircle2 className="w-6 h-6 text-brand-dark" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-brand-dark dark:text-white">
                Clearance Granted: Creator
              </h3>
              <p className="text-xs text-muted-foreground">
                You already hold verified Creator clearance. Access your challenge builder anytime
                from the navigation header.
              </p>
            </div>
            <Button variant="lime" onClick={onClose} className="w-full font-extrabold">
              Acknowledge
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-500 rounded-[8px] flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {isRejected && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-400 rounded-[8px] space-y-1">
                <div className="text-[11px] font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Previous Application Feedback:</span>
                </div>
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  {existingRequest.rejectionReason || 'Application was not approved at this time.'}
                </p>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500 rounded-[8px] flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Specialty Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-dark dark:text-white font-mono">
                Primary Cybersecurity Domain *
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full h-10 px-3 bg-white dark:bg-brand-dark/40 border-2 border-brand-dark rounded-[10px] shadow-neo-sm font-mono text-xs text-brand-dark dark:text-white outline-none focus:ring-2 focus:ring-brand-lime cursor-pointer"
              >
                <option value="Web Exploitation & AppSec">
                  Web Exploitation & AppSec (OWASP Top 10)
                </option>
                <option value="Binary Exploitation & Pwn">
                  Binary Exploitation & Reverse Engineering
                </option>
                <option value="Active Directory & Cloud">
                  Active Directory, Kerberos & Cloud Pentest
                </option>
                <option value="Digital Forensics & Incident Response">
                  Digital Forensics & Threat Hunting (DFIR)
                </option>
                <option value="Cryptography & Steganography">
                  Cryptography & Protocol Security
                </option>
                <option value="DevSecOps & CI/CD Security">
                  DevSecOps & Supply Chain Security
                </option>
              </select>
            </div>

            {/* Motivation & Experience */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-dark dark:text-white font-mono">
                Experience & Motivation *
              </label>
              <textarea
                rows={4}
                required
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder="Describe your background in cybersecurity, CTF challenge authoring, or educational experience..."
                className="w-full p-3 bg-white dark:bg-brand-dark/40 border-2 border-brand-dark rounded-[10px] shadow-neo-sm font-sans text-xs text-brand-dark dark:text-white outline-none focus:ring-2 focus:ring-brand-lime resize-none placeholder:text-muted-foreground/70"
              />
              <span className="text-[10px] text-muted-foreground font-mono">
                Minimum 10 characters. Explain the labs you intend to build.
              </span>
            </div>

            {/* Portfolio / Profile URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-dark dark:text-white font-mono">
                Portfolio / GitHub / HackTheBox Profile (Optional)
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/username or blog URL"
                className="w-full h-10 px-3 bg-white dark:bg-brand-dark/40 border-2 border-brand-dark rounded-[10px] shadow-neo-sm font-mono text-xs text-brand-dark dark:text-white outline-none focus:ring-2 focus:ring-brand-lime placeholder:text-muted-foreground/70"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="lime"
                disabled={isSubmitting || motivation.trim().length < 10}
                className="flex items-center gap-2 font-extrabold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
