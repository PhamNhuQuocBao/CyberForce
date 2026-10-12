'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { PathRoomDetail } from '@/lib/api';

export function PrerequisiteLockDialog({
  isOpen,
  onClose,
  targetRoom,
}: {
  isOpen: boolean;
  onClose: () => void;
  targetRoom: PathRoomDetail | null;
}) {
  if (!targetRoom) return null;
  const prerequisite = targetRoom.prerequisite;
  const progress = prerequisite.prerequisiteProgress;
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Điều kiện tiên quyết</DialogTitle>
          <DialogDescription>
            Hoàn thành phòng học bên dưới để đủ điều kiện học {targetRoom.title}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-3">
          <p className="font-medium">{prerequisite.requiredRoomTitle || 'Phòng học tiên quyết'}</p>
          {progress && (
            <p className="text-sm text-muted-foreground">
              {progress.completedQuestions}/{progress.totalQuestions} câu hỏi hoàn thành ·{' '}
              {progress.percentage}%
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Hoàn thành câu hỏi trong phòng tiên quyết để mở khóa.
          </p>
        </div>
        <DialogFooter>
          {prerequisite.requiredRoomSlug && (
            <Button asChild>
              <Link href={`/rooms/${encodeURIComponent(prerequisite.requiredRoomSlug)}`}>
                Xem phòng tiên quyết
              </Link>
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
