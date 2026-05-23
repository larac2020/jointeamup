## Goal

Replace the three separate fields (Gender, Format, Skill level) with **one Category dropdown** per sport. The category encodes everything in a single human-readable label like `Doubles W Pro` or `RX Men`.

## Categories per sport

Based on the official divisions each series actually runs:

**HYROX**
- Mixed (Relay-style mixed event)
- W Open · W Pro · M Open · M Pro
- Doubles W Open · Doubles W Pro · Doubles M Open · Doubles M Pro · Doubles Mixed
- Relay Women · Relay Men · Relay Mixed

**CrossFit**
- RX Men · RX Women
- Scaled Men · Scaled Women
- Masters Men · Masters Women · Teens
- Team RX · Team Scaled · Team Mixed

**DEKA** (covers FIT / STRONG / MILE — chosen via the existing Competition picker)
- Solo Open Men · Solo Open Women
- Solo Pro Men · Solo Pro Women
- Doubles Men · Doubles Women · Doubles Mixed
- Team / Relay

**Turf Games**
- Solo Men · Solo Women
- Pairs Men · Pairs Women · Pairs Mixed
- Team

**Spartan**
- Open Men · Open Women
- Age Group Men · Age Group Women
- Elite Men · Elite Women
- Team / Hurricane Heat

**Other**
- Individual Men · Individual Women · Individual Mixed
- Team / Pairs / Relay

## Technical approach

No DB migration. Keep the existing `gender`, `format`, `skill_level` columns and treat them as a derived tuple of the chosen category — this preserves existing listings and filters that already use those columns.

1. `src/lib/types.ts`
   - Add a `Category` type: `{ label: string; format: Format; gender: Gender; skill_level: string }`.
   - Add `categoriesByType: Record<string, Category[]>` with the lists above.
   - Add helpers `getCategories(competitionType)` and `findCategory({format, gender, skill_level}, competitionType)` to round-trip between stored values and a label.
   - Keep `formats`, `genders`, `getSkillLevels`, `skillLevelsByType` exported for back-compat but mark deprecated.

2. `src/routes/listings.new.tsx` and `src/routes/listings.$id.edit.tsx`
   - Remove the Gender, Format, Skill level selects.
   - Add one **Category** select populated from `getCategories(competition_type)`.
   - On submit, expand the selected category into `format` / `gender` / `skill_level` before calling the server fn.
   - On edit, preselect by calling `findCategory(...)` against the loaded row.

3. `src/components/ListingCard.tsx` and `src/routes/listings.$id.tsx`
   - Replace the three separate badges/lines with a single Category badge using `findCategory(...).label` (fallback to a composed string if no exact match — keeps old data readable).

4. `src/routes/feed.tsx` (filters)
   - Replace the Gender / Format / Skill filters with one **Category** multi-select that lists categories for the currently selected competition type (and shows the union across sports when "All sports" is selected).
   - Server filter: translate the selected categories back into `(format, gender, skill_level)` tuples and `.or(...)` them.

5. `src/lib/listings.functions.ts`
   - Update the list/search input validator + query builder to accept `categories: string[]` and expand each into a tuple filter. Keep the existing per-field filters as a fallback so deep links still work.

6. `src/routes/listings.mine.tsx`
   - Update the inline display to use the new Category badge (purely presentational).

No backend / RLS changes. Existing dummy listings continue to render correctly because the three columns remain populated.

## Out of scope

- Migrating historical rows that don't exactly match a new preset (they'll display via the composed fallback label).
- Scraping live competition sites — the divisions above are based on each series' published official categories.
