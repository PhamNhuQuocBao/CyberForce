'use client';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function ThemeToggle() {
  function toggle() {
    const dark = document.documentElement.classList.toggle('dark');
    try {
      localStorage.setItem('cf-theme', dark ? 'dark' : 'light');
    } catch {
      /* Theme still works when storage is unavailable. */
    }
  }
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Đổi giao diện sáng / tối"
      title="Đổi giao diện sáng / tối"
    >
      <Moon className="h-4 w-4 dark:hidden" aria-hidden="true" />
      <Sun className="hidden h-4 w-4 dark:block" aria-hidden="true" />
    </Button>
  );
}
