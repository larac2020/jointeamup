alter table public.profiles
  add column if not exists bio text,
  add column if not exists experience text,
  add column if not exists looking_for text,
  add column if not exists photos text[] not null default '{}'::text[];