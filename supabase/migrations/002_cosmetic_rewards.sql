-- Apply after 001_foundation.sql. Unlocks are derived from verified lesson_progress.
begin;
create table public.cosmetic_catalog (
  id text primary key,
  slot text not null check (slot in ('head', 'body', 'accessory')),
  required_lessons integer not null check (required_lessons >= 0)
);
insert into public.cosmetic_catalog (id, slot, required_lessons) values
  ('starter-shirt', 'body', 0),
  ('explorer-cap', 'head', 1),
  ('star-badge', 'accessory', 1),
  ('forest-hoodie', 'body', 3),
  ('scholar-scarf', 'accessory', 5),
  ('star-crown', 'head', 10);
alter table public.cosmetic_catalog enable row level security;
create policy catalog_read on public.cosmetic_catalog for select using (true);
grant select on public.cosmetic_catalog to anon, authenticated;

create function public.grant_earned_cosmetics(p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  -- Serialize unlock and equip operations for one account, including concurrent lessons.
  perform 1 from profiles where id = p_user for update;
  insert into cosmetic_unlocks (user_id, item_id)
    select p_user, c.id from cosmetic_catalog c
    where c.required_lessons <= (select count(*) from lesson_progress where user_id = p_user)
    on conflict (user_id, item_id) do nothing;
end;
$$;

create function public.unlock_lesson_cosmetics() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.grant_earned_cosmetics(new.user_id);
  return new;
end;
$$;
create trigger lesson_cosmetic_rewards after insert on public.lesson_progress
  for each row execute function public.unlock_lesson_cosmetics();

create function public.character_inventory() returns jsonb
language plpgsql security definer set search_path = public as $$
declare learner uuid := auth.uid(); result jsonb;
begin
  if learner is null then raise exception 'Sign in required'; end if;
  if not exists (select 1 from profiles where id = learner) then raise exception 'Profile not found'; end if;
  -- Backfill rewards for accounts that completed lessons before this migration.
  perform public.grant_earned_cosmetics(learner);
  select jsonb_build_object('outfit', p.outfit, 'unlocked',
    (select coalesce(jsonb_agg(u.item_id order by u.item_id), '[]'::jsonb)
     from cosmetic_unlocks u join cosmetic_catalog c on c.id = u.item_id where u.user_id = learner))
    into result from profiles p where p.id = learner;
  return result;
end;
$$;

create function public.equip_cosmetic(p_slot text, p_item text default null) returns void
language plpgsql security definer set search_path = public as $$
declare learner uuid := auth.uid();
begin
  if learner is null then raise exception 'Sign in required'; end if;
  if p_slot is null or p_slot not in ('head', 'body', 'accessory') then raise exception 'Invalid clothing slot'; end if;
  if not exists (select 1 from profiles where id = learner) then raise exception 'Profile not found'; end if;
  perform public.grant_earned_cosmetics(learner);
  if p_item is null then
    update profiles set outfit = case when p_slot = 'body'
      then jsonb_set(outfit, '{body}', '"starter-shirt"'::jsonb)
      else outfit - p_slot end where id = learner;
    return;
  end if;
  if not exists (
    select 1 from cosmetic_catalog c join cosmetic_unlocks u on u.item_id = c.id
    where c.id = p_item and c.slot = p_slot and u.user_id = learner
  ) then raise exception 'This clothing item is not unlocked for this slot'; end if;
  update profiles set outfit = jsonb_set(outfit, array[p_slot], to_jsonb(p_item)) where id = learner;
end;
$$;

revoke all on function public.grant_earned_cosmetics(uuid), public.unlock_lesson_cosmetics(),
  public.character_inventory(), public.equip_cosmetic(text, text) from public, anon, authenticated;
grant execute on function public.character_inventory(), public.equip_cosmetic(text, text) to authenticated;
-- Clients keep read-only profile/unlock access from migration 001.
commit;
