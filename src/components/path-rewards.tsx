"use client";
import { useId } from "react";
import Link from "next/link";
import { Gift, Check, Flag } from "lucide-react";
import type { JourneyMilestone } from "@/lib/learning-journey";
import { ClothingIcon } from "./clothing-icon";

export function AtlasPawn() {
  const uid = useId().replaceAll(":", "");
  return (
    <svg className="atlas-pawn" viewBox="0 0 80 100" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-pawn`} cx="30%" cy="22%" r="85%">
          <stop stopColor="#a3dcff" />
          <stop offset=".45" stopColor="#438df4" />
          <stop offset="1" stopColor="#2358bf" />
        </radialGradient>
        <linearGradient id={`${uid}-base`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#ffed9d" />
          <stop offset="1" stopColor="#e8b44b" />
        </linearGradient>
      </defs>
      <ellipse cx="40" cy="91" rx="29" ry="6" fill="#1b4d8e" opacity=".15" />
      <circle cx="40" cy="27" r="25" fill="#7cc7ff" opacity=".12" />
      <path
        d="M27 45q5 8 2 17-2 7-9 13h40q-7-6-9-13-3-9 2-17z"
        fill={`url(#${uid}-pawn)`}
        stroke="#2159b8"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect
        x="23"
        y="42"
        width="34"
        height="9"
        rx="4.5"
        fill="#d2edff"
        stroke="#3d78c7"
        strokeWidth="1.5"
      />
      <circle
        cx="40"
        cy="27"
        r="19"
        fill={`url(#${uid}-pawn)`}
        stroke="#2159b8"
        strokeWidth="2"
      />
      <path
        d="M29 22q2-8 11-9"
        fill="none"
        stroke="#d7f2ff"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="m32 32 8-13 9 13h-6l-3-5-3 5z"
        fill="white"
        stroke="white"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M25 74h30q9 0 10 9v3H15v-3q1-9 10-9z"
        fill={`url(#${uid}-base)`}
        stroke="#c18c32"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M20 81h40"
        stroke="#fff4c2"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <ellipse cx="40" cy="77" rx="18" ry="2.2" fill="#fff7cc" opacity=".7" />
      <path
        d="M35 55q1 8-5 14"
        fill="none"
        stroke="#b0e3ff"
        strokeWidth="3"
        strokeLinecap="round"
        opacity=".65"
      />
    </svg>
  );
}

export function RewardDot({
  milestones,
  onSelect,
}: {
  milestones: JourneyMilestone[];
  onSelect: (threshold: number) => void;
}) {
  const earned = milestones.every((milestone) => milestone.earned);
  const names = milestones
    .flatMap((milestone) => milestone.items.map((item) => item.name))
    .join(", ");
  return (
    <button
      type="button"
      className={`path-gift-dot ${earned ? "is-earned" : ""}`}
      onClick={() => onSelect(milestones[0].threshold)}
      aria-label={`${earned ? "Earned" : "Upcoming"} clothing checkpoint: ${names}. Show reward details.`}
    >
      <Gift size={20} aria-hidden="true" />
      {earned && (
        <Check className="gift-earned-check" size={12} aria-hidden="true" />
      )}
    </button>
  );
}

export function PathRewards({
  milestones,
  selected,
  onSelect,
}: {
  milestones: JourneyMilestone[];
  selected: number | null;
  onSelect: (threshold: number) => void;
}) {
  const active =
    milestones.find((milestone) => milestone.threshold === selected) ||
    milestones.find((milestone) => !milestone.earned) ||
    milestones.at(-1);
  if (!active) return null;
  const allEarned = milestones.every((milestone) => milestone.earned);
  return (
    <section className="path-rewards" aria-labelledby="path-rewards-title">
      <div className="reward-heading">
        <Gift size={22} aria-hidden="true" />
        <div>
          <h3 id="path-rewards-title">Clothes along the way</h3>
          <p>Each new lesson brings you closer. Replays are for practice.</p>
        </div>
      </div>
      <ol className="reward-checkpoints">
        {milestones.map((milestone) => (
          <li key={milestone.threshold}>
            <button
              type="button"
              className={`reward-checkpoint ${milestone.earned ? "is-earned" : ""}`}
              aria-pressed={active.threshold === milestone.threshold}
              onClick={() => onSelect(milestone.threshold)}
              aria-label={`${milestone.items.map((item) => item.name).join(" and ")}, ${milestone.earned ? "earned" : `${milestone.remaining} more completed lessons`}. Show reward details.`}
            >
              <span className="reward-token">
                <ClothingIcon
                  slot={milestone.items[0].slot}
                  itemId={milestone.items[0].id}
                />
                {milestone.earned && (
                  <Check
                    className="checkpoint-check"
                    size={15}
                    aria-hidden="true"
                  />
                )}
              </span>
              <strong>
                {milestone.threshold}{" "}
                {milestone.threshold === 1 ? "lesson" : "lessons"}
              </strong>
              <span>
                {milestone.items.length > 1
                  ? "Cap + badge"
                  : milestone.items[0].name
                      .replace("Forest ", "")
                      .replace("Scholar ", "")
                      .replace("Star ", "")}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div
        className="reward-detail"
        id="path-reward-detail"
        role="region"
        aria-label="Clothing reward details"
        aria-live="polite"
        tabIndex={-1}
      >
        <span className="reward-detail-icon" aria-hidden="true">
          <ClothingIcon
            slot={active.items[0].slot}
            itemId={active.items[0].id}
          />
        </span>
        <div>
          <strong>{active.items.map((item) => item.name).join(" + ")}</strong>
          <p>
            {active.earned
              ? "You earned this! Try it on in My character."
              : active.remaining
                ? `Finish ${active.remaining} more ${active.remaining === 1 ? "new lesson" : "new lessons"} to unlock. Lessons from any grade count.`
                : "Your completed lessons qualify. Your clothing inventory will update when saved progress syncs."}
          </p>
        </div>
        <Link href="/profile#wardrobe-title" className="secondary">
          {active.earned ? "Try it on" : "See clothes"}
        </Link>
      </div>
      {allEarned && (
        <p className="all-rewards-earned">
          <Flag size={16} aria-hidden="true" />
          You collected every current style. Keep exploring your math path!
        </p>
      )}
      <p className="reward-route-note">
        Gift dots show checkpoints along this path. You can explore in any
        order.
      </p>
    </section>
  );
}
