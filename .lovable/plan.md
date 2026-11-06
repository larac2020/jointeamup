# Competition refresh hardening + shared event list

## Current state (checked)
- Cron job `refresh-competitions-weekly` (Mon 03:00) posts to the `project--...` URL with no `x-refresh-secret` header.
- Upcoming events per source: HYROX 118 (scraped today 10:02 via the picker's background refresh), Spartan 56, **DEKA 0, Turf Games 0, CrossFit 0** — all three last scraped 3 Aug, `last_error` empty. Their scrapes ran without errors but found nothing usable.
- **No email domain is set up**, so the app can't send alert emails yet (see "Needs your input").

## Part A — Weekly refresh

1. **Keys and auth.** The endpoint and `refreshType` use the generated admin client, which picks up the new secret key at runtime. The "Legacy API keys are disabled" error comes from the published build still using the old key, so republishing fixes it; I'll check this after publishing. The endpoint keeps requiring `x-refresh-secret` and compares it in constant time. The cron job is rescheduled to call `https://jointeamup.lovable.app/api/public/hooks/refresh-competitions` with the header. The secret value is read from Vault in the cron SQL so it never appears in the migration.
2. **Per-source results.** New columns on `competition_sources`: `last_success_at`, `last_attempt_at`, `last_found`, `last_added`, `last_upcoming`. `last_scraped_at` is set only on success, and `last_error` is filled on failure. A source that returns 0 upcoming events counts as "empty", not success.
3. **Alerting.** After each run, build a list of problems: a source failed, returned 0 upcoming events, or `last_success_at` is older than 8 days. If the list isn't empty, send one summary email to lara.cuttini@gmail.com through Lovable app emails, using a template called `refresh-alert`. A deduplication key per run date stops repeat emails. The emails need a sender domain first. Until one exists, problems are still saved in the database and shown on the admin page.
4. **Fault tolerance.** Each source runs on its own with a time limit (about 60s) and its own error handling. Sources run in parallel, so one failing site can't block the others.
5. **Admin "Run refresh now".** New `user_roles` table plus a `has_role()` function, following the standard pattern; you are the only admin. A new `/admin/competitions` page (signed-in only) shows each source's status and has a "Run refresh now" button. The button calls a server function that checks your session, confirms the admin role, then runs the same refresh.
6. **Source reliability, and fallbacks:**
   - **HYROX:** reliable.
   - **Spartan:** reliable.
   - **DEKA:** 0 events. The page loads events with JavaScript, so it likely needs Firecrawl's wait-for-content setting or the regional event pages. If that still fails, fall back to the events listed on the DEKA page of hyrox.com.
   - **Turf Games:** 0 events. Try `turfgames.com/events` with page actions and scrolling. Otherwise, use their ticketing pages, for example on Eventbrite or Ticket Tailor, if those list the events.
   - **CrossFit:** `games.crossfit.com/schedule` only lists the season stages. Better options are the CrossFit Games "Sanctioned events" page, or treating CrossFit as user-created events only.
   - I'll test each fix in a one-off run and report which sources actually work.

## Part B — One shared event list

1. **Schema.** Add to `competitions`:
   - `source` (`official` or `user`, default `official`), `created_by uuid`, and `normalized_name`, kept up to date by a trigger.
   - `city`, taken from location.
   - `merged_into uuid`.
   - A trigram index on `normalized_name` (enable `pg_trgm` in the `extensions` schema).

   Add `listings.competition_id` (nullable, references `competitions`, set to null on delete). The existing `competition` text column stays as a display copy.
2. **Backfill.** For each existing listing, find a competition of the same type with similarity ≥ 0.6, the same city and a date within ±7 days, and link it. If none matches, create a `user` competition from the listing (`created_by` = author).
3. **Name normalisation**, done in SQL by `normalize_competition_name()`:
   - Lowercase the name and remove accents and punctuation.
   - Join brand variants, for example "turf games" and "turfgames", "hyrox" and "hy rox", "spartan race".
   - Remove filler words (winter, summer, spring, autumn, edition, years, "the") and remove dates and digits.
4. **Matching.** `match_competitions(type, name, city, date)` is a fast `SECURITY INVOKER` function. It returns up to 3 rows with similarity above about 0.35, a matching city or no city given, and a date within ±7 days. It also returns name, city, date and number of active listings, ordered by score. It is never used to merge anything automatically.
5. **Post form.** When you type a new name and leave the field, or press save, the app calls `findCompetitionMatches`. A "Did you mean …?" box shows up to 3 matches; tapping one sets `competition_id`. "None of these — create new" calls `createUserCompetition`, which creates the event with source `user`. Saving a listing requires a `competition_id`. Picking from the list already sets one. The edit form works the same way.
6. **Feed.** Filters and search use `competition_id`: a competition filter picks one event and shows every listing for it. Listings are grouped under an event heading on the feed, with a count.
7. **Admin merge.** On `/admin/competitions`, you pick the event to keep and the duplicate. `merge_competitions(keep, dup)` is admin-only (it checks `has_role`). It moves listings, sets `dup.merged_into`, and hides the duplicate from the picker.
8. **Access rules.**
   - `competitions`: signed-in users can read. Signed-in users can create rows only where `source = 'user'` and `created_by = auth.uid()`. Only admins can edit or delete. Official rows are written only by the server refresh.
   - `user_roles`: users can read their own role. No one can write to it through the app.

## Files
- **Changed:**
  - `src/lib/competitions.server.ts`: per-source results, time limits, running sources side by side, alert step.
  - `src/routes/api/public/hooks/refresh-competitions.ts`
  - `src/lib/competitions.functions.ts`: match/create functions and admin run/merge.
  - `src/components/CompetitionPicker.tsx`: returns an id and shows "Did you mean".
  - `src/routes/_authenticated/listings.new.tsx` and `listings.$id.edit.tsx`
  - `src/lib/listings.functions.ts`: `competition_id` in create, update, list and filter.
  - `src/routes/feed.tsx`: grouping and competition filter.
  - `src/components/Header.tsx`: admin link for admins only.
- **New:**
  - `src/routes/_authenticated/admin.competitions.tsx`
  - `src/lib/admin.functions.ts`
  - Email alert template, plus email setup files once the domain exists.
  - Tests for name normalisation and the ±7-day rule, next to the existing tests.
- **Database:** one migration for roles and competitions changes, one for listings changes and the backfill. The cron job is rescheduled separately, outside migrations.

## Needs your input
1. **Email domain:** alert emails need a domain you own as the sender, for example notify.yourdomain.com. Do you have one? If not, alerts will only appear on the admin page for now.
2. **Sources:** keep all five? For CrossFit, should I try the "Sanctioned events" page, or make it user-created only?
3. **Admin account:** confirm that lara.cuttini@gmail.com is the account you sign in with, so it gets the admin role.
4. **Publishing:** the refresh fix only takes effect once you publish.
