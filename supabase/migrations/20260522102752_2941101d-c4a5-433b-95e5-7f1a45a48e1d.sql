
-- Pin search_path on touch_updated_at (others already have it)
create or replace function public.touch_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- Lock down trigger-only definer functions: not callable from API
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.on_message_insert() from public, anon, authenticated;
revoke execute on function public.wants_notification(uuid, text) from public, anon, authenticated;

-- is_user_contactable is referenced from RLS policies, so it MUST stay
-- executable by the `authenticated` role (RLS expressions run as the querying role).
-- Revoke from anon/public only.
revoke execute on function public.is_user_contactable(uuid) from public, anon;
