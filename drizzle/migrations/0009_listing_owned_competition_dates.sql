ALTER TABLE public.competitions ADD COLUMN original_date date;
UPDATE public.competitions SET original_date=event_date;
ALTER TABLE public.listings ADD COLUMN competition_date date;
CREATE OR REPLACE FUNCTION public.listings_event_dates_before_write() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ DECLARE c public.competitions; BEGIN
IF TG_OP='UPDATE' AND OLD.competition_date IS NOT NULL AND OLD.expires_on<CURRENT_DATE AND (NEW.competition_id IS DISTINCT FROM OLD.competition_id OR NEW.competition_date IS DISTINCT FROM OLD.competition_date OR NEW.event_date IS DISTINCT FROM OLD.event_date OR NEW.race_day IS DISTINCT FROM OLD.race_day OR NEW.type IS DISTINCT FROM OLD.type OR NEW.format IS DISTINCT FROM OLD.format OR NEW.gender IS DISTINCT FROM OLD.gender OR NEW.skill_level IS DISTINCT FROM OLD.skill_level OR NEW.spots IS DISTINCT FROM OLD.spots OR NEW.description IS DISTINCT FROM OLD.description OR (NEW.is_active AND NOT OLD.is_active)) THEN RAISE EXCEPTION 'Expired listings cannot be edited or reactivated'; END IF;
NEW.competition_date:=coalesce(NEW.competition_date,NEW.race_day,NEW.event_date);
SELECT * INTO c FROM public.competitions WHERE id=NEW.competition_id;
IF FOUND THEN NEW.competition:=c.name; NEW.location:=coalesce(c.city,''); IF NEW.competition_type IS DISTINCT FROM c.competition_type THEN RAISE EXCEPTION 'Competition type does not match event'; END IF; END IF;
NEW.event_date:=NEW.competition_date; NEW.end_date:=NEW.competition_date; NEW.race_day:=NULL;
IF TG_OP='INSERT' AND NEW.competition_date<CURRENT_DATE THEN RAISE EXCEPTION 'Choose a competition date today or later'; END IF;
IF TG_OP='UPDATE' AND OLD.competition_date IS NOT NULL AND NEW.competition_date IS DISTINCT FROM OLD.competition_date AND NEW.competition_date<CURRENT_DATE THEN RAISE EXCEPTION 'Choose a competition date today or later'; END IF;
RETURN NEW; END $$;
UPDATE public.listings SET competition_date=coalesce(race_day,event_date);
ALTER TABLE public.listings ADD CONSTRAINT listings_own_date_required CHECK (competition_date IS NOT NULL AND event_date=competition_date AND end_date=competition_date AND race_day IS NULL);
CREATE OR REPLACE FUNCTION public.competitions_before_write() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN NEW.name:=btrim(NEW.name); NEW.city:=nullif(btrim(coalesce(NEW.city,'')),''); NEW.normalized_name:=public.normalize_competition_name(NEW.name); IF TG_OP='INSERT' THEN NEW.original_date:=NEW.event_date; NEW.end_date:=NEW.event_date; ELSE NEW.original_date:=OLD.original_date; END IF; NEW.year:=extract(year from NEW.event_date)::int; NEW.updated_at:=now(); RETURN NEW; END $$;
UPDATE public.competitions c SET event_date=least(c.original_date,coalesce((SELECT min(l.competition_date) FROM public.listings l WHERE l.competition_id=c.id),c.original_date)), end_date=greatest(c.original_date,coalesce((SELECT max(l.competition_date) FROM public.listings l WHERE l.competition_id=c.id),c.original_date));
CREATE FUNCTION public.refresh_event_listing_range() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE ids uuid[]; event_id uuid; BEGIN
IF TG_OP='INSERT' THEN ids:=ARRAY[NEW.competition_id]; ELSIF TG_OP='DELETE' THEN ids:=ARRAY[OLD.competition_id]; ELSE ids:=ARRAY[OLD.competition_id,NEW.competition_id]; END IF;
FOR event_id IN SELECT DISTINCT x FROM unnest(ids) x WHERE x IS NOT NULL ORDER BY x LOOP
PERFORM 1 FROM public.competitions WHERE id=event_id FOR UPDATE;
UPDATE public.competitions c SET event_date=least(c.original_date,coalesce((SELECT min(l.competition_date) FROM public.listings l WHERE l.competition_id=event_id),c.original_date)),end_date=greatest(c.original_date,coalesce((SELECT max(l.competition_date) FROM public.listings l WHERE l.competition_id=event_id),c.original_date)) WHERE c.id=event_id;
END LOOP; RETURN NULL; END $$;
REVOKE ALL ON FUNCTION public.refresh_event_listing_range() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER refresh_event_listing_range AFTER INSERT OR UPDATE OF competition_id,competition_date OR DELETE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.refresh_event_listing_range();
CREATE INDEX listings_competition_dates_idx ON public.listings(competition_id,competition_date);
COMMENT ON COLUMN public.listings.race_day IS 'DEPRECATED: replaced by required competition_date';
COMMENT ON COLUMN public.listings.end_date IS 'DEPRECATED: compatibility mirror of competition_date, not event range';