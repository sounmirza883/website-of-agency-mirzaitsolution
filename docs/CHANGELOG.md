# Changelog

Newest first. Dates are approximate; commit hashes are authoritative.

## Unreleased — on branch `v2`

Planning for employee scheduling, admin task allocation, timer-based time tracking, completion and daily reports, client progress visibility, and multi-project chat. Nine phases; see [PHASE.md](PHASE.md). Nothing built yet.

Documentation set added under `docs/`.

---

## August 2026

### Toolchain
- `083b7e0` Removed the TypeScript 6 files the 7.0.2 upgrade left behind — 131 deletions that the upgrade commit never picked up, because `backend/node_modules` is tracked in git
- `f9ead99` Upgraded all projects to TypeScript 7

### Documentation
- `ab25fc3` Rewrote the root README as a step-by-step guide. Corrected several stale claims: the staff chat was missing entirely, leads and users *do* have DELETE endpoints, and `npm run seed` was documented as broken when no such script exists

### Form labelling — every input across all five apps
An audit found **94 input controls with 13 visible labels**, and 15 with no descriptive text at all: bare `mm/dd/yyyy` date boxes, and dropdowns reading only "Everyone" or "Medium".

- `f2fd0af` **Mobile** — 13 of 15 `TextInput`s had no label and none set `accessibilityLabel`. Added a shared `Field`, an optional `label` on `StatusPicker`, and a native `DateField`. Fixed two data bugs: leave type and task priority were **free text for enum columns**, and mobile was writing `"Sick"` where the web writes `"Sick Leave"` — two clients disagreeing in one column
- `fae87f6` **Website** — the three contact dropdowns carried only an invisible `aria-label`, because the floating-label CSS keys off `:placeholder-shown`, which selects never match
- `bae8b40` **Client** — the ticket priority dropdown had no label, no `aria-label` and no placeholder option; the invoice payment-proof upload sat in a table column with an empty header
- `49c74d1` **Employee** — the Request Leave form was the worst case in the repo: two identical `mm/dd/yyyy` boxes with nothing marking From from To
- `96c2092` **Admin** — added the shared `Field` using `useId()` so labels actually focus their control. Also fixed an unrelated bug lint surfaced: **admin message search had never worked**, because `setDebouncedSearch` was never called and the search query was permanently the empty string

### Website fixes
- `2ee6f38` The highlighted word in headings was **invisible on gold blocks** — the standard emphasis paints it with a gold gradient. Affected three sections across Home, About and Contact
- `f84284e` Full worldwide dial-code list, 228 countries. The option value is the ISO code rather than the dial code, because `+1`, `+44` and `+7` are each shared by several countries and would otherwise collapse into one entry
- `7b13ecb` Phone country code and estimated budget with currency on the contact form, surfaced as a Budget column on admin Leads. The insert falls back to saving without the new columns if a migration is pending, so a live enquiry cannot be lost — verified against an un-migrated database
- `4352ac9` Standalone SQL file for the budget/currency columns
- `9db5d63` Contact page working hours set to 24/7

### Staff chat — nine phases
A Discord-style internal chat for admin and employees. Vercel serverless cannot hold a WebSocket, so the browser connects to Supabase Realtime directly and the API pokes it over stateless HTTP.

- `68d4e2e` Message search
- `526ba46` Markdown and code blocks, emoji picker, paste and drag upload, message grouping with date dividers
- `4ff4123` **Fix:** adding `chat_reactions` created a second join path between messages and users, and PostgREST began failing every message read and send with "more than one relationship was found" — at runtime, while the build stayed green
- `0745c80` Reactions, quote-replies and typing indicators. Typing rides Presence straight from the browser rather than the API, saving two hops per keystroke
- `daa8732` Edit and soft-delete messages; channel management
- `1855d52` Bounded every unbounded query (PostgREST truncates silently), batched signed-URL generation, wrapped handlers in `asyncHandler`
- `c9a3a55` `@mention` members with highlight and sidebar badge

Earlier in the same series: DMs and channels, realtime delivery, presence, unread badges, attachments.

**Notable fix during this work:** unread badges never cleared. Measurement showed Postgres `now()` running roughly 2 seconds ahead of the Node clock, so the timestamp comparison stayed true forever. Read cursors were changed to use message ids.

### Earlier
- Dark + Gold redesign across the website and all portals
- Pricing and blog features removed
- AI Automation added as a service

---

## Conventions

Commits use `type(scope): summary` — `feat`, `fix`, `chore`, `docs`, `perf`. The body explains *why*, and names anything that could surprise a reader later.
