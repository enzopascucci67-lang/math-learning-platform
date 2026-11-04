-- Additive rewards: existing inventory and thresholds stay intact.
begin;
insert into public.cosmetic_catalog(id,slot,required_lessons) values
  ('sunset-sweater','body',15),
  ('stargazer-beanie','head',20),
  ('explorer-satchel','accessory',30)
on conflict(id) do nothing;
-- Existing completion triggers and inventory backfill grant these milestones.
commit;
