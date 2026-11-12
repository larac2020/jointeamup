ALTER TABLE public.listings DROP CONSTRAINT listings_description_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_description_check CHECK (char_length(description) <= 2000);