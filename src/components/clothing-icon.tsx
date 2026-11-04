"use client";
import { useId } from "react";
import type { OutfitSlot } from "@/lib/cosmetics";

export function ClothingIcon({
  slot,
  hoodie = false,
  itemId,
}: {
  slot: OutfitSlot;
  hoodie?: boolean;
  itemId?: string;
}) {
  const uid = useId().replaceAll(":", ""),
    green = hoodie || itemId === "forest-hoodie",
    sunset = itemId === "sunset-sweater";
  const cloth = `url(#${uid}-cloth)`,
    gold = `url(#${uid}-gold)`;
  return (
    <svg viewBox="0 0 80 80" className="clothing-icon" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-cloth`} x1=".1" y1="0" x2=".9" y2="1">
          <stop
            stopColor={green ? "#80c9a1" : sunset ? "#ffd1a1" : "#70b4ff"}
          />
          <stop
            offset=".55"
            stopColor={green ? "#45966d" : sunset ? "#ed996c" : "#2879eb"}
          />
          <stop
            offset="1"
            stopColor={green ? "#246344" : sunset ? "#bc6650" : "#164ca9"}
          />
        </linearGradient>
        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fff2ad" />
          <stop offset=".5" stopColor="#ffd25f" />
          <stop offset="1" stopColor="#dd9a31" />
        </linearGradient>
      </defs>
      <ellipse cx="40" cy="73" rx="25" ry="3" fill="#173b64" opacity=".08" />
      {slot === "body" ? (
        <g strokeLinejoin="round">
          {green && (
            <path
              d="M27 22q-5-17 13-17t13 17"
              fill="#337750"
              stroke="#31764e"
              strokeWidth="2"
            />
          )}
          <path
            d="M27 17q13 10 26 0l16 13q3 3 1 6l-7 11q-2 3-5 1l-7-5v23q0 4-4 4H33q-4 0-4-4V43l-7 5q-3 2-5-1l-7-11q-2-3 1-6z"
            fill={cloth}
            stroke={green ? "#32704d" : sunset ? "#b67550" : "#2860af"}
            strokeWidth="1.5"
          />
          <path
            d="M29 19q11 15 22 0"
            fill="none"
            stroke={green ? "#bddec9" : sunset ? "#ffe2bd" : "#c8e5ff"}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M34 33v25"
            stroke="white"
            strokeWidth="2.5"
            opacity=".12"
            strokeLinecap="round"
          />
          <path
            d="M32 65h16"
            stroke={green ? "#245d41" : sunset ? "#a96048" : "#2054a5"}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {green ? (
            <>
              <path
                d="M35 28v13m10-13v13"
                stroke="#e1f0e5"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <path
                d="M34 49h12l4 11H30z"
                fill="#2f7952"
                stroke="#9cc5ab"
                strokeWidth="1.3"
              />
            </>
          ) : (
            <path d="m33 51 7-13 9 13h-6l-3-5-3 5z" fill="#f7fcff" />
          )}
        </g>
      ) : itemId === "star-crown" ? (
        <g strokeLinejoin="round">
          <path
            d="m14 53-5-29 18 12 13-23 13 23 18-12-5 29z"
            fill={gold}
            stroke="#c78c32"
            strokeWidth="2"
          />
          <rect
            x="14"
            y="49"
            width="52"
            height="11"
            rx="5"
            fill={gold}
            stroke="#c78c32"
            strokeWidth="1.5"
          />
          <path
            d="m40 29 5 7-5 7-5-7z"
            fill="#63b6d2"
            stroke="white"
            strokeWidth="1.3"
          />
          <path
            d="M20 53h11"
            stroke="#fff7d3"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      ) : itemId === "stargazer-beanie" ? (
        <g strokeLinejoin="round">
          <path
            d="M15 49q-2-31 25-31t25 31"
            fill="#a38cc9"
            stroke="#6e5792"
            strokeWidth="2"
          />
          <circle cx="40" cy="15" r="7" fill="#b49bd9" />
          <path
            d="M25 46q0-14 6-23m9 22V22m15 24-6-23"
            stroke="#d2c0ec"
            strokeWidth="2"
            fill="none"
          />
          <rect
            x="13"
            y="43"
            width="54"
            height="17"
            rx="7"
            fill="#7b649e"
            stroke="#6e5792"
            strokeWidth="2"
          />
          <path
            d="m40 46 2 4 5 1-3 3 1 5-5-2-4 2 1-5-4-3 5-1z"
            fill="#ffedaa"
          />
        </g>
      ) : itemId === "explorer-satchel" ? (
        <g strokeLinejoin="round">
          <path
            d="M21 41V21q19-15 38 0v20"
            stroke="#876644"
            strokeWidth="5"
            fill="none"
          />
          <rect
            x="13"
            y="31"
            width="54"
            height="37"
            rx="9"
            fill="#c59a68"
            stroke="#876644"
            strokeWidth="2"
          />
          <path
            d="M14 34q26 24 52 0v-3H14z"
            fill="#d7b383"
            stroke="#876644"
            strokeWidth="2"
          />
          <rect
            x="36"
            y="40"
            width="9"
            height="14"
            rx="3"
            fill={gold}
            stroke="#ad8644"
            strokeWidth="1"
          />
        </g>
      ) : itemId === "scholar-scarf" ? (
        <g strokeLinejoin="round">
          <path
            d="M39 33q16-4 23 4l-4 32q-9 4-17-1z"
            fill="#8b66be"
            stroke="#6c479d"
            strokeWidth="1.6"
          />
          <path
            d="M15 21q24 14 48 0l4 17q-27 17-54 0z"
            fill="#b193d9"
            stroke="#7752a7"
            strokeWidth="1.6"
          />
          <path
            d="M20 28q20 9 39 0m-14 30h12m-12 5h11"
            fill="none"
            stroke="#e4d4f5"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      ) : slot === "head" ? (
        <g strokeLinejoin="round">
          <path
            d="M15 43q0-29 25-29t25 29z"
            fill={cloth}
            stroke="#2860af"
            strokeWidth="1.5"
          />
          <path
            d="M40 17q-12 8-12 24m14-24q13 7 14 24"
            fill="none"
            stroke="#9dccff"
            strokeWidth="1.2"
          />
          <path
            d="M14 41q25-5 49 0 13 3 10 12-9 9-34-1-15-5-25-2z"
            fill={cloth}
            stroke="#2860af"
            strokeWidth="1.5"
          />
          <path d="m35 34 5-9 6 9h-4l-2-3-2 3z" fill="white" />
        </g>
      ) : (
        <g strokeLinejoin="round">
          <path
            d="m40 12 9 18 21 3-15 15 4 22-19-10-19 10 4-22-15-15 21-3z"
            fill={gold}
            stroke="#ca923b"
            strokeWidth="2"
          />
          <path
            d="m36 23-5 13-11 2"
            fill="none"
            stroke="#fff6c9"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
}
