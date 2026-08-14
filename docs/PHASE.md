# Phases

Current work: **employee scheduling, time tracking, reporting, client visibility and multi-project chat.**

Branch: `v2`. Each sub-phase is a commit. Every sub-phase leaves the system working.

**Scale:** 9 phases, ~28 sub-phases, 5 apps, 8 new tables. Not a single sitting.

## Status

| Phase | Status |
|---|---|
| 1 — Foundation | Not started |
| 2 — Admin task allocation | Not started |
| 3 — Timer | Not started |
| 4 — Reports | Not started |
| 5 — Progress | Not started |
| 6 — Client visibility | Not started |
| 7 — Admin reporting | Not started |
| 8 — Mobile + attendance | Not started |
| 9 — Multi-project chat | Not started |

## Phase 1 — Foundation: schema and working hours

- **1A** Migration: `work_settings`, `employee_schedules`, task columns, `task_time_entries`, `task_reports`, `daily_reports`, attendance timestamp columns. Register FKs in `authStore.ts` `USER_REFERENCES`; add tables to `verify.ts`. Run `migrate.sql`, confirm with `npm run verify:db`.
- **1B** Backend: `GET/PATCH /admin/work-settings`, `GET/PUT /admin/employee-schedules/:id`, `GET /employee/my-schedule` returning the override merged over the company default.
- **1C** Admin Work Schedule settings page, following the `payment-settings` `FieldGrid` shape, plus a per-employee override editor.

## Phase 2 — Admin task allocation

- **2A** `POST/GET/PATCH/DELETE /admin/tasks` with `employee_id` settable from the body, plus `project_id`, `scheduled_start/end`, `estimated_minutes`, `assigned_by`, `client_visible`.
- **2B** Admin Scheduling page: assign a task to an employee with a time window; per-employee workload column.
- **2C** Conflict warnings — warn, never block — when a window falls outside that employee's hours or lands on approved leave. First time leave is read by anything.

## Phase 3 — Timer and time entries

- **3A** `POST /employee/tasks/:id/start`, `POST /employee/time-entries/:id/stop`, `GET /employee/time-entries`. A partial unique index on `(employee_id) WHERE ended_at IS NULL` makes a double start a clean 409 rather than a silent duplicate.
- **3B** Employee web: Start/Stop on the task card, live elapsed, running-task indicator in the shell header.
- **3C** Manual correction: `PATCH /employee/time-entries/:id` stamping `edited_at`/`edited_by`, plus the edit UI and an "edited" marker.

## Phase 4 — Reports

- **4A** `POST /employee/tasks/:id/report`; a task cannot move to Complete without one.
- **4B** `POST/GET /employee/daily-reports`.
- **4C** Employee UI: report modal on completion, daily report card on the dashboard.
- **4D** Admin review views for both.

## Phase 5 — Progress

- **5A** Shared `ProgressBar`, duplicated into both portals and mobile as `Field` was. Replaces the one hand-rolled bar in `employee/app/status/page.tsx`.
- **5B** Roll task progress into `admin_projects.progress`. **This is when the client portal's existing bars start showing real numbers.**
- **5C** Admin scheduling dashboard: today's schedule, who is on what now, tracked hours against scheduled.

## Phase 6 — Client visibility

- **6A** `GET /client/projects/:id/tasks` and `.../reports`, scoped by `client_id` on the parent project, filtered to `client_visible = true`. **Explicit safe column lists** — no `employee_id`, no `assigned_by`, no hours. Non-owner gets 403.
- **6B** Client project detail: task list with status and per-task progress.
- **6C** Client activity feed of completion reports.

## Phase 7 — Admin reporting

- **7A** Per-employee timesheet: hours by day and week, tracked against scheduled.
- **7B** Per-project report: tasks, progress, total hours, completion reports.
- **7C** CSV export for both.

## Phase 8 — Mobile parity and attendance hardening

- **8A** Attendance uses the timestamp columns, keeping the dual-write; fixes the device-vs-server timezone mismatch.
- **8B** Mobile Schedule tab and task timer.
- **8C** Mobile completion and daily report forms.

## Phase 9 — Multi-project chat

- **9A** `GET /{employee,client,admin}/conversations` with last-message preview and unread count; adds `project_message_reads (project_id, user_id, last_read_message_id)` and `POST .../read`.
- **9B** Employee two-pane layout copied from `messages/page.tsx`; replaces the project dropdown.
- **9C** Same for client and admin — admin's replaces the per-project modal.
- **9D** Realtime via `broadcastChatActivity`; demote the 5-second poll to a 30-second fallback.

Unread must key on **message id**, not time — `project_messages.time` is a display string, and the clock skew that broke timestamp cursors once is documented in [MEMORY.md](MEMORY.md).

## Rules for every sub-phase

1. `npm run build` in each changed app — this is the typecheck.
2. `npx eslint` on changed files.
3. Commit separately, with the reasoning in the message.
4. If the schema changed, say so explicitly — `migrate.sql` must be run by hand.
5. State what was verified and what was not.
