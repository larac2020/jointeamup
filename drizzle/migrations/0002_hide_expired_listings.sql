DROP POLICY IF EXISTS "Active listings public read" ON public.listings;
CREATE POLICY "Active listings public read" ON public.listings FOR SELECT TO anon, authenticated
  USING (is_active = true AND event_date >= current_date);
DROP POLICY IF EXISTS "Users delete own listings" ON public.listings;
CREATE POLICY "Users delete own listings" ON public.listings FOR DELETE TO authenticated
  USING (auth.uid() = author_id);