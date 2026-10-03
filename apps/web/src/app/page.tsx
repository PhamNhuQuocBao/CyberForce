import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Terminal,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Flag,
  Award,
  Swords,
  ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas bg-neo-grid flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="border-b border-brand-dark/15 dark:border-white/10 bg-canvas/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary border border-brand-dark rounded-badge flex items-center justify-center shadow-neo-sm font-extrabold text-primary-foreground">
              CF
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-brand-dark dark:text-white">
              CyberForce
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 font-bold text-sm">
            <a
              href="#labs"
              className="text-brand-dark/80 hover:text-brand-dark dark:text-white/80 dark:hover:text-white transition-colors"
            >
              Practice Labs
            </a>
            <a
              href="#arena"
              className="text-brand-dark/80 hover:text-brand-dark dark:text-white/80 dark:hover:text-white transition-colors"
            >
              KotH Arena
            </a>
            <a
              href="#certs"
              className="text-brand-dark/80 hover:text-brand-dark dark:text-white/80 dark:hover:text-white transition-colors"
            >
              Certificates
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              Sign In
            </Button>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20 space-y-20 flex-1 w-full">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="flex justify-center">
            <Badge variant="default" className="gap-2 px-3.5 py-1.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-brand-dark animate-pulse" />
              CYBER RANGE ENGINE &bull; NEO-BRUTALISM EDITION
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-brand-dark dark:text-white leading-[1.1]">
            Hands-on{' '}
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-badge border border-brand-dark inline-block -rotate-1 shadow-neo-sm">
              Cyber Range
            </span>{' '}
            & Real-Time Arena
          </h1>

          <p className="text-lg sm:text-xl text-brand-dark/75 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Zero-friction in-browser Kali Linux, 1-Click isolated Docker sandboxes, WireGuard VPN
            access, and cryptographically verifiable digital certificates.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button size="lg" className="gap-2">
              Start Free Practice
              <ArrowUpRight className="h-5 w-5" />
            </Button>
            <Button variant="dark" size="lg" className="gap-2">
              Explore 120+ Rooms
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Interactive Flag Submission Box */}
        <section className="max-w-xl mx-auto w-full">
          <Card className="p-6 md:p-8 space-y-5 bg-white dark:bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded-full bg-primary border border-brand-dark" />
                <span className="font-bold text-sm text-brand-dark dark:text-white">
                  Active Sandbox Target
                </span>
              </div>
              <Badge variant="secondary" className="font-mono">
                100.64.10.42
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground">
              Exploit the target vulnerability and submit your dynamic HMAC flag to claim EXP
              points.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="flag{e83921bf7a8109dca8721094}"
                mono
                className="flex-1"
                defaultValue="flag{cyberforce_neo_brutalism_ready}"
              />
              <Button variant="default" className="gap-1.5 sm:w-auto">
                <Flag className="h-4 w-4" />
                Submit Flag
              </Button>
            </div>
          </Card>
        </section>

        {/* Tactical 3-Colorway Cards Grid (Positivus Soft Brutalism) */}
        <section className="space-y-8" id="labs">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <Badge variant="lime">CORE CAPABILITIES</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark dark:text-white">
                Engineered For Real-World Combat
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              From web application security to active kernel rootkits, execute attacks without local
              installation barriers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Warm Gray Card (Default) */}
            <Card variant="default" interactive className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-btn bg-white dark:bg-card-hover border border-brand-dark dark:border-white/20 flex items-center justify-center shadow-neo-sm">
                    <Terminal className="h-6 w-6 text-brand-dark dark:text-white" />
                  </div>
                  <Badge variant="white">SANDBOX &lt; 3S</Badge>
                </div>
                <CardTitle>Instant Cloud Lab</CardTitle>
                <CardDescription>
                  Docker containerized sandboxes with cgroups isolation (2 vCPU, 2GB RAM) and
                  ephemeral storage provisioned directly in your browser.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="pt-4 border-t border-brand-dark/10 dark:border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold font-mono">ZERO SETUP TIME</span>
                  <div className="h-9 w-9 rounded-pill bg-brand-dark text-white flex items-center justify-center shadow-neo-sm">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Electric Lime Card (Highlighter) */}
            <Card variant="lime" interactive className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-btn bg-brand-dark text-white border border-brand-dark flex items-center justify-center shadow-neo-sm">
                    <Swords className="h-6 w-6 text-brand-lime" />
                  </div>
                  <Badge variant="dark">ARENA 60S TICK</Badge>
                </div>
                <CardTitle className="text-brand-dark">King of the Hill</CardTitle>
                <CardDescription className="text-brand-dark/85">
                  Real-time attack and defense match engine. Defend your king token in
                  /root/king.txt and earn +10 EXP per tick with automated service health checks.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="pt-4 border-t border-brand-dark/20 flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-brand-dark">
                    COMPETITIVE ARENA
                  </span>
                  <div className="h-9 w-9 rounded-pill bg-brand-dark text-white flex items-center justify-center shadow-neo-sm">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Charcoal Dark Card */}
            <Card variant="dark" interactive className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-btn bg-brand-lime text-brand-dark border border-brand-dark flex items-center justify-center shadow-neo-sm">
                    <Award className="h-6 w-6 text-brand-dark" />
                  </div>
                  <Badge variant="lime">RSA-4096 SIGNED</Badge>
                </div>
                <CardTitle className="text-white">Verifiable Certs</CardTitle>
                <CardDescription className="text-slate-300">
                  Capstone practical exam validation. Automatically generate tamper-evident PDF
                  certificates shareable directly to LinkedIn with OpenBadges support.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="pt-4 border-t border-white/20 flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-slate-300">
                    ACCREDITED PROOF
                  </span>
                  <div className="h-9 w-9 rounded-pill bg-brand-lime text-brand-dark flex items-center justify-center shadow-neo-sm">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Feature Highlight Pill Banner */}
        <section className="bg-brand-gray dark:bg-card border border-brand-dark dark:border-white/20 rounded-card p-8 md:p-12 shadow-neo">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-badge bg-brand-lime border border-brand-dark flex items-center justify-center shrink-0 shadow-neo-sm">
                <Zap className="h-5 w-5 text-brand-dark" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-brand-dark dark:text-white">
                  Apache Guacamole & xterm.js
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Stream Kali Linux graphical desktop and high-speed terminal at 60 FPS directly in
                  your browser.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-badge bg-brand-lime border border-brand-dark flex items-center justify-center shrink-0 shadow-neo-sm">
                <ShieldCheck className="h-5 w-5 text-brand-dark" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-brand-dark dark:text-white">
                  WireGuard Zero-Trust Gateway
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Fast kernel-space VPN tunneling with eBPF client isolation and strict zero-egress
                  firewall policies.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-badge bg-brand-lime border border-brand-dark flex items-center justify-center shrink-0 shadow-neo-sm">
                <Flag className="h-5 w-5 text-brand-dark" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-brand-dark dark:text-white">
                  Dynamic HMAC Flags
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Unique per-student flags prevent answer sharing and cheating during CTF matches
                  and exams.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Neo-Brutalist Footer */}
      <footer className="border-t border-brand-dark/15 dark:border-white/10 bg-canvas py-10 mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-brand-dark dark:text-white">CyberForce</span>
            <span>&copy; {new Date().getFullYear()} &bull; Neo-Brutalism Edition</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#terms" className="hover:text-foreground">
              Terms of Service
            </a>
            <a href="#privacy" className="hover:text-foreground">
              Privacy Policy
            </a>
            <a href="#docs" className="hover:text-foreground">
              Documentation
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
