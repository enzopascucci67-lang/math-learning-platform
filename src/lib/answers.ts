import type { Question } from "./curriculum";
export function numberValue(value: string): number | null {
  const v = value.trim().replaceAll("−", "-");
  if (
    !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\s*\/\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+))?$/.test(
      v,
    )
  )
    return null;
  const [a, b] = v.split("/").map(Number);
  const n = b === undefined ? a : a / b;
  return Number.isFinite(n) ? n : null;
}
export function checkAnswer(q: Question, value: string) {
  if (q.kind === "numeric") {
    const actual = numberValue(value),
      expected = numberValue(q.answer);
    return (
      actual !== null &&
      expected !== null &&
      Math.abs(actual - expected) <= 1e-6
    );
  }
  return (
    value.trim().toLowerCase().replace(/\s|\*/g, "").replaceAll("−", "-") ===
    q.answer.toLowerCase().replace(/\s|\*/g, "").replaceAll("−", "-")
  );
}
