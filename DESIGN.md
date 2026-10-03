---
name: CyberForce Neo-Brutalism (Positivus Theme)
version: 2.0.0
description: Neo-Brutalism & Soft Brutalism design system tokens inspired by the Positivus aesthetic for CyberForce Cloud Cyber Range & Training Platform.
colors:
  primary: "#B9FF66"
  primary-hover: "#A6F24D"
  brand-lime: "#B9FF66"
  brand-lime-hover: "#A6F24D"
  brand-dark: "#191A23"
  brand-gray: "#F3F3F3"
  brand-white: "#FFFFFF"
  canvas: "#FFFFFF"
  canvas-dark: "#11141B"
  surface-card: "#F3F3F3"
  surface-card-alt: "#B9FF66"
  surface-card-dark: "#191A23"
  border-neo: "#191A23"
  border-neo-dark: "rgba(255, 255, 255, 0.20)"
  border-subtle: "rgba(25, 26, 35, 0.12)"
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 54px
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: -0.03em
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: -0.02em
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.01em
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  code:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.5
rounded:
  card: 40px
  btn: 14px
  badge: 7px
  pill: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
shadows:
  neo: "0 5px 0 #191A23"
  neo-lg: "0 8px 0 #191A23"
  neo-sm: "0 3px 0 #191A23"
  neo-dark: "0 5px 0 rgba(0, 0, 0, 0.65)"
  neo-lg-dark: "0 8px 0 rgba(0, 0, 0, 0.75)"
components:
  button-primary:
    backgroundColor: "{colors.brand-lime}"
    textColor: "{colors.brand-dark}"
    rounded: "{rounded.btn}"
    border: "1px solid {colors.border-neo}"
    shadow: "{shadows.neo}"
  button-dark:
    backgroundColor: "{colors.brand-dark}"
    textColor: "{colors.brand-white}"
    rounded: "{rounded.btn}"
    border: "1px solid {colors.border-neo}"
    shadow: "{shadows.neo}"
  card-service:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.card}"
    border: "1px solid {colors.border-neo}"
    shadow: "{shadows.neo}"
  badge-chip:
    backgroundColor: "{colors.brand-lime}"
    textColor: "{colors.brand-dark}"
    rounded: "{rounded.badge}"
    border: "1px solid {colors.border-neo}"
---

# CyberForce Neo-Brutalism (Positivus Theme) Specification

## Overview
CyberForce adopts the **Neo-Brutalism / Soft Brutalism (Positivus Theme)** visual direction. This design language merges high-impact industrial aesthetics with playful highlighters and accessible ergonomics. It conveys military-grade cyber range credibility without being dreary, stale, or corporate-slop.

Key pillars:
1. **Crisp 1px–2px Borders:** All interactive cards, inputs, badges, and buttons have solid black (`#191A23`) outlines.
2. **Hard Flat Drop Shadows (0 blur):** Signature offset depth (`0 5px 0 #191A23`) with tactile push-down active states.
3. **Pronounced Generous Radii:** Striking contrast of ultra-rounded 40px cards (`--radius-card`), smooth 14px buttons (`--radius-btn`), and 7px highlighter chips (`--radius-badge`).
4. **Electric Lime Highlighter:** `#B9FF66` acts as the primary accent and marker for CTF successes, active labs, and primary CTA buttons.

## Colors
- **Brand Electric Lime (`#B9FF66`):** The primary brand accent and highlighter, bringing intense energy and focus.
- **Deep Charcoal Ink Black (`#191A23`):** Used for typography, crisp borders, and deep container surfaces.
- **Soft Warm Gray (`#F3F3F3`):** Neutral surface for primary content cards.
- **Crisp Canvas White (`#FFFFFF`):** High-contrast base background in light mode.
- **Dark Mode Adaptation:** Dark canvas (`#11141B`), elevated card surfaces (`#1B1F2B`), deep panels (`#0B0D13`), and subtle white/translucent crisp borders (`rgba(255, 255, 255, 0.20)`).

## Typography
- **Primary Typeface:** `Plus Jakarta Sans`, system-ui, sans-serif. Clean geometric grotesk with high legibility and contemporary character.
- **Monospace Typeface:** `JetBrains Mono` for IP addresses, terminal output, flags, ports, and technical codes.
- **Hierarchy:**
  - Display (54px / 800): Hero headlines and banner statements.
  - H1 (40px / 800): Page titles and primary section intros.
  - H2 (28px / 700): Card headings and module titles.
  - H3 (20px / 700): Subheadings and task labels.
  - Body (16px / 400): Descriptive paragraphs and instructional guides.
  - Code (14px / 600): Terminal, flags, hashes, and API endpoints.

## Layout & Spacing
- Container layout relies on generous padding (p-6 to p-12) and spacious grid gaps (gap-6 to gap-8).
- Asymmetrical grids and alternating card backgrounds (Warm Gray vs Electric Lime vs Charcoal Dark) create engaging visual rhythm.

## Elevation & Depth
- **Zero-blur hard drop shadows:**
  - Standard buttons and cards: `box-shadow: 0 5px 0 #191A23;`
  - Large showcase cards / Hover: `box-shadow: 0 8px 0 #191A23;`
  - Small badges / Active states: `box-shadow: 0 3px 0 #191A23;`
- **Micro-interactions:** On button hover, subtle negative translation (`translate-y-[-2px]` with `shadow-neo-lg`), and on active press, translation down (`translate-y-[2px]` with `shadow-neo-sm` or flush).

## Shapes
- **Cards:** 40px rounded corners (`rounded-[40px]`).
- **Action Buttons & Inputs:** 14px rounded corners (`rounded-[14px]`).
- **Category Chips & Status Badges:** 7px rounded corners (`rounded-[7px]`).
- **Icon / Arrow Buttons:** Full circular pill (`rounded-full` / `9999px`).

## Components
- **Primary Button:** `#B9FF66` background, `#191A23` text and 1px border, 14px radius, hard drop shadow.
- **Dark Button:** `#191A23` background, `#FFFFFF` text and 1px border, 14px radius, hard drop shadow.
- **Service & Lab Card:** 40px radius, 1px `#191A23` border, hard drop shadow, available in 3 colorways (Gray, Lime, Charcoal).
- **Highlighter Badge:** 7px radius, uppercase bold text, 1px border, highlighter marker aesthetic.
- **Interactive Flag Input:** 14px radius, 1px `#191A23` border with hard drop shadow on focus.

## Do's and Don'ts
### Do's:
- Use solid 1px–2px outlines on cards, buttons, badges, and inputs.
- Keep hard flat drop shadows with zero blur radius (`0 Xpx 0 #191A23`).
- Maintain the 40px / 14px / 7px radius hierarchy across all redesigned pages.
- Highlight key headlines with electric lime (`#B9FF66`) chips or background blocks.
- Preserve Dark Mode compatibility with deep charcoal canvas and crisp translucent borders.

### Don'ts:
- Do not use fuzzy, blurred drop shadows (e.g. `box-shadow: 0 10px 25px rgba(0,0,0,0.1)`).
- Do not mix random border radiuses (e.g. 2px, 8px, 16px, 24px) — stick strictly to 40px / 14px / 7px / pill.
- Do not use generic cold blue or purple gradients.
- Do not remove the 1px-2px solid border from interactive components.
