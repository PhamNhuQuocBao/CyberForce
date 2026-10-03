---
type: project
created: 2026-05-25
updated: 2026-07-12
---

# Project Conventions

## Git Workflow
- **STRICT MANDATORY RULE (NEVER VIOLATE):** NEVER push directly to `main` under ANY circumstances, regardless of whether changes are large, small, documentation, or trivial fixes.
- ALWAYS checkout a dedicated branch (`docs/[slug]`, `feature/CF-[id]-[slug]`, `fix/[slug]`), commit on that branch, and push the feature/doc branch to origin following GitFlow.
- Merges to `main` must only occur via GitHub Pull Requests.

## Supported AI platforms (AG Kit)
- AG Kit **only supports Gemini CLI and Google Antigravity**.
- Do not claim compatibility with Claude Code, Cursor, Copilot, Windsurf, or other assistants unless the user explicitly expands scope.
- Copy on the website, docs, FAQ, README, and marketing should describe AG Kit as a toolkit for Gemini CLI / Antigravity-style agent setups.

## UI Design System (Neo-Brutalism / Soft Brutalism - Positivus Theme)
- Theme: **Neo-Brutalism / Soft Brutalism (Positivus Theme)** as specified in `DESIGN.md`.
- Typography: Always use `Plus Jakarta Sans` for body/headings and `JetBrains Mono` for code/terminal/flags.
- Colors: Primary Electric Lime (`#B9FF66`), Deep Charcoal Ink Black (`#191A23`), Soft Warm Gray (`#F3F3F3`), Canvas White (`#FFFFFF`), Dark Canvas (`#11141B`).
- Borders: Crisp solid 1px-2px borders (`#191A23` in light, `rgba(255, 255, 255, 0.20)` in dark).
- Shadows: Hard flat drop shadows with zero blur (`0 5px 0 #191A23`, `0 8px 0 #191A23`, `0 3px 0 #191A23`).
- Radii: Cards 40px (`rounded-card`), Buttons & Inputs 14px (`rounded-btn`), Badges 7px (`rounded-badge`), Pill 9999px (`rounded-full`).
- All remaining pages and new UI components must strictly adhere to this theme and tokens.
