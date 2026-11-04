"use client";
import { useState, useRef } from "react";
import { CheckCircle2, Sparkles, Trophy } from "lucide-react";
import { LearningVisual } from "./learning-visual";
import { checkAnswer } from "@/lib/answers";
import type { Lesson } from "@/lib/curriculum";
export function Practice({
  lesson,
  onAttempt,
  initialIndex = 0,
  onPositionChange,
  completed = false,
  completionAction,
}: {
  lesson: Lesson;
  initialIndex?: number;
  onPositionChange?: (index: number) => void;
  completed?: boolean;
  completionAction?: React.ReactNode;
  onAttempt: (
    questionId: string,
    answer: string,
    correct: boolean,
  ) => Promise<boolean>;
}) {
  const [index, setIndex] = useState(
      Number.isInteger(initialIndex) &&
        initialIndex >= 0 &&
        initialIndex < lesson.questions.length
        ? initialIndex
        : 0,
    ),
    [answer, setAnswer] = useState(""),
    [feedback, setFeedback] = useState<boolean | null>(null),
    [hint, setHint] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const q = lesson.questions[index];
  const [wasCompleted] = useState(completed);
  const heading = useRef<HTMLHeadingElement>(null);
  function moveTo(position: number) {
    setIndex(position);
    onPositionChange?.(position);
    setAnswer("");
    setFeedback(null);
    setHint(false);
    requestAnimationFrame(() => heading.current?.focus());
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || feedback === true || !answer.trim()) return;
    setBusy(true);
    setError("");
    const correct = checkAnswer(q, answer);
    try {
      const verifiedCorrect = await onAttempt(q.id, answer, correct);
      setFeedback(verifiedCorrect);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card practice">
      {wasCompleted && (
        <div className="practice-review">
          <CheckCircle2 size={22} aria-hidden="true" />
          <p>
            Already mastered! Practice as often as you like. Your rewards stay
            saved.
          </p>
        </div>
      )}
      <p className="question-count">
        Question {index + 1} of {lesson.questions.length}
      </p>
      <div
        className="practice-meter"
        role="progressbar"
        aria-label="Question position"
        aria-valuemin={0}
        aria-valuemax={lesson.questions.length}
        aria-valuenow={index + 1}
      >
        <span
          style={{ width: `${((index + 1) / lesson.questions.length) * 100}%` }}
        />
      </div>
      <h2 ref={heading} tabIndex={-1}>
        {q.prompt}
      </h2>
      {q.visual && <LearningVisual visual={q.visual} />}
      <form onSubmit={submit}>
        {q.choices ? (
          <div className="choices">
            {q.choices.map((c) => (
              <label key={c}>
                <input
                  type="radio"
                  name={q.id}
                  disabled={busy}
                  value={c}
                  checked={answer === c}
                  onChange={() => {
                    setAnswer(c);
                    setFeedback(null);
                  }}
                />
                {c}
              </label>
            ))}
          </div>
        ) : (
          <label>
            Your answer
            <input
              autoComplete="off"
              maxLength={200}
              disabled={busy}
              enterKeyHint="done"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                setFeedback(null);
              }}
              placeholder={
                q.kind === "numeric"
                  ? "Number or fraction"
                  : "Simplified expression"
              }
            />
          </label>
        )}
        <div className="actions">
          {feedback !== true && (
            <button className="primary" disabled={!answer.trim() || busy}>
              {busy ? "Saving…" : "Check answer"}
            </button>
          )}
          <button
            type="button"
            className="secondary"
            onClick={() => setHint(!hint)}
            aria-expanded={hint}
          >
            {hint ? "Hide hint" : "Show hint"}
          </button>
        </div>
      </form>
      {hint && <p className="notice">{q.hint}</p>}
      <div aria-live="polite">
        {feedback !== null && (
          <div className={feedback ? "feedback success" : "feedback"}>
            <strong>
              {feedback ? (
                <>
                  <CheckCircle2 size={21} aria-hidden="true" /> You’ve got it!
                </>
              ) : (
                "Not quite. Let’s try again."
              )}
            </strong>
            <p>{feedback ? q.explanation : q.hint}</p>
            {feedback && index < lesson.questions.length - 1 && (
              <button className="primary" onClick={() => moveTo(index + 1)}>
                Next question →
              </button>
            )}
            {feedback && index === lesson.questions.length - 1 && (
              <div className={completed ? "lesson-celebration" : undefined}>
                {completed && (
                  <>
                    <div className="celebration-medal" aria-hidden="true">
                      <Trophy size={33} />
                      <Sparkles className="medal-sparkles" size={24} />
                    </div>
                    <h3>
                      {wasCompleted ? "Great practice!" : "Lesson complete!"}
                    </h3>
                  </>
                )}
                <p>
                  {completed
                    ? wasCompleted
                      ? "You kept your skills sharp. Your progress and clothing are saved."
                      : "Your progress is saved. 50 XP earned—one step closer to your next style!"
                    : "Answer every question correctly to finish this lesson."}
                </p>
                {completed ? (
                  completionAction
                ) : (
                  <button className="secondary" onClick={() => moveTo(0)}>
                    Go to first question
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {error && <p className="error">{error}</p>}
      </div>
    </section>
  );
}
