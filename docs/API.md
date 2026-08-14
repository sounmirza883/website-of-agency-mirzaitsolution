# API reference

Base: `/api`. Everything except `POST /auth/login` and `/website/*` requires `Authorization: Bearer <token>`.

Mounted in [`backend/src/index.ts`](../backend/src/index.ts):

```ts
app.use("/api/auth", authRoutes);
app.use("/api/website", websiteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/chat", chatRoutes);
```

## `/auth` — no role

| Method | Path | Notes |
|---|---|---|
| POST | `/login` | → JWT + profile |
| POST | `/change-password` | requires current password |
| GET | `/me` | validates a stored token |

## `/website` — public

| Method | Path |
|---|---|
| GET | `/services`, `/portfolio`, `/service-details` |
| POST | `/contact` |

`POST /contact` accepts `name, email, phone, service, budget, currency, message`. It falls back to inserting without `budget`/`currency` if those columns do not exist yet, so a pending migration cannot turn a real enquiry into a 500. Any other error surfaces normally.

## `/admin` — role `admin`

| Method | Path |
|---|---|
| GET/POST | `/employees`, `/clients` |
| PATCH | `/employees/:id/permission` |
| GET | `/users` |
| PATCH | `/users/:id`, `/users/:id/status` |
| DELETE | `/users/:id` |
| GET/POST | `/projects` |
| PATCH | `/projects/:id/status`, `/projects/:id/assign` |
| GET/POST | `/invoices` |
| PATCH | `/invoices/:id/verify` |
| GET/PATCH | `/payment-settings` |
| POST | `/services`, `/portfolio`, `/notifications` |
| GET | `/contact-submissions` |
| DELETE | `/contact-submissions/:id` |
| GET | `/tickets`, `/attendance`, `/leave-requests` |
| PATCH | `/tickets/:id/status`, `/leave-requests/:id/status` |
| GET/POST | `/messages` |

Two routes are gated by `requireAuth` **only**, with no `requireRole` — `GET /employees` and `GET /clients`. Any authenticated user can call them. Worth tightening.

Admin has **no** `employee_tasks` route. An admin cannot see or assign a single task today.

## `/employee` — role `employee`

| Method | Path |
|---|---|
| GET/POST | `/tasks` |
| PATCH | `/tasks/:id/status` |
| GET/POST | `/status-updates` |
| GET | `/attendance` |
| POST | `/attendance/check-in`, `/attendance/check-out` |
| GET/POST | `/leave-requests`, `/files`, `/notifications`, `/messages` |
| GET | `/assigned-projects`, `/tickets` |
| PATCH | `/tickets/:id/status` |

`POST /tasks` hard-wires `employee_id` to the caller and forces `status: "Pending"`. `GET /tickets` is **unscoped** — it returns all tickets, not only the caller's.

## `/client` — role `client`

| Method | Path |
|---|---|
| GET | `/projects`, `/milestones`, `/files`, `/invoices`, `/tickets`, `/notifications`, `/messages`, `/payment-settings` |
| POST | `/invoices/:id/submit-payment`, `/tickets`, `/messages` |
| PATCH | `/tickets/:id/status` |

## `/chat` — roles `admin` + `employee`

Staff chat. Every route re-checks conversation membership, including the admin-only ones.

| Method | Path | Notes |
|---|---|---|
| GET | `/contacts`, `/search`, `/conversations` | |
| POST | `/conversations/dm` | lookup-or-create |
| POST | `/conversations/channel` | admin only |
| GET/POST | `/conversations/:id/messages` | GET is keyset-paginated |
| PATCH/DELETE | `/conversations/:id/messages/:messageId` | sender only; admin may delete any |
| POST | `/conversations/:id/messages/:messageId/reactions` | toggle |
| POST | `/conversations/:id/attachments` | multipart |
| POST | `/conversations/:id/read` | |
| POST | `/conversations/:id/leave` | |
| PATCH/DELETE | `/conversations/:id` | admin only — rename / delete |
| POST/DELETE | `/conversations/:id/members[/:userId]` | admin only |

Message history is keyset-paginated, 50 per page, newest first — pass the oldest id you hold as the cursor.

## Conventions

**Guard the client.** `supabase` is `null` when env vars are absent. Reads return `[]`; writes return `503`.

```ts
if (!supabase) return res.json([]);                                        // read
if (!supabase) return res.status(503).json({ error: "Database not configured" });  // write
```

**Errors.** `{ error: string }` with 400 (validation), 401 (no/bad token), 403 (not yours), 404 (missing), 409 (conflict), 500 (database), 503 (not configured).

**Wrap async handlers.** Express 4 does not catch async errors — a throw becomes an unhandled rejection and kills the process; on serverless the caller just hangs. Use `asyncHandler` from `backend/src/middleware/asyncHandler.ts`. Existing code applies this inconsistently; new code should always wrap.

**Bound your queries.** PostgREST's `max-rows` truncates unbounded selects **without erroring**. Combined with ascending order, that silently returns the *oldest* rows. Always order deliberately and limit.

## CORS

Production domains are allowed explicitly, plus any `localhost` / `127.0.0.1` port so dev servers work whatever port they land on. Broad localhost access is safe here because auth is bearer-token only, with no cookies.
