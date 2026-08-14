# Deployment

Each surface deploys separately on Vercel. Pushing to `main` auto-deploys all of them.

| Surface | Domain |
|---|---|
| API | `backend.vesseldrop.com` |
| Website | `agency.vesseldrop.com` |
| Admin | `admin.vesseldrop.com` |
| Client | `client.vesseldrop.com` |
| Employee | `employee.vesseldrop.com` |

## Environment variables

| Project | Variables |
|---|---|
| Backend | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET` |
| Every frontend | `NEXT_PUBLIC_API_URL` |
| Admin + Employee also | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

`NEXT_PUBLIC_*` is compiled into the bundle at build time. Changing one requires a **redeploy**, not a restart.

Missing the two `NEXT_PUBLIC_SUPABASE_*` values is a silent failure: chat still works, just 30 seconds behind. Nobody reports it as a bug.

## Checklist

1. **Run `migrate.sql` against production first**, before deploying code that depends on new columns.
2. Confirm the `project-files` bucket exists and is private.
3. Confirm `JWT_SECRET` is set — without it, every deploy logs all users out.
4. Push to `main`.

## The backend is serverless

Vercel functions cannot hold a WebSocket, cannot run background work, and have no persistent memory between invocations. Two consequences:

- Realtime goes browser → Supabase directly; the API only pokes it over HTTP. See [ARCHITECTURE.md](ARCHITECTURE.md).
- An unhandled promise rejection kills the invocation and the caller just hangs with no response. Wrap async handlers in `asyncHandler`.

`backend/dist` is committed and `vercel-build` skips `tsc` (`@vercel/node` compiles). The committed `dist` is frequently stale relative to `src` — do not rely on it as a source of truth.

## Android APK

Built with EAS; no Android Studio or JDK needed locally.

```bash
npm install --global eas-cli
cd app
eas login
eas build --platform android --profile preview
```

Use **`--profile preview`**: `distribution: internal` + `buildType: apk` gives an installable file. The `production` profile builds an `.aab` for the Play Store, which **cannot be sideloaded**.

Takes ~15–20 minutes; output is a download URL and QR code.

The root **`.easignore` is load-bearing.** EAS archives from the repo root, so without it the upload balloons to ~1.1 GB (backend plus four web apps plus every `node_modules`) and fails. With it, ~13 MB.

The mobile app points at `extra.apiUrl` in `app.json` — edit that to change environments, then rebuild.

## Rollback

Vercel keeps previous deployments; promote an earlier one from the dashboard.

**Schema changes do not roll back.** `migrate.sql` only adds, and additive changes are backward compatible — old code ignores new columns. Never write a migration that drops or renames a column still referenced by deployed code.
