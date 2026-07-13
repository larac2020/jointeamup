
# Secure public browsing (Option B)

Keep listings and profiles browsable without login, but stop leaking full PII by routing all public reads through the anon key + narrow RLS policies that only expose safe columns. Kill the unauthenticated admin-client bypass.

## 1. Database migration — narrow public read policies

**`profiles` table**
- Drop any broad `TO authenticated`/`TO anon` SELECT policy that returns all columns.
- Add a `TO anon, authenticated` SELECT policy limited to onboarded profiles (`onboarded = true`).
- Since Postgres RLS is row-level (not column-level), we enforce column safety in the server layer (step 2) by projecting only safe columns. RLS ensures only onboarded rows are visible.
- Keep the existing owner-scoped policy so users can read/edit their own full profile via `requireSupabaseAuth`.

**`listings` table**
- Add a `TO anon, authenticated` SELECT policy for `is_active = true` rows.
- Keep owner policy for `/listings/mine` (read own inactive/expired).

**Sensitive tables stay locked**: `messages`, `conversations`, `notifications`, `user_consents`, `competition_suggestions` — no anon access.

**GRANTs**: `GRANT SELECT ON public.profiles, public.listings TO anon;`

## 2. Rewrite public server functions to use publishable client + safe columns

In `src/lib/listings.functions.ts` and `src/lib/profiles.functions.ts`:

- Replace `supabaseAdmin` with a per-handler publishable-key client (anon role). This makes RLS apply — anon can only see the columns/rows the policy allows, and even a leaked direct RPC call cannot return more than the safe projection.
- Explicitly `.select()` only **safe public columns**:
  - **Profile public columns**: `id, first_name, nickname, avatar_url, lives_in, sports, gyms, competitions, prs, superpower, kryptonite, bio, experience, looking_for, photos, age`
  - **Profile private columns (never returned to anon)**: `from_location` (precise "from" location), `onboarded`, timestamps
  - **Listing public columns**: all existing columns are already fine to show publicly (competition, date, location, description, author_id)
  - **AuthorBrief** on listings: same safe subset as profile above
- Affected functions: `listListings`, `getListing`, `listListingsByAuthor`, `getProfile`, `listProfiles`.
- Owner-only functions (`listMyListings`, `updateProfile`, `updateListing`, `deactivateListing`, `reactivateListing`) already use `requireSupabaseAuth` — leave as is.

Include the `sb_` publishable-key fetch shim (strip default `Authorization` bearer, set `apikey` header) per server-functions-modern knowledge, since Lovable Cloud may issue opaque keys.

## 3. Lock down the competitions refresh webhook

`src/routes/api/public/hooks/refresh-competitions.ts` currently lets anyone trigger paid Firecrawl scraping.

- Add a `REFRESH_COMPETITIONS_SECRET` server secret (generated).
- Handler checks `x-refresh-secret` header (timing-safe compare) before running; returns 401 otherwise.
- Update the pg_cron job to send the header.

## 4. Address remaining scanner warnings

- **Public storage bucket listing** (`avatars`): tighten `storage.objects` SELECT policy so anon can only SELECT individual objects by path, not list the entire bucket. Reads by URL still work.
- **SECURITY DEFINER executable by authenticated**: review `has_role`-style helpers (`wants_notification`, `is_user_contactable`, `handle_new_user`, `on_message_insert`, `touch_updated_at`). Trigger functions don't need EXECUTE for anyone; revoke EXECUTE from `PUBLIC`/`authenticated` on non-RPC definer functions.

## What stays working

- Anonymous visitors can still browse `/feed`, view listing detail, and view a profile — but only the safe subset (no precise "from" location, no non-onboarded profiles, no inactive listings).
- Signed-in flows (`/profile/edit`, `/listings/mine`, messaging, etc.) are unchanged — they use `requireSupabaseAuth` and see full data via RLS as the owner.
- Direct RPC scraping of the public endpoints now returns only what a browser visitor would already see, capped by RLS.

## Verification

- Run the Supabase linter after the migration.
- Hit `listListings` / `getProfile` with no bearer token → confirm only safe columns come back.
- Hit refresh-competitions without the secret → 401.
- Mark the two `agent_security` findings as fixed once verified.
