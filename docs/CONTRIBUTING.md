# Contributing

## Before you start

Read [AI_CONTEXT.md](AI_CONTEXT.md) for the shape of the system and [MEMORY.md](MEMORY.md) for the traps. Both are short and each entry in MEMORY cost real debugging time.

## Branches

Work on a feature branch. **`main` auto-deploys every surface**, so a push to it is a release.

Current branches: `main`, `v1`, `v2` (scheduling work).

## The loop

1. Branch
2. Change
3. `npm run build` in **each app you touched** — this is the typecheck; there is no separate script
4. `npx eslint` on changed files
5. Run it and look, if there is UI
6. Commit with the reasoning in the message
7. Push only when asked

## Commits

```
type(scope): summary in the imperative

Why this change exists, and anything that would surprise someone
reading it later.
```

Types: `feat`, `fix`, `chore`, `docs`, `perf`. Scope is the app or subsystem — `admin`, `employee`, `client`, `website`, `mobile`, `chat`, `db`.

The body matters more than the subject. Good examples in this repo explain a constraint rather than restate the diff — why realtime bypasses the API, why the contact form has a fallback, why message ids replaced timestamps.

**Mention anything the reader would otherwise discover the hard way**: a required migration, a fixed bug that was out of scope, a side effect on another app.

## Code style

**Match the file you are in.** It is terse — one-line JSX, dense components, comments only where the reason is non-obvious. Do not reformat code you did not otherwise need to change; it buries the real diff.

**Comments explain why, not what.** If a line needs a comment to say what it does, rename something instead.

**Do not fix unrelated things silently.** Mention them. Fix them only if small and adjacent, and say so in the commit.

## Things to know before your first change

**No shared package.** `Field`, `auth.tsx` and `realtime.ts` are duplicated per app. A shared change is two or three edits.

**The portal palette is inverted.** `bg-white` is dark slate. See [DESIGN.md](DESIGN.md).

**No design system.** Copy the canonical markup in [COMPONENTS.md](COMPONENTS.md) rather than inventing a variant.

**`any` in `queries.ts` is deliberate.** Leave it.

**Schema changes are manual.** DDL cannot go through the REST client. Add to `migrate.sql` idempotently, register new `users(id)` FKs in `authStore.ts`, add the table to `verify.ts`, and **tell the user to run it**.

**Express 4 does not catch async errors.** Wrap handlers in `asyncHandler` or a throw kills the process.

## Adding an endpoint

```ts
router.get("/thing", requireAuth, requireRole("admin"), asyncHandler(async (req: AuthedRequest, res) => {
  if (!supabase) return res.json([]);                       // 503 on writes
  const { data, error } = await supabase
    .from("things")
    .select("id,createdAt:created_at")                       // alias camelCase
    .eq("owner_id", req.user!.id);                           // scope from the token
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
}));
```

Then add the query function to each portal's `queries.ts`, a hook to `hooks.ts`, and the route to [API.md](API.md).

## Adding a shared component

Add it to `components.tsx` in **each** portal that needs it, and document it in [COMPONENTS.md](COMPONENTS.md). Mobile components go in `app/src/components/`.

## Documentation

If you change behaviour, update the doc that describes it **in the same commit**. A wrong document is worse than a missing one.

State facts with a file reference so they can be checked rather than trusted.

## Reporting your work

Say what you verified and what you did not. "Builds clean; I could not test the native picker without a device" is useful. "Done" is not — the build has passed on genuinely broken code more than once.
