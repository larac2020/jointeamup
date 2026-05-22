
-- =========================
-- PROFILES
-- =========================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  nickname text,
  age int check (age is null or (age >= 13 and age <= 120)),
  from_location text,
  lives_in text,
  sports text[] not null default '{}',
  gyms text[] not null default '{}',
  competitions text[] not null default '{}',
  prs jsonb not null default '[]'::jsonb,
  superpower text,
  kryptonite text,
  avatar_url text,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles viewable by authenticated users"
  on public.profiles for select to authenticated using (true);
create policy "Users insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users delete own profile"
  on public.profiles for delete to authenticated using (auth.uid() = id);

-- =========================
-- USER CONSENTS (GDPR)
-- =========================
create table public.user_consents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  terms_accepted_at timestamptz,
  privacy_accepted_at timestamptz,
  contactable_by_athletes boolean not null default false,
  contactable_consent_at timestamptz,
  notifications_messages boolean not null default false,
  notifications_listings boolean not null default false,
  notifications_marketing boolean not null default false,
  notifications_consent_at timestamptz,
  data_processing_version text not null default 'v1',
  updated_at timestamptz not null default now()
);
alter table public.user_consents enable row level security;

create policy "Users read own consents"
  on public.user_consents for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own consents"
  on public.user_consents for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own consents"
  on public.user_consents for update to authenticated using (auth.uid() = user_id);

-- Helper: is this user contactable? (security definer, bypasses RLS for the check)
create or replace function public.is_user_contactable(_user_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select contactable_by_athletes from public.user_consents where user_id = _user_id),
    false
  );
$$;

create or replace function public.wants_notification(_user_id uuid, _kind text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select case _kind
    when 'message'  then coalesce((select notifications_messages from public.user_consents where user_id = _user_id), false)
    when 'listing'  then coalesce((select notifications_listings  from public.user_consents where user_id = _user_id), false)
    when 'application' then coalesce((select notifications_messages from public.user_consents where user_id = _user_id), false)
    when 'marketing' then coalesce((select notifications_marketing from public.user_consents where user_id = _user_id), false)
    else false
  end;
$$;

-- =========================
-- LISTINGS
-- =========================
create type public.listing_type as enum ('selling-ticket','need-teammate','join-team');
create type public.format_type   as enum ('Individual','Doubles','Team');
create type public.skill_level   as enum ('Beginner','Intermediate','Advanced','Elite');
create type public.gender_cat    as enum ('Men','Women','Mixed','Open');

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  type public.listing_type not null,
  competition text not null check (char_length(competition) between 1 and 120),
  competition_type text not null check (char_length(competition_type) between 1 and 60),
  event_date date not null,
  location text not null check (char_length(location) between 1 and 120),
  format public.format_type not null,
  skill_level public.skill_level not null,
  gender public.gender_cat,
  spots int not null default 1 check (spots between 1 and 20),
  description text not null check (char_length(description) between 1 and 2000),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.listings enable row level security;

create policy "Listings readable by authenticated"
  on public.listings for select to authenticated using (true);
create policy "Users create own listings"
  on public.listings for insert to authenticated with check (auth.uid() = author_id);
create policy "Users update own listings"
  on public.listings for update to authenticated using (auth.uid() = author_id);
create policy "Users delete own listings"
  on public.listings for delete to authenticated using (auth.uid() = author_id);

create index listings_active_date_idx on public.listings (is_active, event_date desc);
create index listings_type_idx on public.listings (type);

-- =========================
-- CONVERSATIONS + MESSAGES
-- =========================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint conv_distinct_users check (user_a <> user_b),
  constraint conv_ordered_users check (user_a < user_b)
);
create unique index conversations_pair_listing_uidx
  on public.conversations (user_a, user_b, coalesce(listing_id, '00000000-0000-0000-0000-000000000000'::uuid));

alter table public.conversations enable row level security;

create policy "Participants read conversations"
  on public.conversations for select to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

create policy "Participants insert conversations"
  on public.conversations for insert to authenticated
  with check (
    (auth.uid() = user_a or auth.uid() = user_b)
    and public.is_user_contactable(case when auth.uid() = user_a then user_b else user_a end)
  );

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;

create policy "Participants read messages"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (auth.uid() = c.user_a or auth.uid() = c.user_b)
    )
  );

create policy "Sender inserts message if recipient contactable"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (auth.uid() = c.user_a or auth.uid() = c.user_b)
        and ((c.user_a = recipient_id) or (c.user_b = recipient_id))
    )
    and public.is_user_contactable(recipient_id)
  );

create policy "Recipient marks own message read"
  on public.messages for update to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

create index messages_conv_created_idx on public.messages (conversation_id, created_at);

-- =========================
-- NOTIFICATIONS
-- =========================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('message','listing','application','match','system')),
  title text not null check (char_length(title) between 1 and 200),
  body text check (body is null or char_length(body) <= 500),
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;

create policy "Users read own notifications"
  on public.notifications for select to authenticated using (auth.uid() = user_id);
create policy "Users update own notifications"
  on public.notifications for update to authenticated using (auth.uid() = user_id);
create policy "Users delete own notifications"
  on public.notifications for delete to authenticated using (auth.uid() = user_id);
-- inserts happen via triggers / security definer functions only

create index notifications_user_created_idx on public.notifications (user_id, created_at desc);

-- =========================
-- TRIGGER: new auth user -> profile + consent row
-- =========================
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name',
             split_part(coalesce(new.raw_user_meta_data->>'full_name', new.email, 'Athlete'), ' ', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_consents (user_id) values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================
-- TRIGGER: new message -> notification + bump conversation
-- =========================
create or replace function public.on_message_insert()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  sender_name text;
begin
  update public.conversations
    set last_message_at = new.created_at
    where id = new.conversation_id;

  if public.wants_notification(new.recipient_id, 'message') then
    select first_name into sender_name from public.profiles where id = new.sender_id;
    insert into public.notifications (user_id, kind, title, body, link)
    values (
      new.recipient_id,
      'message',
      coalesce(sender_name, 'Someone') || ' sent you a message',
      left(new.body, 140),
      '/messages'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_message_insert_trg on public.messages;
create trigger on_message_insert_trg
  after insert on public.messages
  for each row execute function public.on_message_insert();

-- =========================
-- updated_at triggers
-- =========================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger consents_touch before update on public.user_consents
  for each row execute function public.touch_updated_at();

-- =========================
-- Realtime
-- =========================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.conversations;

alter table public.messages replica identity full;
alter table public.notifications replica identity full;
alter table public.conversations replica identity full;
