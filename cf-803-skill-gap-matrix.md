# CF-803 — Organization Skill Gap Matrix

**Status:** Approved and implemented on `codex/cf-803-analytics`, stacked on CF-703 PR #41. The user approved the recommended plan before coding.

## Goal and current gap

Give an organization admin an accurate 8-skill heatmap for their own members and groups, with weak-area insights, learning-path suggestions, and PDF/CSV exports. The current profile radar is derived from total EXP, not actual skill awards; the database has no organization or group membership. CF-703 is therefore a real prerequisite, not a reusable completed service.

## Recommended decisions

1. **Complete CF-703 first, in a separate PR.** Add the canonical 8 skill tags to questions/tasks and an immutable award record when a task is first completed. Multi-tag tasks award the full earned skill EXP to every tag; General awards none. Replace the profile's derived radar with actual cumulative skill EXP. Existing historical submissions cannot be attributed reliably without tags at submission time, so show 0 for untagged history rather than inventing skill scores. Alternative: derive from total EXP or current content tags, which can misstate past work.
2. **Add organization membership for CF-803.** Model Organization, Group (department/class), and Membership with an org-scoped admin/member relationship; one member can be in multiple organizations but has one group per membership. Provide superadmin setup and organization-admin member/group management using existing accounts. No bulk CSV import or seat billing in this task. Every analytics/export query must resolve an explicit membership and filter by its organization; global `org_admin` role alone is insufficient. Alternative: infer organization from a global role or email domain, which cannot isolate tenants safely.
3. **Define proficiency visibly.** Keep CF-703's absolute skill EXP as the stored metric. For the 0–100 heatmap, use `min(100, earned skill EXP / published available skill EXP × 100)` per axis; display raw EXP and denominator so the percentage is auditable. An axis with no available tagged content is `0` and labeled “no curriculum yet.” Team averages include all group members, including zero-activity members. Flag a gap when team average is below 40 or at least 70% of members are below the 75 benchmark; recommend published paths containing questions tagged with that skill. Alternative: fixed arbitrary EXP thresholds, which become stale as the curriculum grows.
4. **Exports.** Expose the same org-scoped filtered snapshot as JSON, CSV and server-generated PDF. Use `pdfkit`, already in the workspace for certificate signing, as an explicit new dependency of API core. PDF includes title, scope, timestamp, averages, gap summary and member matrix. Protect all exports with the same membership check; escape CSV formulas and omit emails/identifiers beyond display name and username. Alternative: browser print-to-PDF, which is less repeatable and harder to validate.
5. **UI and routes.** Implement `/org/analytics` in the current Positivus design, with group selector, heatmap, zero-activity state, insight cards, path suggestions and PDF/CSV buttons. Add API under `/api/v1/org/...` with organization/group selection and pagination for member rows. Use existing authentication; no public analytics endpoint.

## Implementation order and verification

1. Implement and test CF-703 skill tags, first-completion awards, radar API and migration on isolated DB; open its PR.
2. Implement organization/group/membership schema and admin operations with additive SQL; test cross-tenant isolation and role boundaries.
3. Implement aggregation, gap rules, learning-path matching and zero-activity behavior; test 50 members and group filtering.
4. Implement PDF/CSV exports and verify both use the same snapshot and cannot read another organization.
5. Build `/org/analytics`; run API/web tests, lint, typecheck and build; update `task-breakdown.md` to reflect delivered scope and open CF-803 PR.

## Rollout boundary

Do not run migrations on the existing database, deploy production, import users, or create organization memberships outside an isolated test database without separate rollout approval.

## Setup and interpretation

- Superadmin creates an organization with `POST /api/v1/org/organizations` (`name`, `slug`). Use existing role administration to grant an account global `org_admin`, then add it to this organization with `POST /api/v1/org/organizations/:id/memberships` (`username`, `role: "admin"`). This membership, not the global role alone, grants access to the organization's analytics.
- That administrator creates departments/classes with `POST /api/v1/org/organizations/:id/groups` and adds existing accounts as `member` memberships with a `groupId`. Group rename/delete and member group move/removal have corresponding PATCH/DELETE routes. Bulk CSV import and billing are outside this task.
- `/org/analytics` shows up to 50 member rows per page, but group averages and exports cover all members in the selected scope. PDF/CSV share the same filtered snapshot. The PDF font is bundled in API core so Vietnamese names render in local and container builds.
- Skill EXP comes from immutable CF-703 first-completion awards. `0–100` proficiency divides that earned EXP by the available EXP of currently published, tagged questions. A zero denominator displays 0 and “no curriculum yet.” Historical untagged work is not guessed. Team averages include zero-activity members. Paths containing published tagged tasks are suggested for weak skills.

## Verification

The isolated test covers 50 members, group averages, a 30-member zero-activity group, cross-organization access rejection, CSV formula escaping and PDF output. No migration has been run on an existing database.
