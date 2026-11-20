# CF-504 — Fixed CTF scoring with time-based tie-break

**Decision:** The user approved fixed challenge points and the time at which a player reached their final score as the tie-break, replacing the earlier dynamic-decay proposal.

## Rules

- Each Jeopardy CTF challenge has an organizer-set point value that does not change after publication. A correct flag awards those points once per player. CTF points are separate from learning EXP, rank, streak, skill awards, exam scores, and KotH.
- Rank by total CTF points descending, then the timestamp of the player's last accepted solve ascending. Players with no points share the same rank. Equal timestamp and score share a rank. The UI labels the time column “Đạt điểm lúc”.
- A superadmin creates the contest and challenges before its start, then publishes it. Challenge content and points lock on publication. Players join before the end and submit only during the event window. The flag is stored as a SHA-256 hash and never returned by a read API.
- If configured, the public scoreboard freezes at `freezeAt`. It is reconstructed from immutable solves recorded before that instant; submissions remain valid and private feedback continues. A superadmin can reveal the final ranking after the event ends. Public challenge values remain fixed and reveal no hidden solve counts.

## Implementation

- Prisma tables: `ctf_events`, `ctf_challenges`, `ctf_participants`, `ctf_solves`. The unique `(challenge_id,user_id)` constraint and a per-event transaction lock make correct solves idempotent under concurrent requests.
- Public API: event list/detail, challenge score, scoreboard. Authenticated API: join and submit. Superadmin API: create event, add challenge, publish, unfreeze. The submission endpoint has its own rate limit.
- Web: `/arena` and `/arena/[slug]` show contests, challenge points, flag feedback, ranking, reached-at time, and freeze state. The open contest page refreshes the scoreboard every 15 seconds.
- Additive SQL: `services/api-core/prisma/sql/20261120_ctf_fixed_scoring.sql`. Apply to an existing database only during a separately approved rollout.

## Verification and boundaries

API 166/166 tests and web 14/14 tests pass, including ten distinct 500-point solves, simultaneous duplicate submissions, time tie-break, freeze cutoff and reveal, authorization, flag secrecy, and no learning EXP change. API/web lint, typecheck and builds pass. Additive SQL was executed against an isolated schema based on current `main`, and Prisma reported no drift. No live migration or production deployment. CF-502 remains deferred at the user's request; CF-503 depends on it.
