import { test } from "node:test";
import assert from "node:assert/strict";
import { courses } from "../src/lib/curriculum";
import { unitProgress, unitReadiness } from "../src/lib/skill-tree";

test("branch merges become ready only after every prerequisite is mastered", () => {
  const course = courses.find((course) => course.id === "algebra")!;
  const unit = course.units.find((unit) => unit.id === "functions")!;
  assert.equal(unitReadiness(course, course.units[0], []), "Ready to explore");
  assert.equal(unitReadiness(course, unit, ["combine"]), "Build toward this");
  assert.equal(
    unitReadiness(course, unit, ["combine", "solve"]),
    "Ready to explore",
  );
  assert.equal(unitReadiness(course, unit, ["function"]), "Completed");
});

test("progress ignores duplicate and unrelated completions and handles empty units", () => {
  const unit = courses[0].units.find((unit) => unit.id === "addition")!;
  assert.equal(unitProgress(unit, ["unrelated"]), 0);
  assert.equal(unitProgress(unit, ["addition", "addition"]), 100);
  assert.equal(unitProgress({ ...unit, lessons: [] }, []), 0);
});
