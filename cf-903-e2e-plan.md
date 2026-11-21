# CF-903 — End-to-end browser tests (proposal)

**Status:** Approved. CF-502/503 remain deferred, so this plan tests the available learning and lab flow without claiming the entire product is complete.

**Result:** Implemented. `pnpm test:e2e` passed on separate disposable Compose projects (4/4 tests in consecutive final runs), including the lab IP time assertion. API unit tests passed 166/166 with isolated PostgreSQL, Redis and MinIO; web unit tests passed 14/14; lint and typecheck passed. The script uses ports 23000–23008 by default; set `CF_E2E_PORT_BASE` to move the range if needed. On a clean host run `pnpm exec playwright install chromium` first. The runner captures API/orchestrator logs in `/tmp/cf903-e2e-services.log` when it fails.

## Goal

Run repeatable Chromium tests against a real, disposable CyberForge stack for registration, lab startup, Web Terminal and first flag solve. No API or UI responses are mocked.

## Recommended implementation

1. Add `@playwright/test` as a development dependency, a root Playwright config and `tests/e2e/*.spec.ts`. Reuse the installed Chromium browser cache where available; document browser installation for clean CI hosts.
2. Start a uniquely named Docker Compose test project with its own PostgreSQL, Redis and MinIO volumes and non-default host ports. Apply the current Prisma schema only inside that project. Never run the existing seed against a shared database; it deletes sample tasks and submissions.
3. Build a minimal local E2E target image and insert a published test path/room/task/question into the isolated database. The fixture gives the browser a known flag and a target IP; the Web Terminal must run a real shell command through its WebSocket sidecar.
4. Drive the desktop UI in Chromium: register a fresh user and assert 0 EXP/Novice; open the test room, start a lab and receive its IP; run a terminal command; submit the flag and assert EXP plus streak day 1. Use unique users per run and explicit readiness checks instead of arbitrary sleeps.
5. Run the suite repeatedly to detect state leakage. Clean up only resources belonging to the named test project and its test lab containers. Record commands and results in `task-breakdown.md`.

## Decisions and trade-offs

- **Runner:** Playwright is the task's specified runner and produces repeatable CI tests. Alternative: manual browser checks avoid a dependency but cannot meet the automated suite requirement.
- **Target fixture:** A local test-only image makes the lab flow deterministic. Alternative: use one of the seed's `cyberforce/*` images, but those images are not built by this repository and may be absent on the Docker host.
- **Database isolation:** A fresh Compose project prevents the seed and tests from changing existing data. It costs more startup time and disk space than reusing the local development stack.

## Acceptance

- `pnpm exec playwright test` passes the four user journeys above against the isolated stack, including a second clean run.
- A failed lab or terminal shows a real test failure; the suite never silently replaces it with mocked success.
- Existing API/web unit tests, lint, typecheck and builds remain green. No production deployment or migration is performed.
