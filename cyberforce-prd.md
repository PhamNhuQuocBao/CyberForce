# CyberForce - Engineering Plan & Documentation Architecture

## Goal
Establish clean Separation of Concerns (SoC) and modular documentation structure for CyberForce:
- **PRD (`docs/01-product/PRD_CYBERFORCE.md`):** Answers "What & Why" (Owned by PM/PO/BA).
- **TDD (`docs/02-architecture/TDD_CYBERFORCE.md`):** Answers "How" (Owned by Tech Lead/Architect).
- **Docs Index (`docs/README.md`):** Central navigation portal for the entire engineering & product team.

## Tasks
- [x] Restructure `docs/` into standard modular folders (`01-product`, `02-architecture`, `03-guidelines`, `04-reports`) → Verify: All files categorized cleanly
- [x] Author `docs/README.md` documentation portal → Verify: Role-based navigation and index links verified
- [x] Refactor `docs/01-product/PRD_CYBERFORCE.md` to pure PM scope → Verify: No low-level technical leaks in PRD
- [x] Author `docs/02-architecture/TDD_CYBERFORCE.md` for technical design → Verify: Complete engineering specification
- [ ] Initialize Monorepo Structure & Dev Environment → Verify: `docker compose up` starts base services (Postgres, Redis, Traefik)
- [ ] Implement Epic 1: Auth & User Management → Verify: OAuth2 & JWT issuance tests pass
- [ ] Implement Epic 2: LMS & Interactive Room Engine → Verify: Markdown rendering & flag validation tests pass
- [ ] Implement Epic 3: Docker Lab Spawner & Web Terminal → Verify: Container spawned and reachable via xterm.js under 3s
- [ ] Implement Epic 4: WireGuard VPN Gateway → Verify: Client connects and pings target private IP `10.10.x.y`
- [ ] Implement Epic 5: CTF Dynamic Scoring & KotH Engine → Verify: 60s tick runner computes king points accurately
- [ ] Implement Epic 6: Digital Certification & Verification Portal → Verify: PDF generated with valid QR & SHA-256 hash
- [ ] Verification Phase X: Security Scan & System Audit → Verify: Zero egress policy and cgroup quotas verified

## Done When
- [x] Documentation hierarchy is fully standardized and navigable.
- [ ] All functional and technical components are verified through code execution.
