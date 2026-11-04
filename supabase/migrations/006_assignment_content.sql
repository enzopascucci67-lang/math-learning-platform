alter table public.assignments add column additional_lesson_ids text[] not null default '{}';

create or replace function public.check_assignment_grade() returns trigger language plpgsql security definer set search_path=public as $$
declare
  g integer;
  selected text[] := array[new.lesson_id] || new.additional_lesson_ids;
begin
  select grade into g from classrooms where id=new.classroom_id for share;
  if cardinality(selected) <> (select count(distinct id) from unnest(selected) as selected_ids(id))
    or exists (
      select 1 from unnest(selected) as selected_ids(id)
      where not exists (
        select 1 from lessons l left join units u on u.id=l.unit_id left join courses c on c.id=u.course_id
        where l.id=selected_ids.id and (g is null or (
          c.id <> 'sat' and c.content->'grades' @> to_jsonb(array[g])
          and (not (u.content ? 'grades') or u.content->'grades' @> to_jsonb(array[g]))
        ))
      )
    ) then raise exception 'Choose distinct lessons for this classroom grade'; end if;
  return new;
end $$;

drop trigger assignment_grade on public.assignments;
create trigger assignment_grade before insert or update of classroom_id,lesson_id,additional_lesson_ids
on public.assignments for each row execute function public.check_assignment_grade();

create or replace view public.assignment_submissions with(security_invoker=true) as
select a.id assignment_id,p.user_id,max(p.completed_at) completed_at
from public.assignments a
join public.lesson_progress p on p.lesson_id=any(array[a.lesson_id] || a.additional_lesson_ids)
group by a.id,p.user_id
having count(*)=1+cardinality(a.additional_lesson_ids);

create function public.assignment_content_report(p_classroom uuid)
returns table(student_id uuid,assignment_id uuid,title text,lesson_ids text[],completed_count integer)
language plpgsql stable security definer set search_path=public as $$
begin
  if not public.owns_room(p_classroom) then raise exception 'Access denied'; end if;
  return query
    select m.student_id,a.id,a.title,array[a.lesson_id] || a.additional_lesson_ids,count(p.lesson_id)::integer
    from classroom_memberships m
    join assignments a on a.classroom_id=m.classroom_id
    left join lesson_progress p on p.user_id=m.student_id
      and p.lesson_id=any(array[a.lesson_id] || a.additional_lesson_ids)
    where m.classroom_id=p_classroom
    group by m.student_id,a.id
    order by a.title,a.id,m.student_id;
end $$;
revoke all on function public.assignment_content_report(uuid) from public,anon;
grant execute on function public.assignment_content_report(uuid) to authenticated;
