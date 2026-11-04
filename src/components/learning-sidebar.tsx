"use client";
import { useState } from "react";
import Link from "next/link";
import { courses, type Lesson } from "@/lib/curriculum";
import { lessonName } from "@/lib/student-learning";
import { findLessons } from "@/lib/lesson-search";

export function LearningSidebar({
  path,
  completed,
  onOpen,
}: {
  path: string;
  completed: string[];
  onOpen: (lesson: Lesson) => void;
}) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const results = findLessons(query);
  const searching = query.trim().length > 0;
  function open(lesson: Lesson) {
    onOpen(lesson);
    setQuery("");
    setExpanded(false);
  }
  return (
    <aside className="learning-sidebar" aria-label="Course explorer">
      <div className="explorer-heading">
        <h2>Course explorer</h2>
        <button
          className="secondary outline-toggle"
          type="button"
          aria-expanded={expanded}
          aria-controls={searching ? undefined : "course-outline"}
          onClick={() => {
            setQuery("");
            setExpanded(!expanded);
          }}
        >
          {expanded ? "Hide courses" : "Browse courses"}
        </button>
      </div>
      <label className="lesson-search">
        Find a lesson
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search lessons or topics"
          autoComplete="off"
        />
      </label>
      {searching ? (
        <div className="search-results">
          <p role="status">
            {results.length
              ? `${results.length} ${results.length === 1 ? "lesson" : "lessons"} found`
              : "No matching lessons. Try a subject or a shorter word."}
          </p>
          <ul>
            {results.map(({ lesson, course, unit }) => (
              <li key={lesson.id}>
                <Link
                  href={`/lesson/${lesson.id}`}
                  onClick={() => open(lesson)}
                  aria-current={
                    path === `/lesson/${lesson.id}` ? "page" : undefined
                  }
                >
                  <strong>{lessonName(lesson)}</strong>
                  <span>
                    {course} · {unit}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="secondary"
            onClick={() => setQuery("")}
          >
            Clear search
          </button>
        </div>
      ) : (
        <div
          id="course-outline"
          className={`navigator-outline ${expanded ? "is-expanded" : ""}`}
        >
          <nav className="explorer-courses" aria-label="Courses and lessons">
            {courses
              .filter((course) => !course.planned && course.units.length > 0)
              .map((course) => {
                const active =
                  path === `/course/${course.id}` ||
                  course.units.some((unit) =>
                    unit.lessons.some(
                      (lesson) => path === `/lesson/${lesson.id}`,
                    ),
                  );
                const lessons = course.units.flatMap((unit) => unit.lessons);
                return (
                  <div className="explorer-course" key={course.id}>
                    <Link
                      className={active ? "selected-course" : ""}
                      href={`/course/${course.id}`}
                      aria-current={
                        path === `/course/${course.id}` ? "page" : undefined
                      }
                      onClick={() => setExpanded(false)}
                    >
                      <strong>{course.title}</strong>
                      <span>
                        {
                          lessons.filter((lesson) =>
                            completed.includes(lesson.id),
                          ).length
                        }
                        /{lessons.length} completed
                      </span>
                    </Link>
                    {active && (
                      <ol className="explorer-units">
                        {course.units.map((unit, index) => (
                          <li key={unit.id}>
                            <span className="outline-unit-label">
                              {index + 1}. {unit.title}
                            </span>
                            <ul>
                              {unit.lessons.map((lesson) => (
                                <li key={lesson.id}>
                                  <Link
                                    href={`/lesson/${lesson.id}`}
                                    aria-current={
                                      path === `/lesson/${lesson.id}`
                                        ? "page"
                                        : undefined
                                    }
                                    onClick={() => open(lesson)}
                                  >
                                    <span aria-hidden="true">
                                      {completed.includes(lesson.id)
                                        ? "✓"
                                        : "○"}
                                    </span>
                                    <span>
                                      {lessonName(lesson)}
                                      {completed.includes(lesson.id) && (
                                        <small>Completed</small>
                                      )}
                                    </span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                );
              })}
          </nav>
          <div className="explorer-shortcuts">
            <Link href="/sat">SAT practice</Link>
            <Link href="/profile#wardrobe-title">Character & rewards</Link>
            <Link href="/classrooms">Classrooms & teacher area</Link>
          </div>
        </div>
      )}
    </aside>
  );
}
