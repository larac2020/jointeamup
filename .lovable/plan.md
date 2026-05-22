Dedicated "My listings" page with inline manage actions, linked from header and profile.

## Route
- New file `src/routes/listings.mine.tsx` → `/listings/mine` (auth-required; redirect to `/login` if no session).

## Data
- New server fn `listMyListings` in `src/lib/listings.functions.ts`:
  - `requireSupabaseAuth` middleware
  - Returns ALL listings for `auth.uid()` (active + inactive), ordered `created_at DESC`
  - Plain `ListingRow[]` (no author join needed — it's always the current user)
- Existing `deactivateListing` / `reactivateListing` reused for inline actions.

## Page layout
- Header + title "My listings" + small "Post a listing" CTA.
- Two sections, in this order:
  1. **Active** — `is_active === true`, sorted by `created_at` desc.
  2. **Past / inactive** — `is_active === false` OR `event_date < today`. Rendered greyed out (`opacity-60`) with a status chip:
     - "Deactivated" if `is_active === false`
     - "Expired" if `is_active === true` AND `event_date < today`
- Empty state when user has no listings ("You haven't posted yet — Post a listing").

## Row component (inline, in the same file)
Reuses listing data and shows the essentials in a compact card:
- Competition name, type, date, location, format, skill_level, spots
- Status chip (Active / Deactivated / Expired)
- Action buttons (icons + labels):
  - **View** → `Link to="/listings/$id"`
  - **Edit** → `Link to="/listings/$id/edit"`
  - **Deactivate** (active rows) / **Reactivate** (deactivated rows, only when not expired) — `useMutation` calling the existing server fns, then `qc.invalidateQueries({ queryKey: ["listings"] })` so this page, the feed, and the profile all refresh.
- Expired rows hide the Reactivate button (date is in the past so it would be meaningless).

## Navigation entry points
- **Header**: add `{ to: "/listings/mine", label: "My listings" }` to `navItems` in `src/components/Header.tsx`, shown only when `user` is signed in. Place it before "Browse".
- **Profile (`src/routes/profile.$id.tsx`)**: when the viewed profile is the current user (`user?.id === id`), add a "Manage my listings" link in the "Active listings" section header pointing to `/listings/mine`. No change for other people's profiles.

## Out of scope
- Pagination (volume is low; simple list is fine).
- Bulk actions.
- Server-side date filtering — "expired" is computed client-side from `event_date` so a listing the user re-dates immediately becomes active again without backend changes.

Confirm and I'll build it.