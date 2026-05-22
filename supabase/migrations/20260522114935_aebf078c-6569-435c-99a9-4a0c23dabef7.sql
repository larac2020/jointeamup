
create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  competition_type text not null,
  name text not null,
  event_date date,
  location text,
  source_url text,
  year int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_type, name, year)
);
create index competitions_type_year_idx on public.competitions (competition_type, year);
alter table public.competitions enable row level security;
create policy "Competitions readable by authenticated"
  on public.competitions for select to authenticated using (true);

create table public.competition_sources (
  competition_type text primary key,
  url text not null,
  last_scraped_at timestamptz,
  last_error text,
  updated_at timestamptz not null default now()
);
alter table public.competition_sources enable row level security;
create policy "Sources readable by authenticated"
  on public.competition_sources for select to authenticated using (true);

create table public.competition_suggestions (
  id uuid primary key default gen_random_uuid(),
  competition_type text not null,
  name text not null,
  submitted_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.competition_suggestions enable row level security;
create policy "Users insert own suggestions"
  on public.competition_suggestions for insert to authenticated
  with check (auth.uid() = submitted_by);
create policy "Users read own suggestions"
  on public.competition_suggestions for select to authenticated
  using (auth.uid() = submitted_by);

insert into public.competition_sources (competition_type, url) values
  ('HYROX', 'https://hyrox.com/find-my-race/'),
  ('DEKA', 'https://dekafit.com/events/'),
  ('Turf Games', 'https://turfgames.com/events'),
  ('CrossFit', 'https://games.crossfit.com/schedule'),
  ('Spartan', 'https://www.spartan.com/en/race/find-race');
