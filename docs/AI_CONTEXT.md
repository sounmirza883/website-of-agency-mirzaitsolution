# AI context

The one-page brief. Read this before touching anything; follow the links for depth.

## What this is

A full-stack platform for a creative digital agency: a public marketing site, three role-based web portals (admin, employee, client), a React Native app covering all three roles, and one Express API behind all of it. Supabase provides Postgres and Storage.

Six deployable surfaces, one API, one JWT auth system.

## The five facts that change how you write code here

**1. The API is serverless and cannot hold a WebSocket.** Realtime is browser → Supabase Realtime directly; the API only pokes it over stateless HTTP. Broadcasts carry an id and never message content, because this app uses its own JWTs rather than Supabase Auth, so RLS cannot identify users and the anon key is public.

**2. There is no shared package.** Each app has its own `package.json` and `node_modules`. Shared components are duplicated, not imported — `Field` exists three times. A shared change must be made in each copy.

**3. Almost nothing is stored as a date or a time.** Dates are display strings like `"Aug 14, 2026"`, times like `"9:05 AM"`. They cannot be sorted, compared or subtracted. Any feature needing real time arithmetic must add typed columns and dual-write.

**4. The portal palette is inverted.** `bg-white` is dark slate; `text-gray-900` is white. Check [DESIGN.md](DESIGN.md) before writing a colour class.

**5. Schema changes need a manual step.** DDL cannot go through the REST client — `migrate.sql` must be run by hand in the Supabase SQL Editor. Say so explicitly when your change requires it, rather than letting the user discover 500s.

## Conventions

**Backend** — `requireAuth, requireRole(...)` then `asyncHandler`. Guard `if (!supabase)` (reads `[]`, writes 503). Alias selects camelCase ← snake_case. Never trust an id from the body for ownership. Register new `users(id)` FKs in `authStore.ts`.

**Frontend** — `queries.ts` functions take `token` first and are untyped (`any` is the norm here, deliberately). Hooks are `useQuery`/`useMutation` with flat camelCase keys and `onSuccess: invalidateQueries`. No design system — copy the canonical markup in [COMPONENTS.md](COMPONENTS.md).

**Everywhere** — `npm run build` **is** the typecheck; there is no separate script and no test framework. Run it plus `npx eslint` on changed files before claiming anything works.

## How to verify

There are no tests. Verification means:

1. `npm run build` in each changed app
2. `npx eslint` on changed files
3. API probes with a minted token, including negative cases (403 for the wrong tenant, 409 for a conflict)
4. For UI, run it and look

Do not claim something works because it compiles. State plainly what you verified and what you did not.

## Traps

[MEMORY.md](MEMORY.md) is the full list. The ones that bite most often:

- The committed `backend/dist` is stale — use `npm run dev`, never diagnose from `dist`
- `NEXT_PUBLIC_*` is build-time; a rebuild is required, not a restart
- Missing realtime env vars degrade silently to polling
- A second FK to `users` breaks PostgREST embeds at runtime while the build stays green
- Unbounded selects are truncated silently by `max-rows`

## Current state

Recently completed: staff chat (DMs, channels, realtime, presence, unread and mention badges, attachments, reactions, replies, edit/delete, search, markdown); a worldwide dial-code and budget/currency contact form; visible labels on every form field across all five apps.

In planning: employee scheduling, task allocation by admin, timer-based time tracking, completion and daily reports, client-facing progress visibility, and multi-project chat. See [ROADMAP.md](ROADMAP.md) and [PHASE.md](PHASE.md).

## Working style expected here

Work in phases, commit each phase separately, and say what is unverified. Flag migrations up front. When a survey or another agent reports a problem, read the code and confirm it before acting — reports have been wrong.
