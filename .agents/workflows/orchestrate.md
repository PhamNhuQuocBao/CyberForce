---
description: Coordinate multiple agents for complex tasks. Use for multi-perspective analysis, comprehensive reviews, or tasks requiring different domain expertise.
---

# Multi-Agent Orchestration

You are now in **ORCHESTRATION MODE**. Your task: coordinate specialized agents to plan, implement, test, and review solutions for complex software tasks.

## Task to Orchestrate
$ARGUMENTS

---

## 🔴 CRITICAL: Agent Quota & Selection

- **Complex / Feature / Full-Stack Tasks:** MANDATORY minimum 3 specialized agents.
- **Bug Fix / Refactor / Single-Domain Tasks:** Minimum 2 specialized agents (e.g., `debugger` + `test-engineer`).
- **Trivial / Docs / Config Tweaks:** Fast-track permitted (1 agent).

### Agent Selection Matrix

| Task Type | REQUIRED Agents (Minimum Pipeline) |
|---|---|
| **Web Feature** | `project-planner` → `frontend-specialist`/`backend-specialist` → `test-engineer` → `security-auditor` |
| **API Endpoint** | `project-planner` → `backend-specialist` → `test-engineer` → `security-auditor` |
| **Database** | `database-architect` → `backend-specialist` → `security-auditor` |
| **Bug Fix** | `debugger` → `backend-specialist`/`frontend-specialist` → `test-engineer` |
| **Security Patch** | `security-auditor` → `backend-specialist` → `penetration-tester` |

---

## Pre-Flight: Mode Check

| Current Mode | Task Scope | Action |
|---|---|---|
| **plan** | Any | ✅ Proceed with planning phase |
| **edit** | Simple execution | ✅ Proceed directly |
| **edit** | Complex/multi-file | ⚠️ Ask: "This task requires planning. Switch to plan mode?" |
| **ask** | Any | ⚠️ Ask: "Ready to orchestrate. Switch to edit or plan mode?" |

---

## 🔴 3-PHASE ORCHESTRATION PIPELINE

### PHASE 1: PLANNING (Sequential)

| Step | Agent | Action |
|---|---|---|
| 1 | `project-planner` | Create plan `{task-slug}.md` in workspace |
| 2 | (optional) `explorer-agent` | Map dependencies and codebase structure |

> 🔴 **NO IMPLEMENTATION AGENTS during planning!**

#### ⏸️ CHECKPOINT: User Approval Gate
After `{task-slug}.md` is created, STOP and ask:
```text
✅ Plan created: {task-slug}.md

Do you approve this implementation plan? (Y/N)
- Y: Proceed to Phase 2 (Implementation)
- N: Revise the plan based on feedback
```
> 🔴 **DO NOT proceed to Phase 2 without explicit user approval!**

---

### PHASE 2: IMPLEMENTATION (Staged Execution)

| Stage | Agents | Purpose |
|---|---|---|
| **Foundation** | `database-architect`, `security-auditor` | Schema, migrations, auth boundaries |
| **Core Coding** | `frontend-specialist`, `backend-specialist` | Write features following `{task-slug}.md` |

> **Context Passing Rule:** When delegating to any subagent, ALWAYS pass:
> 1. Original User Request
> 2. Decisions & Constraints from `{task-slug}.md`
> 3. Files changed by previous agents

---

### PHASE 3: QUALITY GATE & CODE REVIEW (Test & Heal Loop)

#### Step 3.1: Automated Testing & Self-Healing
- **Primary Agent:** `test-engineer`
- **Actions:**
  1. Write Unit & Integration tests for all code generated in Phase 2.
  2. Execute the test command (e.g., `npm test`, `pytest`, `cargo test`).
  3. **Self-Healing Loop (Max 3 Retries):**
     - If tests fail, read errors/stack traces and invoke the respective Core agent (`frontend-specialist` or `backend-specialist`) to fix the bug.
     - Re-run tests until all test cases pass.
     - DO NOT bypass tests with `@ts-ignore` or test skipping flags.

#### Step 3.2: Automated Code Review
- **Primary Agent:** `security-auditor` (referencing `workflows/review-code.md`)
- **Actions:**
  1. Read full `git diff` of all modified/created files.
  2. Audit against Security, Performance, Error Handling, and Clean Code standards.
  3. If critical issues are identified, resolve them immediately before completion.

---

### Phase 4: Final Verification Scripts (MANDATORY)

Execute project validation tools or fallback to standard CLI checks:
```bash
if [ -d ".agents/skills" ]; then
  python .agents/skills/vulnerability-scanner/scripts/security_scan.py .
  python .agents/skills/lint-and-validate/scripts/lint_runner.py .
else
  npm run lint && npm run typecheck && npm test
fi
```

---

## Output Format

```text
## 🎼 Orchestration Report

### Task Summary
[Original task summary]

### Pipeline Execution Status
| # | Agent | Role | Status |
|---|-------|------|--------|
| 1 | project-planner | Architecture & Plan | ✅ Pass |
| 2 | backend-specialist | Core API Implementation | ✅ Pass |
| 3 | test-engineer | Test Suite & Healing Loop | ✅ Pass |
| 4 | security-auditor | Code Review & Audit | ✅ Pass |

### Quality & Verification Results
- [x] Unit/Integration Tests: [X passed / 0 failed]
- [x] Typecheck & Lint: Clean
- [x] Code Review Checklist: Completed (No blockers)
- [x] Security Audit: Clean

### Deliverables
- [x] {task-slug}.md generated and approved
- [x] Core implementation committed
- [x] Test coverage added
- [x] Final review passed

### Summary
[Brief synthesis of architectural decisions, resolved edge cases, and final code state]
```

---

## 🔴 EXIT GATE

Before declaring the task complete, verify:
1. ✅ **Plan Approved:** User signed off on `{task-slug}.md`.
2. ✅ **Tests Green:** All tests executed and passed without bypasses.
3. ✅ **Review Finished:** `git diff` reviewed against `workflows/review-code.md`.
4. ✅ **No Open Vulnerabilities:** Verification scripts returned exit code 0.