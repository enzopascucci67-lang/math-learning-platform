import { test } from "node:test";
import assert from "node:assert/strict";
import { learningJourney } from "../src/lib/learning-journey";
import { gradeUnits, gradeLessons } from "../src/lib/student-learning";
import { unlockedItems } from "../src/lib/cosmetics";
import { allLessons } from "../src/lib/curriculum";

test("pawn follows next unfinished lesson, resumes within its unit and reaches the finish", () => {
  const units = gradeUnits(6);
  assert.equal(
    learningJourney(units, [], null, unlockedItems([])).currentKey,
    "fractions-g6-fraction-division",
  );
  assert.equal(
    learningJourney(units, [], "ratios-practice", unlockedItems([])).currentKey,
    "pre-algebra-ratios",
  );
  const finished = ["g6-fraction-groups"];
  assert.equal(
    learningJourney(
      units,
      finished,
      "g6-fraction-groups",
      unlockedItems(finished),
    ).currentKey,
    "fractions-g6-fraction-division",
  );
  const completed = gradeLessons(6).map((lesson) => lesson.id);
  const end = learningJourney(units, completed, null, unlockedItems(completed));
  assert.equal(end.allDone, true);
  assert.equal(end.currentKey, units.at(-1)?.key);
  assert.equal(
    learningJourney([], completed, null, unlockedItems(completed)).allDone,
    false,
  );
});

test("reward dots forecast actual thresholds across multi-lesson units", () => {
  const completed = [
    "order",
    "triangle-area-practice",
    "multiply",
    "g6-fraction-groups",
    "g6-divide-fractions",
  ];
  const journey = learningJourney(
    gradeUnits(6),
    completed,
    "combine",
    unlockedItems(completed),
  );
  assert.equal(journey.finishedCount, 5);
  assert.equal(journey.nextReward?.threshold, 10);
  assert.equal(journey.nextReward?.remaining, 5);
  assert.equal(journey.nextReward?.unitKey, "pre-algebra-ratios");
  assert.deepEqual(
    journey.milestones.map((milestone) => milestone.threshold),
    [1, 3, 5, 10, 15, 20, 30],
  );
  assert.equal(
    journey.milestones.find((milestone) => milestone.threshold === 5)?.unitKey,
    "fractions-g6-fraction-division",
  );
  assert.equal(
    journey.milestones.find((milestone) => milestone.threshold === 3)?.unitKey,
    undefined,
  );
});

test("replays and unknown saves cannot accelerate rewards; grades share earned clothing", () => {
  const completed = ["order", "order", "not-a-lesson"];
  const unlocked = unlockedItems(completed);
  const grade3 = learningJourney(gradeUnits(3), completed, null, unlocked);
  const grade6 = learningJourney(gradeUnits(6), completed, null, unlocked);
  assert.equal(grade3.finishedCount, 1);
  assert.equal(grade3.nextReward?.threshold, 3);
  assert.equal(grade3.nextReward?.remaining, 2);
  assert.equal(grade6.nextReward?.remaining, 2);
  assert.equal(
    grade3.milestones.find((milestone) => milestone.threshold === 10)?.unitKey,
    undefined,
  );
  // An empty inventory must never be presented as an authoritative grant.
  assert.equal(
    learningJourney(gradeUnits(6), ["order"], null, []).milestones[0].earned,
    false,
  );
});

test("finishing every reward removes future promises while retaining earned milestones", () => {
  const completed = allLessons.slice(0, 30).map((lesson) => lesson.id);
  const journey = learningJourney(
    gradeUnits(6),
    completed,
    null,
    unlockedItems(completed),
  );
  assert.equal(journey.nextReward, undefined);
  assert.ok(
    journey.milestones.every(
      (milestone) => milestone.earned && milestone.remaining === 0,
    ),
  );
});
