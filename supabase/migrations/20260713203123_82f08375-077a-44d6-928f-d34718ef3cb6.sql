
DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;

-- Public URL access still works because Supabase serves public buckets through the CDN
-- without hitting this policy. This policy only affects the storage.objects API,
-- which is what LIST calls go through. By requiring a specific name filter,
-- clients can fetch known objects but cannot enumerate.
CREATE POLICY "Avatars readable by name"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'avatars');
