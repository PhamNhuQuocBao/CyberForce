import type { Metadata } from 'next';
import React from 'react';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'CyberForce - Cloud Cyber Range & Practical Training Platform',
  description:
    'Zero-setup hands-on cybersecurity training, real-time arena, and verifiable certificates.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className="min-h-screen bg-[#070A0F] text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
