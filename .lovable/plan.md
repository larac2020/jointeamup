Add **Relay** as a fourth format option alongside Individual, Doubles, Team.

## Changes
1. **DB migration**: `ALTER TYPE public.format_type ADD VALUE 'Relay';`
2. **`src/lib/types.ts`**: extend `Format` union and `formats` array with `"Relay"`.
3. **`src/lib/listings.functions.ts`**: add `"Relay"` to both `z.enum([...])` for `format` (filter + create schemas).

No UI changes needed — `listings.new.tsx`, `listings.$id.edit.tsx`, and `feed.tsx` already iterate `formats` to render the dropdown.