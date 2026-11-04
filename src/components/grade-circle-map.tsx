"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import type { Lesson } from "@/lib/curriculum";
import {
  continueLesson,
  lessonName,
  lessonStatus,
  type LearningPreferences,
  type LearningUnit,
} from "@/lib/student-learning";
import type { Attempt } from "@/lib/store";
import { unitProgress } from "@/lib/skill-tree";
import { gradeMapLayout } from "@/lib/grade-map";
import { ProgressCircle } from "./skill-tree";

export function GradeCircleMap({
  units,
  completed,
  attempts,
  preferences,
  onOpen,
}: {
  units: LearningUnit[];
  completed: string[];
  attempts: Attempt[];
  preferences: LearningPreferences;
  onOpen: (lesson: Lesson) => void;
}) {
  const next = continueLesson(units, completed, preferences.lastLesson);
  const [selectedKey, setSelectedKey] = useState(
    () =>
      units.find((entry) =>
        entry.unit.lessons.some((lesson) => lesson.id === next?.id),
      )?.key || units[0]?.key,
  );
  const heading = useRef<HTMLHeadingElement>(null);
  const selected = units.find((entry) => entry.key === selectedKey);
  const layout = gradeMapLayout(units);
  return (
    <div className="circle-learning-layout">
      <section
        className="grade-circle-map"
        aria-label="Your grade skill tree"
        style={{ height: layout.height }}
      >
        <svg
          className="grade-branches"
          viewBox={`0 0 100 ${layout.height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {layout.edges.map(({ source, target }) => (
            <line
              key={`${source.entry.key}-${target.entry.key}`}
              x1={source.x}
              y1={source.y + 52}
              x2={target.x}
              y2={target.y + 52}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        {layout.nodes.map(({ entry, x, y }) => (
          <div
            className="grade-skill"
            key={entry.key}
            id={`unit-${entry.key}`}
            style={{ left: `${x}%`, top: y }}
          >
            <button
              type="button"
              className={`skill-circle ${selectedKey === entry.key ? "selected" : ""}`}
              aria-pressed={selectedKey === entry.key}
              aria-label={`${entry.title}, ${Math.round(unitProgress(entry.unit, completed))}% complete. Show lessons.`}
              onClick={() => {
                setSelectedKey(entry.key);
                requestAnimationFrame(() => heading.current?.focus());
              }}
            >
              <ProgressCircle
                value={unitProgress(entry.unit, completed)}
                size={104}
              />
            </button>
            <strong>{entry.title}</strong>
            <span>
              {
                entry.unit.lessons.filter((lesson) =>
                  completed.includes(lesson.id),
                ).length
              }
              /{entry.unit.lessons.length} completed
            </span>
          </div>
        ))}
      </section>
      {selected && (
        <section
          className="circle-lesson-panel"
          aria-label="Selected unit lessons"
        >
          <p className="circle-panel-label">YOUR SELECTED SKILL</p>
          <h2 tabIndex={-1} ref={heading}>
            {selected.title}
          </h2>
          {selected.unit.lessons.map((lesson) => {
            const status = lessonStatus(
              lesson.id,
              completed,
              attempts,
              preferences.started,
            );
            return (
              <div className="circle-lesson" key={lesson.id}>
                {lessonName(lesson) !== selected.title && (
                  <h3>{lessonName(lesson)}</h3>
                )}
                <p>{lesson.explanation}</p>
                <p>
                  {status} · {lesson.questions.length} questions
                </p>
                <Link
                  className={status === "Completed" ? "secondary" : "primary"}
                  href={`/lesson/${lesson.id}`}
                  onClick={() => onOpen(lesson)}
                >
                  {status === "Completed"
                    ? "Review lesson"
                    : status === "In progress"
                      ? "Continue lesson"
                      : "Start lesson"}
                </Link>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
