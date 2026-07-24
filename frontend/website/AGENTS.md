# Zephtrix Studio Website

## Commands

| Command | Script |
|---------|--------|
| dev | `npm run dev` |
| build | `npm run build` (typechecks + builds) |
| lint | `npm run lint` |

No separate typecheck or test commands — `npm run build` includes TypeScript checking. Always run `build` before committing.

## Framework

- **Next.js 16** (App Router) — `node_modules/next/dist/docs/` has API docs; this version has breaking changes from older Next.js
- **Tailwind CSS v4** via `@tailwindcss/postcss` (not the classic `tailwindcss` package)
- **React 19** with `"use client"` directives on interactive components

## Structure

- `app/` — all routes, components, styles
- `app/layout.tsx` — root layout wraps `<ThemeProvider>` > `<Providers>` (TanStack Query) > `<BodyWrapper>` (loading screen + navigation replay)
- `app/page.tsx` — home page, all other routes under `app/{about,services,portfolio,contact}/`
- `app/components.tsx` — **all shared components** in one file (`Header`, `Footer`, `SiteShell`, `Icon`, `PageHero`, `PortfolioFilter`, `ContactForm`, `FAQ`)
- `app/animations.tsx` — `GlitchText`, `FadeIn`, `StaggerContainer`, `StaggerItem`, `LoadingScreen`, `BodyWrapper`, `MatrixRain`
- `app/data.ts` — static content (`services`, `portfolioItems`, `serviceDetails`)
- `app/theme.tsx` — `ThemeProvider` + `useTheme` hook (persists to localStorage, falls back to `prefers-color-scheme`)
- `app/providers.tsx` — TanStack Query `QueryClientProvider`

## CSS quirks

- **All CSS is in `app/globals.css`** on a single line (minified). Add new CSS in minified single-line format.
- Dark theme is driven by `[data-theme="dark"]` attribute on `<html>`, set by `ThemeProvider`.
- CSS variables (`--canvas`, `--ink`, `--soft`, `--red`, etc.) control theme colors. Avoid hardcoded colors unless necessary.
- Font Awesome 6 via CDN (`@import`), icons use `<i className="fas fa-xxx" />` via the `<Icon>` wrapper.

## Key conventions

- All page files return JSX in a single `return` statement (no multi-line formatting in pages).
- `SiteShell` wraps every page with `Header`, WhatsApp float, and `Footer`.
- Loading screen replays on every navigation (controlled by `BodyWrapper` via `usePathname()`).
- No API endpoints — all data is static from `app/data.ts`. TanStack Query is wired up but unused.
- Fonts: `DM Mono` (mono), `Inter` (sans) via Google Fonts.
