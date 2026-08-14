# Tasks

The concrete work queue. [PHASE.md](PHASE.md) has the reasoning; this is the checklist.

## Blocking — do before shipping anything else

- [ ] **Change the seeded admin password.** The bcrypt hash of `ChangeMe123!` is committed. Anyone with repo access can log into any deployment still using it.
- [ ] **Add `requireRole("admin")` to `GET /admin/employees` and `GET /admin/clients`.** Both are gated by `requireAuth` only — any authenticated user, including a client, can list your staff.
- [ ] **Set a real `JWT_SECRET` in production.** Without it, every deploy silently logs all users out.

## Ready to start — Phase 1

- [ ] 1A Write the migration: `work_settings`, `employee_schedules`, `employee_tasks` columns, `task_time_entries` + partial unique index, `task_reports`, `daily_reports`, attendance timestamp columns + unique index
- [ ] 1A Register new `users(id)` FKs in `backend/src/authStore.ts` `USER_REFERENCES`
- [ ] 1A Add new tables to `backend/src/db/verify.ts`
- [ ] 1A Run `migrate.sql` in Supabase, confirm with `npm run verify:db`
- [ ] 1B `GET/PATCH /admin/work-settings`
- [ ] 1B `GET/PUT /admin/employee-schedules/:id`
- [ ] 1B `GET /employee/my-schedule` — override merged over default
- [ ] 1C Admin Work Schedule page
- [ ] 1C Per-employee override editor on the Employees page

## Queued

Phases 2–9 in [PHASE.md](PHASE.md). Do not start a phase before its predecessor is committed and verified — each builds on the last.

## Debt worth clearing

**Correctness**
- [ ] `UNIQUE (employee_id, date)` on `employee_attendance` — concurrent check-in creates duplicates today, after which check-in silently succeeds forever
- [ ] Wrap remaining route handlers in `asyncHandler` — a throw currently kills the process
- [ ] Normalise `employee_tasks.due`, which holds two date formats in one column
- [ ] Scope `GET /employee/tickets` to the caller

**Repository**
- [ ] `git rm -r --cached backend/node_modules` — ~1500 tracked files, already in `.gitignore`
- [ ] Decide what to do with the committed, chronically stale `backend/dist`
- [ ] Delete `backend/src/db/seed.ts` or fix it — no npm script runs it, and it reads `SUPABASE_SERVICE_KEY` while everything else uses `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Remove the empty `doc/` directory (documentation lives in `docs/`)

**Product gaps**
- [ ] Replace the placeholder email `your-email@example.com` on the contact page
- [ ] Fix both WhatsApp buttons pointing at `wa.me/92XXXXXXXXXX` — the main call-to-action currently goes nowhere
- [ ] DELETE endpoints for services, portfolio, notifications and projects — removing rows needs SQL today

**Optional**
- [ ] Apply the `pg_trgm` + GIN index migration for chat search — correctness is fine without it, performance degrades with volume
- [ ] Delete the merged `chating` branch, local and remote

## Definition of done

A task is done when:

1. `npm run build` passes in every changed app
2. `npx eslint` is clean on changed files, or the remaining warnings are pre-existing and named
3. Behaviour is verified — probed, or run and looked at, not merely compiled
4. It is committed with the reasoning in the message
5. Any required migration is stated explicitly to the user
