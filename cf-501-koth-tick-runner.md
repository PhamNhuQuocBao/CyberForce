# CF-501 — KotH tick runner

## Scope

CF-501 provides the backend scoring engine for a 45-minute KotH match. Lobby UI, matchmaking, and participant VPN grants are separate work. The current lab and VPN model still grants target access only to its owner, so this engine alone does not make a playable shared arena.

## Flow

1. An `org_admin` or `superadmin` creates a match on a running KotH lab instance that they own with 4–10 existing users. The instance lease must cover the full match.
2. The Go runner polls for due ticks. The schedule is anchored to `startsAt`; tick 1 is due at 60 seconds and tick 45 at 45 minutes.
3. Orchestrator inspects only the registered lab container. It copies `/root/king.txt` and reads listening TCP ports 22 and 80 from that container's network namespace.
4. API validates the exact king username against the match participants and checks SLA. PostgreSQL records `(matchId, tickNumber)` once. Credited ticks add 10 points to a Redis sorted set using `ZINCRBY`; PostgreSQL can repair lost Redis scores.
5. API publishes `KOTH_TICK_UPDATE` to authenticated participants over `/ws/arena/koth/:id`.

## API

- `POST /api/v1/koth/matches` — organizer only; body: `roomId`, `instanceId`, `userIds` (4–10).
- `GET /api/v1/koth/matches/:id/scoreboard` — participant only.
- `POST /api/v1/koth/matches/:id/scoreboard-ticket` — participant only; returns a 30-second, one-use WebSocket ticket.
- `GET /ws/arena/koth/:id` — WebSocket; requires `WEB_ORIGIN` and ticket in the `Sec-WebSocket-Protocol` list. Sends initial `KOTH_SCOREBOARD` and subsequent `KOTH_TICK_UPDATE` events.
- `/api/v1/koth/internal/*` and Orchestrator's `/v1/instances/:id/koth-snapshot` — runner traffic authenticated with the existing Orchestrator service token.

## Verification

- API suite: 121 tests passed on an isolated PostgreSQL/Redis stack, including KotH authorization, valid and invalid kings, SLA failure, duplicate tick, match expiry, WebSocket event, and Redis score repair.
- Go 1.24 unit tests passed for runner and Orchestrator; a Docker smoke target with `Player1` in `/root/king.txt` and ports 22/80 listening returned a healthy KotH snapshot.
- API lint/typecheck/build, both Go Docker image builds, and Docker Compose validation passed.

The isolated database used for these checks is not the existing development or production database. Applying the Prisma schema to any existing environment must follow that environment's migration approval process.

## Current limits

The approved CF-501 scope does not grant all participants network access to the shared target; existing VPN grants remain per lab owner. The SLA read uses `/proc/net/tcp` through a command inside the target container, so a player with root could tamper with that command; CF-503's anti-sabotage work should harden this trust boundary. Service auto-repair remains CF-502.
