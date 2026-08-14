# Decisions

Why things are the way they are. Each entry is a decision that constrains future work.

---

## 1. Realtime goes browser → Supabase, not through our API

**Because** the API is Vercel serverless and cannot hold a WebSocket open.

The browser connects directly to Supabase Realtime; the backend pokes it with a stateless HTTP POST after a write.

**Consequence:** clients need `NEXT_PUBLIC_SUPABASE_*`. Missing them degrades silently to polling. Anything wanting push must go through this path — do not attempt a socket server.

---

## 2. Broadcasts carry an id, never message content

**Because** the app authenticates with its own JWTs rather than Supabase Auth. Supabase RLS cannot identify our users, and the anon key is public in browser JavaScript, so anyone who guesses a topic can subscribe.

An id tells an eavesdropper that something happened and nothing more. Content is fetched over the authenticated API, which checks membership.

**Consequence:** never optimise by putting the message in the broadcast. Typing indicators are the one exception — worthless to an eavesdropper, and skipping the server saves two hops per keystroke.

---

## 3. Read cursors use message ids, not timestamps

**Because** Postgres `now()` was measured running roughly 2 seconds ahead of the Node clock. `created_at > last_read_at` stayed true forever and unread badges never cleared.

**Consequence:** do not "simplify" this back to timestamps. Any new unread or sync cursor keys on a monotonic id.

---

## 4. No shared package

**Because** each surface deploys separately and evolves at its own pace. Introducing a workspace mid-stream would touch every app's build.

**Consequence:** `Field`, `auth.tsx`, `realtime.ts` and others are duplicated per app. Shared changes must be made in each copy. Revisit if duplication keeps growing.

---

## 5. Dates are stored as display strings — and this is now a known mistake

**Because** early code formatted at write time for convenience.

**Consequence:** times cannot be sorted, compared or subtracted; hours worked are not computable; `employee_tasks.due` holds two formats in one column. The chat tables broke the pattern deliberately and use `TIMESTAMPTZ`.

**Going forward:** new time-bearing features add typed columns and dual-write, so existing screens keep working.

---

## 6. Invoices are verify-based

**Because** payment proof is a file, not an API callback. A client marking their own invoice paid is not evidence.

Client uploads proof → `PendingVerification` → admin approves to `Paid` or rejects to `Unpaid` with the proof cleared.

---

## 7. Deleting a user orphans, never cascades

**Because** losing a project because its employee left is worse than an orphan row.

FK columns are nulled; chat memberships are removed.

**Consequence:** every new `users(id)` FK must be registered in `authStore.ts` `USER_REFERENCES` or deletion breaks.

---

## 8. The public contact form saves the lead even when a migration is pending

**Because** `main` auto-deploys and the site is a live revenue path. Referencing a column that does not exist yet would 500 every real enquiry.

The insert falls back to saving without `budget`/`currency`; any other error surfaces normally. Verified against an un-migrated database.

---

## 9. Client-facing views get an explicit safe column list

**Because** `PROJECT_COLUMNS` includes `employeeId`, and `select("*")` returns whatever a table gains later.

Clients see task status, progress and completion reports — not hours, not employee names. Exposing hours would show exactly how long a fixed-price job really took.

---

## 10. Scheduling warns, it does not block

**Because** the admin knows things the system does not: an employee agreed to cover, a deadline moved, a client is on site.

Conflicts with working hours or approved leave are surfaced and overridable.

---

## 11. Time tracking is a one-tap timer

**Because** friction determines whether it gets used at all. Research on timesheet design is consistent: one-click timers get used, manual entry does not.

Manual correction exists, and corrected entries are marked `edited_at`/`edited_by` so they are visibly corrections rather than indistinguishable from tracked time.

---

## 12. Every input carries a visible label

**Because** placeholders vanish the moment you type, and date, select and file inputs never show one at all — a bare `<input type="date">` renders as an unexplained `mm/dd/yyyy` box. An audit found 94 controls with 13 labels, and 15 with no descriptive text whatsoever.

Labels use `useId()` so clicking one focuses its control.

---

## 13. Mobile enum fields use pickers, not free text

**Because** mobile was sending `"Sick"` where the web sends `"Sick Leave"` — two clients writing different values into the same column.

Pickers use the web portal's exact option strings.

---

## 14. Mobile date entry uses the platform picker

**Because** a typed date reached the API with only a non-empty check.

`@expo/ui` was already a dependency. iOS and Android expose different APIs, so it is a platform-file split. `@expo/ui/community/datetime-picker` would have been one API for both, but its peer dependency is not installed.
