# Testing

## There is no test framework

No Jest, no Vitest, no Playwright, no test files anywhere in any of the five apps. Adding one is a real option, but until then verification is manual and deliberate, and it must be stated honestly.

**Compiling is not evidence of working.** Several real bugs here passed the build: the PostgREST ambiguous-embed failure, the ref mutated during render, the composer wired to a dead handler, the message search that never fired.

## What verification means here

### 1. Build — this is the typecheck

```bash
cd frontend/<app> && npm run build     # Next.js: compiles + runs TypeScript
cd backend && npm run build            # tsc
cd app && npx tsc --noEmit             # mobile has no build script
```

There is no separate typecheck command. Run this before every commit.

### 2. Lint — it catches real defects here

```bash
npx eslint <changed files>
cd app && npx expo lint
```

Not style. It has found: a ref mutated during render (forbidden under concurrent rendering), a composer wired to a handler that no longer existed, and an unused setter that revealed admin message search had never worked.

`@typescript-eslint/no-explicit-any` fires constantly — `any` is the established convention in `queries.ts`. Distinguish pre-existing noise from what your change introduced; naming the pre-existing ones is part of the report.

### 3. API probes with a real token

```bash
TOKEN=$(curl -s -X POST localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@mirzaitsolution.com","password":"..."}' | jq -r .token)

curl -s -o /dev/null -w '%{http_code}\n' localhost:4000/api/admin/users -H "Authorization: Bearer $TOKEN"
```

**Always probe the negative cases**, not only the happy path:

- another tenant's row → 403 or empty, never their data
- no token → 401
- wrong role → 403
- duplicate action → 409
- missing required field → 400

### 4. Run it and look

For UI, start the servers and open the page. There is no substitute — contrast bugs, invisible text and broken layout do not show up in a build.

```bash
cd backend && npm run dev
cd frontend/admin && npm run dev -- -p 3001
cd frontend/employee && npm run dev -- -p 3002
```

Use `npm run dev`, never `node dist/index.js` — the committed `dist` is chronically stale and has been caught serving 404s for routes that exist in source.

## Verifying against the database

The Supabase JS client can be driven from a script for direct checks:

```bash
cd backend && node -e "
require('dotenv').config();
const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
fetch(url+'/rest/v1/<table>?select=*&limit=5',{headers:{apikey:key,Authorization:'Bearer '+key}})
  .then(r=>r.text()).then(console.log);
"
```

This is how the missing `budget` column was confirmed rather than assumed. DDL still cannot run this way.

`npm run verify:db` checks the expected tables and the storage bucket.

## Measure, do not guess

Two bugs here were only solved by measuring:

- **Clock skew** — unread badges never cleared. Comparing Postgres `now()` against the Node clock showed Postgres roughly 2 seconds ahead, which kept a timestamp comparison permanently true.
- **Stale build** — a route 404'd while existing in both `src` and the on-disk `dist`. Probing the live server proved the process had loaded an older build.

When behaviour contradicts the code, measure the assumption before rewriting anything.

## Testing a migration

1. Read the current state — query the table and see what columns actually exist
2. Apply `migrate.sql` in the Supabase SQL Editor
3. Re-query and confirm the change landed
4. Probe an endpoint that uses the new columns
5. For a public path, confirm the pre-migration fallback also works — the contact form was verified against an un-migrated database to prove a pending migration could not lose a real enquiry

## Reporting

State what you verified and what you did not. "Builds clean; I could not test the native date picker because there is no device in this environment" is useful. "Done" is not.
