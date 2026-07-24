# Mirza IT Solution — Project Guide for AI

## Repo Structure

```
root/
├── frontend/
│   ├── website/     Next.js 16 — Public agency site (static)
│   ├── admin/       Next.js 16 — Admin panel portal
│   ├── client/      Next.js 16 — Client portal
│   └── employee/    Next.js 16 — Employee portal
├── backend/         Express.js + TypeScript — Unified API to Supabase
└── temple/          Static HTML — Brand design reference
```

All four Next.js apps share: **Next.js 16.2.11 + React 19.2.4 + Tailwind CSS v4** (`@tailwindcss/postcss`) + TypeScript + TanStack Query.

## Development

Start the backend first, then any frontend:
```bash
cd backend && npm run dev          # API on :4000
cd frontend/<app> && npm run dev   # Frontend on :3000 (or next)
```

Build = typecheck + compile (no separate typecheck command):
```bash
npm run build
```

## Key Conventions

**General:**
- No comments in code unless asked
- Each subproject is independent (separate `package.json`, `node_modules/`)
- Always check the app's `AGENTS.md` before editing — each has specific rules
- All CSS custom properties defined in `globals.css` — use `var(--ink)`, `var(--canvas)`, `var(--red)`, etc. instead of hardcoded colors
- `npm run build` passes before committing

**Frontend (Next.js 16):**
- Breaking changes from older Next.js — check `node_modules/next/dist/docs/` if unsure
- Use `"use client"` for interactive components using hooks (TanStack Query, React state)
- Data fetching: `app/queries.ts` → `app/hooks.ts` (TanStack Query `useQuery`)
- Backend URL from `process.env.NEXT_PUBLIC_API_URL` (defaults to `http://localhost:4000/api`)
- Env files: `.env.local` for dev config, `.env.example` as template
- Portals (admin, client, employee) have sidebar + header layout, page files under route directories

**Backend (Express.js + TypeScript):**
- `src/index.ts` — entry point, mounts routes under `/api`
- Route files in `src/routes/` — `website.ts`, `admin.ts`, `employee.ts`, `client.ts`
- `src/supabase.ts` — Supabase client (null when no credentials → uses in-memory fallback)
- `src/db/migrate.sql` — full SQL to create tables + seed data
- CORS whitelist in `src/index.ts` — update there if adding new frontend domains
- Vercel: `vercel.json` uses `@vercel/node` with esbuild; `vercel-build` script skips `tsc`
- Add new routes: create file in `src/routes/`, import in `src/index.ts`, add Supabase table in `schema.sql` and `migrate.sql`

**Supabase:**
- RLS disabled (backend is sole API gateway)
- Anon key in `backend/.env` — the backend uses it to query Supabase
- When no credentials set, backend returns in-memory mock data (same shapes as Supabase tables)

## Adding a New Feature

1. Check `AGENTS.md` for the relevant app to understand existing conventions
2. Backend: add route + Supabase table + seed data
3. Frontend: add fetch function in `app/queries.ts`, hook in `app/hooks.ts`, use in page
4. Build with `npm run build` to verify TypeScript

## Production Domains

| App | Domain |
|-----|--------|
| Backend API | `https://backend.vesseldrop.com` |
| Agency Website | `https://agency.vesseldrop.com` |
| Admin Portal | `https://admin.vesseldrop.com` |
| Client Portal | `https://client.vesseldrop.com` |
| Employee Portal | `https://employee.vesseldrop.com` |

Set `NEXT_PUBLIC_API_URL=https://backend.vesseldrop.com/api` in each frontend for production.
