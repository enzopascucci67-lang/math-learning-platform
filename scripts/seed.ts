import { writeFileSync } from "node:fs";
import { courses, satLessons } from "../src/lib/curriculum";
const quote = (s: unknown) =>
  "'" +
  String(typeof s === "string" ? s : JSON.stringify(s)).replaceAll("'", "''") +
  "'";
let sql = "-- Generated from src/lib/curriculum.ts. Apply after migration.\n";
for (const c of [
  ...courses,
  {
    id: "sat",
    title: "SAT",
    subject: "SAT",
    grades: [11, 12],
    description: "Original SAT practice",
    units: [
      {
        id: "sat",
        title: "SAT",
        x: 0,
        y: 0,
        requires: [],
        lessons: satLessons,
      },
    ],
  },
]) {
  sql += `insert into public.courses values (${quote(c.id)},${quote(c)}) on conflict(id) do update set content=excluded.content;\n`;
  for (const u of c.units) {
    sql += `insert into public.units values (${quote(u.id)},${quote(c.id)},${quote(u)}) on conflict(id) do update set content=excluded.content;\n`;
    for (const l of u.lessons) {
      sql += `insert into public.lessons values (${quote(l.id)},${quote(u.id)},${quote(l)}) on conflict(id) do update set content=excluded.content;\n`;
      for (const q of l.questions)
        sql += `insert into public.questions values (${quote(q.id)},${quote(l.id)},${quote(q.kind)},${quote(q.answer)},${quote(q)}) on conflict(id) do update set answer=excluded.answer,content=excluded.content;\n`;
    }
  }
  for (const u of c.units)
    for (const r of u.requires)
      sql += `insert into public.skill_edges(source,target) values(${quote(r)},${quote(u.id)}) on conflict do nothing;\n`;
}
writeFileSync("supabase/seed.sql", sql);
