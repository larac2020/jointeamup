# Connection review + publish readiness

## Connections status

- **Firecrawl** — connected and linked in this workspace. `FIRECRAWL_API_KEY` is present and the connection runs in direct-API mode, which matches `src/lib/competitions.server.ts` (it calls the Firecrawl SDK with that key). No change needed.
- **Lovable Cloud (database, auth, storage)** — project-owned, moves with the project. `SUPABASE_*` values are present in the project env.
- **Lovable AI (`LOVABLE_API_KEY`)** — present, though no app code currently calls it.
- **`REFRESH_COMPETITIONS_SECRET`** — still set. The competitions cron webhook requires it.

No other third-party connector is referenced anywhere in the code, so Firecrawl was the only one that needed relinking.

## What currently blocks publishing

The publish check refuses to ship while error-level security findings are open. There are three, plus two warnings.

1. **Stale finding — server functions bypass RLS** (`server_functions_bypass_rls`, error). Already fixed: the public read functions use the anon-key client in `src/lib/supabase-public.server.ts`, and the owner-scoped ones use `requireSupabaseAuth`. Action: re-run the security scan so this clears, and mark it fixed if it lingers.

2. **Profiles readable by anonymous visitors** (`profiles_anon_public_read`, error) and **listings readable by anonymous visitors** (`listings_anon_public_read`, error). These are the deliberate Option B design: browsing without login, through the anon key, limited to onboarded profiles and active listings with only safe columns projected. Action: mark both as accepted risk with a written justification and record it in security memory so future scans don't reopen them. Alternative, only if the intent has changed: restrict both policies to `authenticated` and require login to browse.

3. **Avatars bucket publicly readable** (warn). Expected — profile images render on public pages via public URLs. Accept, or make the bucket private and serve signed URLs (breaks anonymous browsing of photos).

4. **Critical advisory in TanStack dependencies** (warn) — `seroval` deserialization issue reachable via `@tanstack/react-router`, `@tanstack/react-start`, `@tanstack/router-plugin`. Action: bump those packages to patched versions and confirm the app still builds and routes correctly.

## Follow-up not blocking publish

- The pg_cron job that calls `/api/public/hooks/refresh-competitions` must send the `x-refresh-secret` header, or competition data stops refreshing (401). Worth verifying the job in the database has the header.
- Confirm every content route has its own title/description before going live.

## Proposed order of work

1. Bump the TanStack packages and verify the build.
2. Re-run the security scan.
3. Accept the two anonymous-read findings (or lock them down, if you prefer login-gated browsing) and update security memory.
4. Verify the cron header, then publish.

## Decision needed

Should anonymous browsing stay (accept the two findings) or should profiles and listings require login? Everything else above is straightforward cleanup.
