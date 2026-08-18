create table if not exists public.rift_card_waitlist (
  id bigint generated always as identity primary key,
  email text not null unique,
  source text not null default 'home_card_invite',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rift_card_waitlist enable row level security;

-- The browser never accesses this table directly. Inserts are made by the
-- server-only API route with the Supabase service-role key.
