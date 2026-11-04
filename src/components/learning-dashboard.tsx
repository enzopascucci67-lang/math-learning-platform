"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { ClothingIcon } from "./clothing-icon";
import type { Lesson, Outfit } from "@/lib/curriculum";
import type { Attempt } from "@/lib/store";
import {
  continueLesson,
  gradeName,
  gradeUnits,
  lessonName,
  lessonStatus,
  type LearningPreferences,
} from "@/lib/student-learning";
import { unitProgress } from "@/lib/skill-tree";
import { cosmeticItems, type OutfitSlot } from "@/lib/cosmetics";
import { CharacterPreview } from "./character-wardrobe";
import { GradeCircleMap } from "./grade-circle-map";
import { learningJourney } from "@/lib/learning-journey";
import { AtlasPawn, PathRewards, RewardDot } from "./path-rewards";

function LessonArt({
  fraction,
  symbol = "+",
}: {
  fraction: boolean;
  symbol?: string;
}) {
  return (
    <div className="next-lesson-art" aria-hidden="true">
      <svg viewBox="0 0 180 180">
        {fraction ? (
          <>
            <circle
              cx="90"
              cy="90"
              r="61"
              fill="#fff"
              stroke="#1460ff"
              strokeWidth="4"
            />
            <path d="M90 90V29a61 61 0 1 0 0 122z" fill="#76adff" />
            {Array.from({ length: 8 }, (_, index) => {
              const a = (index * Math.PI) / 4;
              return (
                <line
                  key={index}
                  x1="90"
                  y1="90"
                  x2={90 + 61 * Math.sin(a)}
                  y2={90 + 61 * Math.cos(a)}
                  stroke="#1460ff"
                  strokeWidth="2"
                />
              );
            })}
            <circle
              cx="90"
              cy="90"
              r="61"
              fill="none"
              stroke="#1460ff"
              strokeWidth="4"
            />
          </>
        ) : (
          <>
            <circle cx="90" cy="90" r="62" fill="#d6e8ff" />
            <circle
              cx="90"
              cy="90"
              r="52"
              fill="#eff6ff"
              stroke="#93bdff"
              strokeWidth="2"
            />
            <text
              x="90"
              y="110"
              textAnchor="middle"
              fill="#1460ff"
              fontSize="61"
              fontWeight="700"
            >
              {symbol}
            </text>
            <path
              d="M31 42h15m-7-7v15M132 134h15"
              stroke="#5591ff"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </div>
  );
}

function DashboardCharacter({
  outfit,
  unlocked,
  onEquip,
}: {
  outfit: Outfit;
  unlocked: string[];
  onEquip: (slot: OutfitSlot, item: string | null) => Promise<void>;
}) {
  const [slot, setSlot] = useState<OutfitSlot>("body");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const options = cosmeticItems.filter((item) => item.slot === slot);
  async function equip(id: string | null) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      await onEquip(slot, id);
      setMessage("Outfit saved.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save your outfit. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <aside
      className="dashboard-character dashboard-card"
      aria-labelledby="dashboard-character-title"
    >
      <h2 id="dashboard-character-title">Your character</h2>
      <div className="dashboard-character-stage">
        <span className="character-sparkle sparkle-one" aria-hidden="true">
          ✦
        </span>
        <span className="character-sparkle sparkle-two" aria-hidden="true">
          ✦
        </span>
        <CharacterPreview outfit={outfit} />
      </div>
      <div
        className="wardrobe-filters"
        role="group"
        aria-label="Clothing category"
      >
        {(
          [
            { id: "body", label: "Outfits" },
            { id: "head", label: "Hats" },
            { id: "accessory", label: "Extras" },
          ] as const
        ).map((entry) => (
          <button
            key={entry.id}
            type="button"
            aria-pressed={slot === entry.id}
            onClick={() => {
              setSlot(entry.id);
              setMessage("");
            }}
            disabled={busy}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <div className="dashboard-outfits">
        {options.map((item) => {
          const available = unlocked.includes(item.id),
            wearing = outfit[item.slot] === item.id;
          return (
            <button
              type="button"
              key={item.id}
              className={`outfit-swatch ${wearing ? "is-wearing" : ""}`}
              aria-pressed={wearing}
              disabled={!available || busy}
              aria-label={`${item.name}${wearing ? ", wearing" : available ? ", wear this" : `, unlock at ${item.lessons} completed lessons`}`}
              onClick={() => void equip(item.id)}
            >
              <ClothingIcon
                itemId={item.id}
                slot={item.slot}
                hoodie={item.id === "forest-hoodie"}
              />
              <span>{item.name}</span>
              <small>
                {wearing
                  ? "✓ Wearing"
                  : available
                    ? "Wear this"
                    : `${item.lessons} lessons`}
              </small>
            </button>
          );
        })}
        {slot !== "body" && (
          <button
            type="button"
            className="outfit-swatch remove-item"
            disabled={busy}
            aria-pressed={!outfit[slot]}
            onClick={() => void equip(null)}
          >
            None<small>Remove item</small>
          </button>
        )}
      </div>
      <Link className="secondary customize-link" href="/profile#wardrobe-title">
        Customize character
      </Link>
      <p className="wardrobe-caption" role="status">
        {busy ? "Saving…" : message || "Earn more styles as you learn."}
      </p>
    </aside>
  );
}

export function LearningDashboard({
  preferences,
  completed,
  attempts,
  onOpen,
  outfit,
  unlocked,
  onEquip,
}: {
  preferences: LearningPreferences;
  completed: string[];
  attempts: Attempt[];
  onOpen: (lesson: Lesson) => void;
  outfit: Outfit;
  unlocked: string[];
  onEquip: (slot: OutfitSlot, item: string | null) => Promise<void>;
}) {
  const units = gradeUnits(preferences.grade);
  const next = continueLesson(units, completed, preferences.lastLesson);
  const [selectedKey, setSelectedKey] = useState(
    () =>
      units.find((unit) =>
        unit.unit.lessons.some((lesson) => lesson.id === next?.id),
      )?.key || units[0]?.key,
  );
  const [view, setView] = useState<"path" | "tree">("path");
  const lessonHeading = useRef<HTMLHeadingElement>(null);
  function previewUnit(key: string) {
    setSelectedKey(key);
    requestAnimationFrame(() => lessonHeading.current?.focus());
  }
  const [rewardTarget, setRewardTarget] = useState<number | null>(null);
  function showReward(threshold: number) {
    setRewardTarget(threshold);
    requestAnimationFrame(() =>
      document.getElementById("path-reward-detail")?.focus(),
    );
  }
  const journey = learningJourney(
    units,
    completed,
    preferences.lastLesson,
    unlocked,
  );
  const selected = units.find((unit) => unit.key === selectedKey);
  const active =
    selected?.unit.lessons.find((lesson) => !completed.includes(lesson.id)) ||
    selected?.unit.lessons[0];
  const status = active
    ? lessonStatus(active.id, completed, attempts, preferences.started)
    : null;
  const lessons = units.flatMap((unit) => unit.unit.lessons);
  const done = lessons.filter((lesson) => completed.includes(lesson.id)).length;
  const younger = preferences.grade !== null && preferences.grade <= 5;
  return (
    <div className="learning-dashboard">
      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="dashboard-intro">
            <p className="learning-kicker">
              <span aria-hidden="true">✦</span> A little practice. A new
              discovery.
            </p>
            <h1>
              {younger
                ? "Let’s learn some math!"
                : "Your next step starts here."}
            </h1>
            <p>
              {preferences.grade === null
                ? "Choose your grade above to find your math path."
                : `${gradeName(preferences.grade)} · Pick a circle. Learn one step at a time.`}
            </p>
          </div>
          {active ? (
            <section
              className="next-lesson-card dashboard-card"
              aria-label="Your next lesson"
            >
              <LessonArt
                fraction={/fraction|parts/.test(active.id)}
                symbol={
                  /ratio|rate|division/.test(active.id)
                    ? "÷"
                    : /multiply/.test(active.id)
                      ? "×"
                      : /area|angle|triangle/.test(active.id)
                        ? "△"
                        : /combine|quadratic|equation|function/.test(active.id)
                          ? "x²"
                          : "+"
                }
              />
              <div>
                <p className="dashboard-eyebrow">
                  {status === "Completed"
                    ? "READY FOR A REVIEW?"
                    : active.id === next?.id
                      ? "YOUR NEXT LESSON"
                      : "YOUR SELECTED LESSON"}
                </p>
                <h2 ref={lessonHeading} tabIndex={-1}>
                  {lessonName(active)}
                </h2>
                <p className="next-lesson-description">
                  {younger
                    ? "See an example. Try it yourself. We’ll help along the way."
                    : active.explanation}
                </p>
                <p className="lesson-bites">
                  <span>{active.questions.length} questions</span>
                  <span>Hints when you need them</span>
                </p>
                <Link
                  className="primary"
                  href={`/lesson/${active.id}`}
                  onClick={() => onOpen(active)}
                >
                  {status === "Completed"
                    ? "Practice again"
                    : status === "In progress"
                      ? "Let’s continue"
                      : "Let’s start"}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </section>
          ) : (
            <section className="next-lesson-card dashboard-card">
              <LessonArt fraction />
              <div>
                <p className="dashboard-eyebrow">YOUR MATH ADVENTURE</p>
                <h2>A path that fits you</h2>
                <p>
                  Select your grade at the top. Your lessons and circles will
                  appear here.
                </p>
                <Link className="primary" href="#my-grade">
                  Choose my grade
                </Link>
              </div>
            </section>
          )}
          <section
            className="dashboard-path dashboard-card"
            aria-labelledby="dashboard-path-title"
          >
            <div className="path-card-heading">
              <h2 id="dashboard-path-title">Your math path</h2>
              <span>
                {done} of {lessons.length} lessons complete
              </span>
            </div>
            {lessons.length > 0 && (
              <>
                <div
                  className="path-mastery-meter"
                  role="progressbar"
                  aria-label="Grade path completed"
                  aria-valuenow={done}
                  aria-valuemin={0}
                  aria-valuemax={lessons.length}
                >
                  <span
                    style={{ width: `${(done / lessons.length) * 100}%` }}
                  />
                </div>
                <p className="path-instruction">
                  {journey.allDone
                    ? "Your pawn reached the finish! Pick a green circle to practice again."
                    : "Your Atlas pawn marks your next lesson. Tap a gift to see your reward."}
                </p>
              </>
            )}
            {units.length > 0 && (
              <div
                className="path-view-options"
                role="group"
                aria-label="Learning path view"
              >
                <button
                  type="button"
                  aria-pressed={view === "path"}
                  onClick={() => setView("path")}
                >
                  Circle path
                </button>
                <button
                  type="button"
                  aria-pressed={view === "tree"}
                  onClick={() => setView("tree")}
                >
                  Branching tree
                </button>
              </div>
            )}
            {view === "tree" ? (
              <GradeCircleMap
                units={units}
                completed={completed}
                attempts={attempts}
                preferences={preferences}
                onOpen={onOpen}
              />
            ) : (
              <ol className="numbered-path">
                {units.map((entry, index) => {
                  const progress = unitProgress(entry.unit, completed),
                    selected = selectedKey === entry.key,
                    current = journey.currentKey === entry.key;
                  const rewards = journey.milestones.filter(
                    (milestone) => milestone.unitKey === entry.key,
                  );
                  return (
                    <li
                      key={entry.key}
                      className={`${selected ? "current-step" : ""} ${current ? "pawn-step" : ""} ${progress === 100 ? "completed-step" : ""}`}
                      id={`unit-${entry.key}`}
                    >
                      <button
                        type="button"
                        className="path-step-circle"
                        aria-pressed={selected}
                        aria-current={current ? "step" : undefined}
                        aria-label={`${entry.title}, ${Math.round(progress)}% complete. ${current ? (journey.allDone ? "Path finished. " : "Your pawn is here. ") : ""}Show lesson.`}
                        onClick={() => previewUnit(entry.key)}
                      >
                        {current && (
                          <span className="pawn-marker">
                            <AtlasPawn />
                          </span>
                        )}
                        {progress === 100 ? (
                          <svg viewBox="0 0 32 32" aria-hidden="true">
                            <path
                              d="m7 16 6 6L26 9"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </button>
                      {rewards.length > 0 && (
                        <RewardDot milestones={rewards} onSelect={showReward} />
                      )}
                      <strong>{entry.title}</strong>
                      <small>
                        {progress === 100
                          ? "Done!"
                          : current
                            ? "You’re here"
                            : selected
                              ? "Looking here"
                              : "Try this"}
                      </small>
                      <span className="unit-lesson-count">
                        {entry.unit.lessons.length}{" "}
                        {entry.unit.lessons.length === 1 ? "lesson" : "lessons"}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
            {!units.length && (
              <p className="path-empty">
                Your path starts with a grade. You can change it any time.
              </p>
            )}
            {selected && selected.unit.lessons.length > 1 && (
              <details className="unit-lesson-menu" key={selected.key}>
                <summary>All lessons in {selected.title}</summary>
                <ul>
                  {selected.unit.lessons.map((lesson) => (
                    <li key={lesson.id}>
                      <div>
                        <strong>{lessonName(lesson)}</strong>
                        <span>
                          {completed.includes(lesson.id)
                            ? "✓ Completed"
                            : `${lesson.questions.length} questions`}
                        </span>
                      </div>
                      <Link
                        className="secondary"
                        href={`/lesson/${lesson.id}`}
                        onClick={() => onOpen(lesson)}
                      >
                        {completed.includes(lesson.id) ? "Review" : "Start"}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            )}
            {units.length > 0 && (
              <PathRewards
                milestones={journey.milestones}
                selected={rewardTarget}
                onSelect={showReward}
              />
            )}
          </section>
        </div>
        <DashboardCharacter
          outfit={outfit}
          unlocked={unlocked}
          onEquip={onEquip}
        />
        <section
          className="dashboard-progress dashboard-card"
          aria-label="Your progress"
        >
          <h2>
            <span aria-hidden="true">▥</span> Your progress
          </h2>
          <p>
            <span className="progress-symbol" aria-hidden="true">
              ◆
            </span>
            <strong>{completed.length}</strong> lessons completed
          </p>
          <p>
            <span className="progress-star" aria-hidden="true">
              ★
            </span>
            <strong>{completed.length * 50} XP</strong>
          </p>
          <span className="progress-level">
            Level {Math.floor(completed.length / 5) + 1}
          </span>
        </section>
      </div>
      <p className="dashboard-footnote">
        Your grade sets your starting path. Every skill is open to explore. More
        lessons are on the way.
      </p>
    </div>
  );
}
