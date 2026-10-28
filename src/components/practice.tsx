"use client";
import { useState } from "react";
import { checkAnswer } from "@/lib/answers";
import type { Lesson } from "@/lib/curriculum";
export function Practice({
  lesson,
  onAttempt,
}: {
  lesson: Lesson;
  onAttempt: (
    questionId: string,
    answer: string,
    correct: boolean,
  ) => Promise<boolean>;
}) {
  const [index, setIndex] = useState(0),
    [answer, setAnswer] = useState(""),
    [feedback, setFeedback] = useState<boolean | null>(null),
    [hint, setHint] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const q = lesson.questions[index];
  async function submit(e: React.FormEvent) {
    e.preventDefault();
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
      <div className="eyebrow">
        PRACTICE · {index + 1} / {lesson.questions.length} · {q.difficulty}
      </div>
      <h2>{q.prompt}</h2>
      <form onSubmit={submit}>
        {q.choices ? (
          <div className="choices">
            {q.choices.map((c) => (
              <label key={c}>
                <input
                  type="radio"
                  name={q.id}
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
          <button className="primary" disabled={!answer.trim() || busy}>
            {busy ? "Saving…" : "Check answer"}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => setHint(!hint)}
          >
            Show hint
          </button>
        </div>
      </form>
      {hint && <p className="notice">{q.hint}</p>}
      <div aria-live="polite">
        {feedback !== null && (
          <div className={feedback ? "feedback success" : "feedback"}>
            <strong>
              {feedback ? "You’ve got it!" : "Keep going — you can retry."}
            </strong>
            <p>{q.explanation}</p>
            {feedback && index < lesson.questions.length - 1 && (
              <button
                className="primary"
                onClick={() => {
                  setIndex(index + 1);
                  setAnswer("");
                  setFeedback(null);
                  setHint(false);
                }}
              >
                Next question →
              </button>
            )}
            {feedback && index === lesson.questions.length - 1 && (
              <p>
                All questions reached. Mastery is earned when every question is
                answered correctly.
              </p>
            )}
          </div>
        )}
        {error && <p className="error">{error}</p>}
      </div>
    </section>
  );
}
