'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, UserCheck, LogOut, User, Shield, ChevronDown, Radar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/lib/auth-store';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  const isDossierActive = user && pathname === `/user/${user.username}`;

  return (
    <header className="border-b border-brand-dark/15 dark:border-white/10 bg-canvas/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="h-9 w-9 sm:h-10 sm:w-10 bg-primary border border-brand-dark rounded-badge flex items-center justify-center shadow-neo-sm font-extrabold text-primary-foreground group-hover:-translate-y-0.5 transition-transform text-sm sm:text-base">
            CF
          </div>
          <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-brand-dark dark:text-white">
            CyberForce
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 font-bold text-sm">
          <Link
            href="/#labs"
            className="text-brand-dark/80 hover:text-brand-dark dark:text-white/80 dark:hover:text-white transition-colors"
          >
            Practice Labs
          </Link>
          <Link
            href="/#arena"
            className="text-brand-dark/80 hover:text-brand-dark dark:text-white/80 dark:hover:text-white transition-colors"
          >
            KotH Arena
          </Link>
          <Link
            href="/#certs"
            className="text-brand-dark/80 hover:text-brand-dark dark:text-white/80 dark:hover:text-white transition-colors"
          >
            Certificates
          </Link>

          {/* Direct Nav Item for logged-in user to their Dossier */}
          {isAuthenticated && user && (
            <Link
              href={`/user/${encodeURIComponent(user.username)}`}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-btn border transition-all ${
                isDossierActive
                  ? 'bg-brand-lime text-brand-dark border-brand-dark shadow-neo-sm font-extrabold'
                  : 'bg-white hover:bg-brand-gray text-brand-dark border-brand-dark/20 hover:border-brand-dark'
              }`}
            >
              <Radar className="w-3.5 h-3.5" />
              <span>Hồ Sơ Dossier</span>
            </Link>
          )}
        </div>

        {/* Auth / User Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Streak Badge */}
              <div className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 bg-brand-lime text-brand-dark border-2 border-brand-dark rounded-[10px] shadow-neo-sm font-mono text-xs font-extrabold select-none">
                <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
                <span>{user.streakDays}D STREAK</span>
              </div>

              {/* User Profile Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="h-9 px-3 flex items-center gap-2 bg-white hover:bg-brand-gray text-brand-dark border-2 border-brand-dark rounded-[10px] shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5 active:translate-y-0 active:shadow-neo-sm transition-all font-mono text-xs font-extrabold cursor-pointer group outline-none select-none"
                  >
                    <div className="w-5 h-5 rounded-[5px] bg-brand-dark text-brand-lime flex items-center justify-center text-[10px] font-extrabold font-mono shrink-0">
                      {user.username.slice(0, 1).toUpperCase()}
                    </div>
                    <span>{user.username}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64 p-2 shadow-neo-lg">
                  <DropdownMenuLabel className="p-2.5 bg-brand-gray/70 rounded-[10px] border border-brand-dark/15 mb-2 font-mono">
                    <div className="space-y-1">
                      <div className="text-xs font-extrabold text-brand-dark flex items-center gap-1.5 font-mono">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>@{user.username}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                        <span className="bg-brand-lime text-brand-dark px-1.5 py-0.5 rounded font-extrabold border border-brand-dark/30">
                          {user.rankTier || 'Novice'}
                        </span>
                        <span className="font-bold">
                          {user.expPoints?.toLocaleString() ?? 0} EXP
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link
                      href={`/user/${encodeURIComponent(user.username)}`}
                      className="flex items-center gap-2.5 cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      <span>Hồ Sơ Năng Lực (Dossier)</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href={`/user/${encodeURIComponent(user.username)}`}
                      className="flex items-center gap-2.5 cursor-pointer"
                    >
                      <Radar className="w-4 h-4" />
                      <span>8-Axis Skill Radar</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href={`/user/${encodeURIComponent(user.username)}`}
                      className="flex items-center gap-2.5 cursor-pointer"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Thiết lập Quyền riêng tư</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="flex items-center gap-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
