import { test } from "node:test";
import assert from "node:assert/strict";
import { courses, allLessons } from "../src/lib/curriculum";
import {
  gradeUnits,
  learningContext,
  gradeLessons,
  continueLesson,
  lessonNavigation,
  lessonStatus,
  studentAssignments,
  readPreferences,
  savePreferences,
} from "../src/lib/student-learning";
test("class grades override personal suggestions without mixing class paths", () => {
  const preferences = {
    grade: 9,
    lastLesson: "combine",
    started: [],
    positions: {},
  };
  const room = {
    id: "a",
    name: "Primary",
    course: "arithmetic",
    code: "CODE",
    owner: "teacher",
    members: ["student"],
    grade: 3,
  };
  const rooms = [
    room,
    { ...room, id: "b", grade: 6 },
    { ...room, id: "hidden", grade: 12, members: ["other"] },
  ];
  assert.equal(learningContext(rooms, "student", preferences).grade, 3);
  assert.equal(
    learningContext(rooms, "student", { ...preferences, classroomId: "b" })
      .grade,
    6,
  );
  assert.equal(
    learningContext(rooms, "student", { ...preferences, classroomId: "hidden" })
      .grade,
    3,
  );
  assert.equal(learningContext(rooms, "outsider", preferences).grade, 9);
  assert.equal(
    learningContext([{ ...room, grade: 0 }], "student", preferences).grade,
    0,
  );
  assert.equal(
    learningContext([{ ...room, grade: null }], "student", preferences).grade,
    9,
  );
  assert.equal(continueLesson(gradeUnits(3), [], "combine")?.id, "multiply");
  assert.ok(!gradeLessons(3).some((lesson) => lesson.id === "combine"));
  assert.ok(gradeLessons(6).some((lesson) => lesson.id === "ratios-practice"));
});
test("grade views reference canonical units and do not duplicate lesson objects", () => {
  for (let grade = 0; grade <= 12; grade++) {
    const units = gradeUnits(grade);
    for (const u of units) {
      assert.equal(
        u.unit,
        courses
          .find((c) => c.id === u.courseId)!
          .units.find((x) => x.id === u.unit.id),
      );
      for (const l of u.unit.lessons)
        assert.equal(
          l,
          allLessons.find((x) => x.id === l.id),
        );
    }
    assert.equal(new Set(units.map((u) => u.key)).size, units.length);
  }
  assert.deepEqual(gradeUnits(null), []);
  assert.ok(gradeUnits(12).length > 0);
});
test("continue and next/back navigation honor the selected grade and final lesson", () => {
  const units = gradeUnits(3);
  assert.equal(continueLesson(units, [], "multiply")?.id, "multiply");
  assert.equal(
    continueLesson(units, ["multiply"], "multiply")?.id,
    "division-practice",
  );
  assert.equal(lessonNavigation("multiply", 3).next?.id, "division-practice");
  assert.equal(lessonNavigation("division-practice", 3).next?.id, "g3-arrays");
  const final = units.flatMap((unit) => unit.unit.lessons).at(-1)!;
  assert.equal(lessonNavigation(final.id, 3).next, undefined);
  assert.equal(
    lessonNavigation("solve", 0).backHref,
    "/course/algebra#unit-algebra-equations",
  );
  assert.equal(lessonNavigation("sat-algebra", 0).next?.id, "sat-advanced");
});

test("every grade has a distinct starting path and grade changes do not change shared mastery IDs", () => {
  const paths = Array.from({ length: 13 }, (_, grade) =>
    gradeUnits(grade).flatMap((entry) =>
      entry.unit.lessons.map((lesson) => lesson.id),
    ),
  );
  assert.equal(new Set(paths.map((path) => path.join(","))).size, 13);
  assert.deepEqual(paths[0], [
    "counting-practice",
    "g0-count-stars",
    "g0-one-more",
  ]);
  assert.ok(paths[3].includes("multiply"));
  assert.ok(!paths[3].includes("quadratic"));
  assert.ok(paths[10].includes("triangle-angles-practice"));
  assert.ok(!paths[10].includes("addition"));
  assert.ok(paths[12].includes("function-composition-practice"));
  assert.equal(
    gradeUnits(4).find((entry) => entry.unit.id === "parts")?.unit.lessons[0],
    gradeUnits(5).find((entry) => entry.unit.id === "parts")?.unit.lessons[0],
  );
});
test("assignment groups exclude nonmember classrooms and use personal lesson completion", () => {
  const classroom = {
    id: "c",
    name: "Class",
    code: "code",
    course: "arithmetic",
    owner: "teacher",
    members: ["a"],
  };
  const assignments = [
    {
      id: "x",
      classroom: "c",
      lesson: "addition",
      title: "Add",
      due: "2026-11-01",
    },
    { id: "y", classroom: "c", lesson: "multiply", title: "Multiply", due: "" },
  ];
  assert.equal(
    studentAssignments(assignments, [classroom], "b", []).todo.length,
    0,
  );
  const result = studentAssignments(assignments, [classroom], "a", [
    "addition",
  ]);
  assert.equal(result.todo[0].id, "y");
  assert.equal(result.completed[0].id, "x");
  assert.equal(lessonStatus("addition", ["addition"], [], []), "Completed");
  assert.equal(lessonStatus("multiply", [], [], ["multiply"]), "In progress");
});
test("grade and resume preferences survive storage and stay separate by account", () => {
  const data = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => data.get(k) || null,
      setItem: (k: string, v: string) => data.set(k, v),
    },
  });
  savePreferences(null, {
    grade: 0,
    lastLesson: "addition",
    started: ["addition"],
    positions: { addition: 1 },
  });
  assert.equal(readPreferences(null).grade, 0);
  assert.equal(readPreferences(null).positions.addition, 1);
  assert.equal(readPreferences("student-a").grade, null);
  savePreferences("student-a", {
    grade: 9,
    lastLesson: null,
    started: [],
    positions: {},
  });
  assert.equal(readPreferences("student-a").grade, 9);
  assert.equal(readPreferences(null).grade, 0);
});
