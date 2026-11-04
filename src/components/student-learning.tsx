"use client";
import Link from "next/link";
import { allLessons, courses, type Lesson } from "@/lib/curriculum";
import {
  continueLesson,
  gradeName,
  gradeCoverage,
  lessonName,
  lessonStatus,
  studentAssignments,
  assignmentIds,
  type LearningPreferences,
  type LearningUnit,
} from "@/lib/student-learning";
import type { Assignment, Attempt, Classroom } from "@/lib/store";

export function GradePicker({
  grade,
  onChange,
  disabled = false,
}: {
  grade: number | null;
  onChange: (grade: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className="grade-picker">
      My grade
      <select
        id="my-grade"
        disabled={disabled}
        value={grade ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        <option value="" disabled>
          Choose your grade
        </option>
        {Array.from({ length: 13 }, (_, i) => (
          <option key={i} value={i}>
            {gradeName(i)}
          </option>
        ))}
      </select>
    </label>
  );
}
type LearningProps = {
  completed: string[];
  attempts: Attempt[];
  preferences: LearningPreferences;
  onOpen: (lesson: Lesson) => void;
};
export function AvailableSubjects({ catalog = false }: { catalog?: boolean }) {
  return (
    <section
      className="available-subjects"
      aria-labelledby="available-subjects-title"
    >
      <h2 id="available-subjects-title">
        {catalog ? "Available courses" : "Choose a subject"}
      </h2>
      <p>
        These subjects have lessons ready to try. You can explore without
        changing your grade.
      </p>
      <div className="subject-grid">
        {courses
          .filter((course) => !course.planned && course.units.length > 0)
          .map((course) => {
            const lessons = course.units.flatMap((unit) => unit.lessons).length;
            return (
              <Link
                className="subject-option"
                key={course.id}
                href={`/course/${course.id}`}
              >
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <span>
                  {lessons} {lessons === 1 ? "lesson" : "lessons"} ·{" "}
                  {gradeCoverage(course.grades)}
                </span>
                <strong>Explore lessons →</strong>
              </Link>
            );
          })}
      </div>
    </section>
  );
}
export function UnitList({
  units,
  completed,
  attempts,
  preferences,
  onOpen,
}: { units: LearningUnit[] } & LearningProps) {
  const next = continueLesson(units, completed, preferences.lastLesson);
  return (
    <div className="unit-list">
      {units.map((entry, i) => {
        const done = entry.unit.lessons.filter((l) =>
          completed.includes(l.id),
        ).length;
        return (
          <details
            className="unit-section"
            key={entry.key}
            id={"unit-" + entry.key}
            open={
              entry.unit.lessons.some((l) => l.id === next?.id) || undefined
            }
          >
            <summary>
              <span>
                Unit {i + 1}: {entry.title}
              </span>
              <span className="unit-count">
                {done} of {entry.unit.lessons.length} completed
              </span>
            </summary>
            <ol className="lesson-rows">
              {entry.unit.lessons.map((lesson, j) => {
                const status = lessonStatus(
                  lesson.id,
                  completed,
                  attempts,
                  preferences.started,
                );
                return (
                  <li key={lesson.id} className="lesson-row">
                    <div>
                      <h3>
                        Lesson {j + 1}: {lessonName(lesson)}
                      </h3>
                      <span
                        className={
                          "lesson-status " +
                          (status === "Completed" ? "is-complete" : "")
                        }
                      >
                        {status === "Completed" ? "✓ " : ""}
                        {status}
                      </span>
                    </div>
                    <Link
                      className={
                        status === "Completed" ? "secondary" : "primary"
                      }
                      href={"/lesson/" + lesson.id}
                      onClick={() => onOpen(lesson)}
                      aria-label={`${status === "Completed" ? "Review" : status === "In progress" ? "Continue" : "Start"} ${lessonName(lesson)}`}
                    >
                      {status === "Completed"
                        ? "Review"
                        : status === "In progress"
                          ? "Continue"
                          : "Start"}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </details>
        );
      })}
    </div>
  );
}
export { LearningDashboard as MyLearning } from "./learning-dashboard";
export function MyAssignments({
  assignments,
  classrooms,
  studentId,
  completed,
  attempts,
  preferences,
  onOpen,
  onJoin,
  joining = false,
}: {
  assignments: Assignment[];
  classrooms: Classroom[];
  studentId: string;
  onJoin: (e: React.FormEvent<HTMLFormElement>) => void;
  joining?: boolean;
} & LearningProps) {
  const groups = studentAssignments(
    assignments,
    classrooms,
    studentId,
    completed,
  );
  const enrolled = classrooms.some((classroom) =>
    classroom.members.includes(studentId),
  );
  const joinForm = (
    <form className="join-classroom-form" onSubmit={onJoin}>
      <label>
        Classroom code
        <input
          name="code"
          required
          maxLength={32}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          placeholder="Enter your 12-character code"
          aria-describedby="classroom-code-help"
        />
      </label>
      <p id="classroom-code-help">
        Ask your teacher for the 12-character classroom code. Uppercase and
        lowercase both work.
      </p>
      <button className="primary" disabled={joining}>
        {joining ? "Joining…" : "Join classroom"}
      </button>
    </form>
  );
  function list(items: Assignment[], done: boolean) {
    return items.length ? (
      <ul className="assignment-rows">
        {items.map((a) => {
          return (
            <li className="student-assignment" key={a.id}>
              <div>
                <h3>{a.title}</h3>
                <p>{classrooms.find((c) => c.id === a.classroom)?.name}</p>
                <p>
                  {a.due
                    ? `Due ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(a.due.slice(0, 10) + "T12:00:00Z"))}`
                    : "No due date"}
                </p>
                {done && (
                  <span className="lesson-status is-complete">✓ Completed</span>
                )}
              </div>
              <ul>
                {assignmentIds(a).map((id) => {
                  const lesson = allLessons.find((l) => l.id === id);
                  const lessonDone = completed.includes(id);
                  return (
                    <li key={id}>
                      {lesson ? (
                        <Link
                          className={lessonDone ? "secondary" : "primary"}
                          href={"/lesson/" + lesson.id}
                          onClick={() => onOpen(lesson)}
                        >
                          {lesson.title} ·{" "}
                          {lessonDone
                            ? "Review"
                            : lessonStatus(
                                  lesson.id,
                                  completed,
                                  attempts,
                                  preferences.started,
                                ) === "In progress"
                              ? "Continue"
                              : "Start"}
                        </Link>
                      ) : (
                        <span>Coming Soon</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    ) : (
      <p className="assignment-empty">
        {done
          ? "Your finished assignments will appear here."
          : enrolled
            ? "You’re all caught up! New assignments from your teacher will appear here."
            : "Your assignments will appear here after you join a classroom."}
      </p>
    );
  }
  return (
    <>
      <div className="student-page-heading">
        <div>
          <h1>My work</h1>
          <p>Your work from your teacher.</p>
        </div>
      </div>
      {!enrolled && (
        <section className="join-classroom-panel" aria-labelledby="join-title">
          <h2 id="join-title">Join your first classroom</h2>
          <p>Enter your teacher’s code to see your assignments here.</p>
          {joinForm}
        </section>
      )}
      <section className="assignment-group">
        <h2>
          To Do <span>({groups.todo.length})</span>
        </h2>
        {list(groups.todo, false)}
      </section>
      <section className="assignment-group">
        <h2>
          Completed <span>({groups.completed.length})</span>
        </h2>
        {list(groups.completed, true)}
      </section>
      {enrolled && (
        <details className="join-classroom">
          <summary>Join another classroom</summary>
          {joinForm}
        </details>
      )}
    </>
  );
}
