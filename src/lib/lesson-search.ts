import { courses, satLessons, type Lesson } from "./curriculum";
import { lessonName } from "./student-learning";

export type LessonSearchResult = {
  lesson: Lesson;
  course: string;
  unit: string;
};
const lessonIndex: LessonSearchResult[] = [
  ...courses
    .filter((course) => !course.planned)
    .flatMap((course) =>
      course.units.flatMap((unit) =>
        unit.lessons.map((lesson) => ({
          lesson,
          course: course.title,
          unit: unit.title,
        })),
      ),
    ),
  ...satLessons.map((lesson) => ({
    lesson,
    course: "SAT Math",
    unit: lesson.title,
  })),
];
export function findLessons(query: string): LessonSearchResult[] {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return lessonIndex.filter(({ lesson, course, unit }) => {
    const text =
      `${lessonName(lesson)} ${lesson.title} ${course} ${unit}`.toLowerCase();
    return words.every((word) => text.includes(word));
  });
}
