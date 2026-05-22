# Competition picker with web-sourced names

## Goal
On the post-listing form (and edit form), upgrade the two competition fields:
1. **Competition type** (HYROX, DEKA, …) — add an `Other` option.
2. **Competition name** — replace the free-text input with a searchable dropdown of real 2026 events for the chosen type, scraped from each brand's official calendar, with an "Other / not listed" fallback that records the user's typed name for review.

## How it works

### Data model (new tables)
- `competitions` — cached scraped events
  - `competition_type` (text, e.g. HYROX, DEKA…)
  - `name` (text, e.g. "HYROX Berlin")
  - `event_date` (date, nullable)
  - `location` (text, nullable)
  - `source_url` (text)
  - `year` (int)
  - unique on (competition_type, name, year)
- `competition_sources` — one row per type with the calendar URL + `last_scraped_at`
- `competition_suggestions` — user-submitted "Other" entries pending review
  - `competition_type`, `name`, `submitted_by`, `created_at`

RLS:
- `competitions`, `competition_sources` — readable by authenticated users; writes via admin server fn only.
- `competition_suggestions` — users insert their own; only owner can read theirs.

### Scraping (Firecrawl connector)
- Server function `refreshCompetitions(type)` calls Firecrawl `scrape` with JSON extraction on the brand's calendar page (HYROX, Turf Games, DEKA, CrossFit, Spartan). Each type has a known source URL stored in `competition_sources`.
- `listCompetitions(type)` server fn returns cached rows; if `last_scraped_at` for that type is older than 7 days, it triggers a background refresh and still returns current cache.
- A `pg_cron` weekly job calls `/api/public/hooks/refresh-competitions` to refresh all types.

### Form UX changes (`/listings/new` and `/listings/$id/edit`)
- Competition type select gains `Other`.
- Competition name becomes a combobox (search input + dropdown of scraped names for the chosen type). Last item: "+ Other competition not listed".
- When `Other` (type) or "not listed" (name) is chosen, a free text input appears and on submit the entry is also stored in `competition_suggestions`.

## Technical notes
- Firecrawl is not yet linked — I'll prompt to connect it before writing scraping code.
- Source URLs (initial seed):
  - HYROX → `hyrox.com/find-my-race/`
  - DEKA → `dekafit.com/events`
  - Turf Games → `turfgames.com/events`
  - CrossFit (Semifinals/Open events) → `games.crossfit.com/schedule`
  - Spartan → `spartan.com/en/race/find-race`
- Scraper uses Firecrawl JSON extraction (`{ events: [{ name, date, location }] }`) so the schema stays consistent across sources.
- Search/filter in the dropdown is client-side over the cached list (typically <500 rows per type).
- Server fns: `listCompetitions`, `refreshCompetitions` (admin), `suggestCompetition`.
- Add `"Other"` to `competitionTypes` in `src/lib/types.ts`.

## Files touched
- New: migration for 3 tables + RLS, `src/lib/competitions.functions.ts`, `src/lib/competitions.server.ts`, `src/components/CompetitionPicker.tsx`, `src/routes/api/public/hooks/refresh-competitions.ts`.
- Edited: `src/lib/types.ts`, `src/routes/listings.new.tsx`, `src/routes/listings.$id.edit.tsx`.
- Cron job inserted via insert tool.

## Open dependency
Firecrawl connector must be linked first — I'll trigger the connect flow at the start of implementation.