# Database

Supabase Postgres, accessed through the Supabase JS client (PostgREST). 28 tables, all created by [`backend/src/db/migrate.sql`](../backend/src/db/migrate.sql).

## Applying schema changes

Run `migrate.sql` in the **Supabase SQL Editor**. DDL cannot go through the REST client, so it cannot be applied from application code or by a script using the anon/service key.

The file is idempotent — `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `ON CONFLICT DO NOTHING` — and safe to re-run. Re-run it after every pull that touches it.

`npm run verify:db` in `backend/` checks that the expected tables and the storage bucket are reachable.

## Tables

**Website** — `website_services`, `website_portfolio`, `website_service_details`, `website_contact_submissions`

**Core** — `users`, `notifications`, `payment_settings`

**Admin** — `admin_services`, `admin_projects`, `admin_invoices`, `admin_notifications`, `admin_portfolio`

**Employee** — `employee_tasks`, `employee_status_updates`, `employee_attendance`, `employee_leave_requests`

**Client** — `client_milestones`, `client_invoices`, `client_tickets`, `client_messages`

**Shared** — `project_files`, `project_messages`

**Staff chat** — `chat_conversations`, `chat_members`, `chat_messages`, `chat_reactions`

Dropped and gone: `employee_assigned_projects` and `client_projects` were dead-end duplicates that only ever had GET routes and were never written to. `admin_projects` is now the single source of truth for projects.

## The single most important thing to know

**Almost nothing is stored as a date or a time.**

There is no `DATE`, `TIME`, or `INTERVAL` column anywhere outside the chat tables. Dates and times are stored as pre-formatted display strings:

```ts
// backend/src/routes/employee.ts:12-17
function todayStr()   { return new Date().toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric"}); } // "Aug 14, 2026"
function nowTimeStr() { return new Date().toLocaleTimeString("en-US", {hour:"numeric", minute:"2-digit"}); }             // "9:05 AM"
```

Consequences you will run into:

- Times **cannot be sorted, compared, or subtracted**. Hours worked are not computable from `employee_attendance` — there is no duration column and the values are unparseable strings.
- `employee_tasks.due` is a **mixed-format** column: the web UI writes ISO `"2026-08-14"` via `<input type="date">`, while seed data holds `"Jul 28, 2026"`. Same column, two formats.
- These strings are generated in the **server's** timezone, which on Vercel is UTC, but compared against **device**-formatted strings in the mobile app. Near midnight, or from another timezone, they do not match.

The newer machinery does it properly. `users.created_at`, `website_contact_submissions.created_at` and the whole chat set use real `TIMESTAMPTZ`. The comment at `migrate.sql:240-243` records why: `project_messages.time` being a display string is exactly why chat was built on real timestamps instead.

**Any new feature that needs to sort, compare, or sum time must introduce typed columns.** Add them alongside the text columns and dual-write, so existing screens keep working.

## Conventions

### Select aliases

PostgREST returns raw snake_case. Every read aliases to camelCase, comma-joined, no spaces:

```ts
// backend/src/routes/admin.ts:17-21 — read this comment before touching projects
const PROJECT_COLUMNS = "id,name,client,clientId:client_id,employeeId:employee_id,status,deadline,progress";
```

Inconsistency to know about: `employee_id`, `client_id` and `uploaded_by` are deliberately left un-aliased everywhere, and a few routes still use bare `select("*")`.

### Ambiguous embeds

A table with two foreign keys to `users` makes `users(...)` ambiguous. PostgREST fails at **runtime** with "more than one relationship was found" while the TypeScript build stays green. Disambiguate explicitly:

```ts
"...,sender:users!sender_id(name,role)"
```

This has broken production once already, when `chat_reactions` added a second join path and took out every message read and send.

### Registering a new table

Two registries must be updated or things break in non-obvious ways:

- **`backend/src/authStore.ts`** — `USER_REFERENCES` lists every `users(id)` FK so user deletion can null them, and `USER_MEMBERSHIPS` lists composite-PK rows that must be deleted instead. Miss this and deleting a user fails.
- **`backend/src/db/verify.ts`** — the `TABLES` map used by `npm run verify:db`.

## Notable data facts

**`admin_projects.progress` has never been written to.** The column exists, three endpoints return it, and the client portal renders progress bars from it — so those bars have always shown 0%. Nothing computes it.

**`employee_status_updates.progress` feeds nothing.** It is an append-only feed; posting 65% does not update the project.

**`client_milestones` has no write route.** Read-only in practice; nothing ever creates a milestone.

**Approved leave is never read.** `employee_leave_requests` is stored and displayed, and no other code path consults it.

**Attendance has no unique constraint.** Double check-in is prevented only in application code (`employee.ts:86`). Two concurrent requests both pass the check. Once duplicates exist, `.maybeSingle()` errors, the error is discarded by destructuring, and check-in silently succeeds forever after. A `UNIQUE (employee_id, date)` index is the fix.

## Read cursors use ids, not timestamps

Staff chat unread state keys on `last_read_message_id`, never on a timestamp. This was measured, not assumed: **Postgres `now()` ran roughly 2 seconds ahead of the Node process clock**, so `created_at > last_read_at` stayed true forever and unread badges never cleared. Ids are monotonic and generated in one place. Do not "simplify" this back to timestamps.
