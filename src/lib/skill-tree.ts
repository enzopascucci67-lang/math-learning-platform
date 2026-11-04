import type { Course, Unit } from "./curriculum";

export function unitProgress(unit: Unit, completed: string[]) {
  return unit.lessons.length
    ? (100 *
        unit.lessons.filter((lesson) => completed.includes(lesson.id)).length) /
        unit.lessons.length
    : 0;
}

// Prerequisites guide learning order; they never prevent students from exploring.
export function unitReadiness(course: Course, unit: Unit, completed: string[]) {
  if (unitProgress(unit, completed) === 100) return "Completed";
  return unit.requires.every((id) => {
    const prerequisite = course.units.find((candidate) => candidate.id === id);
    return prerequisite && unitProgress(prerequisite, completed) === 100;
  })
    ? "Ready to explore"
    : "Build toward this";
}
