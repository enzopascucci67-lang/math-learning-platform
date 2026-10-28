"use client";
import { Background, Controls, ReactFlow, MarkerType } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Course } from "@/lib/curriculum";
export function ProgressCircle({
  value,
  size = 56,
}: {
  value: number;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      role="img"
      aria-label={`${Math.round(value)}% complete`}
    >
      <circle
        cx="30"
        cy="30"
        r="25"
        fill="none"
        stroke="var(--line)"
        strokeWidth="4"
      />
      <circle
        cx="30"
        cy="30"
        r="25"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeDasharray={`${value * 1.57} 157`}
        transform="rotate(-90 30 30)"
        strokeLinecap="round"
      />
      <text x="30" y="34" textAnchor="middle" fill="currentColor" fontSize="12">
        {Math.round(value)}%
      </text>
    </svg>
  );
}
export function SkillTree({
  course,
  completed,
  onSelect,
}: {
  course: Course;
  completed: string[];
  onSelect: (id: string) => void;
}) {
  const nodes = course.units.map((u) => ({
    id: u.id,
    position: { x: u.x, y: u.y },
    data: {
      label: (
        <div className="node-label">
          <ProgressCircle
            value={
              (100 * u.lessons.filter((l) => completed.includes(l.id)).length) /
              u.lessons.length
            }
          />
          <strong>{u.title}</strong>
          <small>{u.lessons.length} lesson · Explore →</small>
        </div>
      ),
    },
    style: {
      borderRadius: 24,
      width: 155,
      border: "1px solid var(--line)",
      background: "var(--card)",
      color: "var(--ink)",
    },
  }));
  const edges = course.units.flatMap((u) =>
    u.requires.map((source) => ({
      id: `${source}-${u.id}`,
      source,
      target: u.id,
      animated: true,
      style: { stroke: "#9b9be4", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#9b9be4" },
    })),
  );
  return (
    <div
      className="tree"
      aria-label={`${course.title} interactive learning map`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={(_, node) => onSelect(node.id)}
        fitView
        nodesDraggable={false}
        minZoom={0.35}
        maxZoom={1.5}
        proOptions={{ hideAttribution: false }}
      >
        <Background color="#bfc4d6" gap={24} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
