COMMENT ON COLUMN public.listings.format IS 'Sport-specific format: Individual displays as Singles for HYROX; Doubles displays as Pairs outside HYROX; Turf Games always Team.';
COMMENT ON COLUMN public.listings.gender IS 'Team composition for Turf Games; Gender for HYROX; not displayed for other sports.';
COMMENT ON COLUMN public.listings.skill_level IS 'Division for Turf Games (Everyday, Intermediate, Elite) and HYROX (Open, Pro); Level for other sports (Beginner, Intermediate, Advanced, Elite).';
ALTER TABLE public.listings ADD CONSTRAINT listings_sport_fields_check CHECK (
 CASE WHEN lower(competition_type) = 'turf games' THEN format = 'Team' AND gender IS NOT NULL AND gender IN ('Mixed','Men','Women') AND skill_level IN ('Everyday','Intermediate','Elite')
 WHEN lower(competition_type) = 'hyrox' THEN format IN ('Individual','Doubles','Relay') AND gender IS NOT NULL AND gender IN ('Men','Women','Mixed') AND skill_level IN ('Open','Pro') AND (format <> 'Relay' OR skill_level = 'Open')
 ELSE format IN ('Individual','Doubles','Team') AND skill_level IN ('Beginner','Intermediate','Advanced','Elite') END
) NOT VALID;