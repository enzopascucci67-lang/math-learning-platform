import {
  courses,
  allLessons,
  satLessons,
  type Lesson,
  type Unit,
} from "./curriculum";
import type { Assignment, Classroom, Attempt } from "./store";

export const gradeName = (grade: number) =>
  grade === 0 ? "Kindergarten" : `Grade ${grade}`;
export function gradeCoverage(grades: number[]) {
  const sorted = [...new Set(grades)].sort((a, b) => a - b);
  const ranges: number[][] = [];
  for (const grade of sorted) {
    const last = ranges.at(-1);
    if (last && grade === last[1] + 1) last[1] = grade;
    else ranges.push([grade, grade]);
  }
  return ranges
    .map(([first, last]) =>
      first === last
        ? gradeName(first)
        : `${gradeName(first)}–${gradeName(last)}`,
    )
    .join(" · ");
}
export function learningContext(
  classrooms: Classroom[],
  studentId: string,
  preferences: LearningPreferences,
) {
  const enrolled = classrooms.filter(
    (room) =>
      room.members.includes(studentId) &&
      Number.isInteger(room.grade) &&
      room.grade! >= 0 &&
      room.grade! <= 12,
  );
  const classroom =
    enrolled.find((room) => room.id === preferences.classroomId) || enrolled[0];
  return { enrolled, classroom, grade: classroom?.grade ?? preferences.grade };
}
export function gradeLessons(grade: number | null) {
  return gradeUnits(grade).flatMap(({ unit }) => unit.lessons);
}
export type LearningUnit = {
  key: string;
  title: string;
  courseId: string;
  unit: Unit;
};
// A grade view references the original units and lessons; content and grading keys stay canonical.
export function gradeUnits(grade: number | null): LearningUnit[] {
  if (grade === null) return [];
  const seen = new Set<string>();
  return courses
    .filter((c) => !c.planned && c.grades.includes(grade))
    .flatMap((c) =>
      c.units
        .filter((unit) => !unit.grades || unit.grades.includes(grade))
        .map((unit) => ({
          key: `${c.id}-${unit.id}`,
          title: unit.title,
          courseId: c.id,
          unit,
        })),
    )
    .filter(({ key }) => {
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
const lessonNames: Record<string, string> = {
  addition: "Adding Small Numbers",
  multiply: "Multiplying Equal Groups",
  fractions: "Equivalent Fractions",
  order: "Order of Operations",
  combine: "Combining Like Terms",
  solve: "Solving Equations",
  inequality: "Solving Inequalities",
  function: "Inputs and Outputs",
  system: "Solving Two Equations",
  quadratic: "Finding Quadratic Roots",
};
export const lessonName = (lesson: Lesson) =>
  lessonNames[lesson.id] || lesson.title;
export function lessonStatus(
  id: string,
  completed: string[],
  attempts: Attempt[],
  started: string[],
) {
  if (completed.includes(id)) return "Completed";
  const lesson = allLessons.find((l) => l.id === id);
  return started.includes(id) ||
    lesson?.questions.some((q) => attempts.some((a) => a.questionId === q.id))
    ? "In progress"
    : "Not started";
}
export function continueLesson(
  units: LearningUnit[],
  completed: string[],
  lastLesson: string | null,
) {
  const lessons = units.flatMap((u) => u.unit.lessons);
  return (
    lessons.find((l) => l.id === lastLesson && !completed.includes(l.id)) ||
    lessons.find((l) => !completed.includes(l.id))
  );
}
export function lessonNavigation(
  id: string,
  grade: number | null,
  completed: string[] = [],
) {
  const units = gradeUnits(grade);
  let index = units.findIndex((u) => u.unit.lessons.some((l) => l.id === id));
  if (index >= 0) {
    const lessons = units.flatMap((u) => u.unit.lessons);
    return {
      backHref: `/learn#unit-${units[index].key}`,
      unitTitle: `Unit ${index + 1}: ${units[index].title}`,
      next:
        lessons
          .slice(lessons.findIndex((l) => l.id === id) + 1)
          .find((lesson) => !completed.includes(lesson.id)) ||
        (completed.length > 0
          ? lessons.find(
              (lesson) => lesson.id !== id && !completed.includes(lesson.id),
            )
          : undefined),
    };
  }
  const course = courses.find((c) =>
    c.units.some((u) => u.lessons.some((l) => l.id === id)),
  );
  if (course) {
    index = course.units.findIndex((u) => u.lessons.some((l) => l.id === id));
    const lessons = course.units.flatMap((u) => u.lessons);
    return {
      backHref: `/course/${course.id}#unit-${course.id}-${course.units[index].id}`,
      unitTitle: `Unit ${index + 1}: ${course.units[index].title}`,
      next: lessons
        .slice(lessons.findIndex((l) => l.id === id) + 1)
        .find((lesson) => !completed.includes(lesson.id)),
    };
  }
  index = satLessons.findIndex((l) => l.id === id);
  return {
    backHref: "/sat",
    unitTitle: "SAT Math",
    next:
      index >= 0
        ? satLessons
            .slice(index + 1)
            .find((lesson) => !completed.includes(lesson.id))
        : undefined,
  };
}
export function assignmentIds(a: Assignment) {
  return [a.lesson, ...(a.additionalLessons ?? [])];
}

export function assignmentDone(a: Assignment, completed: string[]) {
  return assignmentIds(a).every((id) => completed.includes(id));
}

export function studentAssignments(
  assignments: Assignment[],
  classrooms: Classroom[],
  studentId: string,
  completed: string[],
) {
  const visible = assignments
    .filter((a) =>
      classrooms.some(
        (c) => c.id === a.classroom && c.members.includes(studentId),
      ),
    )
    .sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"));
  return {
    todo: visible.filter((a) => !assignmentDone(a, completed)),
    completed: visible.filter((a) => assignmentDone(a, completed)),
  };
}
export type LearningPreferences = {
  classroomId?: string;
  grade: number | null;
  lastLesson: string | null;
  started: string[];
  positions: Record<string, number>;
};
const preferenceKey = (user: string | null) =>
  `math-atlas:learning:v1:${user || "guest"}`;
export function readPreferences(user: string | null): LearningPreferences {
  const empty: LearningPreferences = {
    grade: null,
    lastLesson: null,
    started: [],
    positions: {},
  };
  try {
    const data = JSON.parse(
      localStorage.getItem(preferenceKey(user)) || "null",
    );
    if (!data || typeof data !== "object") return empty;
    return {
      classroomId:
        typeof data.classroomId === "string" ? data.classroomId : undefined,
      grade:
        Number.isInteger(data.grade) && data.grade >= 0 && data.grade <= 12
          ? data.grade
          : null,
      lastLesson: typeof data.lastLesson === "string" ? data.lastLesson : null,
      started: Array.isArray(data.started)
        ? data.started.filter((x: unknown) => typeof x === "string")
        : [],
      positions:
        data.positions && typeof data.positions === "object"
          ? data.positions
          : {},
    };
  } catch {
    return empty;
  }
}
export function savePreferences(
  user: string | null,
  value: LearningPreferences,
) {
  localStorage.setItem(preferenceKey(user), JSON.stringify(value));
}
