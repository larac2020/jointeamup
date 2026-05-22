Make the listing description optional.

## Changes
1. **`src/lib/listings.functions.ts`** — change `description: z.string().min(10).max(2000)` to `z.string().max(2000).optional().default("")` in `createSchema` (also covers `updateSchema` via `.extend`).
2. **`src/routes/listings.new.tsx`** — remove `required` and `minLength={10}` from the description `<textarea>`; update the field label to "Description (optional)".
3. **`src/routes/listings.$id.edit.tsx`** — same: remove `required` and `minLength={10}`; label "Description (optional)".
4. **`src/routes/listings.$id.tsx`** — only render the description `<p>` when `listing.description` is non-empty.

No DB migration: the `description` column stays NOT NULL and we store `""` when omitted (matches existing default in form state).