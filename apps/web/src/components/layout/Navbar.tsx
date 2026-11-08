'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Flame, Menu } from 'lucide-react';
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
import { BecomeCreatorDialog } from '@/components/creator/BecomeCreatorDialog';
import { ThemeToggle } from './ThemeToggle';
import { VpnStatusBadge } from './VpnStatusBadge';
const links = [
  ['/paths', 'Lộ trình'],
  ['/#labs', 'Thực hành'],
  ['/#arena', 'Thi đấu'],
  ['/exams', 'Kỳ thi'],
  ['/#certs', 'Chứng chỉ'],
];
export function Navbar() {
  const { user, accessToken, isAuthenticated, logout } = useAuthStore();
  const [isCreatorDialogOpen, setIsCreatorDialogOpen] = useState(false);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const timezone = user?.timezone ?? 'Asia/Ho_Chi_Minh';
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)!.value;
  const today = `${part('year')}-${part('month')}-${part('day')}`;
  const yesterdayDate = new Date(`${today}T00:00:00.000Z`);
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
  const visibleStreak =
    user?.lastStreakDate &&
    [today, yesterdayDate.toISOString().slice(0, 10)].includes(user.lastStreakDate)
      ? user.streakDays
      : 0;
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-card focus:p-3"
      >
        Đến nội dung chính
      </a>
      <header className="sticky top-0 z-40 border-b bg-card">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
          <Link href="/" className="py-3 text-lg font-semibold tracking-tight">
            CyberForce<span className="text-[#486B16] dark:text-primary">.</span>
          </Link>
          <nav aria-label="Điều hướng chính" className="hidden items-center gap-6 text-sm md:flex">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="py-3 text-muted-foreground hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            {isAuthenticated && user && accessToken && (
              <VpnStatusBadge userId={user.id} accessToken={accessToken} />
            )}
            <ThemeToggle />
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Tài khoản">
                    <span className="hidden max-w-32 truncate sm:inline">{user.username}</span>
                    <span className="sm:hidden">Tài khoản</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <p className="break-all text-foreground">{user.username}</p>
                    <p className="mt-1 font-normal">
                      {user.rankTier || 'Novice'} · {user.expPoints?.toLocaleString() ?? 0} EXP ·{' '}
                      <Flame aria-hidden="true" className="inline h-4 w-4 align-[-2px]" />{' '}
                      {visibleStreak} ngày liên tiếp
                      {user.streakBonusPercent &&
                      user.streakBonusPercent > 100 &&
                      user.streakBonusUntil &&
                      new Date(user.streakBonusUntil).getTime() > now
                        ? ` · ${(user.streakBonusPercent / 100).toLocaleString('vi-VN')}× EXP`
                        : ''}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/user/${encodeURIComponent(user.username)}`}>
                      Hồ sơ & quyền riêng tư
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/access/vpn">Kết nối VPN</Link>
                  </DropdownMenuItem>
                  {user.role === 'student' && (
                    <DropdownMenuItem onSelect={() => setIsCreatorDialogOpen(true)}>
                      Đăng ký trở thành Creator
                    </DropdownMenuItem>
                  )}
                  {['creator', 'instructor', 'org_admin', 'superadmin'].includes(user.role) && (
                    <DropdownMenuItem asChild>
                      <Link href="/#creator-studio">Creator Studio</Link>
                    </DropdownMenuItem>
                  )}
                  {['org_admin', 'superadmin'].includes(user.role) && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/roles">Duyệt quyền Creator</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => logout()}>Đăng xuất</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link href="/login">Đăng nhập</Link>
                </Button>
                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <Link href="/register">Đăng ký</Link>
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Mở điều hướng"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {links.map(([href, label]) => (
                  <DropdownMenuItem asChild key={href}>
                    <Link href={href}>{label}</Link>
                  </DropdownMenuItem>
                ))}
                {!isAuthenticated && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/login">Đăng nhập</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register">Đăng ký</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <BecomeCreatorDialog
        isOpen={isCreatorDialogOpen}
        onClose={() => setIsCreatorDialogOpen(false)}
      />
    </>
  );
}
