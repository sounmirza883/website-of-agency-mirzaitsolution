# mirzaitsolution

Six subprojects in this repo:

| Directory | Type | Status |
|-----------|------|--------|
| `frontend/website/` | Next.js 16 App Router site (Mirza IT Solution public site) | Built out. See `frontend/website/AGENTS.md`. |
| `frontend/admin/` | Next.js 16 App Router app (admin portal) | Built out. See `frontend/admin/AGENTS.md`. |
| `frontend/client/` | Next.js 16 App Router app (client portal) | Built out. See `frontend/client/AGENTS.md`. |
| `frontend/employee/` | Next.js 16 App Router app (employee portal) | Built out. See `frontend/employee/AGENTS.md`. |
| `backend/` | Express.js + TypeScript API server | Built out. See `backend/AGENTS.md`. |
| `temple/` | Static HTML/CSS/JS site | Reference implementation of the Zephtrix brand design. |

All four Next.js apps share the same stack: **Next.js 16.2.11 + React 19.2.4 + Tailwind CSS v4** (via `@tailwindcss/postcss`) + TypeScript + TanStack Query.

The backend serves as a unified API layer connecting all frontends to Supabase. Each frontend's `app/queries.ts` calls the backend API with in-memory fallback data when Supabase credentials are not configured.

Each app is independent — separate `package.json`, separate `node_modules/`, start dev servers individually with `npm run dev` in the target directory.

`npm run build` includes TypeScript checking (no separate typecheck command). No test framework is set up. No CI workflows exist.

Each subproject has its own `AGENTS.md` — check it before editing.

## Quick Start (Local Dev)

1. Copy `backend/.env.example` to `backend/.env` and add Supabase credentials (optional — falls back to mock data)
2. Start backend: `cd backend && npm run dev`
3. Start any frontend: `cd frontend/<app> && npm run dev`
4. Set `NEXT_PUBLIC_API_URL=http://localhost:4000/api` in frontend `.env.local` if backend is not on port 4000

## Production Domains

| App | Domain |
|-----|--------|
| Backend API | `https://backend.vesseldrop.com` |
| Agency Website | `https://agency.vesseldrop.com` |
| Admin Portal | `https://admin.vesseldrop.com` |
| Client Portal | `https://client.vesseldrop.com` |
| Employee Portal | `https://employee.vesseldrop.com` |
