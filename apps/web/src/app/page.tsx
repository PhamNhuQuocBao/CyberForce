import React from 'react';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/20 px-4 py-1 text-xs font-mono text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          CYBERFORCE PLATFORM READY
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-50">
          Hands-on <span className="text-[#00F0FF]">Cyber Range</span> & Real-Time Arena
        </h1>
        <p className="text-lg text-slate-400">
          Zero-Setup in-browser Kali Linux, 1-Click dynamic Docker sandboxes, WireGuard VPN access,
          and verifiable digital certifications.
        </p>
      </div>
    </main>
  );
}
