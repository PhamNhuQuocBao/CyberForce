# CF-701 — Daily streak by learner timezone

**Status:** Approved by the user and implemented on `codex/cf-701-daily-streak`. The branch starts at `origin/main` `77420bf`, which includes CF-603.

## Goal

Count a streak only when a learner finishes a previously unsolved Task during their local calendar day; award persistent 7/30-day badges and time-limited EXP bonuses without double rewards.

## Implementation steps

1. Add an IANA timezone setting to the user profile and synchronize the browser timezone after sign-in. Validate it on the server; expose it in the authenticated profile. Use `Asia/Ho_Chi_Minh` until a learner chooses or syncs another timezone.
2. Add a durable streak-day record keyed by user and local date, a last qualifying day, bonus expiry/tier, and badge awards. New accounts begin at zero. Existing accounts with no qualifying record display zero until their first new completion, without rewriting old submission history.
3. In the existing submission transaction, count a Task only when all its questions have their first correct answer. Serialize by user and insert one streak day at most once per local day. Yesterday advances the count; a gap starts at one. A repeat answer earns no new EXP and never affects the streak.
4. On day 7 award `7-Day Warrior` and activate 1.2× EXP for the next 24 hours; on day 30 award `Cyber Habit Master` and activate 1.5× for 48 hours. Bonuses start after the qualifying submission, do not stack, and round bonus EXP to the nearest integer. Keep badge awards idempotent.
5. Compute the visible streak as zero after a missed local day and add a periodic sweep to persist that reset. Return streak/badge/bonus details to the learner and show the current state in the header plus a one-time unlock announcement after a qualifying submission.
6. Test timezone boundaries, daylight saving time, multi-question Tasks, concurrent submissions, missed days, repeat submissions, bonus expiry, and idempotent badges. Run API/web typecheck, lint, tests and builds. Do not apply a migration to an existing database or deploy production in this task.

## Decisions to approve

- **What counts as a Task:** Recommend all questions in a Task must be solved. Counting one question would award a daily streak for partial completion; the current UI tracks question completion but has no Task completion event.
- **Timezone:** Recommend browser sync with a profile override and `Asia/Ho_Chi_Minh` fallback. A UTC fallback would shift the day boundary for the primary local audience; accepting arbitrary client timestamps would allow streak manipulation. The server remains authoritative for submission time.
- **Rewards and history:** Recommend no replay EXP, preserving CF-203 anti-farming behavior. The Epic's “review EXP” sentence conflicts with current code. Recommend showing existing users' unproven registration streak as zero; historic qualifying days cannot be reconstructed reliably from a current timezone after it changes.
- **Persistence:** Recommend a dedicated day and badge ledger plus user summary fields, updated in one transaction. A summary-only model is smaller but cannot explain or safely deduplicate awards; a ledger supports later CF-702 badges at a modest schema and migration cost.

## Boundaries

CF-702 rank tiers and other badges remain separate. No new framework or library is needed. Database schema and authenticated response contracts change, so AGENTS.md requires approval before coding.

## Verification and rollout

Prisma schema validation and client generation pass. The additive SQL is at `services/api-core/prisma/sql/20261108_daily_streak.sql`; it has not been applied to an existing database. An isolated PostgreSQL/Redis test stack was synchronized from the schema, and all 146 API tests passed, including multi-question Task completion, next-submission bonus, and profile timezone validation. The 14 web tests, both typechecks/lints, and API/web builds passed. Production deployment remains out of scope.
