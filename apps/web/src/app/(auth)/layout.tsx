import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Terminal, Shield, Zap, Activity } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas bg-neo-grid flex flex-col justify-between selection:bg-brand-lime selection:text-brand-dark">
      {/* Top Simple Header */}
      <header className="border-b border-brand-dark/15 dark:border-white/10 bg-canvas/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 bg-primary border border-brand-dark rounded-badge flex items-center justify-center shadow-neo-sm font-extrabold text-primary-foreground group-hover:-translate-y-0.5 transition-transform">
              CF
            </div>
            <span className="font-extrabold text-xl tracking-tight text-brand-dark dark:text-white">
              CyberForce
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Range Status: Online
            </span>
          </div>
        </div>
      </header>

      {/* Main Split Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 md:py-12 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-stretch">
          {/* Left Column: Cyber Telemetry & Live Range (40%) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between bg-brand-dark text-white rounded-card border-2 border-brand-dark shadow-neo-lg p-8 md:p-10 relative overflow-hidden">
            {/* Background Accent Grid / Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <Badge variant="lime" className="font-extrabold">
                  <Activity className="w-3.5 h-3.5 mr-1" />
                  Live Telemetry
                </Badge>
                <span className="font-mono text-xs text-white/60 tracking-wider">
                  RFC 6598 Subnet
                </span>
              </div>

              <div>
                <h2 className="text-3xl font-extrabold text-white leading-tight">
                  Zero-Setup Cloud Cyber Range
                </h2>
                <p className="mt-3 text-white/75 text-sm leading-relaxed">
                  Join thousands of security operators defending, attacking, and mastering hands-on
                  cyber warfare in isolated browser sandboxes.
                </p>
              </div>

              {/* Stats Counters in Neo-Brutalist boxes */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white/5 border border-white/15 rounded-btn p-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-brand-lime font-bold">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Active Pods</span>
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-white mt-1">1,420+</div>
                </div>

                <div className="bg-white/5 border border-white/15 rounded-btn p-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-brand-lime font-bold">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Daily Flags</span>
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-white mt-1">8,912</div>
                </div>
              </div>

              {/* Real-time Telemetry Simulated Terminal */}
              <div className="bg-black/60 border border-white/20 rounded-btn p-4 font-mono text-xs text-brand-lime space-y-1.5">
                <div className="text-white/40">// Live Range Kernel Status</div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>sys.init_probe(): OK</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>wireguard.gateway: 100.64.0.1 (Online)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>zero_egress_firewall: ENFORCED</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <span className="animate-pulse text-brand-lime">▶</span>
                  <span>ready_for_operator_connection...</span>
                </div>
              </div>
            </div>

            {/* Bottom Quote & Trust Anchor */}
            <div className="pt-8 border-t border-white/10 relative z-10">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-brand-lime shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-white/80 leading-relaxed italic">
                  &ldquo;Train like it&apos;s a real incident. From zero to root in &lt; 3
                  seconds.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Form Area (70% on mobile, 60% on desktop) */}
          <div className="col-span-1 lg:col-span-7 flex flex-col justify-center">{children}</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-dark/15 dark:border-white/10 py-5 bg-canvas text-center text-xs text-muted-foreground font-medium">
        CyberForce &copy; 2026. Built for high-velocity offensive and defensive cyber training.
      </footer>
    </div>
  );
}
