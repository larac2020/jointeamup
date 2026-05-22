## Goal

Make the skill-level options depend on the competition type, since each brand uses different category names (HYROX = Open/Pro, CrossFit = RX/Scaled, etc.) instead of the generic Beginner→Elite scale used everywhere today.

## Proposed per-type levels

- **HYROX**: Open, Pro
- **CrossFit**: Scaled, RX, Elite
- **DEKA**: Fit, Strong, Elite
- **Turf Games**: Open, Elite
- **Spartan**: Open, Age Group, Elite
- **Other**: Open (single neutral default)

(Easy to tweak — tell me if you want different labels.)

## Changes

### 1. Database
- Drop the restrictive `skill_level` Postgres enum and change `listings.skill_level` to plain `text` (validation moves to the app). This keeps history intact (`Beginner/Intermediate/...` rows stay readable) and lets us add new brand-specific values without future migrations.

### 2. Shared config (`src/lib/types.ts`)
- Replace the single `skillLevels` array with a `skillLevelsByType: Record<CompetitionType, string[]>` map plus a helper `getSkillLevels(type)` that falls back to a default list for unknown types.
- `SkillLevel` becomes `string` (validated against the map at the form layer).

### 3. Forms — `listings.new.tsx` and `listings.$id.edit.tsx`
- The skill-level `<select>` is driven by `getSkillLevels(form.competition_type)`.
- When the user changes competition type, reset `skill_level` to the first option of the new list (prevents invalid combos like HYROX + Intermediate).
- Server validators in `listings.functions.ts` switch from `z.enum([...])` to `z.string().min(1)` (per-type whitelist enforced in the handler against the same map).

### 4. Browse filters — `feed.tsx`
- Skill-level filter becomes context-aware: shown only when a competition type filter is active, listing that type's levels. When no type is selected, hide the skill-level filter (or show "All levels" only) to avoid meaningless cross-brand options.

### 5. Display
- `ListingCard` and `/listings/:id` already render `skill_level` as a string — no change beyond the DB type widening.

## Out of scope
- Migrating existing rows to new labels (e.g. rewriting "Intermediate" HYROX listings to "Open"). Existing rows keep their current label until the owner edits the listing.
- Changing the profile experience field (still uses the generic scale).

Confirm the per-type label lists above and I'll implement.