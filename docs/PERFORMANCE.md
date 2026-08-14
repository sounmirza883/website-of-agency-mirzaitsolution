# Performance

## The silent one: PostgREST truncation

`max-rows` — commonly 1000 on hosted Supabase — caps an unbounded select **without returning an error**. Combined with `order(..., { ascending: true })`, the query quietly returns the *oldest* rows.

A sidebar built that way freezes on ancient history and looks like a caching bug. Always order deliberately and bound the query.

## Keyset pagination

Chat history uses keyset pagination over the `(conversation_id, id)` index — not `OFFSET`, which degrades as it counts past skipped rows:

```ts
.lt("id", cursor).order("id", { ascending: false }).limit(PAGE_SIZE + 1)
```

Fetch one extra row to know whether more exist without a second count query. This is the repo's first pagination and the pattern to copy.

## Batch external calls

`attachSignedUrls` originally made one Storage API call **per attachment** via `Promise.all` — a thread with 300 attachments meant 300 concurrent calls on every poll and every received message. It now uses `createSignedUrls` (plural) once, for the page being rendered. Pagination is what keeps that bounded.

The rule generalises: if a helper takes a list, do not call the singular version in a loop.

## Push aggregation into the database

The chat sidebar used to pull the **full history of every conversation you belong to**, including every message body, purely to compute unread counts and previews in JavaScript. Twenty conversations of five hundred messages is ten thousand rows and several megabytes, on every sidebar load, every poll and every realtime invalidation.

It is now one RPC, `chat_conversation_summary(p_user_id)`, returning `(conversation_id, unread, mentioned, preview_text, newest_id)`.

Two things to know if you write a similar function:

- `RETURNS TABLE` output column names **shadow real columns**. Name outputs distinctly (`conv_id`, not `conversation_id`) or your `WHERE` clauses silently refer to the output.
- Derived values computed in the same loop must move into the RPC together — the mention flag could not be split from the unread count.

## Realtime instead of polling

Chat polls at 30 seconds as a fallback, not as the delivery mechanism. Realtime carries the actual latency. Where polling is still the mechanism — project chat at 5 seconds — every open tab is a request every five seconds per user.

## Indexes that exist

- `chat_messages (conversation_id, id)` — pagination
- `chat_members (user_id)` — conversation lookup
- `chat_reactions (message_id)` — reaction grouping
- `chat_messages` GIN trigram on `text` — search; **optional and currently unapplied**. Search is correct without it and degrades with volume.

## Frontend cost

`staleTime: 1000 * 60 * 5` on CRUD lists. Mutations invalidate rather than refetch.

The message thread renders the whole array into the DOM with no virtualisation — pagination bounds it for now. `MessageBody` is memoised because it re-scans each message string and re-sorts members on every render.

Optimistic updates are used where latency is visible — drag-and-drop status changes apply immediately and roll back on error (`useUpdateTaskStatus`).

## Bundle and build

`NEXT_PUBLIC_*` is inlined at build time. The mobile EAS upload depends on the root `.easignore` — without it the archive is ~1.1 GB and fails; with it, ~13 MB.

## Not measured

No profiling has been done, no APM, no bundle analysis, no query timing in production. The items above are structural — problems found by reading and reasoning, or by a specific failure. Real measurement would likely surface different priorities.
