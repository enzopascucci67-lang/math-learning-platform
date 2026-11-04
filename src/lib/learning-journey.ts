import { allLessons } from "./curriculum";
import { cosmeticItems } from "./cosmetics";
import { continueLesson, type LearningUnit } from "./student-learning";

export function learningJourney(
  units: LearningUnit[],
  completed: string[],
  lastLesson: string | null,
  unlocked: string[],
) {
  const known = new Set(allLessons.map((lesson) => lesson.id));
  const finished = [...new Set(completed.filter((id) => known.has(id)))];
  const next = continueLesson(units, finished, lastLesson);
  const currentKey =
    units.find((entry) =>
      entry.unit.lessons.some((lesson) => lesson.id === next?.id),
    )?.key || units.at(-1)?.key;
  const thresholds = [
    ...new Set(
      cosmeticItems.map((item) => item.lessons).filter((count) => count > 0),
    ),
  ].sort((a, b) => a - b);
  const milestones = thresholds.map((threshold) => {
    const items = cosmeticItems.filter((item) => item.lessons === threshold);
    const earned = items.every((item) => unlocked.includes(item.id));
    let unitKey: string | undefined;
    if (earned) {
      const earnedAt = finished[threshold - 1];
      unitKey = units.find((entry) =>
        entry.unit.lessons.some((lesson) => lesson.id === earnedAt),
      )?.key;
    } else if (threshold > finished.length) {
      // Forecast checkpoints along this path; exploring out of order may move them.
      let count = finished.length;
      const seen = new Set(finished);
      for (const entry of units) {
        for (const lesson of entry.unit.lessons)
          if (!seen.has(lesson.id)) {
            seen.add(lesson.id);
            count++;
          }
        if (count >= threshold) {
          unitKey = entry.key;
          break;
        }
      }
    }
    return {
      threshold,
      items,
      earned,
      remaining: Math.max(0, threshold - finished.length),
      unitKey,
    };
  });
  return {
    currentKey,
    finishedCount: finished.length,
    allDone: units.length > 0 && !next,
    milestones,
    nextReward: milestones.find((milestone) => !milestone.earned),
  };
}
export type JourneyMilestone = ReturnType<
  typeof learningJourney
>["milestones"][number];
