---
name: CyberForce Tactical Dark
version: 1.0.0
description: Tactical Cyber-Minimalism design tokens and guidelines for CyberForce Cloud Range & Training Platform. Strict Purple Ban.
colors:
  primary: "#00F0FF"
  primary-hover: "#00D2E0"
  secondary: "#10B981"
  secondary-hover: "#059669"
  warning: "#F59E0B"
  error: "#EF4444"
  neutral-canvas: "#070A0F"
  neutral-surface: "#0E131F"
  neutral-surface-hover: "#141C2E"
  neutral-border: "#1E293B"
  neutral-border-active: "#334155"
  text-primary: "#F8FAFC"
  text-secondary: "#94A3B8"
  text-muted: "#64748B"
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: -0.03em
  h1:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.6
  code:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.5
rounded:
  none: 0px
  sm: 2px
  md: 4px
  lg: 6px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-canvas}"
    rounded: "{rounded.sm}"
    padding: 10px 18px
  button-secondary:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: 10px 18px
  card-panel:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: 20px
---

# CyberForce Design Specification

## Overview
CyberForce is an interactive cyber range and real-time security competition platform.
The design language is **Tactical Cyber-Minimalism**: ultra-clean, high-contrast, dark-mode first, with 0–4px sharp radii, avoiding all AI visual clichés.

## Colors
- **Canvas Base (`#070A0F`):** Deep obsidian background for prolonged training sessions without eye fatigue.
- **Surface Layer (`#0E131F`):** Layered card/panel elevation.
- **Electric Cyan (`#00F0FF`):** Primary accent for interactive actions, highlights, and CTAs.
- **Cyber Emerald (`#10B981`):** Success indicators, solved flags, live VPN connection status.
- **Amber Alert (`#F59E0B`):** Machine lease expiry warnings, SLA warnings, tiered hints.
- **Crimson Breach (`#EF4444`):** Failed submissions, account lockouts, critical service failures.

## Typography
- **UI Text:** `Inter` (geometric, highly legible at small sizes).
- **Terminal, Code & Flags:** `JetBrains Mono` (clear distinction for `0` vs `O`, `l` vs `1`).

## Elevation & Depth
- Flat technical panels separated by sharp `#1E293B` borders rather than muddy diffuse drop shadows.
- Active states use `#334155` borders with subtle cyan/emerald glows (`box-shadow: 0 0 12px rgba(0, 240, 255, 0.15)`).

## Shapes
- Sharp, technical borders with minimal corner radius (`0px` to `4px`).
- Pills (`9999px`) reserved strictly for status chips and tags (e.g. `100.64.10.42`).

## Do's and Don'ts
- **DO** maintain strict dark aesthetic with WCAG AA compliance (4.5:1 text contrast).
- **DON'T** use purple or violet gradients (`#8B5CF6`, `#A855F7`, `#7C3AED`) — strict Purple Ban.
- **DON'T** use generic rounded corporate SaaS templates.
- **DO** use monospace fonts for all hashes, IPs, flags, and terminal outputs.
