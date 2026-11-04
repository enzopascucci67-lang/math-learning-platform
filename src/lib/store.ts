export type Attempt = {
  questionId: string;
  answer: string;
  correct: boolean;
  at: string;
};
export type Classroom = {
  grade?: number | null;
  id: string;
  name: string;
  course: string;
  code: string;
  owner: string;
  members: string[];
};
export type Assignment = {
  id: string;
  classroom: string;
  lesson: string;
  additionalLessons?: string[];
  due: string;
  title: string;
};
export type DemoState = {
  outfit?: import("./curriculum").Outfit;
  unlockedCosmetics?: string[];
  version: 1;
  completed: string[];
  attempts: Attempt[];
  classrooms: Classroom[];
  assignments: Assignment[];
  studentCompleted: Record<string, string[]>;
};
export const emptyState: DemoState = {
  version: 1,
  completed: [],
  attempts: [],
  classrooms: [],
  assignments: [],
  studentCompleted: {},
};
export const STORAGE_KEY = "math-atlas:demo:v1";
import type { Lesson } from "./curriculum";
export function recordAttempt(
  state: DemoState,
  lesson: Lesson,
  attempt: Attempt,
): DemoState {
  const attempts = [...state.attempts, attempt];
  const mastered = lesson.questions.every((q) =>
    attempts.some((a) => a.questionId === q.id && a.correct),
  );
  return {
    ...state,
    attempts,
    completed: mastered
      ? [...new Set([...state.completed, lesson.id])]
      : state.completed,
  };
}
export function readDemo(): DemoState {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (
      value?.version === 1 &&
      Array.isArray(value.completed) &&
      Array.isArray(value.attempts) &&
      Array.isArray(value.classrooms) &&
      Array.isArray(value.assignments) &&
      value.studentCompleted &&
      typeof value.studentCompleted === "object"
    )
      return value;
  } catch {}
  return structuredClone(emptyState);
}
