'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, UserCheck, LogOut, User, Shield, ChevronDown, Radar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
              <Badge variant="lime" className="hidden sm:inline-flex gap-1 font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>{user.streakDays}d Streak</span>
              </Badge>

              {/* User Profile Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-gray hover:bg-brand-lime border border-brand-dark rounded-btn shadow-neo-sm hover:shadow-neo transition-all font-mono text-xs font-bold text-brand-dark cursor-pointer group outline-none"
                  >
                    <div className="w-5 h-5 rounded-badge bg-brand-dark text-brand-lime flex items-center justify-center text-[10px] font-extrabold">
                      {user.username.slice(0, 1).toUpperCase()}
                    </div>
                    <span>{user.username}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel>
                    <div className="space-y-0.5">
                      <div className="text-xs font-mono font-bold text-brand-dark flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>@{user.username}</span>
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground">
                        {user.rankTier || 'Novice'} &bull; {user.expPoints?.toLocaleString() ?? 0}{' '}
                        EXP
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
