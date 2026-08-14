# Memory

Facts learned the hard way. None of these are visible by reading the code, and each one cost real debugging time.

## Postgres clock runs ahead of Node

Measured at roughly **2 seconds** ahead. Timestamp-based read cursors were therefore broken: `created_at > last_read_at` stayed true forever and unread badges never cleared, no matter how many times a thread was opened.

Fix: read cursors key on **message id**, never a timestamp. Ids are monotonic and generated in one place. Do not "simplify" this back to timestamps.

## PostgREST truncates silently

`max-rows` (commonly 1000 on hosted Supabase) caps an unbounded select **without returning an error**. Combined with ascending order, the query quietly returns the *oldest* rows. A sidebar built that way freezes on ancient history and looks like a caching bug.

Always order deliberately and bound the query.

## Two FKs to the same table break embeds at runtime

Adding `chat_reactions` created a second join path between `chat_messages` and `users`. Every message read and send began failing with "more than one relationship was found" — while the TypeScript build stayed green, because this is a runtime PostgREST error.

Disambiguate: `users!sender_id(...)`, `users!user_id(...)`.

## `NEXT_PUBLIC_*` is build-time

Inlined into the bundle when the app is built. Changing one requires a rebuild — restarting the dev server does nothing, and in production it needs a redeploy. A wrong API URL is baked in.

## Missing realtime env vars fail silently

Without `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY`, the realtime client is `null`, both hooks no-op, and chat falls back to 30-second polling. No error, no warning — just latency nobody reports as a bug.

## The committed `dist/` is stale

`backend/dist` is tracked in git and frequently behind `src`. A running backend started with `node dist/index.js` was found returning **404 for `/api/website/services`** — a route that exists in both `src` and the on-disk `dist` — because the process had loaded an even older build and there was no watcher to pick up changes.

Use `npm run dev` (`tsx watch src/index.ts`) locally. Never diagnose behaviour from `dist`.

## Express 4 does not catch async errors

A throwing `async` handler becomes an unhandled rejection and **kills the process**. On serverless the caller simply hangs with no response. `asyncHandler` exists for this and is applied inconsistently — most handlers are still bare.

## Turbopack caches stale routes

A page 404'd in dev while building fine. Deleting `.next` fixed it. Suspect the cache before suspecting your code.

## `tsx watch` can miss external edits

Files written by an external script did not always trigger a reload. If behaviour does not match source, restart the backend before investigating further.

## The mobile app compares device time to server time

`app/src/app/(employee)/(tabs)/index.tsx` computes "today" from the **device** clock and matches it against a date string formatted by the **server**. Near midnight, or from a different timezone, they do not match: the app offers Check In and the server answers 409.

## Lint has caught real bugs here

Not style — actual defects, twice:

- a ref mutated during render in `realtime.ts`, which React forbids under concurrent rendering
- a composer wired to a dead handler, meaning the `@` mention picker would never have opened

A third was found by lint during the labelling work: admin message search never fired, because `setDebouncedSearch` was never called and `useChatSearch` only ever received the empty string.

Run `npx eslint` on changed files. Note that `no-explicit-any` fires constantly and is the established convention in `queries.ts` — do not treat those as new.

## Regex edits to minified CSS leave orphaned braces

Twice. `globals.css` is one long minified line; removing a rule by pattern is fragile. Detect with a brace count, or edit by exact string match.

## Verify claims before acting on them

A survey once reported a malformed Express route path in `employee.ts`. Reading the file showed it was correct. Nothing was "fixed", and that was the right outcome — agent reports and grep hits are leads, not conclusions.

## The seeded admin hash is public

`migrate.sql` contains a bcrypt hash of `ChangeMe123!` for `admin@mirzaitsolution.com`. Verified by comparison. Anyone with repo access can log into any deployment that still uses it.
