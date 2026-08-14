# Rules for AI agents

Start with [AI_CONTEXT.md](AI_CONTEXT.md). This file is the working agreement.

Note: each app also has its own `AGENTS.md` at its root with stack-specific rules. The Next.js ones carry a block written and re-added by `next dev` — do not fight it; commit it with your work.

## Before you write anything

1. **Read the code before believing a claim about it.** A survey once reported a malformed route path; reading the file showed it was correct. Nothing was changed, and that was right. Grep hits and agent reports are leads, not conclusions.
2. **Check whether it already exists.** There is a lot of near-duplicate code. Look in `components.tsx`, `queries.ts`, `hooks.ts` before adding anything.
3. **Know the traps.** [MEMORY.md](MEMORY.md) exists because each entry cost real time.

## Non-negotiable

**Never put message content in a realtime broadcast.** Ids only. The reasoning is in [SECURITY.md](SECURITY.md) and it is not negotiable for performance.

**Never trust a body id for ownership.** Scope from `req.user!.id`.

**Never `select("*")` on a client-facing endpoint.** Explicit safe column list.

**Never use timestamps for read cursors.** Message ids. Clock skew was measured.

**Never claim something works because it compiled.** The build has passed on genuinely broken code more than once.

## Conventions

**Backend** — `requireAuth, requireRole(...)` then `asyncHandler`. Guard `if (!supabase)` — reads return `[]`, writes 503. Alias selects camelCase ← snake_case. Register new `users(id)` FKs in `authStore.ts`.

**Frontend** — copy the canonical markup in [COMPONENTS.md](COMPONENTS.md); there is no design system. `queries.ts` takes `token` first. `any` is the established convention there — do not "fix" it as a side quest.

**Style** — match the file you are in. It is terse: one-line JSX, dense components, comments only where the reason is non-obvious. Do not reformat code you did not need to change.

**Comments** — explain *why*, never *what*. The good ones here record a constraint: why realtime bypasses the API, why ids not timestamps, why the alias constant exists.

## Workflow

**Work in phases.** Each phase builds, lints, and is committed separately with the reasoning in the message.

**Say when a migration is needed.** DDL cannot go through the REST client — `migrate.sql` must be run by hand in the Supabase SQL Editor. State this up front rather than letting the user discover 500s.

**Verify before reporting.** `npm run build` in each changed app, `npx eslint` on changed files, and probe the behaviour. Then say what you checked *and what you did not*.

**Do not push unless asked.** `main` auto-deploys every surface.

## Reporting

State the outcome plainly. If something is unverified, say so — "builds clean, but I could not test the native picker without a device" is useful; "done" is not.

If you find a real problem outside the task, mention it, and fix it only if it is small and adjacent. Do not silently expand scope.

If lint or a build surfaces pre-existing issues, distinguish them from yours by name. Do not fix unrelated warnings unprompted.

## Things that look like bugs and are not

- `any` everywhere in `queries.ts` — deliberate
- `bg-white` rendering dark in the portals — the palette is inverted
- Admin and employee code being near-identical — no shared package, by decision
- `check_out: ""` rather than null on check-in — existing convention
- `client_milestones` having no write route — nothing has ever written to it

## Things that are bugs and are known

Listed in [ROADMAP.md](ROADMAP.md) under debt, and in [TASKS.md](TASKS.md). The blocking ones: the committed admin password hash, two admin routes missing `requireRole`, and attendance having no unique constraint.
