# Mirza IT Solution

A multi-project monorepo for a creative digital agency — **Zephtrix Studio** — with a public website, three client/employee/admin portals, a unified API backend, and a brand reference implementation.

## Architecture

```
├── frontend/
│   ├── website/      Next.js 16 — Public agency site (marketing, portfolio, services)
│   ├── admin/        Next.js 16 — Admin panel (manage users, projects, invoices, blog)
│   ├── client/       Next.js 16 — Client portal (view projects, files, invoices, chat)
│   └── employee/     Next.js 16 — Employee portal (tasks, attendance, leave requests)
├── backend/          Express.js + TypeScript — Unified API layer connecting to Supabase
└── temple/           Static HTML/CSS/JS — Brand reference implementation
```

All four Next.js apps share the same stack: **Next.js 16.2.11, React 19.2.4, Tailwind CSS v4** (via `@tailwindcss/postcss`), TypeScript, and TanStack Query for data fetching.

## Quick Start (Local Dev)

### Prerequisites

- Node.js 20+
- npm 10+

### Setup

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. (Optional) Configure Supabase — fallback data works without it
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Start the backend API server
npm run dev
# → http://localhost:4000
```

In a separate terminal:

```bash
# 4. Pick a frontend app and start it
cd frontend/website   # or admin, client, employee
npm install
npm run dev
# → http://localhost:3000 (or next available port)
```

Each frontend expects the backend at `http://localhost:4000/api` by default. Override via `NEXT_PUBLIC_API_URL` in `frontend/<app>/.env.local`.

## Project Structure

### Frontend Apps

Each frontend is independent — its own `package.json`, `node_modules/`, and dev server.

| App | Path | Features |
|-----|------|----------|
| **Website** | `frontend/website/` | Home, services (12 detailed pages), portfolio with filter, about, contact form, FAQ |
| **Admin** | `frontend/admin/` | Dashboard, users, employees, clients, services, projects, invoices, notifications, blog, portfolio management |
| **Client** | `frontend/client/` | Dashboard, projects with progress, milestones, files, invoices, support tickets, team chat |
| **Employee** | `frontend/employee/` | Dashboard, assigned projects, tasks, files, status updates, attendance logs, leave requests |

### Backend API

`backend/` — Express.js + TypeScript API server on port 4000.

All routes are prefixed with `/api`:

| Domain | Prefix | Endpoints |
|--------|--------|-----------|
| Website | `/api/website` | `services`, `portfolio`, `service-details` |
| Admin | `/api/admin` | `users`, `employees`, `clients`, `services`, `projects`, `invoices`, `notifications`, `blog`, `portfolio` |
| Employee | `/api/employee` | `assigned-projects`, `tasks`, `files`, `status-updates`, `attendance`, `leave-requests` |
| Client | `/api/client` | `projects`, `milestones`, `files`, `invoices`, `tickets`, `messages` |

**Data fallback:** When `SUPABASE_URL` and `SUPABASE_ANON_KEY` are not set in `backend/.env`, the API returns in-memory mock data so all frontends work out of the box.

### Brand Reference

`temple/` — a static HTML/CSS/JS implementation of the Zephtrix Studio brand design used as a visual reference.

## Commands

Each subproject supports:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | TypeScript check + production build |
| `npm run lint` | Run ESLint |

## Production Domains

| App | Domain |
|-----|--------|
| Backend API | `https://backend.vesseldrop.com` |
| Agency Website | `https://agency.vesseldrop.com` |
| Admin Portal | `https://admin.vesseldrop.com` |
| Client Portal | `https://client.vesseldrop.com` |
| Employee Portal | `https://employee.vesseldrop.com` |

Set `NEXT_PUBLIC_API_URL=https://backend.vesseldrop.com/api` in each frontend's environment for production.

## Stack Details

| Technology | Version | Notes |
|------------|---------|-------|
| Next.js | 16.2.11 | App Router — breaking changes from older versions |
| React | 19.2.4 | Server components + `"use client"` directives |
| Tailwind CSS | 4.x | Via `@tailwindcss/postcss` (not the classic package) |
| TypeScript | 5.x | Strict mode |
| TanStack Query | 5.x | Data fetching + caching in all frontends |
| Express.js | 4.21.2 | API server |
| Supabase | 2.x | Database client (optional — falls back to mock data) |
| Font Awesome | 6.x | Icons via CDN |
| Inter / DM Mono | — | Google Fonts (sans-serif / monospace) |

## Design System

The brand uses a set of CSS custom properties defined in `frontend/website/app/globals.css`:

- `--canvas` — page background
- `--ink` — primary text
- `--ink-soft` — secondary text
- `--red` — brand accent (`#e63946`)
- `--soft` — subtle background
- `--line` — border color
- `--radius` — border radius (`24px`)
- `--sans` / `--mono` — font stacks

## License

Private — all rights reserved.
