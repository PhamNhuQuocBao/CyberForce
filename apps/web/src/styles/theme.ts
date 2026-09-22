/**
 * CyberForce Common Theme Definition
 * Single Source of Truth for frontend tokens & reusable CSS utility bindings.
 * Strictly adheres to DESIGN.md (Tactical Cyber-Minimalism & Strict Purple Ban).
 */

export const CYBER_THEME = {
  colors: {
    canvas: '#070A0F', // Obsidian Base
    surface: '#0E131F', // Surface Layer
    surfaceHover: '#141C2E', // Interactive Surface
    border: '#1E293B', // Subtle Divider
    borderActive: '#334155', // Active Technical Border
    primary: '#00F0FF', // Electric Cyan
    primaryHover: '#00D2E0',
    secondary: '#10B981', // Cyber Emerald
    secondaryHover: '#059669',
    warning: '#F59E0B', // Amber Alert
    error: '#EF4444', // Crimson Breach
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },
  fonts: {
    sans: 'Inter, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  radii: {
    none: '0px',
    sm: '2px',
    md: '4px',
    lg: '6px',
    full: '9999px',
  },
  shadows: {
    glowCyan: '0 0 14px rgba(0, 240, 255, 0.25)',
    glowEmerald: '0 0 14px rgba(16, 185, 129, 0.25)',
    glowAmber: '0 0 14px rgba(245, 158, 11, 0.25)',
    glowCrimson: '0 0 14px rgba(239, 68, 68, 0.25)',
  },
} as const;

export type CyberBadgeVariant = 'cyan' | 'emerald' | 'amber' | 'crimson';
export type CyberButtonVariant = 'primary' | 'secondary' | 'danger';

export const CYBER_CLASSES = {
  panel: {
    base: 'cyber-panel p-5',
    interactive: 'cyber-panel-interactive p-5 cursor-pointer',
    elevated: 'bg-[#0E131F] border border-[#334155] rounded-[4px] p-6 shadow-glow-cyan/10',
  },
  button: {
    primary: 'cyber-btn-primary',
    secondary: 'cyber-btn-secondary',
    danger: 'cyber-btn-danger',
  },
  badge: {
    cyan: 'cyber-badge-cyan',
    emerald: 'cyber-badge-emerald',
    amber: 'cyber-badge-amber',
    crimson: 'cyber-badge-crimson',
  },
  input: {
    base: 'cyber-input font-mono',
  },
  typography: {
    h1: 'text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight',
    h2: 'text-2xl font-bold text-[#F8FAFC] tracking-tight',
    h3: 'text-lg font-semibold text-[#F8FAFC]',
    body: 'text-sm text-[#94A3B8] leading-relaxed',
    monoLabel: 'font-mono text-xs uppercase tracking-wider text-[#64748B]',
  },
} as const;

export function getBadgeClass(variant: CyberBadgeVariant): string {
  return CYBER_CLASSES.badge[variant] || CYBER_CLASSES.badge.cyan;
}

export function getButtonClass(variant: CyberButtonVariant): string {
  return CYBER_CLASSES.button[variant] || CYBER_CLASSES.button.primary;
}
