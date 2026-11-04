import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cosmeticItems,
  unlockedItems,
  normalizeOutfit,
  changeOutfit,
} from "../src/lib/cosmetics";
import { allLessons } from "../src/lib/curriculum";
import {
  emptyState,
  readDemo,
  recordAttempt,
  STORAGE_KEY,
} from "../src/lib/store";

test("reward thresholds count unique known lessons only", () => {
  assert.deepEqual(unlockedItems([]), ["starter-shirt"]);
  const first = allLessons[0].id;
  assert.deepEqual(unlockedItems([first, first, "unknown"]), [
    "starter-shirt",
    "explorer-cap",
    "star-badge",
  ]);
  for (const count of [0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 29, 30]) {
    const result = unlockedItems(
      allLessons.slice(0, count).map((lesson) => lesson.id),
    );
    for (const item of cosmeticItems)
      assert.equal(result.includes(item.id), count >= item.lessons);
  }
});
test("outfits reject locked, unknown and wrong-slot items and can remove accessories", () => {
  const unlocked = unlockedItems([allLessons[0].id]);
  assert.throws(
    () => changeOutfit({}, unlocked, "body", "forest-hoodie"),
    /more lessons/,
  );
  assert.throws(
    () => changeOutfit({}, unlocked, "head", "starter-shirt"),
    /correct slot/,
  );
  assert.throws(
    () => changeOutfit({}, unlocked, "head", "unknown"),
    /correct slot/,
  );
  const outfit = changeOutfit({}, unlocked, "head", "explorer-cap");
  assert.equal(outfit.head, "explorer-cap");
  assert.equal(outfit.body, "starter-shirt");
  assert.deepEqual(changeOutfit(outfit, unlocked, "head", null), {
    body: "starter-shirt",
  });
  assert.deepEqual(
    normalizeOutfit(
      { body: "star-crown", head: "star-crown", accessory: 22 },
      unlocked,
    ),
    { body: "starter-shirt" },
  );
});
test("old guest saves load with starter clothing; equipped rewards survive reload and practice", () => {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) || null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  });
  values.set(STORAGE_KEY, JSON.stringify(emptyState));
  assert.deepEqual(normalizeOutfit(readDemo().outfit, unlockedItems([])), {
    body: "starter-shirt",
  });
  const lesson = allLessons[0];
  let state = structuredClone(emptyState);
  for (const q of lesson.questions)
    state = recordAttempt(state, lesson, {
      questionId: q.id,
      answer: q.answer,
      correct: true,
      at: "now",
    });
  state.outfit = changeOutfit(
    state.outfit,
    unlockedItems(state.completed),
    "head",
    "explorer-cap",
  );
  values.set(STORAGE_KEY, JSON.stringify(state));
  state = readDemo();
  assert.equal(state.outfit?.head, "explorer-cap");
  const before = unlockedItems(state.completed);
  state = recordAttempt(state, lesson, {
    questionId: lesson.questions[0].id,
    answer: lesson.questions[0].answer,
    correct: true,
    at: "later",
  });
  assert.deepEqual(unlockedItems(state.completed), before);
  assert.equal(state.outfit?.head, "explorer-cap");
});
