import { test } from "node:test";
import assert from "node:assert/strict";
import { findLessons } from "../src/lib/lesson-search";
import { allLessons, courses } from "../src/lib/curriculum";

test("lesson search matches friendly names, canonical names, units and courses", () => {
  assert.ok(
    findLessons("  ADDING  small ").some(
      (result) => result.lesson.id === "addition",
    ),
  );
  assert.ok(
    findLessons("linear equations").some(
      (result) => result.lesson.id === "solve",
    ),
  );
  assert.ok(
    findLessons("foundations").some((result) => result.lesson.id === "order"),
  );
  assert.equal(
    findLessons("algebra I").filter((result) => result.course === "Algebra I")
      .length,
    courses
      .find((course) => course.id === "algebra")!
      .units.flatMap((unit) => unit.lessons).length,
  );
  assert.equal(findLessons("SAT").length, 4);
});
test("empty or unmatched searches are safe and results reference existing lessons", () => {
  assert.deepEqual(findLessons(" \t "), []);
  assert.deepEqual(findLessons("no-such-topic"), []);
  for (const result of findLessons("math"))
    assert.equal(
      result.lesson,
      allLessons.find((lesson) => lesson.id === result.lesson.id),
    );
  const results = findLessons("algebra");
  assert.equal(
    new Set(results.map((result) => result.lesson.id)).size,
    results.length,
  );
});
