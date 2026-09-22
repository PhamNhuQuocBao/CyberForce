import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cyber-grid flex flex-col items-center justify-center p-6 md:p-12">
      <div className="max-w-4xl w-full space-y-10">
        {/* Status Header Badge */}
        <div className="flex justify-center">
          <Badge variant="emerald">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            CYBERFORCE ENGINE READY &bull; ZERO-SETUP PRACTICE
          </Badge>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Hands-on <span className="text-primary">Cyber Range</span> & Real-Time Arena
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Zero-friction in-browser Kali Linux, 1-Click isolated Docker sandboxes, WireGuard VPN
            access, and cryptographically verifiable digital certificates.
          </p>
        </div>

        {/* Action Button Row */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button variant="default">Start Free Practice</Button>
          <Button variant="secondary">Browse Learning Paths</Button>
        </div>

        {/* Interactive Flag Submission Demo */}
        <Card className="max-w-md mx-auto w-full p-4 space-y-3 bg-card/80 backdrop-blur border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground uppercase">
              Target Sandbox
            </span>
            <Badge variant="cyan">100.64.10.42</Badge>
          </div>
          <div className="flex gap-2">
            <Input placeholder="flag{e83921bf7a8109dca8721094}" mono />
            <Button size="sm">Submit</Button>
          </div>
        </Card>

        {/* Tactical Panels Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {/* Card 1: Practice */}
          <Card interactive>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-muted-foreground uppercase">LAB-01</span>
                <Badge variant="cyan">Active</Badge>
              </div>
              <CardTitle>Instant Sandbox</CardTitle>
              <CardDescription>
                Spawn target Linux/Docker containers in &lt; 3s with zero local setup friction.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 2: KotH Arena */}
          <Card interactive>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-muted-foreground uppercase">ARENA-60S</span>
                <Badge variant="amber">Live Tick</Badge>
              </div>
              <CardTitle>King of the Hill</CardTitle>
              <CardDescription>
                Defend your root token and gain +10 EXP per 60-second tick with service auto-heal.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 3: Capstone */}
          <Card interactive>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-muted-foreground uppercase">EXAM-CERT</span>
                <Badge variant="emerald">Verified</Badge>
              </div>
              <CardTitle>Verifiable Certs</CardTitle>
              <CardDescription>
                RSA-4096 cryptographically signed PDF certificates shareable directly to LinkedIn.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </main>
  );
}
