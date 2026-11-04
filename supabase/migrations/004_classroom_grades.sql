alter table public.classrooms add column grade smallint check(grade between 0 and 12);
grant select(grade) on public.classrooms to authenticated;

create function public.create_classroom(p_name text,p_course text,p_grade integer) returns uuid
language plpgsql security definer set search_path=public as $$
declare room uuid;
begin
  if p_grade is null or p_grade not between 0 and 12 then raise exception 'Choose a valid class grade'; end if;
  room := public.create_classroom(p_name,p_course);
  update classrooms set grade=p_grade where id=room;
  return room;
end $$;

create function public.set_classroom_grade(p_classroom uuid,p_grade integer) returns void
language plpgsql security definer set search_path=public as $$
begin
  if not public.owns_room(p_classroom) or not exists(select 1 from profiles where id=auth.uid() and role='teacher') then raise exception 'Access denied'; end if;
  if p_grade is null or p_grade not between 0 and 12 then raise exception 'Choose a valid class grade'; end if;
  update classrooms set grade=p_grade where id=p_classroom;
end $$;

create or replace function public.classroom_overview() returns jsonb language sql stable security definer set search_path=public as $$
select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'course',c.course_id,'grade',c.grade,'owner',c.owner,'code',case when c.owner=auth.uid() then c.code else '' end,'members',(select coalesce(jsonb_agg(m.student_id),'[]') from classroom_memberships m where m.classroom_id=c.id and (c.owner=auth.uid() or m.student_id=auth.uid())))),'[]') from classrooms c where c.owner=auth.uid() or public.in_room(c.id)
$$;

create function public.check_assignment_grade() returns trigger language plpgsql security definer set search_path=public as $$
declare g integer;
begin
  select grade into g from classrooms where id=new.classroom_id;
  if g is not null and not exists(
    select 1 from lessons l join units u on u.id=l.unit_id join courses c on c.id=u.course_id
    where l.id=new.lesson_id and c.id <> 'sat' and c.content->'grades' @> to_jsonb(array[g])
    and (not (u.content ? 'grades') or u.content->'grades' @> to_jsonb(array[g]))
  ) then raise exception 'Choose a lesson for this classroom grade'; end if;
  return new;
end $$;
create trigger assignment_grade before insert or update of classroom_id,lesson_id on public.assignments for each row execute function public.check_assignment_grade();
revoke all on function public.create_classroom(text,text,integer),public.set_classroom_grade(uuid,integer),public.check_assignment_grade() from public,anon;
grant execute on function public.create_classroom(text,text,integer),public.set_classroom_grade(uuid,integer) to authenticated;
