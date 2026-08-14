# User stories

Written as outcomes. ✅ shipped · 🔜 planned · ❌ not planned

## Visitor

- ✅ Browse services and portfolio, and read answers to common questions
- ✅ Send an enquiry with my phone number in my own country's format, and say what my budget is and in which currency
- ✅ Reach the agency on WhatsApp — *the button currently points at a placeholder number*
- ❌ Create my own account — accounts are created by an admin

## Client

- ✅ See my projects, their status and deadline
- ✅ Download deliverables through time-limited links
- ✅ Receive an invoice, upload proof of payment, and see it move to verified
- ✅ Raise a support ticket and track it
- ✅ Message the employee working on my project
- 🔜 **See what is actually being worked on** — which pieces are done, in progress, or not started
- 🔜 **Read what was delivered**, in the employee's own words, as each piece completes
- 🔜 See a progress bar that means something — *it exists today and has always shown 0%*
- 🔜 Hold several project conversations without losing track of them
- ❌ See how many hours were spent, or which individual did the work

## Employee

- ✅ See the projects assigned to me
- ✅ Track my own tasks on a board
- ✅ Check in and out, and request leave
- ✅ Upload files and post status updates
- ✅ Message the client on my projects
- ✅ Talk to colleagues in DMs and channels, with attachments, search and mentions
- 🔜 **Be told what to work on** — see what the admin assigned me, with a deadline and an estimate
- 🔜 **Know my working hours**, and have work scheduled around my approved leave
- 🔜 **Start and stop a timer** on a task, rather than reconstructing my day from memory
- 🔜 Correct a time entry when I forget to stop it, without it looking like tracked time
- 🔜 Write up what I did when I finish something, and a short summary at day's end
- 🔜 Handle several project chats from one screen — *today they are behind a dropdown that only appears if I have more than one project*

## Admin

- ✅ Create staff and client accounts, and control who can create clients
- ✅ Turn a website enquiry straight into a project
- ✅ Assign a project to an employee, which opens their chat with the client
- ✅ Issue invoices and verify payment proofs — *a client can never mark their own invoice paid*
- ✅ See attendance and approve leave
- ✅ Read and join any project conversation
- 🔜 **Assign a task to an employee** — *today there is no admin task endpoint at all; employees create their own tasks and I cannot even see them*
- 🔜 Set working hours company-wide and per person
- 🔜 Be warned when I schedule work outside someone's hours or on their approved leave
- 🔜 See who is working on what, right now
- 🔜 Read completion reports and daily summaries
- 🔜 See hours tracked against hours scheduled, per employee and per project
- 🔜 Export timesheets and project reports
- 🔜 Control which tasks and reports the client can see

## The gap that motivates this work

The admin decides what gets done, and the system has no way to record that decision. Employees invent their own tasks; the admin cannot see them. Nobody can say how long anything took. Clients are shown a progress bar that has never moved.

Fixing that, in order, is what [PHASE.md](PHASE.md) describes.
