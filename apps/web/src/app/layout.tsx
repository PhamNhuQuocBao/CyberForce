import type { Metadata } from 'next';
import React from 'react';
import localFont from 'next/font/local';
import { Toaster } from 'sonner';
import '@/styles/globals.css';

const inter = localFont({
  src: [
    { path: '../fonts/Inter-400.ttf', weight: '400' },
    { path: '../fonts/Inter-500.ttf', weight: '500' },
    { path: '../fonts/Inter-600.ttf', weight: '600' },
    { path: '../fonts/Inter-700.ttf', weight: '700' },
  ],
  variable: '--font-sans',
  display: 'swap',
});
const mono = localFont({
  src: '../fonts/JetBrainsMono-400.ttf',
  weight: '400',
  variable: '--font-mono',
  display: 'swap',
});
export const metadata: Metadata = {
  title: 'CyberForce — Học và thực hành an ninh mạng',
  description: 'Nền tảng học tập, thực hành và xây dựng hồ sơ năng lực an ninh mạng.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.classList.toggle('dark',localStorage.getItem('cf-theme')==='dark')}catch{}`,
          }}
        />
      </head>
      <body className="min-h-screen font-sans">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--card)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
            },
          }}
        />
      </body>
    </html>
  );
}
