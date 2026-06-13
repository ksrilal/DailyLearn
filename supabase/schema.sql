-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).

-- Profile table: one row per auth user, holding role and AI-access flag.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'learner' check (role in ('admin', 'learner')),
  ai_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

-- If the table already exists from a previous run, update the column
-- default so future inserts (outside the trigger) also default to false.
alter table public.profiles alter column ai_enabled set default false;

alter table public.profiles enable row level security;

-- RLS policies restrict which rows are visible/editable, but the
-- `authenticated` role still needs base table privileges to query at all.
grant select, update on public.profiles to authenticated;

-- Returns true if the given user id belongs to an admin. Marked `security
-- definer` so it bypasses RLS internally, avoiding infinite recursion when
-- referenced from policies on public.profiles.
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = user_id and role = 'admin'
  );
$$;

-- Learners can read their own profile.
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Admins can read every profile.
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

-- Admins can update any profile (used for the AI-access toggle and role changes).
drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin(auth.uid()));

-- Auto-create a profile row whenever a new auth user registers.
-- New accounts default to role = 'learner' and ai_enabled = false; an
-- admin must explicitly enable AI access from the User Management page.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, ai_enabled)
  values (new.id, new.email, false);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- After registering your first account, promote it to admin by running:
-- update public.profiles set role = 'admin' where email = 'you@example.com';
