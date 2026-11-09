# CF-801 — Admin CMS for Phase 1 content

**Status:** Approved and implemented on `codex/cf-801-admin-cms`. Base: `main` at `7861591` (CF-702 merged).

## Goal

Let authorized admins create, edit, archive, and publish a complete learning path → module → room → task → question hierarchy, including a runnable lab configuration, from `/admin/cms`.

## Decisions to approve

1. **Module storage and existing content.** Today modules are only `Room.moduleName`/`moduleOrder`; they cannot exist without a room or be edited safely as one object. Recommend a real `Module` table and `Room.moduleId`, with a reviewed backfill script grouping existing rooms by path/name/order. Keep existing rows and relationships. Alternative: keep virtual modules; this avoids a migration but cannot fully deliver Module CRUD. Author the migration and test it on an isolated copy; do not apply it to an existing environment in this task.
2. **Publication model.** Today paths use `isPublished`, rooms use `publishedAt`, and tasks/questions have no status. Recommend explicit `draft | published | archived` status for each CMS entity, backfilled from existing publication fields, and update student catalog/room reads to respect the full parent chain. Publishing a room requires a published path/module and at least one valid task/question. Keep legacy fields synchronized during transition to avoid breaking current callers. Alternative: infer child status from the room; this is smaller but does not satisfy independent CRUD/publish/archive for tasks/questions. No hard delete of content with learner activity or certificates; archive instead. An unreferenced draft can be deleted only after a dependency check and confirmation.
3. **Lab image and resources.** Recommend validating image syntax and confirming that the exact image exists on the configured orchestrator Docker host before publishing. The orchestrator already runs images from that host; this checks the image the learner can actually start, but does not prove it still exists in the remote private registry. Alternative: add authenticated registry lookup and new registry configuration/credentials; this is broader infrastructure work. Store CPU, RAM, and internal service ports in the room spec, validate safe bounds, and pass supported limits to the orchestrator. Never publish host ports; learner access remains through the isolated VPN network.
4. **Authorization and answer secrecy.** Reuse the existing admin roles (`superadmin`, `org_admin`) and server-side route guard. Return flag type and edit metadata to admins, but never return plaintext static flags after saving; hash on write and use replace-only editing. Alternative: new CMS-specific permissions, which requires a role model redesign. This keeps the current permission boundary and avoids leaking answers through student APIs.

## Implementation

1. Add the schema and isolated migration/backfill for modules and statuses; validate current seed and catalog behavior.
2. Build admin API for list/detail/create/update/status/delete across paths, modules, rooms, tasks, and questions, with validation, optimistic version checks, dependency-aware deletion, and audit records.
3. Add a lab image availability check and bounded CPU/RAM/internal-port settings in the orchestrator and room publish validation.
4. Build `/admin/cms` list, filters, pagination, hierarchy editor, room environment/flag forms, draft/publish/archive actions, and field-level error summary using the Modern Minimal design.
5. Verify admin versus non-admin access, invalid EXP/image, concurrency conflicts, dependent deletion, secret non-disclosure, student catalog visibility, and lab spawn in API/web tests and builds. Update `task-breakdown.md` with the approved scope and results; create a PR from the feature branch.

## Rollout boundary

No production deployment, registry credential changes, or migration applied to an existing database without a separate rollout approval. The full published-room acceptance check needs an image already present on the configured orchestrator host; API integration tests mock that availability response.

## Handoff

The admin CMS now supports list/search/filter/pagination and editors for all five content levels. Draft content stays hidden from learners; archive hides previously published content. The API checks admin roles, validates content and resource limits, uses version checks for concurrent edits, audits writes, and returns static flag configuration without the stored hash or plaintext answer. A room can be created with its first task and question, then published once its parent path/module are published and its image exists on the orchestrator host. The orchestrator accepts bounded CPU/RAM and exposed internal TCP ports with no host port bindings.

`services/api-core/prisma/sql/20261109_admin_cms.sql` is the reviewed, additive backfill for existing databases. It was exercised against an isolated database with a legacy fixture; it has **not** been applied to an existing environment. A deployment must run this SQL before starting the updated API and orchestrator services, and provide the referenced lab image on the orchestrator Docker host. The existing `Room.moduleName`/`moduleOrder` fields remain synchronized for current readers.

Verification: API 156 tests, web 14 tests, Go suite, API/web lint and typecheck, API/web production builds, and Prisma schema validation/generation passed. The API tests ran against a separate Docker PostgreSQL/Redis stack. A live browser acceptance flow and production migration remain rollout checks.
