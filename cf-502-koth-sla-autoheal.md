# CF-502 — KotH SLA monitor and auto-heal proposal

**Status:** Deferred at the user's request on 2026-10-30. No implementation has started. CF-503 depends on this task.

## Goal

Detect failed HTTP/SSH service checks every 15 seconds, alert players, restore the target within the next 15 seconds where possible, and keep failed 60-second ticks scoreless.

## Proposed implementation (awaiting approval)

1. Add a Go Arbiter at `services/koth-engine/arbiter/health_healer.go` that scans active matches every 15 seconds. A Redis lease prevents two Arbiter replicas from healing the same match concurrently.
2. Add a restricted Orchestrator health operation. Probe the target IP from the existing read-only terminal container on the same isolated network: require HTTP 200 and a valid SSH banner, each with a short timeout. This replaces the current listen-port-only result used by CF-501 ticks.
3. On a failed probe, publish `KOTH_SLA_ALERT` with service details through the existing participant WebSocket and expose the latest status to participants for reconnects. Keep tick scoring based on a fresh health check at the tick boundary; a failed tick remains `sla_failed` and awards nobody.
4. Heal by restarting only the match's registered target container, then re-probe. Docker restart preserves its writable filesystem and `/root/king.txt`, but disconnects active sessions and restarts processes. Restore `/root/king.txt` to root-owned, mode `0644`, preserving its content when possible; create an empty file if missing. Report recovery failure rather than looping indefinitely.
5. Add an explicit KotH image contract: its entrypoint must bring up HTTP and SSH within 15 seconds after restart. Reject match creation when the target image is not configured for this recovery mode. Test service stop, alert, restart, file permissions, recovery event, next tick, repeat failure, and cross-match isolation with an isolated Docker target.

## Decisions to approve

1. **Recovery method.** Recommend Docker restart of the registered target only. It avoids running image-specific shell commands chosen by users. Alternative: allowlisted per-image service commands can preserve sessions, but require an additional trusted image contract and can be tampered with by root inside the target. Restart disrupts current shell sessions and may fail if the image entrypoint does not restart both services.
2. **Health definition.** Recommend probing actual HTTP 200 and SSH banner from the trusted terminal container, not merely checking that ports listen inside the target. This detects fake listeners and endpoint failures, but adds network probes and requires the terminal container to be healthy.
3. **Status contract.** Recommend a Redis-backed latest SLA status, `KOTH_SLA_ALERT` / `KOTH_SLA_RESTORED` WebSocket events, and a participant-only read endpoint. Alternative: only report at the 60-second tick, which misses immediate alerts. This changes the internal API and participant event contract.

## Existing constraints

No KotH target image or service restart script is defined in this repository. Lab targets drop all Linux capabilities, so changing their firewall from inside the target is currently blocked; the existing gateway isolation policy remains untouched. CF-503 handles deeper anti-sabotage measures. This plan changes Orchestrator behavior, API contracts, and Docker service configuration, so `AGENTS.md` requires approval before implementation.
