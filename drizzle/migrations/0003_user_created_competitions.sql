DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'refresh-competitions-weekly') THEN
    PERFORM cron.unschedule('refresh-competitions-weekly');
  END IF;
END $$;

DELETE FROM public.competition_sources WHERE competition_type IS NOT NULL;
REVOKE ALL ON public.competition_sources FROM anon, authenticated;
COMMENT ON TABLE public.competition_sources IS 'DEPRECATED: automatic scraping removed; safe to drop later';

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

DELETE FROM public.competitions WHERE created_at IS NOT NULL;

ALTER TABLE public.competitions DROP CONSTRAINT IF EXISTS competitions_competition_type_name_year_key;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS normalized_name text NOT NULL DEFAULT '';
ALTER TABLE public.competitions ALTER COLUMN event_date SET NOT NULL;
ALTER TABLE public.competitions ALTER COLUMN year SET DEFAULT extract(year from now())::int;
COMMENT ON COLUMN public.competitions.source_url IS 'DEPRECATED: scraping removed';
COMMENT ON COLUMN public.competitions.location IS 'DEPRECATED: replaced by city';

CREATE OR REPLACE FUNCTION public.normalize_competition_name(_name text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT regexp_replace(lower(coalesce(_name, '')), '[^a-z0-9]+', '', 'g')
$$;

CREATE OR REPLACE FUNCTION public.competitions_before_write()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.name := btrim(NEW.name);
  NEW.city := nullif(btrim(coalesce(NEW.city, '')), '');
  NEW.normalized_name := public.normalize_competition_name(NEW.name);
  NEW.year := extract(year from NEW.event_date)::int;
  NEW.updated_at := now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS competitions_before_write ON public.competitions;
CREATE TRIGGER competitions_before_write BEFORE INSERT OR UPDATE ON public.competitions
FOR EACH ROW EXECUTE FUNCTION public.competitions_before_write();

CREATE UNIQUE INDEX IF NOT EXISTS competitions_exact_unique
  ON public.competitions (competition_type, normalized_name, lower(coalesce(city, '')), event_date);
CREATE INDEX IF NOT EXISTS competitions_norm_trgm
  ON public.competitions USING gin (normalized_name extensions.gin_trgm_ops);

ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS competition_id uuid
  REFERENCES public.competitions(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS listings_competition_id_idx ON public.listings(competition_id);

INSERT INTO public.competitions (competition_type, name, event_date, city, created_by)
SELECT DISTINCT ON (l.competition_type, public.normalize_competition_name(l.competition), lower(btrim(l.location)), l.event_date)
  l.competition_type, btrim(l.competition), l.event_date, btrim(l.location), l.author_id
FROM public.listings l
ORDER BY l.competition_type, public.normalize_competition_name(l.competition), lower(btrim(l.location)), l.event_date, l.created_at
ON CONFLICT DO NOTHING;

UPDATE public.listings l SET competition_id = c.id
FROM public.competitions c
WHERE c.competition_type = l.competition_type
  AND c.normalized_name = public.normalize_competition_name(l.competition)
  AND lower(coalesce(c.city, '')) = lower(btrim(l.location))
  AND c.event_date = l.event_date;

DROP POLICY IF EXISTS "Competitions readable by authenticated" ON public.competitions;
GRANT SELECT ON public.competitions TO anon;
GRANT SELECT, INSERT ON public.competitions TO authenticated;
GRANT ALL ON public.competitions TO service_role;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Upcoming competitions readable" ON public.competitions FOR SELECT TO anon, authenticated
  USING (event_date >= CURRENT_DATE);
CREATE POLICY "Creators read own competitions" ON public.competitions FOR SELECT TO authenticated
  USING (created_by = auth.uid());
CREATE POLICY "Users create competitions" ON public.competitions FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND event_date >= CURRENT_DATE);

CREATE OR REPLACE FUNCTION public.search_competitions(_type text, _q text DEFAULT '')
RETURNS TABLE (id uuid, name text, city text, event_date date, listing_count bigint)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT c.id, c.name, c.city, c.event_date,
    (SELECT count(*) FROM public.listings l WHERE l.competition_id = c.id AND l.is_active) AS listing_count
  FROM public.competitions c
  WHERE c.competition_type = _type AND c.event_date >= CURRENT_DATE
    AND (coalesce(_q, '') = '' OR c.name ILIKE '%' || _q || '%' OR c.city ILIKE '%' || _q || '%'
         OR c.normalized_name LIKE '%' || public.normalize_competition_name(_q) || '%')
  ORDER BY c.event_date, c.name
  LIMIT 100
$$;

CREATE OR REPLACE FUNCTION public.match_competitions(_type text, _name text, _city text, _date date)
RETURNS TABLE (id uuid, name text, city text, event_date date, listing_count bigint, score real)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public, extensions AS $$
  SELECT c.id, c.name, c.city, c.event_date,
    (SELECT count(*) FROM public.listings l WHERE l.competition_id = c.id AND l.is_active),
    extensions.similarity(c.normalized_name, public.normalize_competition_name(_name)) AS score
  FROM public.competitions c
  WHERE c.competition_type = _type
    AND c.event_date >= CURRENT_DATE
    AND c.event_date BETWEEN _date - 7 AND _date + 7
    AND lower(coalesce(c.city, '')) = lower(btrim(coalesce(_city, '')))
    AND extensions.similarity(c.normalized_name, public.normalize_competition_name(_name)) >= 0.3
  ORDER BY score DESC, abs(c.event_date - _date)
  LIMIT 3
$$;

GRANT EXECUTE ON FUNCTION public.search_competitions(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_competitions(text, text, text, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.normalize_competition_name(text) TO anon, authenticated;