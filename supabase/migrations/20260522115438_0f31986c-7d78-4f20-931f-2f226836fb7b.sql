ALTER TABLE public.listings ALTER COLUMN skill_level TYPE text USING skill_level::text;
DROP TYPE IF EXISTS public.skill_level;