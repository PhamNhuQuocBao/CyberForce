# CF-703 — Real eight-axis skill radar

**Status:** Approved as the prerequisite to CF-803 and implemented on `codex/cf-703-skill-radar`.

Each task may carry any of eight canonical skill tags. When a learner completes every question in a tagged task for the first time, the earned EXP is recorded once per tag in an immutable award row. General tasks have no tags and award no skill EXP. Replays do not award additional points. The public profile radar reads these award rows instead of deriving skill values from total EXP, and the radar chart scales to the highest cumulative value. Private profiles keep their existing privacy shield.

The additive SQL adds the tags and award ledger. Existing tasks default to General, and prior submissions receive no guessed skill attribution. Admin CMS and Creator Studio can edit task tags; editing a Creator task invalidates its dry-run proof through the room fingerprint.

Verification: 161 API tests and 14 web tests passed on an isolated Postgres/Redis/MinIO stack; API and web lint/typecheck passed. No migration was run on an existing database.
