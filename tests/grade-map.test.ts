import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeUnits } from "../src/lib/student-learning";
import { gradeMapLayout } from "../src/lib/grade-map";

test("grade circle maps contain only selected-grade units with forward, local branches", () => {
  for (let grade = 0; grade <= 12; grade++) {
    const units = gradeUnits(grade);
    const layout = gradeMapLayout(units);
    assert.equal(layout.nodes.length, units.length);
    assert.equal(
      new Set(layout.nodes.map((node) => `${node.x},${node.y}`)).size,
      units.length,
    );
    for (const node of layout.nodes) {
      assert.ok(node.x > 0 && node.x < 100);
      assert.ok(node.y >= 0 && node.y < layout.height);
    }
    for (const { source, target } of layout.edges) {
      assert.equal(source.entry.courseId, target.entry.courseId);
      assert.ok(source.y < target.y);
    }
  }
  assert.ok(gradeMapLayout(gradeUnits(9)).edges.length > 0);
});
