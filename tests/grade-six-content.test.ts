import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeSixLessons } from "../src/lib/grade-six-content";
import {
  gradeLessons,
  gradeUnits,
  continueLesson,
  lessonNavigation,
} from "../src/lib/student-learning";
import { allLessons } from "../src/lib/curriculum";
import { checkAnswer, numberValue } from "../src/lib/answers";

test("expanded Grade 6 content is canonical and never suggested for another grade", () => {
  assert.equal(gradeSixLessons.length, 8);
  assert.equal(
    gradeSixLessons.flatMap((lesson) => lesson.questions).length,
    24,
  );
  for (const lesson of gradeSixLessons) {
    assert.equal(
      allLessons.find((candidate) => candidate.id === lesson.id),
      lesson,
    );
    for (let grade = 0; grade <= 12; grade++)
      assert.equal(gradeLessons(grade).includes(lesson), grade === 6);
    assert.ok(lesson.example.length > 30);
    assert.ok(
      lesson.questions.every(
        (question) => question.hint && question.explanation && question.prompt,
      ),
    );
  }
  assert.equal(gradeLessons(6).length, 14);
  for (const id of ["order", "combine", "ratios-practice", "integers-practice"])
    assert.ok(gradeLessons(6).some((lesson) => lesson.id === id));
});

test("new answer keys agree with independently calculated quantities and accept equivalents", () => {
  const expected = [
    [5, 4 / 2, 2 / (1 / 3)],
    [1 / 2 / (1 / 4), 2 / 3 / (4 / 5), 3 / 4 / (1 / 8)],
    [3.6 / 0.9, 5.25 / 0.5, 2.4 / 0.15],
    [3 * (6 / 2), 3 * (20 / 5), (6 / 4) * 10],
    [0.1 * 80, 0.35 * 60, 0.75 * 24],
    [5 * 3 + 1, 2 * (5 + 4), 4 ** 2 + 3],
    [5 * 2 * 3, 1.5 * 2 * 4, 48 / (4 * 3)],
    [(4 + 6 + 8) / 3, [9, 2, 7, 4, 3].sort((a, b) => a - b)[2], (5 + 8) / 2],
  ];
  gradeSixLessons.forEach((lesson, index) =>
    lesson.questions.forEach((question, qIndex) => {
      const value = expected[index][qIndex];
      assert.ok(
        Math.abs(numberValue(question.answer)! - value) < 1e-6,
        question.id,
      );
      assert.ok(checkAnswer(question, String(value)), question.id);
      assert.equal(
        checkAnswer(question, String(value + 1)),
        false,
        question.id,
      );
    }),
  );
  assert.ok(checkAnswer(gradeSixLessons[1].questions[1], "10/12"));
});

test("multi-lesson circles advance without losing prior mastery or changing grade", () => {
  const units = gradeUnits(6);
  const fractions = units.find(
    (entry) => entry.unit.id === "g6-fraction-division",
  )!;
  const [first, second] = fractions.unit.lessons;
  assert.equal(continueLesson([fractions], [], null)?.id, first.id);
  assert.equal(
    continueLesson([fractions], [first.id], first.id)?.id,
    second.id,
  );
  assert.equal(lessonNavigation(first.id, 6).next?.id, second.id);
  for (const lesson of gradeSixLessons) {
    const navigation = lessonNavigation(lesson.id, 6);
    assert.ok(navigation.backHref.startsWith("/learn#unit-"));
    if (navigation.next) assert.ok(gradeLessons(6).includes(navigation.next));
  }
});
