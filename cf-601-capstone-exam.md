# CF-601 — Practical Capstone Exam proposal

## Goal

Let an eligible student start one uninterrupted 6/12/24-hour practical exam, work in a private multi-target Docker range, submit flags for automatic scoring, and see a server-authoritative countdown and result.

## Approved implementation (in progress)

1. Add exam definitions, objectives, sessions, targets, and submissions to Prisma. An admin configures duration, required path, target images, objective points, and passing score. Store only flag hashes or per-session HMAC inputs; keep exam scores separate from learning EXP.
2. Compute eligibility from published, required, non-exam rooms in the path. Add a room-level `requiredForCapstone` flag (default true) and exclude empty exam rooms, then use the same completion rule in path progress and exam start. Require enrollment and 100% completion server-side.
3. Extend Orchestrator with a separate exam-range operation that creates several target containers on one per-session isolated Docker network. Validate image names and target counts, roll back partial creation, provide participant-only network access, and reap every target when the session ends. Do not change the existing one-hour lab flow.
4. Add authenticated exam APIs for overview, start with honor-code consent, current session, flag submission, and early finish. Lock concurrent starts; persist the deadline in PostgreSQL and reject all submissions after it. Reuse the flag validator, but never expose answers or use normal learning submissions.
5. While an exam is active, block normal room content, hints, and learning lab actions at the API. The repository has no forum/chat feature to disable. Show the exam overview and dedicated workspace with countdown, target list, objectives, and submission controls using `DESIGN.md` and modern-minimal `EXAM-01`/`EXAM-02` specs.
6. Verify 60% progress cannot start, 100% can; two targets share only their exam network; duplicate starts/submissions are idempotent; a 6/12/24-hour deadline survives refresh/restart; hints and walkthrough APIs deny access during the exam; finish and timeout stop scoring and clean up the range.

## Approved decisions

1. **Exam isolation:** use new exam-specific records and a multi-container range, reusing only safe Docker utilities. Alternative: stretch `LabInstance` into a multi-target exam, which risks breaking current one-hour labs and VPN/reaper behavior. This adds schema and Orchestrator APIs but keeps normal labs stable.
2. **Eligibility:** add `requiredForCapstone` and count all required published learning rooms with questions. Alternative: count every room in the path; optional or empty exam rooms can make eligibility incorrect. This changes the room/path data contract.
3. **Scoring and lockdown:** keep exam flags/scores separate from learning EXP, and enforce the exam lock on API routes. Alternative: reuse normal submissions and only hide UI; that would allow hint and walkthrough bypass through direct API calls.
4. **Content/configuration:** admins define target image names and exam objectives in the database; the repo currently has no production capstone target images. The feature can be verified with isolated test images, but a playable production exam requires real images and an approved VPN route.

## Existing constraints

CF-201 and CF-301 are merged. Current paths derive completion from ordinary question submissions, and current labs allocate one target per user for one hour. The old Epic 6 wireframe is marked superseded; use `docs/07-wireframes/modern-minimal/06-exams.md`. This feature changes schema, APIs, Docker networking, access rules, and UI, so `AGENTS.md` requires explicit approval before implementation.
