'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Radar,
  Cloud,
  Terminal,
  Search,
  BookOpen,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Award,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/auth-store';
import { pathsApi, type PathListItem } from '@/lib/api';

const CATEGORIES = [
  { id: 'all', label: 'All Tracks' },
  { id: 'Offense', label: 'Offense' },
  { id: 'Defense', label: 'Defense' },
  { id: 'Cloud', label: 'Cloud' },
  { id: 'Pentest', label: 'Pentest' },
];

export default function LearningPathsCatalogPage() {
  const { accessToken, isAuthenticated } = useAuthStore();
  const [paths, setPaths] = useState<PathListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    async function fetchPaths() {
      setLoading(true);
      setError(null);
      try {
        const res = await pathsApi.listPaths(
          {
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
          },
          accessToken,
        );
        setPaths(res.data);
      } catch (err: unknown) {
        const errorObj = err as { message?: string };
        setError(errorObj.message || 'Failed to load learning tracks. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchPaths();
  }, [selectedCategory, accessToken]);

  const filteredPaths = useMemo(() => {
    if (!searchQuery.trim()) return paths;
    const q = searchQuery.toLowerCase();
    return paths.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q),
    );
  }, [paths, searchQuery]);

  const getPathIcon = (category: string, iconUrl?: string | null) => {
    switch (category.toLowerCase()) {
      case 'offense':
        return <ShieldAlert className="w-6 h-6 text-brand-dark" />;
      case 'defense':
        return <Radar className="w-6 h-6 text-brand-dark" />;
      case 'cloud':
        return <Cloud className="w-6 h-6 text-brand-dark" />;
      case 'pentest':
      default:
        return <Terminal className="w-6 h-6 text-brand-dark" />;
    }
  };

  const getDifficultyBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-900 border-emerald-900/30';
      case 'intermediate':
        return 'bg-amber-100 text-amber-900 border-amber-900/30';
      case 'advanced':
        return 'bg-rose-100 text-rose-900 border-rose-900/30';
      default:
        return 'bg-brand-gray text-brand-dark border-brand-dark/20';
    }
  };

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark text-brand-dark dark:text-white pb-20">
      {/* Top Header Section */}
      <section className="border-b border-brand-dark/15 dark:border-white/10 bg-brand-gray/60 dark:bg-card-dark/40 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-badge bg-brand-lime text-brand-dark border border-brand-dark shadow-neo-sm font-mono text-xs font-extrabold uppercase tracking-wider mb-4">
            <Layers className="w-3.5 h-3.5" />
            CAREER ROADMAPS // STRUCTURED LEARNING PATHS
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-brand-dark dark:text-white mb-4">
            Master Real-World Cyber Roles
          </h1>

          <p className="text-base sm:text-lg text-brand-dark/70 dark:text-white/70 max-w-2xl leading-relaxed">
            Step through verified hands-on progression tracks with instant flag validation, sandbox
            targets, and progressive skill calibration.
          </p>

          {/* Search & Category Filter Bar */}
          <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/50 dark:text-white/50" />
              <Input
                type="text"
                placeholder="Search tracks, skills, or vulnerabilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-white dark:bg-card-dark border-2 border-brand-dark dark:border-white/20 rounded-btn shadow-neo-sm focus-visible:ring-0 focus-visible:border-brand-dark font-medium text-sm"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <span className="text-xs font-mono font-extrabold uppercase text-brand-dark/60 dark:text-white/60 mr-1 hidden sm:inline-flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-btn text-xs font-extrabold transition-all border border-brand-dark select-none whitespace-nowrap ${
                      isActive
                        ? 'bg-brand-lime text-brand-dark shadow-neo-sm -translate-y-0.5'
                        : 'bg-white dark:bg-card-dark text-brand-dark/80 dark:text-white/80 hover:bg-brand-gray dark:hover:bg-brand-dark'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-80 rounded-card bg-brand-gray/50 dark:bg-card-dark/50 border-2 border-brand-dark/10 animate-pulse p-8 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="h-6 w-32 bg-black/10 dark:bg-white/10 rounded-btn" />
                  <div className="h-8 w-3/4 bg-black/10 dark:bg-white/10 rounded-btn" />
                  <div className="h-16 w-full bg-black/5 dark:bg-white/5 rounded-btn" />
                </div>
                <div className="h-12 w-full bg-black/10 dark:bg-white/10 rounded-btn" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 p-8 border-2 border-dashed border-red-400 rounded-card bg-red-50 dark:bg-red-950/20">
            <ShieldAlert className="w-10 h-10 text-red-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-red-900 dark:text-red-300">
              Error Loading Tracks
            </h3>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1 mb-4">{error}</p>
            <Button
              onClick={() => setSelectedCategory('all')}
              className="bg-brand-dark text-white rounded-btn"
            >
              Reset Filters
            </Button>
          </div>
        ) : filteredPaths.length === 0 ? (
          <div className="text-center py-16 p-8 border-2 border-dashed border-brand-dark/20 rounded-card bg-brand-gray/30">
            <Search className="w-10 h-10 text-brand-dark/40 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-brand-dark dark:text-white">
              No Learning Tracks Found
            </h3>
            <p className="text-sm text-brand-dark/60 dark:text-white/60 mt-1 mb-4">
              Try adjusting your search keywords or resetting category filters.
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="bg-brand-lime text-brand-dark border border-brand-dark rounded-btn shadow-neo-sm"
            >
              View All Tracks
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredPaths.map((path) => {
              const isMastered = path.status === 'mastered';
              const isInProgress = path.status === 'in_progress';

              return (
                <div
                  key={path.id}
                  className="group relative flex flex-col justify-between bg-white dark:bg-card-dark border-2 border-brand-dark rounded-card shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all duration-200 p-6 sm:p-8"
                >
                  {/* Top Metadata Header */}
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      {/* Icon */}
                      <div className="h-12 w-12 rounded-badge bg-brand-lime border-2 border-brand-dark flex items-center justify-center shadow-neo-sm">
                        {getPathIcon(path.category, path.iconUrl)}
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <span className="font-mono text-xs font-extrabold uppercase px-2.5 py-1 rounded-badge bg-brand-gray dark:bg-brand-dark border border-brand-dark/40 text-brand-dark dark:text-white">
                          {path.category}
                        </span>
                        <span
                          className={`font-mono text-xs font-extrabold px-2.5 py-1 rounded-badge border ${getDifficultyBadgeColor(
                            path.difficultyLevel,
                          )}`}
                        >
                          {path.difficultyLevel}
                        </span>
                      </div>
                    </div>

                    {/* Track Title & Description */}
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-brand-dark dark:text-white group-hover:text-brand-dark/90 transition-colors">
                      {path.title}
                    </h2>

                    <p className="mt-2 text-sm text-brand-dark/70 dark:text-white/70 line-clamp-2 leading-relaxed">
                      {path.description ||
                        'Structured cyber security curriculum with interactive hands-on labs.'}
                    </p>

                    {/* Modules & Time Stats */}
                    <div className="mt-4 pt-4 border-t border-brand-dark/10 dark:border-white/10 flex items-center gap-4 text-xs font-mono font-bold text-brand-dark/80 dark:text-white/80">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-brand-dark/50 dark:text-white/50" />
                        <span>{path.modulesCount} Modules</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-brand-dark/50 dark:text-white/50" />
                        <span>{path.roomsCount} Rooms</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-dark/50 dark:text-white/50" />
                        <span>~{path.estimatedHours}h</span>
                      </div>
                    </div>

                    {/* Progress Bar & Telemetry */}
                    <div className="mt-6 p-4 rounded-btn bg-brand-gray/60 dark:bg-brand-dark/40 border border-brand-dark/20 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono font-extrabold">
                        <span className="uppercase text-brand-dark/70 dark:text-white/70">
                          {isMastered
                            ? 'Status: Mastered 🎖️'
                            : isInProgress
                              ? `Status: In Progress (${path.completedRoomsCount}/${path.roomsCount} Rooms Cleared)`
                              : 'Status: Not Started'}
                        </span>
                        <span className="text-brand-dark dark:text-brand-lime font-bold">
                          {path.progressPercentage}%
                        </span>
                      </div>

                      {/* Visual Bar */}
                      <div className="h-3 w-full bg-white dark:bg-black/40 border border-brand-dark rounded-full overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 border border-brand-dark/30 ${
                            isMastered ? 'bg-emerald-500' : 'bg-brand-lime'
                          }`}
                          style={{
                            width: `${Math.max(path.progressPercentage > 0 ? 5 : 0, path.progressPercentage)}%`,
                          }}
                        />
                      </div>

                      {/* Next Up Recommendation */}
                      {path.nextUpRoom && !isMastered && (
                        <div className="pt-1 flex items-center gap-1.5 text-xs font-mono text-brand-dark/80 dark:text-white/80">
                          <span className="font-extrabold text-amber-600 dark:text-amber-400">
                            Next Up:
                          </span>
                          <span className="truncate">{path.nextUpRoom.title}</span>
                        </div>
                      )}

                      {isMastered && (
                        <div className="pt-1 flex items-center gap-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
                          <Award className="w-3.5 h-3.5" />
                          <span>Capstone Certification Issued</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 pt-2">
                    <Link href={`/paths/${path.slug}`}>
                      {isMastered ? (
                        <Button className="w-full bg-emerald-500 text-white hover:bg-emerald-600 border-2 border-brand-dark font-extrabold rounded-btn shadow-neo-sm hover:shadow-none hover:translate-y-0.5 transition-all flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Review Completed Track</span>
                        </Button>
                      ) : isInProgress ? (
                        <Button className="w-full bg-brand-lime text-brand-dark hover:bg-brand-lime-hover border-2 border-brand-dark font-extrabold rounded-btn shadow-neo-sm hover:shadow-none hover:translate-y-0.5 transition-all flex items-center justify-center gap-2">
                          <span>&gt; Resume Learning Track</span>
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button className="w-full bg-white dark:bg-card-dark text-brand-dark dark:text-white hover:bg-brand-lime hover:text-brand-dark border-2 border-brand-dark font-extrabold rounded-btn shadow-neo-sm hover:shadow-none hover:translate-y-0.5 transition-all flex items-center justify-center gap-2">
                          <span>Enroll &amp; Start Path</span>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      )}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
