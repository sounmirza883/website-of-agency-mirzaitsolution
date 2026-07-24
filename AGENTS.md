# mirzaitsolution

Five subprojects in this repo:

| Directory | Type | Status |
|-----------|------|--------|
| `website/` | Next.js 16 App Router site (Zephtrix Studio public site) | Built out. See `website/AGENTS.md`. |
| `admin/` | Next.js 16 App Router app (admin portal) | `create-next-app` boilerplate — blank. |
| `client/` | Next.js 16 App Router app (client portal) | `create-next-app` boilerplate — blank. |
| `employee/` | Next.js 16 App Router app (employee portal) | `create-next-app` boilerplate — blank. |
| `temple/` | Static HTML/CSS/JS site | Reference implementation of the Zephtrix brand design. |

All four Next.js apps share the same stack: **Next.js 16.2.11 + React 19.2.4 + Tailwind CSS v4** (via `@tailwindcss/postcss`) + TypeScript.

Each app is independent — separate `package.json`, separate `node_modules/`, start dev servers individually with `npm run dev` in the target directory.

`npm run build` includes TypeScript checking (no separate typecheck command). No test framework is set up. No CI workflows exist.

Always check a subproject's own `AGENTS.md` before editing it (currently only `website/` has one).
