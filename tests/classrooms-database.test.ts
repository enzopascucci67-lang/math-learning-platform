import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { allLessons } from "../src/lib/curriculum";
import { gradeLessons } from "../src/lib/student-learning";
import { gradeSixLessons } from "../src/lib/grade-six-content";
import { expandedLessons } from "../src/lib/expanded-content";

test("classroom migrations enforce teacher ownership and student privacy", async (t) => {
  const db = new PGlite({ extensions: { pgcrypto } });
  t.after(() => db.close());
  const teacher = "00000000-0000-4000-8000-000000000011";
  const otherTeacher = "00000000-0000-4000-8000-000000000012";
  const student = "00000000-0000-4000-8000-000000000013";
  const peer = "00000000-0000-4000-8000-000000000014";
  const outsider = "00000000-0000-4000-8000-000000000015";
  await db.exec(`create role anon; create role authenticated;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated;`);
  for (const file of [
    "migrations/001_foundation.sql",
    "seed.sql",
    "migrations/002_cosmetic_rewards.sql",
    "migrations/003_classroom_code_privacy.sql",
    "migrations/004_classroom_grades.sql",
    "migrations/005_more_clothing.sql",
    "migrations/006_assignment_content.sql",
  ]) {
    await db.exec(
      await readFile(new URL(`../supabase/${file}`, import.meta.url), "utf8"),
    );
  }
  for (const id of [teacher, otherTeacher, student, peer, outsider])
    await db.query("insert into auth.users values ($1)", [id]);
  // Only the administrator approves teacher roles; clients have no profile writes.
  await db.query(
    "update public.profiles set role='teacher' where id in ($1,$2)",
    [teacher, otherTeacher],
  );
  async function signIn(id: string) {
    await db.exec("reset role; set role authenticated");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
  }
  type Room = { id: string; code: string; members: string[] };
  async function rooms() {
    return (
      await db.query<{ rooms: Room[] }>(
        "select public.classroom_overview() as rooms",
      )
    ).rows[0].rooms;
  }
  const lesson = allLessons[0];
  let room: string;
  let code: string;
  await t.test(
    "students cannot promote themselves or create classrooms",
    async () => {
      await signIn(student);
      await assert.rejects(
        db.query("update public.profiles set role='teacher' where id=$1", [
          student,
        ]),
        /permission denied/,
      );
      await assert.rejects(
        db.query("select public.create_classroom('Forged',null)"),
        /Approved teacher/,
      );
      await assert.rejects(
        db.query(
          "insert into public.classrooms(name,owner) values ('Forged',$1)",
          [student],
        ),
        /permission denied/,
      );
    },
  );
  await t.test(
    "approved teachers create rooms and receive their own join codes",
    async () => {
      await signIn(teacher);
      room = (
        await db.query<{ id: string }>(
          "select public.create_classroom('  Math group  ',null) as id",
        )
      ).rows[0].id;
      const visible = await rooms();
      assert.equal(visible.length, 1);
      assert.equal(visible[0].id, room);
      code = visible[0].code;
      assert.match(code, /^[A-F0-9]{12}$/);
      await assert.rejects(
        db.query("select public.join_classroom($1)", [code]),
        /Student account/,
      );
    },
  );
  await t.test(
    "nonmembers cannot discover rooms, codes, memberships or assignments",
    async () => {
      await signIn(outsider);
      assert.deepEqual(await rooms(), []);
      assert.equal(
        (await db.query("select id from public.classrooms")).rows.length,
        0,
      );
      await assert.rejects(
        db.query("select code from public.classrooms"),
        /permission denied/,
      );
      await assert.rejects(
        db.query("select public.join_classroom('INVALID')"),
        /Invalid classroom code/,
      );
      await assert.rejects(
        db.query("insert into public.classroom_memberships values ($1,$2)", [
          room,
          outsider,
        ]),
        /permission denied/,
      );
    },
  );
  await t.test(
    "joining accepts padded lowercase codes and is idempotent",
    async () => {
      for (const id of [student, peer]) {
        await signIn(id);
        await db.query("select public.join_classroom($1)", [
          `  ${code.toLowerCase()}  `,
        ]);
        await db.query("select public.join_classroom($1)", [code]);
      }
      await signIn(student);
      const visible = await rooms();
      assert.deepEqual(visible[0].members, [student]);
      assert.equal(visible[0].code, "");
      assert.equal(
        (await db.query("select student_id from public.classroom_memberships"))
          .rows.length,
        1,
      );
      await assert.rejects(
        db.query("select code from public.classrooms where id=$1", [room]),
        /permission denied/,
      );
      await signIn(teacher);
      assert.deepEqual(
        new Set((await rooms())[0].members),
        new Set([student, peer]),
      );
    },
  );
  await t.test(
    "only the owner can assign lessons and members can read assignments",
    async () => {
      for (const id of [student, otherTeacher]) {
        await signIn(id);
        await assert.rejects(
          db.query(
            "insert into public.assignments(classroom_id,lesson_id,title) values ($1,$2,'Unauthorized')",
            [room, lesson.id],
          ),
          /row-level security/,
        );
        await assert.rejects(
          db.query("select * from public.assignment_report($1)", [room]),
          /Access denied/,
        );
      }
      await signIn(teacher);
      await db.query(
        "insert into public.assignments(classroom_id,lesson_id,title) values ($1,$2,'First practice')",
        [room, lesson.id],
      );
      await signIn(student);
      assert.equal(
        (
          await db.query<{ title: string }>(
            "select title from public.assignments",
          )
        ).rows[0].title,
        "First practice",
      );
      await signIn(outsider);
      assert.equal(
        (await db.query("select id from public.assignments")).rows.length,
        0,
      );
      await signIn(otherTeacher);
      assert.deepEqual(await rooms(), []);
    },
  );
  await t.test(
    "reports reflect verified mastery without exposing unrelated learning or duplicating rewards",
    async () => {
      await signIn(student);
      for (const question of lesson.questions)
        await db.query("select public.submit_answer($1,$2,$3)", [
          lesson.id,
          question.id,
          question.answer,
        ]);
      for (const question of lesson.questions)
        await db.query("select public.submit_answer($1,$2,$3)", [
          lesson.id,
          question.id,
          question.answer,
        ]);
      const extra = allLessons[1];
      for (const question of extra.questions)
        await db.query("select public.submit_answer($1,$2,$3)", [
          extra.id,
          question.id,
          question.answer,
        ]);
      assert.equal(
        (await db.query("select * from public.xp_events")).rows.length,
        2,
      );
      await signIn(peer);
      assert.equal(
        (await db.query("select * from public.lesson_progress")).rows.length,
        0,
      );
      assert.equal(
        (await db.query("select * from public.assignment_submissions")).rows
          .length,
        0,
      );
      await signIn(teacher);
      const report = (
        await db.query<{
          student_id: string;
          lesson_id: string;
          completed_at: string | null;
        }>("select * from public.assignment_report($1)", [room])
      ).rows;
      assert.equal(report.length, 2);
      assert.ok(report.every((row) => row.lesson_id === lesson.id));
      assert.ok(report.find((row) => row.student_id === student)?.completed_at);
      assert.equal(
        report.find((row) => row.student_id === peer)?.completed_at,
        null,
      );
      assert.equal(
        (await db.query("select * from public.question_attempts")).rows.length,
        0,
      );
      assert.equal(
        (await db.query("select * from public.lesson_progress")).rows.length,
        0,
      );
    },
  );
  await t.test("selected lessons determine assignment completion", async () => {
    await signIn(teacher);
    const second = allLessons[2];
    const insert =
      "insert into public.assignments(classroom_id,lesson_id,additional_lesson_ids,title) values ($1,$2,array[$3::text],'Selected lessons') returning id";
    await assert.rejects(
      db.query(insert, [room, lesson.id, lesson.id]),
      /distinct lessons/,
    );
    await assert.rejects(
      db.query(insert, [room, lesson.id, "missing-lesson"]),
      /classroom grade/,
    );
    const {
      rows: [assignment],
    } = await db.query<{ id: string }>(insert, [room, lesson.id, second.id]);
    const report =
      "select * from public.assignment_content_report($1) where assignment_id=$2 and student_id=$3";
    const params = [room, assignment.id, student];
    const before = await db.query<{
      completed_count: number;
      lesson_ids: string[];
    }>(report, params);
    assert.equal(before.rows[0].completed_count, 1);
    assert.deepEqual(before.rows[0].lesson_ids, [lesson.id, second.id]);
    await signIn(student);
    await assert.rejects(db.query(report, params), /Access denied/);
    for (const q of second.questions)
      await db.query("select public.submit_answer($1,$2,$3)", [
        second.id,
        q.id,
        q.answer,
      ]);
    const submissions = await db.query(
      "select * from public.assignment_submissions where assignment_id=$1",
      [assignment.id],
    );
    assert.equal(submissions.rows.length, 1);
    await signIn(teacher);
    const after = await db.query<{ completed_count: number }>(report, params);
    assert.equal(after.rows[0].completed_count, 2);
    await db.exec("reset role");
    await db.query("delete from public.assignments where id=$1", [
      assignment.id,
    ]);
  });

  await t.test(
    "class grades constrain new assignments and preserve existing work",
    async () => {
      await signIn(student);
      await assert.rejects(
        db.query("select public.set_classroom_grade($1,3)", [room]),
        /Access denied/,
      );
      await signIn(otherTeacher);
      await assert.rejects(
        db.query("select public.set_classroom_grade($1,3)", [room]),
        /Access denied/,
      );
      await signIn(teacher);
      await assert.rejects(
        db.query("select public.create_classroom('Invalid',null,13)"),
        /valid class grade/,
      );
      await db.query("select public.set_classroom_grade($1,3)", [room]);
      assert.equal(
        (
          await db.query<{ grade: number }>(
            "select grade from public.classrooms where id=$1",
            [room],
          )
        ).rows[0].grade,
        3,
      );
      assert.equal(
        (await db.query("select id from public.assignments")).rows.length,
        1,
      );
      await assert.rejects(
        db.query(
          "insert into public.assignments(classroom_id,lesson_id,title) values ($1,'combine','Wrong grade')",
          [room],
        ),
        /classroom grade/,
      );
      await db.query(
        "insert into public.assignments(classroom_id,lesson_id,title) values ($1,'multiply','Grade 3 practice')",
        [room],
      );
      await signIn(student);
      const overview = (
        await db.query<{ rooms: { grade: number }[] }>(
          "select public.classroom_overview() as rooms",
        )
      ).rows[0].rooms;
      assert.equal(overview[0].grade, 3);
      assert.equal(
        (await db.query("select id from public.assignments")).rows.length,
        2,
      );
    },
  );
  await t.test(
    "expanded Grade 6 assignments and all new answer keys work through the database",
    async () => {
      await signIn(teacher);
      await db.query("select public.set_classroom_grade($1,6)", [room]);
      for (const lesson of gradeLessons(6))
        await db.query(
          "insert into public.assignments(classroom_id,lesson_id,title) values ($1,$2,$3)",
          [room, lesson.id, lesson.title],
        );
      await assert.rejects(
        db.query(
          "insert into public.assignments(classroom_id,lesson_id,title) values ($1,'multiply','Wrong grade')",
          [room],
        ),
        /classroom grade/,
      );
      await signIn(student);
      for (const lesson of gradeSixLessons)
        for (const question of lesson.questions) {
          const result = await db.query<{ correct: boolean }>(
            "select public.submit_answer($1,$2,$3) as correct",
            [lesson.id, question.id, question.answer],
          );
          assert.equal(result.rows[0].correct, true, question.id);
        }
      const progress = await db.query<{ lesson_id: string }>(
        "select lesson_id from public.lesson_progress",
      );
      for (const lesson of gradeSixLessons)
        assert.ok(progress.rows.some((row) => row.lesson_id === lesson.id));
    },
  );
  await t.test(
    "all 26 added lessons enforce grade scope and grade their keys in PostgreSQL",
    async () => {
      for (let grade = 0; grade <= 12; grade++) {
        await signIn(teacher);
        await db.query("select public.set_classroom_grade($1,$2)", [
          room,
          grade,
        ]);
        for (const { lesson } of expandedLessons.filter(
          (entry) => entry.grade === grade,
        )) {
          await db.query(
            "insert into public.assignments(classroom_id,lesson_id,title) values ($1,$2,$3)",
            [room, lesson.id, lesson.title],
          );
          await signIn(student);
          for (const question of lesson.questions) {
            const result = await db.query<{ correct: boolean }>(
              "select public.submit_answer($1,$2,$3) as correct",
              [lesson.id, question.id, question.answer],
            );
            assert.equal(result.rows[0].correct, true, question.id);
          }
          await signIn(teacher);
        }
        const wrong = expandedLessons.find(
          (entry) => entry.grade !== grade,
        )!.lesson;
        await assert.rejects(
          db.query(
            "insert into public.assignments(classroom_id,lesson_id,title) values ($1,$2,'Wrong grade')",
            [room, wrong.id],
          ),
          /classroom grade/,
        );
      }
    },
  );
  await t.test(
    "anonymous users cannot join, create, list or report classrooms",
    async () => {
      await db.exec("reset role; set role anon");
      for (const sql of [
        "select public.classroom_overview()",
        "select public.create_classroom('Room',null)",
        "select public.join_classroom('INVALID')",
        `select * from public.assignment_report('${room}')`,
        "select id from public.classrooms",
      ])
        await assert.rejects(db.query(sql), /permission denied/);
    },
  );
});
