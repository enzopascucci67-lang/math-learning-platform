import type { QuestionVisual } from "@/lib/curriculum";

export function LearningVisual({ visual }: { visual: QuestionVisual }) {
  const label =
    visual.type === "objects"
      ? `${visual.count} stars arranged in rows of up to five.`
      : visual.type === "array"
        ? `${visual.rows} rows of ${visual.columns} counters.`
        : `${visual.numerator} of ${visual.denominator} equal parts are shaded.`;
  return (
    <figure className="learning-visual">
      <svg viewBox="0 0 300 160" role="img" aria-label={label}>
        {visual.type === "objects" &&
          Array.from({ length: visual.count }, (_, index) => {
            const x = 40 + (index % 5) * 55,
              y = 45 + Math.floor(index / 5) * 65;
            return (
              <g key={index} transform={`translate(${x},${y})`}>
                <path
                  d="m0-18 6 12 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2z"
                  fill={visual.color === "gold" ? "#ffd465" : "#5aa3f4"}
                  stroke={visual.color === "gold" ? "#c18a26" : "#2569ba"}
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="m-4-9-3 7-6 1"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity=".7"
                />
              </g>
            );
          })}
        {visual.type === "array" &&
          Array.from({ length: visual.rows * visual.columns }, (_, index) => {
            const spacing = Math.min(40, 120 / visual.rows),
              width = (visual.columns - 1) * spacing,
              height = (visual.rows - 1) * spacing;
            return (
              <circle
                key={index}
                cx={150 - width / 2 + (index % visual.columns) * spacing}
                cy={
                  80 - height / 2 + Math.floor(index / visual.columns) * spacing
                }
                r={Math.min(13, spacing * 0.35)}
                fill={
                  Math.floor(index / visual.columns) % 2 ? "#64b99c" : "#589cee"
                }
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        {visual.type === "fraction" && (
          <g>
            {Array.from({ length: visual.denominator }, (_, index) => (
              <rect
                key={index}
                x={20 + (index * 260) / visual.denominator}
                y="44"
                width={260 / visual.denominator}
                height="72"
                rx="3"
                fill={index < visual.numerator ? "#4c98ed" : "#e8eff6"}
                stroke="white"
                strokeWidth="3"
              />
            ))}
            <rect
              x="20"
              y="44"
              width="260"
              height="72"
              rx="8"
              fill="none"
              stroke="#3677bb"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>
    </figure>
  );
}
