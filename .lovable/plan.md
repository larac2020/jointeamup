# Shareholder Demo Mode

A self-contained, presenter-friendly walkthrough at `/demo` that you click through live. On-brand (acid green + black), no auth required, uses mock data so it never depends on what's in the live database.

## What it is

A new route `/demo` that runs as a guided slideshow inside the app. Each "slide" is a full-screen panel with:
- Large headline + supporting copy on the left
- A live UI mock (real components, fake data) on the right
- Keyboard nav (← → Space, Esc to exit) + on-screen Prev/Next + slide counter
- Progress bar at top, slide index in URL (`/demo?step=3`) so you can resume mid-pitch

No backend writes, no auth gate, no real listings touched.

## Structure (≈10 slides)

**Part 1 — Problem & market (4 slides)**
1. **Cover** — Logo, tagline, "Shareholder briefing · 2026". Acid green on black, big.
2. **The problem** — Athletes can't find partners for team competitions. 3 stat callouts (events/year, % needing partners, time wasted searching).
3. **Today's alternatives** — Side-by-side: Instagram DMs / WhatsApp groups / word of mouth vs. what's missing (filtering, trust, structure).
4. **Market opportunity** — TAM/SAM/SOM-style framing with the addressable sport categories (CrossFit, Hyrox, etc.) and city reach.

**Part 2 — Product walkthrough (5 slides)**
5. **Browse** — Screenshot-style embed of the feed page with mock listings, callouts pointing at filters (sport, date, location, skill level).
6. **Listing detail** — Mock detail card highlighting the structured info (event, format, spots, skill).
7. **Post a listing** — Show the create flow in 3 steps, emphasizing how fast it is.
8. **Connect** — Messaging UI mock, with contactability/consent shown as a trust feature.
9. **Profile** — Athlete profile with PRs, sports, gyms — the "why this is more than a classifieds board" slide.

**Part 3 — Close (1 slide)**
10. **Where we go next** — One-liner vision + CTA ("Questions?"). Optional: link back to the live app.

## Visual treatment

- Acid green (`--primary`) + black backgrounds + white/off-white text — same tokens already in `styles.css`.
- Big editorial type for headlines (existing display font).
- Mock UI panels reuse real components (`ListingCard`, message bubbles, profile header) wrapped in a framed "device" container with subtle shadow so it reads as product, not screenshot.
- Soft motion: each slide fades + slides in 8px on enter (Framer Motion, already in deps).

## Technical details

- New file: `src/routes/demo.tsx` — pathless from main nav (not linked in header), accessed via direct URL.
- New folder: `src/components/demo/` — one file per slide (`SlideCover.tsx`, `SlideProblem.tsx`, …) + `DemoFrame.tsx` (the chrome: progress bar, nav, keyboard handling) + `mockData.ts` (fake listings, profile, messages — no DB calls).
- URL state: `?step=N` via TanStack Router search params, so refresh keeps position.
- No new dependencies. No DB changes. No auth changes.
- Add a small "Demo" link in the footer of `/` (or skip entirely if you'd rather keep it unlisted — let me know).

## Out of scope

- No traction/metrics slides (you didn't pick that focus).
- No PDF export — this is live-presenter mode only. If you later want a PDF handout, that's a separate build.
- No editing UI for slide content — copy lives in the slide components; you'd ask me to tweak wording.

## Open question

Should the `/demo` link be discoverable (footer link on homepage) or unlisted (URL-only, you share it manually)? Default: unlisted.
