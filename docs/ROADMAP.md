# Roadmap

## Done

**Platform** — public website, three role portals, mobile app, one Express API on Supabase. JWT auth with three roles.

**Delivery flow** — leads → projects → assignment → per-project chat → invoices with admin verification → tickets.

**Staff chat** — DMs and channels, Supabase Realtime, presence, typing indicators, unread and mention badges, attachments, reactions, replies, edit and soft delete, keyset pagination, full-text search, markdown and code blocks.

**Contact form** — worldwide dial codes (228 countries), estimated budget with currency, surfaced on the admin Leads page.

**Form labelling** — every input across all five apps now carries a visible label tied to its control; mobile gained a native date picker and enum pickers replacing free-text fields that were writing values incompatible with the web portal.

## Building — scheduling and tracking

Nine phases, each in lettered sub-phases. Full detail in [PHASE.md](PHASE.md).

| Phase | What it delivers |
|---|---|
| 1 | Schema plus working hours — company default and per-employee override |
| 2 | **Admin task allocation** — the core gap; admin can finally assign and see work |
| 3 | Start/stop timer with real timestamps and marked manual correction |
| 4 | Completion report per task (required to close it) and a daily report |
| 5 | **Progress becomes real** — task progress rolls up to the project |
| 6 | Client visibility — task status and completion reports for their own project |
| 7 | Admin reporting — timesheets, per-project reports, CSV export |
| 8 | Mobile parity and attendance hardening |
| 9 | Multi-project chat — thread list instead of a dropdown |

**Highest value soonest:** phase 2 changes the product most — it is the difference between a system that records work and one that directs it. Phase 5B is the cheapest visible win: the client progress bars already exist and have always shown 0%.

## Known debt

Ordered by how likely it is to hurt.

**Security**
- Seeded admin password hash is committed; anyone with repo access can enter any deployment still using it
- `GET /admin/employees` and `GET /admin/clients` are missing `requireRole` — any authenticated user can list staff
- `GET /employee/tickets` is unscoped

**Correctness**
- Attendance has no unique constraint; concurrent check-in creates duplicates, after which check-in silently succeeds forever
- Most route handlers are not wrapped in `asyncHandler`, so a throw kills the process
- `employee_tasks.due` holds two date formats in one column
- Mobile compares device-formatted dates against server-formatted ones

**Structural**
- `backend/node_modules` is committed — ~1500 tracked files
- `backend/dist` is committed and chronically stale
- `backend/src/db/seed.ts` is dead code reading a variable name nothing sets
- No DELETE endpoints for services, portfolio, notifications or projects — removing rows needs SQL
- Admin and employee portals duplicate large amounts of code

**Quality**
- No test framework at all; verification is build, lint and manual probing
- No error tracking
- `pg_trgm` index for chat search is optional and unapplied — correctness is fine, performance degrades with volume

## Not planned

Payroll, client booking, public sign-up, multi-agency tenancy, automated invoicing from tracked hours. See [PRD.md](PRD.md) for why.
