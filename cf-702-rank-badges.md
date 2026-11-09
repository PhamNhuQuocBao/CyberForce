# CF-702 — Rank tiers and earned badges

**Status:** Approved and implemented on `codex/cf-702-rank-badges`. Base: `main` at `16bc236` (CF-701 merged).

## Goal

Promote learners as they earn EXP, preserve their highest rank after deductions, and show only badges backed by actual achievements.

## Decisions

- **Rank names and thresholds:** Recommend the six tiers in US-07.03 and the current progress wireframe: Novice 0, Script Kiddie 1,000, Hacker 5,000, Pro Hacker 15,000, Elite Hacker 35,000, Cyber Guru 70,000 EXP. `task-breakdown.md` instead names Apprentice, Specialist, Operator, Elite, Cyber Master without thresholds. Update that task description and verification example to the canonical Epic scale. Alternative: keep the task names and map them to the Epic thresholds; this changes labels shown across the product and contradicts the Epic and wireframe.
- **Persistence:** Use the existing `users.rank_tier` and `user_badges` table. Award rank badges once inside the existing serialized EXP transaction; keep the highest earned tier when EXP is deducted. No new table or dependency. The submission response needs rank and newly earned badge details so the UI can announce the event. Alternative: calculate rank from current EXP on every read, but that would demote users after hint deductions.
- **Badge evidence:** Keep existing streak badges. Award rank badges from rank transitions; award Capstone Certified when a certificate is issued (once per user). Leave First Blood and KotH Champion locked until their event handlers can prove the achievement. Replace current EXP-based placeholder unlocks, which currently claim unrelated competition or lab achievements. No retrospective awards without evidence.
- **Presentation:** Show the tier and next threshold in the profile, update the navigation label and avatar treatment, and open an accessible badge unlock modal on a new award. Use a short browser-generated sound after the user's submission interaction, with mute and reduced-motion support; no audio package. Follow the Modern Minimal design. The progress wireframe says rank-up uses an inline notice, while CF-702 explicitly asks for a badge modal; recommend modal for badge unlock, with a restrained rank celebration in the same flow.

## Implementation

1. [x] Add a shared server rank policy and tests for all threshold boundaries, multiple-tier jumps, and no demotion after deductions.
2. [x] Award rank badges atomically with first-time EXP in the submission transaction; return the new rank and unlock event without replaying on duplicate submissions.
3. [x] Attach Capstone Certified to successful certificate issuance and make the award idempotent; expose only persisted badges in the profile.
4. [x] Update the profile, navigation, answer flow, and certificate result with tier progress, real badge states, and a keyboard-accessible unlock modal with controlled sound and motion.
5. [x] Align the CF-702 task text with the approved rank scale and verify API/web tests, typechecks, lint, and builds.

## Boundary

No production migration or deployment. No new database columns are planned. The existing CF-701 `user_badges` table must be present in the target environment before rollout.

Existing users whose EXP already exceeds a threshold but whose stored rank is still Novice are promoted on their next EXP-earning submission. Historical rank awards are not inferred or backfilled by this task. The isolated local database used for tests was synchronized from the current Prisma schema; no existing database was migrated.

## Verification

All 153 API tests and 14 web tests passed. API/web typechecks, lint, and builds passed. Integration tests used a separate local PostgreSQL/Redis stack. A concurrent web typecheck initially raced with Next's build output and was rerun successfully after the build completed.
