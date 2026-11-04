-- Members may read classroom details, but join codes are owner-only.
-- classroom_overview() already returns codes only to the owning teacher.
revoke select on public.classrooms from authenticated;
grant select(id, name, course_id, owner) on public.classrooms to authenticated;
