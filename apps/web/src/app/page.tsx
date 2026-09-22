import React from 'react';
import { CYBER_CLASSES } from '@/styles/theme';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cyber-grid flex flex-col items-center justify-center p-6 md:p-12">
      <div className="max-w-4xl w-full space-y-10">
        {/* Status Header Badge */}
        <div className="flex justify-center">
          <div className={CYBER_CLASSES.badge.emerald}>
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            CYBERFORCE ENGINE READY &bull; ZERO-SETUP PRACTICE
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className={CYBER_CLASSES.typography.h1}>
            Hands-on <span className="text-[#00F0FF]">Cyber Range</span> & Real-Time Arena
          </h1>
          <p className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            Zero-friction in-browser Kali Linux, 1-Click isolated Docker sandboxes, WireGuard VPN
            access, and cryptographically verifiable digital certificates.
          </p>
        </div>

        {/* Action Button Row */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button type="button" className={CYBER_CLASSES.button.primary}>
            Start Free Practice
          </button>
          <button type="button" className={CYBER_CLASSES.button.secondary}>
            Browse Learning Paths
          </button>
        </div>

        {/* Tactical Panels Showcase (Theme Demonstration) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          {/* Card 1: Practice */}
          <div className={CYBER_CLASSES.panel.interactive}>
            <div className="flex items-center justify-between mb-3">
              <span className={CYBER_CLASSES.typography.monoLabel}>LAB-01</span>
              <span className={CYBER_CLASSES.badge.cyan}>Active</span>
            </div>
            <h3 className={CYBER_CLASSES.typography.h3}>Instant Sandbox</h3>
            <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
              Spawn target Linux/Docker containers in &lt; 3s with zero local setup friction.
            </p>
          </div>

          {/* Card 2: KotH Arena */}
          <div className={CYBER_CLASSES.panel.interactive}>
            <div className="flex items-center justify-between mb-3">
              <span className={CYBER_CLASSES.typography.monoLabel}>ARENA-60S</span>
              <span className={CYBER_CLASSES.badge.amber}>Live Tick</span>
            </div>
            <h3 className={CYBER_CLASSES.typography.h3}>King of the Hill</h3>
            <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
              Defend your root token and gain +10 EXP per 60-second tick with service auto-heal.
            </p>
          </div>

          {/* Card 3: Capstone */}
          <div className={CYBER_CLASSES.panel.interactive}>
            <div className="flex items-center justify-between mb-3">
              <span className={CYBER_CLASSES.typography.monoLabel}>EXAM-CERT</span>
              <span className={CYBER_CLASSES.badge.emerald}>Verified</span>
            </div>
            <h3 className={CYBER_CLASSES.typography.h3}>Verifiable Certs</h3>
            <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
              RSA-4096 cryptographically signed PDF certificates shareable directly to LinkedIn.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
