
-- 1. Profiles: allow public browsing of onboarded profiles only
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;

CREATE POLICY "Onboarded profiles public read"
  ON public.profiles FOR SELECT
  TO anon, authenticated
  USING (onboarded = true);

CREATE POLICY "Own profile full read"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

GRANT SELECT ON public.profiles TO anon;

-- 2. Listings: allow public browsing of active listings
DROP POLICY IF EXISTS "Listings readable by authenticated" ON public.listings;

CREATE POLICY "Active listings public read"
  ON public.listings FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Own listings read"
  ON public.listings FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

GRANT SELECT ON public.listings TO anon;

-- 3. Competitions: already public, ensure anon can read
GRANT SELECT ON public.competitions TO anon;

-- 4. Storage: restrict avatars bucket LIST but keep individual object reads via public URL
-- Public URLs work through the CDN regardless; the policy governs the storage.objects API.
-- Keep SELECT so signed / direct reads work, but this is a public bucket so it is expected.
-- (No change needed: public bucket + object URL is the intended access pattern.)

-- 5. Lock down SECURITY DEFINER functions from being directly invoked via PostgREST.
-- These are trigger / internal helpers - not RPCs.
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_message_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.wants_notification(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_user_contactable(uuid) FROM PUBLIC, anon, authenticated;
