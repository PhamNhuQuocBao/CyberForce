'use client';

import { useEffect, useState } from 'react';
import { Award, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface BadgeUnlock {
  title: string;
  description: string;
  rankUp: boolean;
}

function playUnlockSound() {
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const start = context.currentTime;
  [523.25, 659.25, 783.99].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, start + index * 0.11);
    gain.gain.linearRampToValueAtTime(0.035, start + index * 0.11 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, start + index * 0.11 + 0.2);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start + index * 0.11);
    oscillator.stop(start + index * 0.11 + 0.21);
  });
  window.setTimeout(() => void context.close(), 700);
}

export function BadgeUnlockModal({
  award,
  onClose,
}: {
  award: BadgeUnlock | null;
  onClose: () => void;
}) {
  const [muted, setMuted] = useState(true);
  useEffect(() => {
    setMuted(window.localStorage.getItem('badge-sound-muted') === 'true');
  }, []);
  useEffect(() => {
    if (!award) return;
    if (!muted) {
      try {
        playUnlockSound();
      } catch {
        // Browser audio permissions may prevent automatic playback.
      }
    }
  }, [award, muted]);
  useEffect(() => {
    if (award?.rankUp && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      void import('canvas-confetti').then(({ default: confetti }) => {
        void confetti({
          particleCount: 80,
          spread: 65,
          origin: { y: 0.4 },
          colors: ['#486B16', '#A5C778', '#F6CC62'],
        });
      });
    }
  }, [award]);

  function toggleSound() {
    const next = !muted;
    setMuted(next);
    window.localStorage.setItem('badge-sound-muted', String(next));
  }

  return (
    <Dialog open={Boolean(award)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
            <Award aria-hidden="true" className="h-7 w-7" />
          </div>
          <DialogTitle>{award?.rankUp ? 'Thăng cấp!' : 'Huy hiệu mới!'}</DialogTitle>
          <DialogDescription>
            {award?.title}. {award?.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={toggleSound}
            aria-label={muted ? 'Bật âm thanh huy hiệu' : 'Tắt âm thanh huy hiệu'}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {muted ? 'Âm thanh tắt' : 'Âm thanh bật'}
          </Button>
          <Button onClick={onClose}>Tiếp tục học</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
