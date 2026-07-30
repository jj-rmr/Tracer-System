# Tracer System

Graduate tracer study administration and alumni response application built with Next.js 16, Supabase, and Google Drive.

## Local development

1. Install dependencies with `npm install`.
2. Copy the required values into `.env.local`. Environment files are intentionally ignored by Git.
3. Apply the SQL migrations in `supabase/migrations` in filename order.
4. Run `npm run dev` and open `http://localhost:3000`.

Required server configuration:

- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`
- `GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_CLIENT_SECRET`, `GOOGLE_DRIVE_REDIRECT_URI`
- `GOOGLE_DRIVE_REFRESH_TOKEN`, `GOOGLE_DRIVE_ROOT_FOLDER_ID`

Never expose the Supabase secret key, OAuth client secrets, or Drive refresh token through a `NEXT_PUBLIC_` variable.

Authentication consumers use the provider-neutral contract in `lib/auth/types.ts`.
Supabase is the current adapter; a future provider can implement the same
contract without changing protected pages or application authorization logic.

## Supabase Google authentication

1. Apply every SQL migration in `supabase/migrations`, including the
   `auth_accounts` migration.
2. In Supabase Authentication, enable Google and configure the Google client ID
   and secret. Add Supabase's displayed callback URL to the Google OAuth client.
3. In Supabase URL Configuration, set the application Site URL and allow
   `http://localhost:3000/api/auth/google/callback` for local development plus
   the equivalent production callback URL.
4. Existing canonical account profiles are linked to Supabase Auth by verified
   institutional email on first sign-in, preserving ownership of historical
   responses and documents.

The development-only `/api/auth/google-drive` setup flow is deliberately restricted to a loopback hostname. Do not expose it through a tunnel. Store the resulting refresh token in `.env.local`, then restart the server.

## Quality gates

Run these before merging or deploying:

```sh
npm run lint
npm test
npm run format:check
npm run build
npm audit --omit=dev
```

## Security model

- Supabase Auth owns provider sessions. Application roles and stable provider-neutral account IDs are stored in the server-only `auth_accounts` table.
- Every protected page validates the session server-side. API handlers independently validate the user or admin role; the proxy cookie check is only an optimistic navigation guard.
- Supabase is accessed with the server-only service credential. Browser database roles have no application-table grants and RLS remains enabled.
- Alumni response and document access is checked against the authenticated canonical application user ID.
- Uploads are limited to 10 MB, allowed extensions/MIME types, and recognized file signatures.
- Google Drive admin operations are constrained to indexed descendants of the configured Admin Files directory.
- Mutating API requests reject cross-origin browser calls. Coarse per-instance rate limits protect authentication, export, and mutation endpoints; production deployments should add a shared edge/provider rate limiter as well.

## Operations and recovery

- Database migrations are append-only. Test them against a disposable Supabase project before production.
- Google Drive writes are indexed in Supabase. Failed response organization and deletion operations retain retry state instead of silently dropping records.
- Rotate all server credentials immediately if an environment file or build log is exposed.
- Back up Supabase and the configured Drive root before destructive maintenance.
