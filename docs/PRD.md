# Product requirements

## What this is

An operations platform for Mirza IT Solution, a software and design agency. It replaces the spreadsheets and chat threads an agency accumulates: winning work, assigning it, tracking it, billing it, and showing the client what is happening.

## Who uses it

**Admin (agency owner)** — runs everything. Creates staff and client accounts, sets up projects, allocates work, issues invoices, verifies payment, and needs to know at any moment what is being worked on and by whom.

**Employee** — does the work. Needs to know what is assigned to them, when it is due, and what counts as done. Records attendance and requests leave.

**Client** — pays for the work. Needs to see progress without having to ask, download deliverables, raise issues, and pay invoices.

**Visitor** — a prospect on the public website who becomes a lead through the contact form.

## What it does today

**Lead to project.** A visitor submits the contact form; it lands in admin as a lead with their budget and currency, and can be converted directly into a project.

**Project delivery.** Admin creates a project, assigns it to an employee, and that assignment creates the employee↔client chat thread. Threads are per project. Progress and milestones are visible to the client.

**Invoicing, verify-based.** Admin issues an invoice. The client uploads a payment proof, which moves it to `PendingVerification`. Admin approves it to `Paid` or rejects it back to `Unpaid` with the proof cleared. **A client can never mark their own invoice paid** — that is deliberate.

**Support.** Clients raise tickets; employees and admin work them on a Kanban board.

**Staff communication.** Admin and employees have a full internal chat: direct messages and named channels, realtime delivery, presence, unread and mention badges, file attachments, reactions, replies, editing, deletion and search.

**HR basics.** Attendance check-in/out and leave requests with admin approval.

## What is missing, and why it matters

**The admin cannot assign a task.** There is no admin task endpoint at all. Employees create their own tasks, and `employee_id` is hard-wired to the caller. The person who decides what gets done has no way to record that decision, and no way to see what anyone is working on.

**Hours cannot be measured.** Attendance stores two display strings per day and no duration. Nothing computes time worked, and nothing tracks time against a task, so there is no way to know whether a fixed-price job was profitable.

**Progress is theatre.** `admin_projects.progress` is rendered to clients as a progress bar and has never been written to — it has always read 0%. Employees post free-text status updates with a percentage that feeds nothing.

**Working hours do not exist.** No shift, no schedule, no capacity. Approved leave is stored and read by nothing, so work can be assigned to someone who is away.

**Clients must ask.** They see a project name, a status word and a 0% bar. "How is it going?" is answered by email, not by the product.

## What is being built

A scheduling and tracking system that closes those gaps:

1. **Admin allots work** — assigns tasks to employees with a project, a time window and an estimate. Employees may still add their own.
2. **Working hours are defined** — a company default with per-employee overrides, so scheduling can warn when work lands outside someone's hours or on approved leave.
3. **Time is tracked honestly** — a start/stop timer per task storing real timestamps, with manual correction that is visibly marked as corrected.
4. **Work ends in a report** — a completion report per task, required before it can be marked complete, plus a daily summary.
5. **Progress becomes real** — task progress rolls up to the project, which lights up the client progress bars that already exist.
6. **Clients can see it** — task-level status and completion reports for their own project. Not hours, and not employee names.
7. **Chat handles multiple projects** — a thread list rather than a dropdown, since an employee can hold several projects at once.

## Non-goals

- Payroll, contracts, or tax
- Client self-service booking or scheduling
- Public sign-up — accounts are created by an admin
- Multi-agency tenancy
- Automated invoicing from tracked time

## Principles

**The client sees outcomes, not internals.** Progress and what was delivered — never hours or individual names. Exposing hours would show exactly how long a fixed-price job took.

**Warn, do not block.** Scheduling conflicts are surfaced, not enforced. The admin knows things the system does not.

**Nothing silently loses data.** The public contact form saves the lead even when a migration is pending. Real enquiries are irreplaceable.

**One tap or it will not be used.** Time tracking succeeds or fails on friction.
