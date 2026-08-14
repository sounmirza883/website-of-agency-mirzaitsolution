# Local setup

## Prerequisites

- Node.js 20+, npm 10+
- A Supabase project (Postgres + Storage) — free tier is enough
- Expo account, for mobile cloud builds only

From **Supabase → Project Settings → API** you need the project URL, the `anon` key, and the `service_role` key.

## Step 1 — Clone

```bash
git clone https://github.com/sounmirza883/website-of-agency-mirzaitsolution.git
cd website-of-agency-mirzaitsolution
```

There is no root `npm install` — this is not a workspace. You install per app.

## Step 2 — Database

Run [`backend/src/db/migrate.sql`](../backend/src/db/migrate.sql) in the Supabase SQL Editor. It is idempotent and safe to re-run.

Skipping this is the most common cause of "the feature is broken": the API returns `column ... does not exist`, and the staff chat fails outright.

## Step 3 — Storage bucket

Create a **private** bucket named exactly `project-files`. Project files, invoice payment proofs and chat attachments all live there, served through 1-hour signed URLs.

## Step 4 — Backend

```bash
cd backend
npm install
cp .env.example .env      # fill it in
npm run dev               # → http://localhost:4000
```

| Variable | Required | Purpose |
|---|---|---|
| `SUPABASE_URL` | yes | Project URL |
| `SUPABASE_ANON_KEY` | yes | Normal queries |
| `SUPABASE_SERVICE_ROLE_KEY` | for uploads | Storage writes, signed URLs, realtime poke. Without it uploads return 503. Server-side only. |
| `JWT_SECRET` | yes in prod | Falls back to a random per-boot secret, silently invalidating all sessions on restart |
| `PORT` | no | Defaults to 4000 |

Check it: `npm run verify:db`.

> **Use `npm run dev`, not `node dist/index.js`.** `dev` runs `tsx watch src/index.ts` and serves current source. The compiled `dist/` is committed and frequently stale — a `dist` build was once found serving 404s for routes that existed in source.

## Step 5 — Web apps

```bash
cd frontend/admin        # or website | client | employee
npm install
npm run dev
```

They default to the production API. For local work create `frontend/<app>/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

> `NEXT_PUBLIC_*` is inlined at **build time**. Changing it needs a rebuild, not a restart — and in production, a redeploy.

Ports: Next.js takes 3000 and counts up. Pin them if you run several: `npm run dev -- -p 3001`.

## Step 6 — Realtime (admin + employee)

Chat works without this — it silently degrades to 30-second polling. For instant delivery, add to **both** portals' `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

Use the **anon** key. Never the service role key — this one ships to the browser.

## Step 7 — Mobile

```bash
cd app
npm install
npm run start        # i = iOS, a = Android, w = web
```

API base comes from `extra.apiUrl` in `app.json`, read via `expo-constants` — Expo has no `NEXT_PUBLIC_*` equivalent.

Uses native modules (`expo-secure-store`, `expo-image-picker`, `expo-document-picker`, `@expo/ui`), so **Expo Go is not sufficient** — you need a dev build or the APK.

## First login

```
admin@mirzaitsolution.com  /  ChangeMe123!
```

**Change this immediately.** The hash is committed to the repo. Then create staff via Employees → Add, and clients via Clients → Add.

## Running several at once

```bash
cd backend           && npm run dev              # 4000
cd frontend/admin    && npm run dev -- -p 3001
cd frontend/employee && npm run dev -- -p 3002
cd frontend/client   && npm run dev -- -p 3003
```

CORS already allows any localhost port.

## Commands

| Command | Notes |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | **This is the typecheck** — there is no separate script. Run before committing. |
| `npm run lint` | ESLint |
| `npm run verify:db` | Backend only |
| `npm run start` | Expo dev server (`app/` only) |
