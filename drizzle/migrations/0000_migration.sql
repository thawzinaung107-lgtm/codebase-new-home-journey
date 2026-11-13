create type public.app_role as enum ('student', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  legacy_user_id uuid unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Users read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

-- Server-only: emails that become admins on sign-in (replaces LMS_ADMIN_EMAILS)
create table public.admin_emails (email text primary key);
grant all on public.admin_emails to service_role;
alter table public.admin_emails enable row level security;

-- Server-only: users imported from the previous app, matched by verified Google email on first sign-in
create table public.legacy_users (
  legacy_id uuid primary key,
  email text not null unique,
  display_name text not null default '',
  role public.app_role not null default 'student',
  claimed_by uuid
);
grant all on public.legacy_users to service_role;
alter table public.legacy_users enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  legacy public.legacy_users%rowtype;
  em text := lower(coalesce(new.email, ''));
begin
  if new.email_confirmed_at is not null then
    select * into legacy from public.legacy_users where lower(email) = em and claimed_by is null;
  end if;
  insert into public.profiles (id, email, display_name, legacy_user_id)
  values (new.id, coalesce(new.email, ''),
    coalesce(nullif(legacy.display_name, ''), new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(coalesce(new.email,''), '@', 1)),
    legacy.legacy_id)
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'student') on conflict do nothing;
  if legacy.legacy_id is not null then
    update public.legacy_users set claimed_by = new.id where legacy_id = legacy.legacy_id;
    if legacy.role = 'admin' then
      insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
    end if;
  end if;
  if new.email_confirmed_at is not null and exists (select 1 from public.admin_emails where lower(email) = em) then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();