import type { Metadata } from 'next';
import React from 'react';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import '@/styles/globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CyberForce - Hands-on Cyber Range & Real-Time Arena',
  description:
    'Zero-setup hands-on cybersecurity training, real-time KotH arena, and verifiable certificates.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-canvas text-brand-dark dark:text-foreground antialiased font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
