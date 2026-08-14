# Authentication and authorization

One login endpoint serves every surface: `POST /api/auth/login` → JWT + user profile.

## The token

Signed with `jsonwebtoken` using `JWT_SECRET`, 7-day expiry. Payload:

```ts
// backend/src/middleware/auth.ts:11-15
type AuthPayload = { id: number; role: string; canCreateClients: boolean }
```

**This app does not use Supabase Auth.** That has a consequence that reaches into the architecture: Supabase's row-level security cannot identify our users, so RLS is not a security layer here. All access control is in Express middleware, and every endpoint must scope its own rows. See [SECURITY.md](SECURITY.md).

If `JWT_SECRET` is unset, the server falls back to a random per-boot secret. Everything works until the process restarts, at which point every session is silently invalidated. Always set it in production.

## Middleware

```ts
router.get("/thing", requireAuth, requireRole("admin"), asyncHandler(async (req: AuthedRequest, res) => { ... }))
```

- `requireAuth` verifies the bearer token and populates `req.user`
- `requireRole(...)` is variadic — `requireRole("admin", "employee")` allows either

## Roles

Three roles in a single `users` table, constrained by a CHECK:

| Role | Can do |
|---|---|
| `admin` | Everything. Creates employees and clients. |
| `employee` | Own tasks, attendance, leave, assigned projects. Can create clients **only** if an admin grants `canCreateClients`. |
| `client` | Only their own projects, invoices, tickets, files. |

`can_create_clients` is the only granular permission flag in the system. There is no roles table, no permission matrix, no manager hierarchy.

## Tenant scoping

Every list endpoint filters by the caller's own id, server-side:

```ts
.eq("employee_id", req.user!.id)     // employee routes
.eq("client_id", req.user!.id)       // client routes
```

Project chat re-derives access from the project row (403 unless `project.employee_id === req.user.id`). Staff chat re-checks conversation membership on **every** request, including the admin-only ones.

**Never trust an id from the request body for ownership.** `POST /employee/tasks` hard-wires `employee_id: req.user!.id` and does not read it from the body — that is the pattern to follow.

## Token storage

| Surface | Where |
|---|---|
| Web | `localStorage`, key `token` |
| Mobile | `expo-secure-store` (iOS Keychain / Android Keystore) |
| Mobile web | `localStorage` fallback |

Mobile implementation: `app/src/lib/secure-storage.ts`, key `auth_token`. On mount, the stored token is re-validated against `GET /auth/me` before the app trusts it.

Every request attaches `Authorization: Bearer <token>` inside the `api*` helpers. There is no interceptor and no cookie — which is also why permissive localhost CORS is safe here.

## The seeded admin

`migrate.sql` seeds one admin so a fresh install can be entered:

```
admin@mirzaitsolution.com  /  ChangeMe123!
```

**The bcrypt hash is committed to this repository.** Anyone who can read the repo can log into any deployment where the password has not been changed. Change it immediately after first login.

Running the backend with no Supabase credentials creates the same account in memory instead, where it lasts until the process restarts and all data routes return empty arrays.

## Deleting a user

Deletion orphans, never cascades. Projects, invoices, tickets and messages survive with the owner field nulled; chat memberships are removed. The FK lists in `backend/src/authStore.ts` (`USER_REFERENCES`, `USER_MEMBERSHIPS`) are what make this work — a new table with a `users(id)` FK must be registered there or deletion will fail.
