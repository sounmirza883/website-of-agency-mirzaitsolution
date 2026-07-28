# Backend — Mirza IT Solution API Server

Express.js + TypeScript API server that connects all four frontend apps to Supabase.

## Commands

| Command | Script |
|---------|--------|
| dev | `npm run dev` (tsx watch) |
| build | `npm run build` (tsc) |
| start | `npm start` (runs dist/) |

## Stack

- **Express.js** (`^4.21.2`) — HTTP server
- **TypeScript** (`^5.7.3`) — compiled via `tsc`, run via `tsx`
- **Supabase** (`@supabase/supabase-js`) — database client
- **CORS** — whitelisted origins: `agency.vesseldrop.com`, `admin.vesseldrop.com`, `client.vesseldrop.com`, `employee.vesseldrop.com`, localhost

## Structure

- `src/index.ts` — Express app entry, mounts all route groups under `/api`
- `src/supabase.ts` — Supabase client (falls back to `null` if no credentials)
- `src/types/index.ts` — TypeScript interfaces for all entities
- `src/routes/website.ts` — Website API (`/api/website/*`)
- `src/routes/admin.ts` — Admin API (`/api/admin/*`)
- `src/routes/employee.ts` — Employee API (`/api/employee/*`)
- `src/routes/client.ts` — Client API (`/api/client/*`)
- `src/db/schema.sql` — Supabase table definitions

## API Endpoints

### Website (`/api/website`)
- `GET /services` — service offerings
- `GET /portfolio` — portfolio items
- `GET /service-details` — detailed service pages

### Admin (`/api/admin`)
- `GET /users`, `/employees`, `/clients`, `/services`, `/projects`, `/invoices`, `/notifications`, `/blog`, `/portfolio`

### Employee (`/api/employee`)
- `GET /assigned-projects`, `/tasks`, `/files`, `/status-updates`, `/attendance`, `/leave-requests`

### Client (`/api/client`)
- `GET /projects`, `/milestones`, `/files`, `/invoices`, `/tickets`, `/messages`

## Data Fallback

When `SUPABASE_URL` and `SUPABASE_ANON_KEY` are not set in `.env`, the server returns in-memory mock data matching the original frontend data shapes. Add Supabase credentials in `.env` to use the real database.

## Health Check

`GET /api/health` returns `{ status: "ok" }`.

## Domain

`https://backend.vesseldrop.com`

## Vercel Deployment

The backend is deployed on Vercel as a serverless function:

- `vercel.json` — routes all requests to `src/index.ts`, compiled by `@vercel/node` with esbuild
- `src/index.ts` — exports the Express app as default (Vercel calls this as a serverless handler)
- `app.listen()` still runs for local dev — Vercel ignores it and uses the exported app instead
