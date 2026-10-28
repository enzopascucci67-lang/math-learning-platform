import { test } from "node:test";
import assert from "node:assert/strict";
import { allLessons, courses } from "../src/lib/curriculum";
import { checkAnswer, numberValue } from "../src/lib/answers";
import { emptyState, recordAttempt } from "../src/lib/store";
test("mastery requires every question, survives retries and awards XP only once", () => {
  const l = allLessons[0];
  let s = structuredClone(emptyState);
  s = recordAttempt(s, l, {
    questionId: l.questions[0].id,
    answer: "wrong",
    correct: false,
    at: "now",
  });
  assert.equal(s.completed.length, 0);
  for (const q of l.questions)
    s = recordAttempt(s, l, {
      questionId: q.id,
      answer: q.answer,
      correct: true,
      at: "now",
    });
  assert.deepEqual(s.completed, [l.id]);
  s = recordAttempt(s, l, {
    questionId: l.questions[0].id,
    answer: l.questions[0].answer,
    correct: true,
    at: "later",
  });
  assert.equal(s.completed.length * 50, 50);
  assert.equal(JSON.parse(JSON.stringify(s)).completed[0], l.id);
});
test("numeric equivalents, rejection and tolerance", () => {
  const q = allLessons.find((l) => l.id === "fractions")!.questions[0];
  for (const a of ["0.5", "1/2", "2/4", " .5000001 "])
    assert.ok(checkAnswer(q, a));
  for (const a of ["", "1/0", "NaN", "Infinity", "0.6", "1+1", "0.5junk"])
    assert.ok(!checkAnswer(q, a));
  assert.equal(numberValue("−1/2"), -0.5);
});
test("every answer key passes its validator and IDs are unique", () => {
  const ids = new Set<string>();
  for (const l of allLessons) {
    assert.ok(!ids.has(l.id));
    ids.add(l.id);
    assert.ok(l.questions.length);
    for (const q of l.questions) {
      assert.ok(!ids.has(q.id));
      ids.add(q.id);
      assert.ok(checkAnswer(q, q.answer));
      if (q.choices) assert.ok(q.choices.includes(q.answer));
    }
  }
});
test("prerequisites form a valid acyclic graph with branches and merges", () => {
  for (const c of courses) {
    const visit = (id: string, path: string[]) => {
      assert.ok(!path.includes(id));
      const u = c.units.find((u) => u.id === id);
      assert.ok(u);
      for (const r of u.requires) visit(r, [...path, id]);
    };
    for (const u of c.units) visit(u.id, []);
  }
  const a = courses.find((c) => c.id === "algebra")!;
  assert.ok(a.units.some((u) => u.requires.length > 1));
  assert.ok(
    a.units.filter((u) => u.requires.includes("foundations")).length > 1,
  );
});
