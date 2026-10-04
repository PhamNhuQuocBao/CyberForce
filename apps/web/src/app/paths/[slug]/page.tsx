'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Shield,
  Clock,
  Sparkles,
  Lock,
  CheckCircle2,
  PlayCircle,
  AlertTriangle,
  Award,
  ChevronDown,
  ChevronUp,
  Layers,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth-store';
import { pathsApi, type PathDetailResponse, type PathRoomDetail } from '@/lib/api';
import { PrerequisiteLockDialog } from '@/components/paths/PrerequisiteLockDialog';

export default function LearningPathDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { accessToken } = useAuthStore();
  const [path, setPath] = useState<PathDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expanded modules state (default all open)
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Locked room modal state
  const [selectedLockedRoom, setSelectedLockedRoom] = useState<PathRoomDetail | null>(null);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function fetchPathDetail() {
      setLoading(true);
      setError(null);
      try {
        const res = await pathsApi.getPath(slug, accessToken);
        setPath(res.data);

        // Open all modules by default
        const initialExpand: Record<string, boolean> = {};
        res.data.modules.forEach((m) => {
          initialExpand[m.moduleName] = true;
        });
        setExpandedModules(initialExpand);
      } catch (err: unknown) {
        const errorObj = err as { message?: string };
        setError(errorObj.message || 'Failed to load learning path details.');
      } finally {
        setLoading(false);
      }
    }

    fetchPathDetail();
  }, [slug, accessToken]);

  const toggleModule = (moduleName: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }));
  };

  const handleRoomClick = (room: PathRoomDetail) => {
    if (room.status === 'locked') {
      setSelectedLockedRoom(room);
      setIsLockModalOpen(true);
      return;
    }
    // Navigate to room interactive workspace
    router.push(`/room/${room.slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-canvas-dark text-brand-dark dark:text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="h-6 w-36 bg-black/10 dark:bg-white/10 rounded-btn animate-pulse" />
          <div className="h-48 rounded-card bg-brand-gray/50 dark:bg-card-dark/50 border-2 border-brand-dark/10 animate-pulse p-8" />
          <div className="h-96 rounded-card bg-brand-gray/50 dark:bg-card-dark/50 border-2 border-brand-dark/10 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !path) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-canvas-dark text-brand-dark dark:text-white py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="p-8 rounded-card border-2 border-brand-dark bg-red-50 dark:bg-red-950/20 shadow-neo">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-red-900 dark:text-red-300">
              Path Not Found
            </h2>
            <p className="mt-2 text-sm text-red-700 dark:text-red-400 mb-6">
              {error || 'The requested learning curriculum does not exist or has been unpublished.'}
            </p>
            <Link href="/paths">
              <Button className="bg-brand-dark text-white rounded-btn shadow-neo-sm">
                ← Return to Paths Catalog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark text-brand-dark dark:text-white pb-24">
      {/* Top Header Card */}
      <section className="border-b border-brand-dark/15 dark:border-white/10 bg-brand-gray/50 dark:bg-card-dark/40 py-8 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb Back Button */}
          <Link
            href="/paths"
            className="inline-flex items-center gap-2 text-sm font-extrabold font-mono text-brand-dark/70 dark:text-white/70 hover:text-brand-dark dark:hover:text-white mb-6 group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>&larr; Back to Catalog</span>
          </Link>

          {/* Path Header Banner */}
          <div className="p-6 sm:p-8 rounded-card bg-white dark:bg-card-dark border-2 border-brand-dark shadow-neo space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="font-mono text-xs font-extrabold uppercase px-2.5 py-1 rounded-badge bg-brand-lime text-brand-dark border border-brand-dark shadow-neo-sm">
                    {path.category} TRACK
                  </span>
                  <span className="font-mono text-xs font-extrabold uppercase px-2.5 py-1 rounded-badge bg-brand-gray dark:bg-brand-dark border border-brand-dark/30 text-brand-dark dark:text-white">
                    {path.difficultyLevel}
                  </span>
                  <span className="font-mono text-xs font-bold text-brand-dark/60 dark:text-white/60 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> ~{path.estimatedHours} Hours
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-brand-dark dark:text-white">
                  {path.title}
                </h1>
              </div>

              {/* Total EXP Badge */}
              <div className="flex flex-col items-start md:items-end justify-center">
                <div className="px-4 py-2 rounded-btn bg-brand-gray dark:bg-brand-dark border-2 border-brand-dark shadow-neo-sm font-mono text-sm font-extrabold">
                  <div className="text-xs text-brand-dark/60 dark:text-white/60 uppercase">
                    Total Track EXP
                  </div>
                  <div className="text-brand-dark dark:text-brand-lime font-black text-lg">
                    +{path.totalTrackExp.toLocaleString()} EXP
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm sm:text-base text-brand-dark/70 dark:text-white/70 max-w-3xl leading-relaxed">
              {path.description ||
                'Step through this comprehensive curriculum to build verified offensive and defensive capabilities.'}
            </p>

            {/* Overall Progress Telemetry Bar */}
            <div className="p-4 sm:p-5 rounded-btn bg-brand-gray/60 dark:bg-brand-dark/40 border border-brand-dark/20 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono font-extrabold">
                <div className="flex items-center gap-2">
                  <span className="uppercase text-brand-dark/70 dark:text-white/70">
                    Overall Progress:
                  </span>
                  <span className="text-brand-dark dark:text-white font-bold">
                    {path.progressPercentage}% ({path.completedRoomsCount}/{path.totalRoomsCount}{' '}
                    Rooms Completed)
                  </span>
                </div>
                <div>
                  {path.isCapstoneUnlocked ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-badge border border-emerald-600/30">
                      <Award className="w-3.5 h-3.5" />
                      CAPSTONE UNLOCKED 🎖️
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-brand-dark/60 dark:text-white/60 bg-black/5 dark:bg-white/5 px-2.5 py-0.5 rounded-badge border border-black/10 dark:border-white/10">
                      <Lock className="w-3.5 h-3.5" />
                      CAPSTONE: LOCKED 🔒
                    </span>
                  )}
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="h-3.5 w-full bg-white dark:bg-black/40 border-2 border-brand-dark rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 border border-brand-dark/30 ${
                    path.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-brand-lime'
                  }`}
                  style={{
                    width: `${Math.max(path.progressPercentage > 0 ? 5 : 0, path.progressPercentage)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules & Rooms Breakdown (Wireframe 2.2) */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
        {path.modules.map((module) => {
          const isExpanded = expandedModules[module.moduleName] ?? true;

          return (
            <div
              key={module.moduleName}
              className="bg-white dark:bg-card-dark border-2 border-brand-dark rounded-card shadow-neo overflow-hidden transition-all"
            >
              {/* Module Header Bar */}
              <button
                type="button"
                onClick={() => toggleModule(module.moduleName)}
                className="w-full px-6 sm:px-8 py-5 flex items-center justify-between gap-4 bg-brand-gray/60 dark:bg-brand-dark/60 hover:bg-brand-gray dark:hover:bg-brand-dark border-b-2 border-brand-dark transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-badge bg-brand-dark text-white flex items-center justify-center font-mono text-xs font-extrabold">
                    M{module.moduleOrder}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base sm:text-xl text-brand-dark dark:text-white tracking-tight">
                      {module.moduleName}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-badge bg-white dark:bg-card-dark border border-brand-dark/30 text-brand-dark dark:text-white">
                    {module.completedRoomsCount}/{module.roomsCount} Rooms
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-brand-dark/60 dark:text-white/60" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-brand-dark/60 dark:text-white/60" />
                  )}
                </div>
              </button>

              {/* Rooms List within Module */}
              {isExpanded && (
                <div className="divide-y-2 divide-brand-dark/10 dark:divide-white/10">
                  {module.rooms.map((room) => {
                    const isCompleted = room.status === 'completed';
                    const isInProgress = room.status === 'in_progress';
                    const isLocked = room.status === 'locked';

                    return (
                      <div
                        key={room.id}
                        onClick={() => handleRoomClick(room)}
                        className={`p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all ${
                          isLocked
                            ? 'bg-brand-gray/20 dark:bg-brand-dark/20 opacity-80 hover:bg-amber-500/5'
                            : isCompleted
                              ? 'bg-emerald-500/5 hover:bg-emerald-500/10'
                              : isInProgress
                                ? 'bg-brand-lime/10 hover:bg-brand-lime/15'
                                : 'hover:bg-brand-gray/40 dark:hover:bg-brand-dark/30'
                        }`}
                      >
                        {/* Left Side: Status Icon & Details */}
                        <div className="flex items-start gap-4">
                          {/* Status Icon */}
                          <div className="mt-1">
                            {isCompleted ? (
                              <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center border border-brand-dark shadow-neo-sm">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            ) : isInProgress ? (
                              <div className="h-8 w-8 rounded-full bg-brand-lime text-brand-dark flex items-center justify-center border border-brand-dark shadow-neo-sm font-extrabold text-xs">
                                <span className="h-2.5 w-2.5 rounded-full bg-brand-dark animate-pulse" />
                              </div>
                            ) : isLocked ? (
                              <div className="h-8 w-8 rounded-full bg-amber-400 text-brand-dark flex items-center justify-center border border-brand-dark shadow-neo-sm">
                                <Lock className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-white dark:bg-card-dark text-brand-dark dark:text-white flex items-center justify-center border border-brand-dark shadow-neo-sm">
                                <PlayCircle className="w-4 h-4" />
                              </div>
                            )}
                          </div>

                          {/* Room Metadata */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-base sm:text-lg text-brand-dark dark:text-white">
                                {room.title}
                              </span>
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-badge bg-brand-gray dark:bg-brand-dark border border-brand-dark/20 text-brand-dark/70 dark:text-white/70">
                                {room.difficulty}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs font-mono text-brand-dark/70 dark:text-white/70">
                              <span>{room.taskCount} Tasks</span>
                              <span>•</span>
                              <span>+{room.pointsReward} EXP</span>
                              <span>•</span>
                              <span>~{room.estimatedMinutes} mins</span>
                            </div>

                            {/* Prerequisite warning line if locked */}
                            {isLocked && room.prerequisite?.requiredRoomTitle && (
                              <div className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 pt-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Requires: {room.prerequisite.requiredRoomTitle}</span>
                              </div>
                            )}

                            {/* Mini progress line if in progress */}
                            {isInProgress && (
                              <div className="text-xs font-mono font-bold text-brand-dark dark:text-brand-lime pt-1">
                                Progress: {room.userProgress.completedQuestions}/
                                {room.userProgress.totalQuestions} Questions Solved (
                                {room.userProgress.percentage}%)
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Side: Action CTA Button */}
                        <div className="sm:self-center flex-shrink-0">
                          {isCompleted ? (
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full sm:w-auto font-mono text-xs font-extrabold border-2 border-brand-dark rounded-btn shadow-neo-sm bg-white dark:bg-card-dark text-brand-dark dark:text-white hover:bg-emerald-500 hover:text-white"
                            >
                              Completed 100% [ Review ]
                            </Button>
                          ) : isInProgress ? (
                            <Button
                              type="button"
                              className="w-full sm:w-auto font-mono text-xs font-extrabold bg-brand-lime text-brand-dark hover:bg-brand-lime-hover border-2 border-brand-dark rounded-btn shadow-neo-sm flex items-center gap-1.5"
                            >
                              <span>[ In Progress - Resume ]</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          ) : isLocked ? (
                            <Button
                              type="button"
                              className="w-full sm:w-auto font-mono text-xs font-extrabold bg-amber-400 text-brand-dark hover:bg-amber-500 border-2 border-brand-dark rounded-btn shadow-neo-sm flex items-center gap-1.5"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Prerequisite Locked</span>
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              className="w-full sm:w-auto font-mono text-xs font-extrabold bg-brand-dark text-white hover:bg-brand-dark/80 border-2 border-brand-dark rounded-btn shadow-neo-sm"
                            >
                              Start Room →
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </main>

      {/* Prerequisite Lock Dialog Modal (Wireframe 2.2) */}
      <PrerequisiteLockDialog
        isOpen={isLockModalOpen}
        onClose={() => {
          setIsLockModalOpen(false);
          setSelectedLockedRoom(null);
        }}
        targetRoom={selectedLockedRoom}
      />
    </div>
  );
}
