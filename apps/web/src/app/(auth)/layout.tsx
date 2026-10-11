import Link from 'next/link';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          CyberForce.
        </Link>
        <ThemeToggle />
      </header>
      <main id="main-content" className="mx-auto w-full max-w-[472px] flex-1 px-4 py-8 sm:py-12">
        {children}
      </main>
      <footer className="px-4 py-6 text-center text-sm text-muted-foreground">
        CyberForce · Học và thực hành an ninh mạng
      </footer>
    </div>
  );
}
