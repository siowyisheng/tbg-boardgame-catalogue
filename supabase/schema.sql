-- Run this once in the Supabase SQL editor.
-- All access goes through the Vercel API with the service-role key, so row level
-- security is switched on with no policies: the public anon key can read and write nothing.

create table if not exists games (
  slug          text primary key,
  bgg_id        integer,
  name          text not null,
  min_players   integer,
  max_players   integer,
  best_players  integer[] not null default '{}',
  playing_time  integer,
  weight        numeric(3,2),
  rating        numeric(3,1),
  types         text[] not null default '{}',
  categories    text[] not null default '{}',
  cover_url     text,
  verified      boolean not null default false,
  removed       boolean not null default false,
  created_at    timestamptz not null default now()
);

create table if not exists reports (
  id             uuid primary key default gen_random_uuid(),
  game_slug      text not null references games(slug),
  kind           text not null check (kind in ('missing', 'damaged')),
  component      text not null,
  note           text not null default '',
  reporter_name  text,
  reporter_email text,
  resolved       boolean not null default false,
  ip_hash        text,
  created_at     timestamptz not null default now()
);

create index if not exists reports_ip_recent on reports (ip_hash, created_at desc);
create index if not exists reports_open on reports (resolved, created_at desc);

alter table games   enable row level security;
alter table reports enable row level security;
