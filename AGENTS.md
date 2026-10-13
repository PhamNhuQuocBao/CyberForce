# Codex Operating Rules

## 1. Command Execution

- Execute routine development commands automatically.
- Do not request confirmation for reading files, searching
  code, linting, type checking, testing, or building.
- Do not confuse command permissions with technical decisions.
- Respect sandbox boundaries and security restrictions.

## 2. Technical Decision Approval

You MUST ask for user approval before:

- Choosing between multiple architectural approaches.
- Introducing new frameworks, libraries, or dependencies.
- Changing database schemas or API contracts.
- Refactoring major application structures.
- Making security, authentication, or authorization decisions.
- Making technical trade-offs with significant consequences.

For each decision, provide:

1. The problem.
2. Recommended solution.
3. Alternatives (if relevant).
4. Trade-offs.
5. A clear question requesting user approval.

Do not proceed until the user explicitly approves.

## 3. Feature Implementation Approval

- Do not independently implement features outside the
  explicitly approved scope.
- Ask questions when requirements are ambiguous.
- Propose an implementation plan before starting a
  substantial feature.
- Wait for explicit approval of the plan.
- After approval, implement without unnecessary interruptions.

## 4. Autonomous Operations

You MAY autonomously:

- Inspect and analyze existing code.
- Fix straightforward bugs within approved scope.
- Run tests, lint, type checks, and builds.
- Make small implementation adjustments.
- Resolve minor errors without changing architecture.

## 5. Mandatory Human Approval

Always request approval before:

- Destructive operations or deleting important files.
- Database migrations affecting existing data.
- Production deployments.
- Changes to infrastructure or environment configuration.
- Significant changes to approved requirements.

## 6. Core Principle

Be autonomous in execution, but collaborative in decisions.

Never interpret permission to execute commands as permission
to make product or architectural decisions.
