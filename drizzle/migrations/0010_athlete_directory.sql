ALTER TABLE public.profiles
  ADD COLUMN show_in_directory boolean NOT NULL DEFAULT false,
  ADD COLUMN directory_prompted boolean NOT NULL DEFAULT false,
  ADD COLUMN open_formats text[] NOT NULL DEFAULT '{}',
  ADD COLUMN compete_category text,
  ADD COLUMN divisions text[] NOT NULL DEFAULT '{}',
  ADD COLUMN travel text,
  ADD COLUMN strengths text[] NOT NULL DEFAULT '{}',
  ADD COLUMN available_for text;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_open_formats_chk CHECK (open_formats <@ ARRAY['Doubles','Relay','Team','Pairs','Individual']::text[]),
  ADD CONSTRAINT profiles_compete_category_chk CHECK (compete_category IS NULL OR compete_category IN ('Men','Women')),
  ADD CONSTRAINT profiles_divisions_chk CHECK (divisions <@ ARRAY['Everyday','Intermediate','Elite','Open','Pro']::text[]),
  ADD CONSTRAINT profiles_travel_chk CHECK (travel IS NULL OR travel IN ('Local only','Anywhere in the UK','Europe','Anywhere')),
  ADD CONSTRAINT profiles_strengths_chk CHECK (strengths <@ ARRAY['Running','Strength','Engine','Gymnastics','Rowing','Sled work']::text[]),
  ADD CONSTRAINT profiles_available_for_chk CHECK (available_for IS NULL OR char_length(available_for) <= 80);
CREATE INDEX profiles_directory_idx ON public.profiles (show_in_directory) WHERE show_in_directory AND onboarded;