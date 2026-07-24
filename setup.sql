create table if not exists public.practice_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  practice_date date not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, practice_date)
);

alter table public.practice_days enable row level security;

drop policy if exists "Users can read own practice days" on public.practice_days;
create policy "Users can read own practice days"
on public.practice_days for select
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own practice days" on public.practice_days;
create policy "Users can insert own practice days"
on public.practice_days for insert
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own practice days" on public.practice_days;
create policy "Users can update own practice days"
on public.practice_days for update
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own practice days" on public.practice_days;
create policy "Users can delete own practice days"
on public.practice_days for delete
using ((select auth.uid()) = user_id);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.practice_days to authenticated;
