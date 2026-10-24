'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu } from 'lucide-react';
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
const links = [
  ['/paths', 'Lộ trình'],
  ['/#labs', 'Thực hành'],
  ['/#arena', 'Thi đấu'],
  ['/#certs', 'Chứng chỉ'],
];
export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isCreatorDialogOpen, setIsCreatorDialogOpen] = useState(false);
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
                      {user.streakDays} ngày liên tiếp
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
