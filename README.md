# Tracer System

Graduate tracer study administration and alumni response application built with Next.js 16, Appwrite, Supabase, and Google Drive.

## Local development

1. Install dependencies with `npm install`.
2. Copy the required values into `.env.local`. Environment files are intentionally ignored by Git.
3. Apply the SQL migrations in `supabase/migrations` in filename order.
4. Run `npm run dev` and open `http://localhost:3000`.

Required server configuration:

- `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`
- `SUPABASE_URL`, `SUPABASE_SECRET_KEY`
- `GOOGLE_SIGN_IN_CLIENT_ID`, `GOOGLE_SIGN_IN_CLIENT_SECRET`, `GOOGLE_SIGN_IN_REDIRECT_URI`
- `GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_CLIENT_SECRET`, `GOOGLE_DRIVE_REDIRECT_URI`
- `GOOGLE_DRIVE_REFRESH_TOKEN`, `GOOGLE_DRIVE_ROOT_FOLDER_ID`

Never expose the Appwrite API key, Supabase secret key, OAuth client secrets, or Drive refresh token through a `NEXT_PUBLIC_` variable.

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

- Appwrite owns user sessions and roles. The session cookie is HTTP-only, secure in production, and same-site.
- Every protected page validates the session server-side. API handlers independently validate the user or admin role; the proxy cookie check is only an optimistic navigation guard.
- Supabase is accessed with the server-only service credential. Browser database roles have no application-table grants and RLS remains enabled.
- Alumni response and document access is checked against the authenticated Appwrite user ID.
- Uploads are limited to 10 MB, allowed extensions/MIME types, and recognized file signatures.
- Google Drive admin operations are constrained to indexed descendants of the configured Admin Files directory.
- Mutating API requests reject cross-origin browser calls. Coarse per-instance rate limits protect authentication, export, and mutation endpoints; production deployments should add a shared edge/provider rate limiter as well.

## Operations and recovery

- Database migrations are append-only. Test them against a disposable Supabase project before production.
- Google Drive writes are indexed in Supabase. Failed response organization and deletion operations retain retry state instead of silently dropping records.
- Rotate all server credentials immediately if an environment file or build log is exposed.
- Back up Supabase and the configured Drive root before destructive maintenance.
