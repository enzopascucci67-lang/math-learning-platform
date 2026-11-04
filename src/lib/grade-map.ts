import type { LearningUnit } from "./student-learning";

export function gradeMapLayout(units: LearningUnit[]) {
  const depths = new Map<string, number>();
  function depth(entry: LearningUnit, visiting = new Set<string>()): number {
    if (depths.has(entry.key)) return depths.get(entry.key)!;
    if (visiting.has(entry.key)) return 0;
    const next = new Set([...visiting, entry.key]);
    const parents = units.filter(
      (candidate) =>
        candidate.courseId === entry.courseId &&
        entry.unit.requires.includes(candidate.unit.id),
    );
    const result = parents.length
      ? Math.max(...parents.map((parent) => depth(parent, next))) + 1
      : 0;
    depths.set(entry.key, result);
    return result;
  }
  units.forEach((entry) => depth(entry));
  // Cap each row at three circles to keep labels legible on a phone.
  const rows: LearningUnit[][] = [];
  for (let level = 0; level <= Math.max(0, ...depths.values()); level++) {
    const entries = units.filter((entry) => depths.get(entry.key) === level);
    for (let index = 0; index < entries.length; index += 3)
      rows.push(entries.slice(index, index + 3));
  }
  const nodes = rows.flatMap((row, rowIndex) =>
    row.map((entry, index) => ({
      entry,
      x: ((index + 1) * 100) / (row.length + 1),
      y: 24 + rowIndex * 180,
    })),
  );
  const edges = nodes.flatMap((target) =>
    nodes
      .filter(
        (source) =>
          source.entry.courseId === target.entry.courseId &&
          target.entry.unit.requires.includes(source.entry.unit.id),
      )
      .map((source) => ({ source, target })),
  );
  return { nodes, edges, height: Math.max(180, rows.length * 180) };
}
