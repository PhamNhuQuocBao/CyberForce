# CF-802 — Creator Studio and reviewed lab drafts

**Status:** Approved and implemented on `codex/cf-802-creator-studio`. Base: `origin/main` at `438ecae` (CF-801 merged). Approval was given in the CF-802 conversation before implementation.

## Goal

Let an approved Creator/Instructor author a private lab draft, preview its lesson, test the actual lab and flags, then submit that tested revision for admin review without exposing it to learners.

## Approved decisions

1. **Ownership and review state.** Reuse CF-801 `Room`/`Task`/`Question` drafts, add nullable `creatorId` to Room and a separate review state (`editing`, `pending_review`, `changes_requested`, `rejected`, `approved`) with reviewer feedback and revision fingerprint. Existing/admin rooms have no creator. Creator APIs only read/write their own drafts; admins see the queue and publish an approved revision through the CMS rules. Alternative: a parallel Creator content store, which duplicates the hierarchy. This adds schema, API contracts and authorization rules; backfill is additive and is not run on an existing DB in this task.
2. **Safe live preview.** Use the existing student `LessonContent` renderer (`react-markdown`, GFM, syntax highlighting), adding a small curated callout syntax and safe component mapping. Tables, code blocks and callouts update as the author types; raw JSX/JavaScript in MDX is not executed. Alternative: a full MDX runtime, which permits richer components but creates an untrusted-code execution boundary and needs new dependencies. Label the editor clearly as the supported MDX subset.
3. **Attachments.** Store bounded uploads privately in the existing MinIO service, with a new S3 client dependency and API storage settings. Allow PNG/JPEG/PDF/TXT/ZIP up to 10 MB; verify type and size server-side, bind each object to the creator-owned room, and serve through authorized download endpoints. Do not make the bucket public or embed raw object keys in learner content. Alternative: defer uploads, which leaves an explicit CF-802 requirement incomplete. Production storage configuration remains a separate rollout action.
4. **Dry-run proof and review.** Add a creator test session linked to one room revision. Spawn its image on the orchestrator using the same resource bounds but a separate test instance; allow only the owner to use the terminal and submit every required flag. Test submissions award no EXP/streak. Save verified question IDs and a fingerprint over room/task/question content; any edit invalidates the proof. `Submit for Review` is accepted server-side only with a live, complete proof. Admin queue shows the exact submitted revision, feedback, and approve/request-changes/reject actions; approval still checks image availability and CF-801 publication rules. Alternative: client-side “test passed” state, which cannot prove the lab/flags were checked and can be bypassed.

## Implementation and verification

1. Add schema plus additive SQL for creator ownership, review history, attachments and test evidence; validate against an isolated database.
2. Add creator-owned draft, task, question, attachment and test-session APIs; enforce role/ownership and never return saved static flags.
3. Add staging spawn, terminal and flag-check flows with cleanup/expiry; prove no learning rewards are written.
4. Add admin review queue and revision-safe decisions; keep student catalog visibility tied to `published` only.
5. Build `/creator` and `/creator/rooms/[id]`: list, split editor/preview, question/environment/attachment tabs, test status and review submission. Follow Modern Minimal desktop design.
6. Verify ownership, upload limits, safe rendering, edited-proof invalidation, dry-run success/failure, review transitions, learner invisibility, API/web tests and builds. Go code is unchanged. Update task description and open a separate PR.

## Verification

- API: 159 tests passed across 23 files on an isolated Postgres/Redis/MinIO stack, including Creator ownership, private attachment, dry-run evidence, review, publication, and learner download.
- Web: 14 tests passed; production build passed. API lint and typecheck passed.
- The additive SQL is kept for a separately approved rollout; no migration has been run on an existing database.

## Rollout boundary

No migration on an existing database, production deployment, public bucket, or automatic publication without a separately approved rollout. A real dry run needs the lab image on the orchestrator Docker host.
