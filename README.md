# Mirza IT Solution — Agency Management Platform

A full-stack platform for a creative digital agency: a public marketing site, three role-based web portals, a cross-platform mobile app, and a single API backing all of them.

Six deployable surfaces, one shared Express + Supabase API, one shared JWT auth system.

---

## Table of contents

1. [What's in the repo](#1-whats-in-the-repo)
2. [Prerequisites](#2-prerequisites)
3. [Setup, step by step](#3-setup-step-by-step)
4. [First login](#4-first-login)
5. [How auth works](#5-how-auth-works)
6. [What each role can do](#6-what-each-role-can-do)
7. [The two chat systems](#7-the-two-chat-systems)
8. [API reference](#8-api-reference)
9. [Database](#9-database)
10. [Deployment](#10-deployment)
11. [Building the Android APK](#11-building-the-android-apk)
12. [Troubleshooting](#12-troubleshooting)
13. [Gotchas](#13-gotchas)

---

## 1. What's in the repo

```
├── frontend/
│   ├── website/      Next.js 16 — public marketing site + contact form
│   ├── admin/        Next.js 16 — admin portal
│   ├── client/       Next.js 16 — client portal
│   └── employee/     Next.js 16 — employee portal
├── app/              Expo SDK 57 — React Native mobile app (all three roles in one)
├── backend/          Express 4 + TypeScript — the only API; talks to Supabase
└── temple/           Static HTML/CSS — brand reference implementation
```

Every project is independent: its own `package.json`, its own `node_modules`, its own dev server. This is **not** an npm workspace, so there is no root `npm install` — you install in each directory you intend to run.

That independence is deliberate, and it has a cost worth knowing up front: **the admin and employee portals contain near-duplicate code** (`queries.ts`, `hooks.ts`, and the whole staff chat UI). A change to shared behaviour usually has to be made twice.

| Surface | Stack |
|---|---|
| 4 × web apps | Next.js 16.2.11 · React 19.2.4 · Tailwind CSS v4 (`@tailwindcss/postcss`) · TanStack Query 5 |
| Website extras | `three` (3D brand mark) · `framer-motion` |
| Admin + Employee extras | `@supabase/supabase-js` (Realtime only) · `@dnd-kit` (Kanban) |
| Mobile app | Expo SDK 57 · React Native 0.86 · React 19.2.3 · Expo Router · NativeWind 4 (Tailwind **v3**) · TanStack Query 5 |
| Backend | Express 4.21 · TypeScript 5.7 · Supabase JS 2 · JWT (`jsonwebtoken`) · `bcryptjs` · `multer` |

The mobile app pins **Tailwind v3** because NativeWind 4 targets v3; NativeWind 5 (which targets Tailwind v4) is still pre-release. The web apps are on Tailwind v4. Don't "unify" these.

---

## 2. Prerequisites

- **Node.js 20+**, npm 10+
- A **Supabase project** (Postgres + Storage) — the free tier is enough
- For the mobile app only: an Expo account (for cloud builds)

From the Supabase dashboard you will need three values, all under **Project Settings → API**:

| Value | Where it's used |
|---|---|
| Project URL | backend + admin/employee realtime |
| `anon` public key | backend + admin/employee realtime |
| `service_role` secret key | backend only — **never** put this in a frontend |

---

## 3. Setup, step by step

### Step 1 — Clone

```bash
git clone https://github.com/sounmirza883/website-of-agency-mirzaitsolution.git
cd website-of-agency-mirzaitsolution
```

### Step 2 — Create the database schema (required, not optional)

Open the **Supabase SQL Editor** and run **`backend/src/db/migrate.sql`** in full.

It is idempotent (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `ON CONFLICT DO NOTHING`) and safe to re-run whenever you pull changes.

Skipping this is the single most common cause of "the feature is broken" — the API returns `column ... does not exist` or `relation ... does not exist`, and the staff chat endpoints fail outright. Re-run it after every `git pull` that touches `migrate.sql`.

> Smaller, single-purpose SQL files live alongside it — e.g. `add-budget-currency.sql` — for when you only need one change and don't want to re-run everything.

### Step 3 — Create the Storage bucket

In **Supabase → Storage**, create a **private** bucket named exactly:

```
project-files
```

Everything uploaded goes here: project files, invoice payment proofs, and staff-chat attachments (under a `chat/<conversationId>/` prefix). Files are served through short-lived signed URLs (1 hour), which is why the bucket must stay private.

### Step 4 — Run the backend

```bash
cd backend
npm install
cp .env.example .env      # then fill it in
npm run dev               # → http://localhost:4000
```

`.env`:

| Variable | Required | Purpose |
|---|---|---|
| `SUPABASE_URL` | yes | Project URL |
| `SUPABASE_ANON_KEY` | yes | Normal DB queries |
| `SUPABASE_SERVICE_ROLE_KEY` | for uploads | Storage writes + signed URLs, and the Realtime broadcast poke. Without it, upload routes return `503 File storage not configured`. Server-side only. |
| `JWT_SECRET` | yes in prod | Token signing. Falls back to a random per-boot secret, which silently invalidates every session on restart. |
| `PORT` | no | Defaults to `4000` |

Verify the database is wired up correctly:

```bash
npm run verify:db
```

**Running without Supabase credentials:** auth falls back to an in-memory store with a bootstrap admin, but **all data routes return empty arrays**. The app runs without crashing; it does not run with sample data.

### Step 5 — Run the web apps

Each portal is its own Next.js app. Repeat for whichever you need:

```bash
cd frontend/admin        # or website | client | employee
npm install
npm run dev
```

They default to the production API (`https://backend.vesseldrop.com/api`). For local work, create `frontend/<app>/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

> `NEXT_PUBLIC_*` is inlined at **build time**, not read at runtime. Changing it requires a rebuild — restarting the server is not enough, and in production it means a redeploy.

Ports: Next.js takes 3000 and counts upward, so running several at once gives you 3000, 3001, 3002… The backend's CORS allows any localhost port, so no configuration is needed for this.

### Step 6 — Enable realtime chat (admin + employee only)

The staff chat works without this — it just degrades to 30-second polling, silently. To get instant delivery, add to **both** `frontend/admin/.env.local` and `frontend/employee/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>
```

Use the **anon** key here, never the service role key — this one ships to the browser.

### Step 7 — Run the mobile app

```bash
cd app
npm install
npm run start            # then: i (iOS) · a (Android) · w (web)
```

The API base comes from `extra.apiUrl` in `app.json`, read via `expo-constants` — Expo has no `NEXT_PUBLIC_*` equivalent, so edit `app.json` to point it elsewhere.

The app uses native modules (`expo-secure-store`, `expo-image-picker`, `expo-document-picker`), so **Expo Go is not sufficient** — you need a dev build or the APK from [Step 11](#11-building-the-android-apk).

---

## 4. First login

There is no signup. Accounts are created by an admin.

`migrate.sql` seeds one admin so you can get in:

```
admin@mirzaitsolution.com  /  ChangeMe123!
```

**Change this password immediately** via *Change Password* in the portal — the hash is committed to this public-ish repo, so anyone who reads it can log into any deployment where it hasn't been changed. Running the backend without Supabase credentials creates the same account in memory, where it lasts only until the process restarts.

Once logged in as admin: **Employees → Add** creates staff, **Clients → Add** creates clients. You set each person's email and password.

---

## 5. How auth works

One login endpoint for every surface: `POST /api/auth/login` → JWT (7-day expiry) + user profile.

The token carries `{ id, role, canCreateClients }`. `requireAuth` validates it; `requireRole(...)` gates by role. Roles are `admin`, `employee`, `client` in a single `users` table.

- **Admin** — full access; creates employees and clients
- **Employee** — own tasks/attendance/leave; can create clients *only* if an admin grants `canCreateClients`
- **Client** — only their own projects, invoices, tickets, files

Token storage: `localStorage` on web, **`expo-secure-store`** (iOS Keychain / Android Keystore) on mobile, with a `localStorage` fallback for the mobile web target.

Every list endpoint is scoped server-side by the caller's own id — cross-tenant reads return `403` or an empty list, never another tenant's rows.

---

## 6. What each role can do

**Admin** — dashboard · users/employees/clients (create, edit, delete, activate/deactivate) · services · projects (Kanban with drag-and-drop, assign to employee) · invoices (create, verify/reject payment proofs) · payment settings · notifications (targeted) · portfolio · leads (contact-form submissions, convertible straight into a project) · attendance (all staff) · leave approval · staff chat · read/join any project chat

**Employee** — dashboard · assigned projects · tasks (Kanban) · attendance check-in/out · leave requests · file uploads · status updates · notifications · tickets · staff chat · chat with the client on assigned projects

**Client** — dashboard · projects + milestones + progress · invoices (upload payment proof) · support tickets (Kanban) · file downloads (signed URLs) · notifications · chat with the assigned employee

**Website** — 5 routes (`/`, `/about`, `/services`, `/portfolio`, `/contact`): services list, filterable portfolio, FAQ accordion, and a contact form (worldwide dial codes, estimated budget + currency) that writes real leads into the admin Leads page

### Flows worth knowing

- **Project assignment drives chat.** Assigning a project to an employee is what creates the employee↔client conversation. Threads are **per project**, so a client with three projects has three separate threads. Admin can read and post in any thread.
- **Invoices are verify-based, not self-serve.** Client uploads a proof file → `PendingVerification` → admin approves (`Paid`) or rejects (back to `Unpaid`, proof cleared). Clients cannot mark an invoice paid.
- **Deleting a user orphans, never cascades.** Their projects/invoices/tickets/messages survive with the owner field nulled; chat memberships are removed.

---

## 7. The two chat systems

These are separate subsystems that happen to share a word. Don't confuse them when debugging.

|  | **Project chat** | **Staff chat** |
|---|---|---|
| Who | client ↔ employee (admin can join) | admin ↔ employee |
| Scope | one thread per project | DMs + named channels |
| Where | `/chat` in client & employee portals | `/messages` in admin & employee portals |
| API | `/admin/messages`, `/employee/messages`, `/client/messages` | `/api/chat/*` |
| Tables | `project_messages`, `client_messages` | `chat_conversations`, `chat_members`, `chat_messages`, `chat_reactions` |
| Transport | polling every 5s | Supabase Realtime, 30s polling as fallback |

### How staff chat gets real-time on serverless

Vercel's serverless functions **cannot hold a WebSocket open**, so the API can't push. Instead:

1. The browser connects **directly** to Supabase Realtime (`wss://<project>.supabase.co`), bypassing Express entirely.
2. When a message is written, the backend makes a stateless HTTP call to Supabase's broadcast endpoint to poke the relevant users.
3. Each client re-fetches through the normal authenticated API.

**The broadcast carries only a conversation id — never message content.** This is a security requirement, not an optimisation: the app authenticates with its own JWTs rather than Supabase Auth, so Supabase's row-level security cannot identify users, and the anon key is public in browser JS. Anything published over that socket should be assumed readable by anyone. The same reasoning is why typing indicators (low-value) go direct from the browser, while message text never does.

Staff chat features: DMs and channels, unread + `@mention` badges, online/offline presence, typing indicators, replies, reactions, edit/delete (soft-delete tombstones), file and image attachments, full-text search, markdown and code blocks, message grouping with date dividers.

---

## 8. API reference

All routes are under `/api`. Everything except `/auth/login` and `/website/*` requires `Authorization: Bearer <token>`.

| Prefix | Role | Endpoints |
|---|---|---|
| `/auth` | — | `POST login`, `POST change-password`, `GET me` |
| `/website` | public | `services`, `portfolio`, `service-details`, `POST contact` |
| `/admin` | admin | `users` (+`PATCH :id`, `DELETE :id`, `PATCH :id/status`), `employees` (+`PATCH :id/permission`), `clients`, `services`, `projects` (+`PATCH :id/status`, `PATCH :id/assign`), `invoices` (+`PATCH :id/verify`), `payment-settings`, `notifications`, `portfolio`, `contact-submissions` (+`DELETE :id`), `tickets`, `attendance`, `leave-requests` (+`PATCH :id/status`), `messages` |
| `/employee` | employee | `clients`, `tasks` (+`PATCH :id/status`), `assigned-projects`, `status-updates`, `attendance` (+`POST check-in`, `POST check-out`), `leave-requests`, `files`, `tickets` (+`PATCH :id/status`), `notifications`, `messages` |
| `/client` | client | `projects`, `milestones`, `files`, `invoices` (+`POST :id/submit-payment`), `payment-settings`, `tickets` (+`PATCH :id/status`), `notifications`, `messages` |
| `/chat` | admin + employee | `contacts`, `search`, `conversations`, `POST conversations/dm`, `POST conversations/channel`, `:id/messages` (GET paginated, POST, PATCH, DELETE), `:id/messages/:mid/reactions`, `:id/attachments`, `:id/members`, `:id/leave`, `:id/read`, `PATCH :id`, `DELETE :id` |

Project-chat endpoints require a `?projectId=` query param and return `403` if the project isn't yours. Staff-chat endpoints re-check conversation membership on **every** request, including the admin-only ones.

Message history is keyset-paginated (50 per page, newest first) — pass the oldest id you hold as the cursor to load older messages.

---

## 9. Database

28 tables, all created by `migrate.sql`:

- **Website** — `website_services`, `website_portfolio`, `website_service_details`, `website_contact_submissions`
- **Core** — `users`, `notifications`, `payment_settings`
- **Admin** — `admin_services`, `admin_projects`, `admin_invoices`, `admin_notifications`, `admin_portfolio`
- **Employee** — `employee_assigned_projects`, `employee_tasks`, `employee_status_updates`, `employee_attendance`, `employee_leave_requests`
- **Client** — `client_projects`, `client_milestones`, `client_invoices`, `client_tickets`, `client_messages`
- **Shared** — `project_files`, `project_messages`
- **Staff chat** — `chat_conversations`, `chat_members`, `chat_messages`, `chat_reactions`

Plus the `pg_trgm` extension and a GIN index for chat search, a `(conversation_id, id)` index for message pagination, and the `chat_conversation_summary(p_user_id)` function that computes unread counts, mention flags and previews in one query instead of shipping whole threads to the client.

**Read cursors use message ids, not timestamps.** Postgres `now()` was measured running ~2 seconds ahead of the Node process, which made timestamp comparisons unreliable and left unread badges permanently stuck. Ids are monotonic and generated in one place, so they don't have this problem. Don't "simplify" this back to timestamps.

---

## 10. Deployment

Each surface deploys separately on Vercel; pushing to `main` auto-deploys.

| Surface | Domain |
|---|---|
| API | `backend.vesseldrop.com` |
| Website | `agency.vesseldrop.com` |
| Admin | `admin.vesseldrop.com` |
| Client | `client.vesseldrop.com` |
| Employee | `employee.vesseldrop.com` |

Environment variables to set in Vercel:

| Project | Variables |
|---|---|
| Backend | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET` |
| Each frontend | `NEXT_PUBLIC_API_URL` |
| Admin + Employee also | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

**Deployment checklist:**

1. Run `migrate.sql` against the production database *before* deploying code that depends on new columns.
2. Confirm the `project-files` bucket exists and is private.
3. Set `JWT_SECRET` to a real secret — without it, every deploy logs all users out.
4. Push to `main`.

CORS (`backend/src/index.ts`) allows the production domains explicitly, plus any `localhost`/`127.0.0.1` port. Broad localhost access is safe here because auth is Bearer-token only, with no cookies.

---

## 11. Building the Android APK

Built with EAS (Expo's cloud service) — no Android Studio or JDK needed locally.

```bash
npm install --global eas-cli
cd app
eas login
eas build --platform android --profile preview
```

Use **`--profile preview`**: it sets `distribution: internal` + `buildType: apk`, producing an installable file. The `production` profile builds an `.aab` for the Play Store, which **cannot be sideloaded**.

Takes ~15–20 min. Output is a download URL plus a QR code; builds are also listed on your expo.dev dashboard.

The root **`.easignore` is load-bearing.** EAS archives from the git repo root, so without it the upload balloons to ~1.1 GB (the backend and all four web apps plus every `node_modules`) and fails. With it, ~13 MB.

---

## 12. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `column ... does not exist` / `relation ... does not exist` | Migration not applied | Run `migrate.sql` |
| Uploads return `503 File storage not configured` | `SUPABASE_SERVICE_ROLE_KEY` missing | Add it to the backend env |
| Signed URLs 404 | Bucket missing or misnamed | Create private bucket `project-files` |
| Chat works but messages take 30s | Realtime env vars missing | Add `NEXT_PUBLIC_SUPABASE_*` to admin **and** employee, then rebuild |
| Frontend calls the wrong API after an env change | `NEXT_PUBLIC_*` is build-time | Rebuild/redeploy — restarting won't do it |
| Everyone logged out after a deploy | `JWT_SECRET` unset, so it regenerates per boot | Set `JWT_SECRET` |
| A page 404s in dev despite building fine | Stale Turbopack cache | Delete `.next` and restart |
| `EADDRINUSE` on 4000 | A backend is already running | Kill that process, or set `PORT` |

Commands:

| Command | Notes |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck + production build (`tsc` only, in `backend`) |
| `npm run lint` | ESLint |
| `npm run verify:db` | Backend only — checks tables and bucket are reachable |
| `npm run start` | Expo dev server (`app/` only) |

**Always run `npm run build` before committing** — it typechecks, and there is no separate typecheck script.

---

## 13. Gotchas

Things that have actually cost debugging time here:

1. **Migration not applied** — the single most common cause of "broken" features. Re-run `migrate.sql`.
2. **`SUPABASE_SERVICE_ROLE_KEY` missing** — file upload and invoice-proof routes return `503`. Easy to miss because everything else works.
3. **`NEXT_PUBLIC_*` is build-time** — a wrong API URL is baked into the bundle and needs a redeploy, not a restart.
4. **Express 4 does not catch async route errors.** A throwing `async` handler becomes an unhandled rejection and **kills the process** — on serverless the caller just hangs with no response. Wrap anything that can throw in `asyncHandler` (`backend/src/middleware/asyncHandler.ts`).
5. **PostgREST truncates silently.** Unbounded selects are capped by `max-rows` **without an error**, and combined with ascending order that quietly returns the *oldest* rows. Always bound and order deliberately.
6. **Ambiguous PostgREST embeds.** A table with two foreign keys to `users` makes `users(...)` ambiguous and breaks the query at runtime while still compiling fine. Disambiguate: `users!sender_id(...)`.
7. **`backend/node_modules` is committed to git** (~1500 files). It bloats clones and was the original cause of the oversized EAS upload. Worth `git rm -r --cached backend/node_modules`.
8. **`backend/src/db/seed.ts` is dead code.** No npm script runs it, and it reads `SUPABASE_SERVICE_KEY` while everything else uses `SUPABASE_SERVICE_ROLE_KEY`. Use `migrate.sql`.
9. **No DELETE endpoints** for services, portfolio, notifications, or projects — removing those rows currently needs SQL. (Users and leads *do* have one.)
10. **Two Tailwind majors on purpose** — v4 for web, v3 for the mobile app (NativeWind 4 requirement).
11. **Admin and employee portals are duplicated by design.** Changes to shared behaviour must be made in both.

---

## License

Private — all rights reserved.
