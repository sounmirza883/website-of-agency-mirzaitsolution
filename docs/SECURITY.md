# Security

## Invariants — do not break these

### 1. Realtime broadcasts carry only an id, never content

This app authenticates with its own JWTs, not Supabase Auth. Supabase's row-level security therefore **cannot identify our users**, and the anon key is public in browser JavaScript. Anyone who guesses a topic name can subscribe to it.

Broadcasts carry `{ conversationId }` and nothing else. An eavesdropper learns that something happened; the message is still fetched over the authenticated API, which checks membership.

Typing indicators are the deliberate exception, published straight from the browser over Presence — "someone is typing" is worth nothing to an eavesdropper. That exception is exactly why message text must never join it.

### 2. RLS is not a security layer here

Because the app does not use Supabase Auth, **every endpoint must scope its own rows** in Express. There is no database-level backstop. Assume any query without an explicit `.eq(...)` on the caller's id is a data leak.

### 3. The service role key never leaves the server

`SUPABASE_SERVICE_ROLE_KEY` bypasses all Postgres policies. It belongs only in the backend environment, used for Storage writes and signed URLs. It must never appear in a `NEXT_PUBLIC_*` variable or in mobile config — those are compiled into client bundles.

The **anon** key is the one that goes in `NEXT_PUBLIC_SUPABASE_ANON_KEY`. That is correct and intended.

### 4. Never trust an id from the body for ownership

```ts
// backend/src/routes/employee.ts — the pattern to follow
insert({ ..., employee_id: req.user!.id })   // from the token, not the body
```

### 5. Message text is rendered as React elements, never HTML

The chat formatter (`message-body.tsx`) builds React elements only. There is no `dangerouslySetInnerHTML` anywhere in message rendering, and link URLs are validated to `http:`/`https:` before becoming an anchor. Keep both properties if you touch it.

## Known issues

### The seeded admin password is in the repository

`migrate.sql` seeds `admin@mirzaitsolution.com` with a bcrypt hash of `ChangeMe123!`. **Anyone who can read this repo can log into any deployment where that password has not been changed.** Change it on first login. Treat any environment still using it as compromised.

### Two admin routes are missing their role gate

`GET /admin/employees` and `GET /admin/clients` are gated by `requireAuth` only — any authenticated user, including a client, can list your staff. Worth fixing.

### `GET /employee/tickets` is unscoped

It returns all tickets rather than only those relevant to the caller.

### Attendance double check-in has no database constraint

Prevention is application-level only, with no unique index. Two concurrent requests both pass the check. Once duplicates exist, `.maybeSingle()` errors, the error is discarded by destructuring, and check-in silently succeeds forever after. Fix is `UNIQUE (employee_id, date)`.

### `backend/node_modules` is committed

~1500 tracked files. It bloats clones and was the original cause of an oversized EAS upload. It also means dependency contents are in git history. `git rm -r --cached backend/node_modules` would untrack it; `.gitignore` already covers it.

## File access

The `project-files` bucket is **private**. Files are served as signed URLs with a 1-hour expiry, generated server-side after an ownership check. Never make the bucket public — the URLs are the access control.

Signing is batched (`createSignedUrls`, plural) and only for the page being rendered. The per-file version made one API call per attachment on every poll.

## Client-facing data

When building client-visible views, use an **explicit safe column list**. Do not reuse `PROJECT_COLUMNS` — it includes `employeeId`. Do not `select("*")`. Clients should not receive employee identities or logged hours unless that is a deliberate product decision.

## Before deploying

- [ ] `JWT_SECRET` set to a real secret
- [ ] Seeded admin password changed
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set on the backend only
- [ ] `project-files` bucket exists and is private
- [ ] `migrate.sql` applied
