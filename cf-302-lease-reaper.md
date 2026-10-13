# CF-302 — Lease lifecycle and reaper

## Goal

Allow a learner to extend one active lab up to three times and reclaim expired or orphaned Docker labs automatically after the three-minute grace period.

## Tasks

- [x] Add `extension_count` to `lab_instances` with default 0 and provision a DB role restricted to this table for the Go reaper. A smoke row inserted without the column received count 0.
- [x] Add `POST /api/v1/rooms/:slug/extend` with owner checks and one atomic 60-minute extension, including grace and three-extension limits. Concurrent calls cannot exceed the limit.
- [x] Implement `services/orchestrator/pkg/reaper/sweeper.go` and run it every 30 seconds. Claim expired and orphaned instances, stop their Docker resources, then mark them terminated; retry cleanup failures.
- [x] Verify API and Go tests, lint/typecheck/build, and Docker smoke against an isolated database. Simulate time crossing the three-minute boundary by moving the test row's expiration timestamp.
- [x] Update CF-302 progress and handoff with validated behavior and remaining UI work.

## Done when

- [x] An expired lab remains extendable during grace; after grace it is cleaned up and no longer blocks a new spawn.
- [x] The worker cannot read user, answer, or secret tables through its DB account.

## Scope

Backend lifecycle only. The lab HUD, terminal, and browser countdown belong to CF-303 or later UI work.
