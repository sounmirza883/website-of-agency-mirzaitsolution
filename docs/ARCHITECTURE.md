# Architecture

## Six deployable surfaces, one API

```
├── frontend/
│   ├── website/      Next.js 16 — public marketing site + contact form
│   ├── admin/        Next.js 16 — admin portal
│   ├── client/       Next.js 16 — client portal
│   └── employee/     Next.js 16 — employee portal
├── app/              Expo SDK 57 — React Native app (all three roles in one)
├── backend/          Express 4 + TypeScript — the only API
└── temple/           Static HTML/CSS — brand reference
```

Everything talks to one Express API, which talks to Supabase (Postgres + Storage). There is no second service, no queue, no cron, no background worker.

## Each project is independent

Every app has its own `package.json` and its own `node_modules`. This is **not** an npm workspace — there is no root `npm install`, and no shared package.

The consequence is real and you will hit it: **shared code is duplicated, not imported.** `frontend/admin/app/components.tsx` and `frontend/employee/app/components.tsx` are identical for their first 61 lines. `auth.tsx`, `provider.tsx`, `realtime.ts`, `message-body.tsx` and `globals.css` are byte-identical across those two apps. A change to shared behaviour must be made in each app that has a copy.

This is deliberate — the apps deploy separately and evolve at different speeds — but it is a standing cost. Revisit it if the duplication keeps growing.

## The constraint that shapes everything: serverless cannot hold a socket

The API is deployed as Vercel serverless functions. A serverless function **cannot hold a WebSocket open**. This single fact determines how realtime works, and it is the most important thing to understand before changing anything in chat.

```
browser  ──── WebSocket ────►  Supabase Realtime     (the socket lives here)
   │                                  ▲
   │ authenticated REST               │ stateless HTTP POST after a write
   ▼                                  │
Express API on Vercel ────────────────┘
```

1. The browser connects **directly** to `wss://<project>.supabase.co`, bypassing our API entirely.
2. After a successful write, the API makes one ordinary HTTP call to Supabase's broadcast endpoint — stateless, which is what a serverless function does well.
3. The client re-fetches through the normal authenticated API.

Implementation: [`backend/src/realtime.ts`](../backend/src/realtime.ts), [`frontend/admin/app/realtime.ts`](../frontend/admin/app/realtime.ts).

### The rule that comes with it

**The broadcast carries only an id — never message content.** This app authenticates with its own `jsonwebtoken` JWTs, not Supabase Auth, so Supabase's row-level security cannot identify our users, and the anon key is public in browser JavaScript. Anyone who guesses a topic name can listen.

Sending only an id means an eavesdropper learns that *something happened* and nothing more. The message itself is fetched over the authenticated API, which checks membership. See [SECURITY.md](SECURITY.md).

Typing indicators are the deliberate exception — they ride Supabase Presence straight from the browser, because "someone is typing" is worth nothing to an eavesdropper and skipping the server saves two network hops per keystroke.

## Two chat systems

They share a word and nothing else. Do not confuse them when debugging.

|  | **Project chat** | **Staff chat** |
|---|---|---|
| Who | client ↔ employee (admin can join) | admin ↔ employee |
| Scope | one thread per project | DMs + named channels |
| Route | `/chat` in client & employee | `/messages` in admin & employee |
| API | `/{admin,employee,client}/messages` | `/api/chat/*` |
| Tables | `project_messages`, `client_messages` | `chat_conversations`, `chat_members`, `chat_messages`, `chat_reactions` |
| Transport | polling every 5s | Supabase Realtime, 30s poll as fallback |

Staff chat is the newer, more capable system: pagination, unread and mention badges, presence, reactions, replies, edit/delete, attachments, search. Project chat has none of that yet.

## Request path

```
Browser → fetch(`${NEXT_PUBLIC_API_URL}${path}`, { Authorization: Bearer <jwt> })
        → Express (backend/src/index.ts)
        → CORS check (production domains + any localhost port)
        → requireAuth  → verifies JWT, sets req.user
        → requireRole  → gates by role
        → handler      → Supabase JS client → Postgres
```

Every list endpoint scopes rows by the caller's own id server-side. Cross-tenant reads return 403 or an empty list — never another tenant's rows.

## Storage

One private Supabase bucket, `project-files`, holds everything: project files, invoice payment proofs, and staff-chat attachments under a `chat/<conversationId>/` prefix. Files are served as signed URLs with a 1-hour expiry, which is why the bucket must stay private.

Storage writes need `SUPABASE_SERVICE_ROLE_KEY`. Without it, upload routes return `503` while everything else keeps working — an easy failure to misdiagnose.

## What does not exist

Worth knowing before you go looking:

- No background jobs, cron, or scheduler
- No caching layer, no Redis
- No test framework of any kind
- No shared package or monorepo tooling
- No CI beyond Vercel's build
- No error tracking or APM
