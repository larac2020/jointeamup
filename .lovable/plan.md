# Aqua Court palette refresh

Replace the current orange "Sunset Blaze" theme with a solid turquoise/teal palette. No mesh, no gradients — just clean color blocks. Light mode only, WCAG AA contrast.

## Palette

- Background: `#f8fafc` (near-white, soft cool tint)
- Surface / cards: `#ffffff`
- Primary (turquoise): `#0ea5b7` — buttons, links, highlights
- Foreground / deep teal: `#0b3b4a` — headings, body text
- Accent (amber): `#f59e0b` — sparingly, for badges/notifications/CTAs needing contrast
- Muted text: slate ~`#475569`
- Borders: cool grey ~`#e2e8f0`

All values written as `oklch()` tokens in `src/styles.css`.

## Changes

1. **`src/styles.css`**
   - Rewrite `:root` tokens: background, foreground, primary, secondary, accent, muted, border, ring, destructive — all in the turquoise/teal/amber family.
   - Drop `--gradient-blaze`, `--gradient-warm`, `--gradient-cool`, `--shadow-blaze`, and the `.bg-blaze` / `.bg-warm` / `.bg-cool` / `.text-blaze` / `.shadow-blaze` / `.ring-blaze` utilities. Replace `--shadow-card` tint with teal.
   - Keep `--magenta` / `--violet` tokens removed (unused after refactor) or repoint them to neutral teal shades if any component still references them.
   - Remove `.dark` block (light-only) — or keep but unused.

2. **`src/routes/index.tsx`**
   - Replace `bg-warm`, `bg-cool`, `bg-blaze`, `shadow-blaze`, `text-blaze` usages with solid utility classes (`bg-primary`, `bg-secondary`, `bg-accent`, `text-primary`, `shadow-card`).
   - Hero overlay: replace `from-black/65` gradient with a solid deep-teal scrim using the new `--foreground` token at ~70% opacity.
   - Final CTA card: solid `bg-primary` block instead of `bg-blaze`; remove decorative blurred circles.

3. **Sweep other routes/components** for the dropped utility classes and swap to solids:
   - `src/components/Header.tsx`, `ListingCard.tsx`, `AthleteCard.tsx`
   - `src/routes/login.tsx`, `feed.tsx`, `search.tsx`, `listings.$id.tsx`, `profile.$id.tsx`, `messages.tsx`, `notifications.tsx`, `onboarding.tsx`, `settings.tsx`
   - `rg "bg-blaze|bg-warm|bg-cool|text-blaze|shadow-blaze|ring-blaze"` to find them all in one pass.

4. **Accessibility check**
   - Primary `#0ea5b7` on white: ~3.3:1 — large text / UI only. Use deep teal `#0b3b4a` for body copy (>12:1 on white). Primary buttons use white text on primary (~4.6:1 — AA for large/bold).
   - Amber accent only on deep teal or as small badges.

## Out of scope

- No layout, copy, font, or component-structure changes.
- No dark mode (light-only as selected).
- No business logic touched.

## Note on the reported build errors

The TS errors listed in the prompt are stale from before the route tree was regenerated last turn — `routeTree.gen.ts` now includes all routes. The next typecheck pass should clear them; no action needed as part of this plan.
