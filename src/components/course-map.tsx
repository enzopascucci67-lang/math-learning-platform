"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Course, Lesson } from "@/lib/curriculum";
import { unitReadiness } from "@/lib/skill-tree";
import { lessonName } from "@/lib/student-learning";

const SkillTree = dynamic(
  () => import("./skill-tree").then((module) => module.SkillTree),
  { loading: () => <p role="status">Loading your learning map…</p> },
);

export function CourseMap({
  course,
  completed,
  onOpen,
}: {
  course: Course;
  completed: string[];
  onOpen: (lesson: Lesson) => void;
}) {
  const [showMap, setShowMap] = useState(false);
  const [selectedId, setSelectedId] = useState(course.units[0]?.id);
  const selected = course.units.find((unit) => unit.id === selectedId);
  return (
    <section className="course-map">
      <button
        className="secondary"
        aria-expanded={showMap}
        aria-controls={`map-${course.id}`}
        onClick={() => setShowMap(!showMap)}
      >
        {showMap ? "Hide skill tree" : "Explore skill tree"}
      </button>
      {showMap && (
        <div id={`map-${course.id}`}>
          <p>
            Follow the branches to build your skills. Every lesson is open to
            explore.
          </p>
          <div className="learning-layout">
            <div className="card tree-card">
              <SkillTree
                course={course}
                completed={completed}
                onSelect={setSelectedId}
              />
            </div>
            <div className="card">
              <label>
                Choose a unit
                <select
                  value={selectedId}
                  onChange={(event) => setSelectedId(event.target.value)}
                >
                  {course.units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.title}
                    </option>
                  ))}
                </select>
              </label>
              {selected && (
                <div aria-live="polite">
                  <h2>{selected.title}</h2>
                  <p>{unitReadiness(course, selected, completed)}</p>
                  {selected.requires.length > 0 && (
                    <p>
                      Suggested first:{" "}
                      {selected.requires
                        .map(
                          (id) =>
                            course.units.find((unit) => unit.id === id)?.title,
                        )
                        .join(", ")}
                    </p>
                  )}
                  {selected.lessons.map((lesson) => (
                    <Link
                      className="lesson-link"
                      key={lesson.id}
                      href={`/lesson/${lesson.id}`}
                      onClick={() => onOpen(lesson)}
                    >
                      {completed.includes(lesson.id) ? "✓ Review: " : "Start: "}
                      {lessonName(lesson)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
