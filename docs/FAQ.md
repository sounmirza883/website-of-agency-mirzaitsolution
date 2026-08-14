# FAQ

**Why is there no root `npm install`?**
Each app is an independent project with its own `package.json` and `node_modules`. Not a workspace. Install in each app you intend to run.

**Why is admin and employee code duplicated?**
No shared package, by decision — the surfaces deploy separately and evolve at different speeds. The cost is that shared changes are made two or three times. See [DECISIONS.md](DECISIONS.md).

**Why does `bg-white` render dark?**
The portals remap Tailwind's colour scale in a `@theme` block. `bg-white` is `#1E293B`, `text-gray-900` is white. See [DESIGN.md](DESIGN.md).

**Why can't I run migrations from code?**
DDL cannot go through the Supabase REST client, which is all the app has. `migrate.sql` must be run by hand in the SQL Editor. It is idempotent.

**Why are dates stored as strings like `"Aug 14, 2026"`?**
Early convenience, now a known mistake. It means times cannot be sorted, compared or summed, and hours worked are not computable. New time-bearing features add real `TIMESTAMPTZ` columns and dual-write.

**Why doesn't the API use WebSockets?**
It is Vercel serverless and cannot hold a socket open. The browser connects to Supabase Realtime directly; the API pokes it over HTTP. See [ARCHITECTURE.md](ARCHITECTURE.md).

**Why do broadcasts only carry an id?**
The anon key is public and this app does not use Supabase Auth, so RLS cannot identify users — anyone who guesses a topic can listen. An id leaks nothing; content is fetched over the authenticated API.

**Chat works but is slow. Why?**
`NEXT_PUBLIC_SUPABASE_*` is missing or the app was not rebuilt after adding it. It falls back to 30-second polling with no error.

**Why is the client's progress bar always 0%?**
`admin_projects.progress` has never been written to. The bar is real; the number is not. Phase 5B fixes it.

**Can an admin assign a task to an employee?**
Not today. There is no admin task endpoint at all — employees create their own tasks and the admin cannot see them. This is the main gap the current work closes.

**Why can't a client mark their own invoice paid?**
Deliberate. They upload proof, an admin verifies it. Self-declaration is not evidence.

**Where do uploaded files go?**
One private bucket, `project-files`, including chat attachments under `chat/<conversationId>/`. Served as 1-hour signed URLs.

**Why do uploads return 503?**
`SUPABASE_SERVICE_ROLE_KEY` is not set. Everything else works without it, which makes this easy to misdiagnose.

**What is the default login?**
`admin@mirzaitsolution.com` / `ChangeMe123!`, seeded by `migrate.sql`. **The hash is committed to the repo — change it immediately.**

**Are there tests?**
No framework of any kind. Verification is `npm run build` (which is the typecheck), `npx eslint`, and manual probing. See [TESTING.md](TESTING.md).

**Why is `any` everywhere in `queries.ts`?**
Established convention. Do not "fix" it as a side quest.

**Why is `backend/node_modules` in git?**
It should not be. ~1500 tracked files; it bloats clones and once caused an oversized EAS upload. `git rm -r --cached backend/node_modules` would clear it.

**Which branch do I work on?**
Feature branches. `main` auto-deploys every surface, so treat a push to it as a release.

**Why can't I sideload the production APK?**
The `production` EAS profile builds an `.aab` for the Play Store. Use `--profile preview` for an installable APK.

**Why does the mobile app need a dev build?**
It uses native modules — `expo-secure-store`, image and document pickers, `@expo/ui`. Expo Go cannot load them.

**Why do the AGENTS.md files keep changing?**
`next dev` writes and re-adds its own rules block. Deleting it from a diff just recreates it. Commit it with your work.
