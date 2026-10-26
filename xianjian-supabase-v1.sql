-- 弦間小日子：新增雙人聯絡簿與集章功能（不修改 practice_days）
-- 請先備份並確認兩位使用者的 auth.users UUID；此檔暫供審閱，勿直接執行。
create table if not exists public.music_pairs (
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references auth.users(id) on delete cascade,
 teacher_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 constraint distinct_members check (student_id <> teacher_id),
 unique(student_id, teacher_id)
);
create table if not exists public.diary_entries (
 id uuid primary key default gen_random_uuid(),
 pair_id uuid not null references public.music_pairs(id) on delete cascade,
 entry_date date not null,
 student_note text not null default '',
 teacher_note text not null default '',
 updated_at timestamptz not null default now(),
 unique(pair_id, entry_date)
);
create table if not exists public.reward_stamps (
 id uuid primary key default gen_random_uuid(),
 pair_id uuid not null references public.music_pairs(id) on delete cascade,
 stamp_date date not null default current_date,
 emoji text not null,
 reason text not null default '',
 awarded_by uuid not null references auth.users(id),
 created_at timestamptz not null default now()
);
alter table public.music_pairs enable row level security;
alter table public.diary_entries enable row level security;
alter table public.reward_stamps enable row level security;
-- 配對只能由管理員在 SQL Editor 建立；前端使用者不可自行指定老師。
revoke insert, update, delete on public.music_pairs from anon, authenticated;
grant select on public.music_pairs to authenticated;
grant select, insert, update on public.diary_entries to authenticated;
grant select, insert on public.reward_stamps to authenticated;
create policy "pair members read" on public.music_pairs for select to authenticated
 using (student_id = (select auth.uid()) or teacher_id = (select auth.uid()));
create policy "diary members read" on public.diary_entries for select to authenticated
 using (exists(select 1 from public.music_pairs p where p.id=pair_id and (p.student_id=(select auth.uid()) or p.teacher_id=(select auth.uid()))));
-- 僅允許雙方建立空白的聯絡簿；後續各欄位寫入透過安全 RPC 處理。
create policy "diary members insert blank" on public.diary_entries for insert to authenticated
 with check (student_note='' and teacher_note='' and exists(select 1 from public.music_pairs p where p.id=pair_id and (p.student_id=(select auth.uid()) or p.teacher_id=(select auth.uid()))));
-- 刻意不建立 diary_entries 的 UPDATE policy，避免一方覆寫另一方欄位。
create policy "stamps members read" on public.reward_stamps for select to authenticated
 using (exists(select 1 from public.music_pairs p where p.id=pair_id and (p.student_id=(select auth.uid()) or p.teacher_id=(select auth.uid()))));
create policy "teacher awards stamps" on public.reward_stamps for insert to authenticated
 with check (awarded_by=(select auth.uid()) and exists(select 1 from public.music_pairs p where p.id=pair_id and p.teacher_id=(select auth.uid())));
-- 專用 RPC：以 SECURITY INVOKER 不能繞過 RLS，故用 SECURITY DEFINER + 明確角色驗證。
create or replace function public.save_diary_note(p_pair_id uuid,p_date date,p_note text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_student uuid; v_teacher uuid;
begin
 select student_id,teacher_id into v_student,v_teacher from public.music_pairs where id=p_pair_id;
 if v_uid is null or (v_uid is distinct from v_student and v_uid is distinct from v_teacher) then
  raise exception 'not a pair member';
 end if;
 insert into public.diary_entries(pair_id,entry_date) values(p_pair_id,p_date)
 on conflict(pair_id,entry_date) do nothing;
 if v_uid=v_student then
  update public.diary_entries set student_note=coalesce(p_note,''),updated_at=now() where pair_id=p_pair_id and entry_date=p_date;
 else
  update public.diary_entries set teacher_note=coalesce(p_note,''),updated_at=now() where pair_id=p_pair_id and entry_date=p_date;
 end if;
end $$;
revoke all on function public.save_diary_note(uuid,date,text) from public,anon;
grant execute on function public.save_diary_note(uuid,date,text) to authenticated;
