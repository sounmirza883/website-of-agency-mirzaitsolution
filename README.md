# Mirza IT Solution — Agency Management Platform

A full-stack platform for a creative digital agency: a public marketing site, three role-based web portals, a cross-platform mobile app, and a single API backing all of them.

Six deployable surfaces, one shared Express + Supabase API, one shared JWT auth system.

## Architecture

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

Every project is independent: its own `package.json`, its own `node_modules`, its own dev server. This is **not** an npm workspace, so there is no root `npm install`.

| Surface | Stack |
|---|---|
| 4 × web apps | Next.js 16.2.11 · React 19.2.4 · Tailwind CSS v4 (`@tailwindcss/postcss`) · TanStack Query 5 |
| Mobile app | Expo SDK 57 · React Native 0.86 · React 19.2.3 · Expo Router · NativeWind 4 (Tailwind **v3**) · TanStack Query 5 |
| Backend | Express 4.21 · TypeScript 5.7 · Supabase JS 2 · JWT (`jsonwebtoken`) · `multer` |

The mobile app pins **Tailwind v3** because NativeWind 4 targets v3; NativeWind 5 (which targets Tailwind v4) is still pre-release. The web apps are on Tailwind v4. Don't "unify" these.

## Prerequisites

- Node.js 20+, npm 10+
- A Supabase project (Postgres + Storage)

## Setup

### 1. Database — required, not optional

Run **`backend/src/db/migrate.sql`** in the Supabase SQL Editor. It is idempotent and safe to re-run.

Without it, the API returns clear `column/table not found` errors. Most "the feature doesn't work" reports trace back to a migration that was never applied.

Then create a **private** Storage bucket named exactly `project-files` (file uploads and invoice payment proofs live there).

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # then fill it in
npm run dev               # → http://localhost:4000
```

| Variable | Required | Purpose |
|---|---|---|
| `SUPABASE_URL` | yes | Project URL |
| `SUPABASE_ANON_KEY` | yes | Normal DB queries |
| `SUPABASE_SERVICE_ROLE_KEY` | for file uploads | Storage writes + signed URLs. Without it, upload routes return `503 File storage not configured`. Keep it server-side only. |
| `JWT_SECRET` | yes in prod | Token signing. Falls back to a random per-boot secret, which invalidates all sessions on restart. |
| `PORT` | no | Defaults to `4000` |

With no Supabase credentials, auth falls back to an in-memory store with a bootstrap admin (`admin@mirzaitsolution.com` / `ChangeMe123!`), but **all data routes return empty arrays** — the app runs without crashing, it does not run with sample data.

### 3. Web apps

```bash
cd frontend/admin        # or website | client | employee
npm install
npm run dev
```

Each defaults to `https://backend.vesseldrop.com/api`. For local work, set `NEXT_PUBLIC_API_URL=http://localhost:4000/api` in `frontend/<app>/.env.local`.

`NEXT_PUBLIC_*` is inlined at **build time**, not read at runtime — changing it requires a rebuild/redeploy, not a restart.

### 4. Mobile app

```bash
cd app
npm install
npm run start            # then: i (iOS) · a (Android) · w (web)
```

The API base comes from `extra.apiUrl` in `app.json`, read via `expo-constants` (Expo has no `NEXT_PUBLIC_*` equivalent).

Uses native modules (`expo-secure-store`, `expo-image-picker`, `expo-document-picker`), so **Expo Go is not sufficient** — you need a dev build or the APK.

## Auth & roles

One login endpoint for every surface: `POST /api/auth/login` → JWT (7-day expiry) + user profile.

The token carries `{ id, role, canCreateClients }`. `requireAuth` validates it; `requireRole(...)` gates by role. Roles are `admin`, `employee`, `client` in a single `users` table.

- **Admin** — full access; creates employees and clients
- **Employee** — own tasks/attendance/leave; can create clients *only* if an admin grants `canCreateClients`
- **Client** — only their own projects, invoices, tickets, files

Token storage: `localStorage` on web, **`expo-secure-store`** (iOS Keychain / Android Keystore) on mobile, with a `localStorage` fallback for the mobile web target.

Every list endpoint is scoped server-side by the caller's own id — cross-tenant reads return `403`/empty, never another tenant's rows.

## Features

**Admin** — dashboard · users/employees/clients (create, edit, delete) · services · projects (Kanban board with drag-and-drop, assign to employee) · invoices (create, verify/reject payment proofs) · notifications (targeted) · portfolio · leads (convert a contact-form lead straight into a project) · attendance (all staff) · leave approval · read/join any project chat

**Employee** — dashboard · assigned projects · tasks (Kanban) · attendance check-in/out · leave requests · file uploads · status updates · notifications (create, targeted) · chat with the client on assigned projects

**Client** — dashboard · projects + milestones + progress · invoices (upload payment proof) · support tickets (Kanban) · file downloads (signed URLs) · notifications · chat with the assigned employee

**Website** — 5 routes (`/`, `/about`, `/services`, `/portfolio`, `/contact`): services list, filterable portfolio, FAQ accordion, and a contact form that writes real leads into the admin Leads page

### Notable flows

- **Project assignment drives chat.** Assigning a project to an employee is what creates the employee↔client conversation. Threads are **per project**, so a client with three projects has three separate threads. Admin can read and post in any thread.
- **Invoices are verify-based, not self-serve.** Client uploads a proof file → `PendingVerification` → admin approves (`Paid`) or rejects (back to `Unpaid`, proof cleared). Clients cannot mark an invoice paid.
- **Chat polls every 5s** (`refetchInterval`). No websockets.
- **Deleting a user orphans, never cascades.** Their projects/invoices/tickets survive with the owner field nulled.

## API

All routes are under `/api`. Everything except `/auth/login` and `/website/*` requires `Authorization: Bearer <token>`.

| Prefix | Role | Endpoints |
|---|---|---|
| `/auth` | — | `POST login`, `GET me` |
| `/website` | public | `services`, `portfolio`, `service-details`, `POST contact` |
| `/admin` | admin | `users` (+`PATCH :id`, `DELETE :id`, `PATCH :id/status`), `employees`, `clients`, `services`, `projects` (+`PATCH :id/status`, `PATCH :id/assign`), `invoices` (+`PATCH :id/verify`), `notifications`, `portfolio`, `contact-submissions`, `attendance`, `leave-requests` (+`PATCH :id/status`), `messages` |
| `/employee` | employee | `clients`, `tasks` (+`PATCH :id/status`), `assigned-projects`, `status-updates`, `attendance` (+`POST check-in`, `POST check-out`), `leave-requests`, `files`, `notifications`, `messages` |
| `/client` | client | `projects`, `milestones`, `files`, `invoices` (+`POST :id/submit-payment`), `tickets` (+`PATCH :id/status`), `notifications`, `messages` |

Chat endpoints require a `?projectId=` query param and `403` if the project isn't yours.

## Android APK

Built with EAS (Expo's cloud service) — no Android Studio or JDK needed locally.

```bash
npm install --global eas-cli
cd app
eas login
eas build --platform android --profile preview
```

Use **`--profile preview`**: it sets `distribution: internal` + `buildType: apk`, giving an installable file. The `production` profile builds an `.aab` for Play Store, which **cannot be sideloaded**.

Takes ~15–20 min. Output is a download URL plus a QR code; builds are also listed on your expo.dev dashboard.

The root **`.easignore` is load-bearing.** EAS archives from the git repo root, so without it the upload balloons to ~1.1 GB (the backend and all four web apps plus every `node_modules`) and fails. With it, ~13 MB.

## Deployment

Each surface deploys separately on Vercel; push to `main` auto-deploys.

| Surface | Domain |
|---|---|
| API | `backend.vesseldrop.com` |
| Website | `agency.vesseldrop.com` |
| Admin | `admin.vesseldrop.com` |
| Client | `client.vesseldrop.com` |
| Employee | `employee.vesseldrop.com` |

Set in Vercel: `NEXT_PUBLIC_API_URL` per frontend; `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET` on the backend.

CORS (`backend/src/index.ts`) allows the production domains explicitly plus any `localhost`/`127.0.0.1` port — dev servers pick whatever port is free (Next.js 3000–3003, Expo web 8081, then 8082+). Broad localhost access is safe here because auth is Bearer-token only with no cookies.

## Commands

| Command | Notes |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck + production build (`tsc` only, in `backend`) |
| `npm run lint` | ESLint |
| `npm run start` | Expo dev server (`app/` only) |

## Gotchas

Things that have actually cost debugging time here:

1. **Migration not applied** — the single most common cause of "broken" features. Re-run `migrate.sql`.
2. **`SUPABASE_SERVICE_ROLE_KEY` missing** — file upload and invoice-proof routes return `503`. Easy to miss because everything else works.
3. **`NEXT_PUBLIC_*` is build-time** — a wrong API URL is baked into the bundle and needs a redeploy, not a restart.
4. **`npm run seed` is broken** — `backend/src/db/seed.ts` reads `SUPABASE_SERVICE_KEY`, but `.env.example` and the rest of the code use `SUPABASE_SERVICE_ROLE_KEY`. Use `migrate.sql` instead, or fix the variable name.
5. **`backend/node_modules` is committed to git** (~1500 files). It bloats clones and was the original cause of the oversized EAS upload. Worth `git rm -r --cached backend/node_modules`.
6. **Express 4 does not catch async route errors.** A throwing `async` handler becomes an unhandled rejection and **kills the process** — on serverless the caller just hangs with no response. Wrap anything that can throw in `asyncHandler` (`backend/src/middleware/asyncHandler.ts`).
7. **Two Tailwind majors on purpose** — v4 for web, v3 for the mobile app (NativeWind 4 requirement).
8. **No DELETE endpoints** for services, portfolio, notifications, projects, or leads — removing those rows currently needs SQL.

## License

Private — all rights reserved.
