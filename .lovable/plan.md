## Correction to my previous audit

After re-checking the database, the `listings`, `conversations`, `messages`, and `notifications` tables **already exist** with RLS policies and a trigger (`on_message_insert`) that updates conversations and creates notifications automatically. So the gap is smaller than I said: the **backend is mostly ready**, and the **frontend is still reading from `src/lib/mock-data.ts`**. The remaining real work is:

1. Enable Google sign-in at the provider level + wire the buttons.
2. Add a "Create listing" form and read listings from the DB.
3. Wire messages and notifications to the real tables (with realtime).
4. Make search filters actually filter the real data.

## Scope

### 1. Google sign-in (provider + UI)
- Call `configure_social_auth` with `providers: ["google"]` so the provider is enabled (today the button would fail with "Unsupported provider").
- In `src/routes/login.tsx`: add real email/password sign-in + sign-up forms wired to `supabase.auth.signInWithPassword` / `signUp`, and a "Continue with Google" button calling `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`.
- Add a `/reset-password` page + "Forgot password?" link (required when email auth is on).

### 2. Listings — real persistence
- New `src/routes/listings.new.tsx`: form (competition, type, date, location, format, gender, skill, spots, description) inserting into `public.listings` with `author_id = auth.uid()`. Guard behind auth.
- Server functions in `src/lib/listings.functions.ts` (with `requireSupabaseAuth`):
  - `listListings({ filters })` — returns active listings + author profile.
  - `getListing({ id })` — single listing + author.
- Replace mock reads in `feed.tsx`, `listings.$id.tsx`, `search.tsx` with `useSuspenseQuery` against those server fns. Keep `ListingCard` and the UI shell unchanged.
- Add "Create listing" CTA in the header / feed.

### 3. Search filters — actually filter
- Push the current filter UI state into `listListings` input (competition type, date range, location text, skill level, format = team/individual, gender).
- Server-side filtering in the query so it scales beyond 1000 rows.

### 4. Messaging — real
- Server fns in `src/lib/messages.functions.ts`:
  - `listConversations()` — for current user, with the other participant's profile + last message preview.
  - `getConversation({ id })` — messages in a thread.
  - `sendMessage({ conversationId, body })` — insert into `messages` (recipient inferred from conversation).
  - `startConversationFromListing({ listingId })` — find-or-create conversation between current user and `listing.author_id`, returns conversation id. Used by a new "Message seller" button on the listing detail page.
- In `src/routes/messages.tsx`: list real conversations, open a thread, send messages. Subscribe via `supabase.channel('messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'conversation_id=eq.<id>' }, ...)` for live updates. Mark messages read by updating `read_at` when viewing the thread.
- Enable realtime in a small migration: `ALTER PUBLICATION supabase_realtime ADD TABLE public.messages, public.notifications;`.
- Respect existing GDPR gate: the RLS already blocks sending unless `is_user_contactable(recipient)` — surface a friendly toast when that's the case.

### 5. Notifications — real centre
- `listNotifications()` and `markNotificationRead({ id })` server fns.
- `src/routes/notifications.tsx` reads from the `notifications` table (the `on_message_insert` trigger already creates message notifications when the recipient has opted in).
- Header bell shows an unread count badge, subscribed via realtime on the `notifications` table filtered by `user_id=eq.<me>`.
- Notification opt-ins are already wired through `user_consents` + `wants_notification`; nothing new there.

### 6. Auth flow polish
- Keep mock data file but stop importing it from routes (delete imports, leave the file for future seed scripts).
- Profile page (`profile.$id.tsx`) reads real `profiles` rows instead of mock.

## Out of scope (call out explicitly)
- Avatar uploads / storage bucket — keep `avatar_url` as a text URL for now.
- Push / email notification delivery — only in-app notifications.
- Admin tools, reporting, blocking users.
- Payments (the prompt explicitly excludes payment processing).
- Visual redesign — Aqua Court palette stays.

## Technical notes
- All server fns use `requireSupabaseAuth` middleware so RLS applies as the signed-in user. `src/start.ts` already registers `attachSupabaseAuth`.
- Place server fns in `*.functions.ts` files imported by routes/components — never import `client.server.ts` from the client.
- Loaders for protected pages live under the existing auth gating; public landing/search of listings can call a small public server fn using `supabaseAdmin` with a `WHERE is_active = true` projection, so unauthenticated visitors can still browse the feed.
- One migration only: enable realtime publication on `messages` and `notifications`. No schema changes needed.

## Deliverable order
1. Enable Google provider + finish login/signup/reset-password UI.
2. Listings server fns + create form + wire feed/detail/search to DB.
3. Messages server fns + realtime + "Message seller" entry point.
4. Notifications wiring + header bell badge.
5. Profile page reads real data; remove mock-data imports from routes.
