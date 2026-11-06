CREATE OR REPLACE FUNCTION public.enforce_onboarding_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.onboarded AND (btrim(coalesce(NEW.first_name,'')) = '' OR coalesce(array_length(NEW.sports,1),0) = 0) THEN
    RAISE EXCEPTION 'First name and at least one sport are required';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS profiles_enforce_onboarding ON public.profiles;
CREATE TRIGGER profiles_enforce_onboarding BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.enforce_onboarding_fields();