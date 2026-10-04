'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { PathRoomDetail } from '@/lib/api';

interface PrerequisiteLockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetRoom: PathRoomDetail | null;
}

export function PrerequisiteLockDialog({
  isOpen,
  onClose,
  targetRoom,
}: PrerequisiteLockDialogProps) {
  if (!targetRoom || !targetRoom.prerequisite) {
    return null;
  }

  const prereq = targetRoom.prerequisite;
  const progressPercent = prereq.prerequisiteProgress?.percentage ?? 0;
  const completedQ = prereq.prerequisiteProgress?.completedQuestions ?? 0;
  const totalQ = prereq.prerequisiteProgress?.totalQuestions ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg border-2 border-brand-dark rounded-card shadow-neo-lg p-6 sm:p-8 bg-white dark:bg-card-dark">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-badge bg-amber-400 border border-brand-dark flex items-center justify-center text-brand-dark shadow-neo-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-extrabold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Access Restricted
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-extrabold tracking-tight text-brand-dark dark:text-white">
                Prerequisite Room Required
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-sm text-brand-dark/70 dark:text-white/70 leading-relaxed pt-1">
            <strong className="text-brand-dark dark:text-white font-bold">
              {targetRoom.title}
            </strong>{' '}
            is locked to ensure a structured progression. You must complete all foundational
            challenges in the prerequisite room first.
          </DialogDescription>
        </DialogHeader>

        {/* Missing Prerequisite Card */}
        <div className="my-2 p-4 sm:p-5 rounded-btn bg-brand-gray dark:bg-brand-dark/60 border-2 border-brand-dark dark:border-white/20 shadow-neo-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-extrabold text-brand-dark/60 dark:text-white/60 uppercase">
            <span>Required Prerequisite</span>
            <span className="text-brand-dark dark:text-brand-lime font-bold">
              {progressPercent}% Complete
            </span>
          </div>

          <div className="font-bold text-base text-brand-dark dark:text-white flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
            {prereq.requiredRoomTitle || 'Preceding Lab Room'}
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5 pt-1">
            <div className="h-3 w-full bg-white dark:bg-black/40 border border-brand-dark rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-brand-lime border border-brand-dark/40 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-brand-dark/70 dark:text-white/70">
              <span>
                {completedQ} of {totalQ} Challenges Solved
              </span>
              <span>{totalQ - completedQ} Remaining</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto border-2 border-brand-dark font-extrabold rounded-btn shadow-neo-sm hover:shadow-none hover:translate-y-0.5 transition-all"
          >
            Close & Stay on Path
          </Button>
          {prereq.requiredRoomSlug ? (
            <Link
              href={`/room/${prereq.requiredRoomSlug}`}
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              <Button
                type="button"
                className="w-full bg-brand-lime text-brand-dark hover:bg-brand-lime-hover border-2 border-brand-dark font-extrabold rounded-btn shadow-neo-sm hover:shadow-none hover:translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <span>Jump to Prerequisite</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto bg-brand-lime text-brand-dark font-extrabold rounded-btn border-2 border-brand-dark shadow-neo-sm"
            >
              Finish Required Tasks
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
