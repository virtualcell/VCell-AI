-- The `users` table: Auth0 identities synced into Supabase, plus each user's
-- LiteLLM virtual key and role.
--
-- This table was originally created by hand in the Supabase dashboard and was
-- never checked in, which made it unrecoverable from source when it was lost.
-- This file is that missing definition. Safe to re-run.

-- Dropping a table leaves its enum type behind, so this has to tolerate the
-- type already existing.
do $$
begin
  create type user_role as enum ('user', 'admin');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.users (
  user_id              uuid primary key default gen_random_uuid(),
  auth0_sub            varchar(255) unique not null,
  email                varchar(255),
  name                 varchar(255),
  role                 user_role not null default 'user',
  created_at           timestamp with time zone not null default now(),
  last_login           timestamp with time zone,
  -- Added after the original schema, when chat moved onto LiteLLM. Null until
  -- the user's first login provisions a key; never returned by the API.
  litellm_virtual_key  text
);

-- Redundant alongside the unique constraint, which already indexes this
-- column, but kept to match the table as it was originally created.
create index if not exists users_auth0_sub_idx on public.users (auth0_sub);

-- The backend reaches Supabase with the service-role key, which bypasses RLS.
-- Nothing else queries this table directly, so enabling RLS with no policies
-- keeps the anon key from reading user records.
alter table public.users enable row level security;
