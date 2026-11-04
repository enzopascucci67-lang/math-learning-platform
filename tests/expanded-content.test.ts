import { test } from "node:test";
import assert from "node:assert/strict";
import { expandedLessons } from "../src/lib/expanded-content";
import {
  gradeCoverage,
  gradeLessons,
  lessonNavigation,
} from "../src/lib/student-learning";
import { allLessons } from "../src/lib/curriculum";
import { checkAnswer, numberValue } from "../src/lib/answers";

test("course coverage preserves gaps and groups only consecutive grades", () => {
  assert.equal(gradeCoverage([10, 6, 6]), "Grade 6 · Grade 10");
  assert.equal(gradeCoverage([0, 1, 2, 5]), "Kindergarten–Grade 2 · Grade 5");
  assert.equal(gradeCoverage([]), "");
});

test("every grade gains two isolated canonical lessons with usable hints and examples", () => {
  assert.equal(expandedLessons.length, 26);
  assert.equal(
    expandedLessons.flatMap((entry) => entry.lesson.questions).length,
    78,
  );
  for (let grade = 0; grade <= 12; grade++) {
    const entries = expandedLessons.filter((entry) => entry.grade === grade);
    assert.equal(entries.length, 2);
    assert.ok(gradeLessons(grade).length >= 3);
    for (const { lesson } of entries) {
      assert.equal(
        allLessons.find((candidate) => candidate.id === lesson.id),
        lesson,
      );
      for (let other = 0; other <= 12; other++)
        assert.equal(gradeLessons(other).includes(lesson), other === grade);
      assert.ok(lesson.example && lesson.explanation);
      assert.ok(
        lesson.questions.every(
          (question) =>
            question.hint && question.explanation && question.prompt,
        ),
      );
    }
  }
});
test("new answers agree with independent arithmetic geometry and algebra calculations", () => {
  const expected = [
    [3, 5, 8],
    [2 + 1, 5 - 1, 6 + 1],
    [10 - 4, 10 - 8, 10 - 3],
    [9 - 4, 15 - 5, 14 - 6],
    [8 + 2, 15 + 5, 40 + 10],
    [32 + 25, 47 + 16, 28 + 35],
    [3 * 4, 4 * 5, 6 * 3],
    [21 / 3, 56 / 7, 36 / 4],
    [1 / 5 + 2 / 5, 3 / 8 + 1 / 8, 2 / 6 + 3 / 6],
    [28 / 4, 6, 6],
    [(1 / 2) * (1 / 3), (3 / 5) * (2 / 3), 3 / 4 / 2],
    [0.4 * 0.5, 2.5 * 1.2, 3 * 1.75],
    [20 - 9, 28 / 4, 5 * 3],
    [(8 * 3) / 2, (5 * 6) / 2, (2 * 24) / 8],
    [-4 * 6, -7 * -3, -36 / 9],
    [50 * 0.8, 80 * 1.15, ((25 - 20) / 20) * 100],
    [(5 - 1) / (2 - 0), (1 - 7) / (4 - 1), 12 / 8],
    [(17 - 5) / 2, (12 + 8) / 5, 21 / 3 - 2],
    [3 * 5 - 2, 7, (1 - 9) / -2],
    [2 ** 7, 3 ** 4, 5 ** 3 / 5 ** 2],
    [Math.sqrt(6 ** 2 + 8 ** 2), Math.sqrt(13 ** 2 - 5 ** 2), 5 ** 2 + 5 ** 2],
    [3.14 * 3 ** 2, 2 * 3.14 * 5, 3.14 * (8 / 2) ** 2],
    [8 / 2, -12 / (2 * 2), 2 ** 2 - 4 * 2 + 7],
    [11 + 3, 2 + 5 * 5, 30 - 4 * 4],
    [3 * 3 ** 2, 100 * 1.1 ** 2, 80 * 0.5 ** 3],
    [5, -2, 0],
  ];
  expandedLessons.forEach(({ lesson }, index) =>
    lesson.questions.forEach((question, q) => {
      assert.ok(
        Math.abs(numberValue(question.answer)! - expected[index][q]) < 1e-6,
        question.id,
      );
      assert.ok(checkAnswer(question, String(expected[index][q])), question.id);
      assert.equal(
        checkAnswer(question, String(expected[index][q] + 1)),
        false,
        question.id,
      );
    }),
  );
});
test("visual teaching aids have bounded valid geometry", () => {
  const visuals = expandedLessons.flatMap(({ lesson }) =>
    lesson.questions.flatMap((q) => (q.visual ? [q.visual] : [])),
  );
  assert.ok(visuals.length >= 7);
  for (const visual of visuals) {
    if (visual.type === "objects")
      assert.ok(visual.count > 0 && visual.count <= 10);
    if (visual.type === "array")
      assert.ok(
        visual.rows > 0 &&
          visual.columns > 0 &&
          visual.rows <= 6 &&
          visual.columns <= 6,
      );
    if (visual.type === "fraction")
      assert.ok(
        visual.numerator >= 0 &&
          visual.numerator <= visual.denominator &&
          visual.denominator > 0,
      );
  }
});
test("completion navigation skips mastered work and recovers earlier unfinished lessons", () => {
  const grade = gradeLessons(6),
    first = grade[0],
    next = grade[1];
  assert.equal(
    lessonNavigation(first.id, 6, [first.id, next.id]).next?.id,
    grade[2].id,
  );
  const last = grade.at(-1)!;
  assert.equal(lessonNavigation(last.id, 6, [last.id]).next?.id, first.id);
  assert.equal(
    lessonNavigation(
      last.id,
      6,
      grade.map((lesson) => lesson.id),
    ).next,
    undefined,
  );
});
