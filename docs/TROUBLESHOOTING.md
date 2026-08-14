# Troubleshooting

## Quick table

| Symptom | Cause | Fix |
|---|---|---|
| `column ... does not exist` | Migration not applied | Run `migrate.sql` in the Supabase SQL Editor |
| `relation ... does not exist` | Same | Same |
| Uploads return `503 File storage not configured` | `SUPABASE_SERVICE_ROLE_KEY` missing | Add it to the backend env |
| Signed URLs 404 | Bucket missing or misnamed | Create a private bucket named exactly `project-files` |
| Chat works but is 30s behind | `NEXT_PUBLIC_SUPABASE_*` missing | Add both to admin and employee, then **rebuild** |
| Frontend calls the wrong API after an env change | `NEXT_PUBLIC_*` is build-time | Rebuild or redeploy; restarting does nothing |
| Everyone logged out after a deploy | `JWT_SECRET` unset, regenerates per boot | Set it |
| A page 404s in dev but builds fine | Stale Turbopack cache | Delete `.next`, restart |
| `EADDRINUSE` on 4000 | A backend is already running | Kill that PID, or set `PORT` |
| "more than one relationship was found" | Two FKs to the same table | Disambiguate: `users!sender_id(...)` |
| A list silently stops updating | PostgREST `max-rows` truncation | Bound and order the query deliberately |
| Unread badges never clear | Timestamp cursor + clock skew | Use message ids |
| Employee deletion fails | New FK not registered | Add it to `USER_REFERENCES` in `authStore.ts` |
| Mobile offers Check In, server says 409 | Device vs server date string | Known bug; being fixed in phase 8A |

## The backend is not doing what the source says

Check **how it was started**:

```bash
netstat -ano | grep ":4000"
powershell -Command "Get-CimInstance Win32_Process -Filter 'ProcessId=<PID>' | Select -Expand CommandLine"
```

If it says `node dist/index.js`, that is the committed build, which is chronically stale — a running process was once found returning 404 for `/api/website/services`, a route present in both `src` and the on-disk `dist`, because it had loaded an even older build and had no watcher.

Kill it and use `npm run dev` (`tsx watch src/index.ts`).

## The database does not have what I expect

Query it directly rather than inferring from code:

```bash
cd backend && node -e "
require('dotenv').config();
const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
fetch(url+'/rest/v1/<table>?select=*&limit=3',{headers:{apikey:key,Authorization:'Bearer '+key}})
  .then(r=>r.text()).then(console.log);
"
```

A 400 naming a column is proof that column does not exist. Also run `npm run verify:db`.

## Realtime is not delivering

Check in order:

1. Are `NEXT_PUBLIC_SUPABASE_URL` and `_ANON_KEY` set for that app? Without them the client is `null` and both hooks no-op — **no error is logged**.
2. Was the app **rebuilt** after adding them? These are build-time.
3. Is `SUPABASE_SERVICE_ROLE_KEY` set on the backend? The broadcast needs it, and a failed broadcast is only `console.warn`ed so as not to fail a send that succeeded.
4. Is Realtime enabled for the Supabase project?

Symptom is always the same: everything works, 30 seconds late.

## A styling change looks wrong in the portals

The palette is inverted: `bg-white` is dark slate, `text-gray-900` is white, `text-gray-500` is muted. Stock colours like `bg-blue-600` are **not** remapped.

On gold `.color-block` sections, text is `#1A1200`. The standard heading emphasis paints `strong` with a gold gradient, which on gold renders the word invisible — check contrast on anything added to a gold block.

## The build passes but the app is broken

Expected. These have all shipped green:

- PostgREST ambiguous embed — runtime only
- A ref mutated during render — caught by lint, not tsc
- A composer wired to a dead handler — caught by lint
- A search that never fired, because its setter was never called

Run `npx eslint` on changed files, then run the app and look.

## An edit did not take effect

- Backend: `tsx watch` has been observed missing externally-written files. Restart it.
- Frontend: delete `.next`.
- Mobile: restart Metro with a cleared cache.

## Nothing here matches

Reproduce the smallest case, then measure the assumption rather than reading more code. The two hardest bugs in this repo — clock skew and the stale build — both looked like application logic and were neither.
