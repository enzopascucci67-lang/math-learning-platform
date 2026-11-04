"use client";
import { useId } from "react";
import type { Outfit } from "@/lib/curriculum";
import { cosmeticItems } from "@/lib/cosmetics";

/** Layered vector artwork keeps every earned outfit crisp at any preview size. */
export function CharacterPreview({ outfit }: { outfit: Outfit }) {
  const uid = useId().replaceAll(":", "");
  const paint = (name: string) => `url(#${uid}-${name})`;
  const hoodie = outfit.body === "forest-hoodie";
  const sunset = outfit.body === "sunset-sweater";
  const description = cosmeticItems
    .filter((item) => outfit[item.slot] === item.id)
    .map((item) => item.name)
    .join(", ");
  return (
    <svg
      className="character-preview"
      viewBox="0 0 200 230"
      role="img"
      aria-label={`Your character wearing ${description}`}
    >
      <defs>
        <radialGradient id={`${uid}-backdrop`} cx="38%" cy="30%" r="75%">
          <stop stopColor="#f7fcff" />
          <stop offset="1" stopColor="#e1f0ff" />
        </radialGradient>
        <radialGradient id={`${uid}-skin`} cx="35%" cy="28%" r="78%">
          <stop stopColor="#ffe3bf" />
          <stop offset=".55" stopColor="#efbd94" />
          <stop offset="1" stopColor="#cf8965" />
        </radialGradient>
        <linearGradient id={`${uid}-hands`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f9d2ac" />
          <stop offset="1" stopColor="#d99570" />
        </linearGradient>
        <linearGradient id={`${uid}-shirt`} x1="0" y1="0" x2=".9" y2="1">
          <stop
            stopColor={hoodie ? "#72bd96" : sunset ? "#ffc38a" : "#68afff"}
          />
          <stop
            offset=".48"
            stopColor={hoodie ? "#40956d" : sunset ? "#ed9262" : "#2878ee"}
          />
          <stop
            offset="1"
            stopColor={hoodie ? "#21684c" : sunset ? "#bd604b" : "#144bb8"}
          />
        </linearGradient>
        <linearGradient id={`${uid}-hair`} x1=".1" y1="0" x2=".8" y2="1">
          <stop stopColor="#9d684b" />
          <stop offset=".45" stopColor="#65422f" />
          <stop offset="1" stopColor="#382b2b" />
        </linearGradient>
        <linearGradient id={`${uid}-pants`} x1="0" y1="0" x2="1" y2=".5">
          <stop stopColor="#526780" />
          <stop offset=".55" stopColor="#354b66" />
          <stop offset="1" stopColor="#283b54" />
        </linearGradient>
        <linearGradient id={`${uid}-cap`} x1=".2" y1="0" x2=".7" y2="1">
          <stop stopColor="#62a8ff" />
          <stop offset=".5" stopColor="#2674ed" />
          <stop offset="1" stopColor="#164ab7" />
        </linearGradient>
        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2=".8" y2="1">
          <stop stopColor="#fff0a1" />
          <stop offset=".5" stopColor="#ffd25d" />
          <stop offset="1" stopColor="#e59a31" />
        </linearGradient>
        <linearGradient id={`${uid}-scarf`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#b59aea" />
          <stop offset="1" stopColor="#7651b4" />
        </linearGradient>
        <radialGradient id={`${uid}-cheek`}>
          <stop stopColor="#e88b80" stopOpacity=".55" />
          <stop offset="1" stopColor="#e88b80" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-shadow`}>
          <stop stopColor="#789cc7" stopOpacity=".35" />
          <stop offset="1" stopColor="#789cc7" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="116" r="89" fill={paint("backdrop")} />
      <circle
        cx="100"
        cy="116"
        r="82"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        opacity=".7"
      />
      <path
        d="M28 109a74 74 0 0 1 28-48"
        fill="none"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        opacity=".7"
      />
      <ellipse cx="100" cy="215" rx="60" ry="11" fill={paint("shadow")} />

      {/* Rounded trousers and chunky sneakers. */}
      <rect
        x="76"
        y="164"
        width="48"
        height="26"
        rx="11"
        fill={paint("pants")}
      />
      <path
        d="M77 177h20v26q-9 7-20-1zM104 177h20v25q-11 8-20 1z"
        fill={paint("pants")}
        strokeLinejoin="round"
      />
      <path
        d="M82 181v15m28-15v15"
        stroke="#8293a8"
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".45"
      />
      <g strokeLinejoin="round">
        <path
          d="M78 197q9-4 18 1l1 10q-8 5-29 2-1-9 10-13zM105 198q9-5 18-1 11 4 10 13-20 3-29-2z"
          fill={paint("cap")}
          stroke="#275cae"
          strokeWidth="1.3"
        />
        <path
          d="M69 207q12 3 28-1v6q-14 4-29-1zM104 206q15 4 28 1l1 4q-15 5-29 1z"
          fill="#f6faff"
          stroke="#d8e5f3"
          strokeWidth="1"
        />
        <path
          d="m80 200 10 1m-13 3 12 1m21-4 10-1m-9 5 12-1"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>

      {/* Sleeves wrap naturally around soft arms and mitten-like hands. */}
      <path
        d="M75 122q-15 5-19 27l-3 13m72-40q15 5 19 27l3 13"
        fill="none"
        stroke={hoodie ? "#28734f" : sunset ? "#b76a50" : "#205ac6"}
        strokeWidth="19"
        strokeLinecap="round"
      />
      <path
        d="M74 121q-13 7-17 25m69-25q13 7 17 25"
        fill="none"
        stroke={hoodie ? "#52a77b" : sunset ? "#f0a173" : "#438bf0"}
        strokeWidth="18"
        strokeLinecap="round"
      />
      <path
        d="m55 154-3 12m93-12 3 12"
        stroke={paint("hands")}
        strokeWidth="15"
        strokeLinecap="round"
      />
      <path
        d="m58 161 1 5m82-5-1 5"
        stroke="#e7b18b"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {hoodie && <path d="M72 119q-7-23 11-27h34q18 4 11 27z" fill="#2e7856" />}
      <rect
        x="89"
        y="101"
        width="22"
        height="26"
        rx="10"
        fill={paint("hands")}
      />
      <path
        d="M76 116q8-5 13-3 11 13 22 0 6-2 13 3 8 8 8 28l-2 27q-1 7-9 8H79q-9-1-9-8l-2-27q0-20 8-28z"
        fill={paint("shirt")}
        stroke={hoodie ? "#2d7757" : sunset ? "#b76a50" : "#2769ce"}
        strokeWidth="1.2"
      />
      <path
        d="M77 129q-4 19-1 35"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        opacity=".14"
      />
      <path
        d="M76 172q24 5 48 0"
        fill="none"
        stroke={hoodie ? "#205d45" : sunset ? "#ae5d49" : "#1749aa"}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity=".5"
      />
      {hoodie ? (
        <>
          <path
            d="M82 115q18 20 36 0"
            fill="none"
            stroke="#a7d5ba"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M90 124v15m20-15v15"
            stroke="#d0e8d9"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M87 148q13-4 26 0l5 14q-18 5-36 0z"
            fill="#287653"
            opacity=".5"
            stroke="#83bc9d"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <circle cx="90" cy="139" r="1.6" fill="#e3f2e8" />
          <circle cx="110" cy="139" r="1.6" fill="#e3f2e8" />
        </>
      ) : (
        <>
          <path
            d="M87 115q13 11 26 0"
            fill="none"
            stroke={sunset ? "#ffddbd" : "#a0ceff"}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="m89 149 10-17 13 17h-7l-6-8-4 8z"
            fill="#f5fbff"
            stroke="#f5fbff"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </>
      )}

      {/* Ears, softly sculpted face, expressive eyes and layered hair. */}
      <ellipse cx="65" cy="81" rx="9" ry="12" fill={paint("skin")} />
      <ellipse cx="135" cy="81" rx="9" ry="12" fill={paint("skin")} />
      <ellipse cx="63" cy="82" rx="3" ry="5" fill="#d9967c" opacity=".35" />
      <ellipse cx="137" cy="82" rx="3" ry="5" fill="#d9967c" opacity=".35" />
      <path
        d="M63 78q-5 1-1 7m75-7q5 1 1 7"
        fill="none"
        stroke="#c98968"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M65 67q0-30 35-30t35 30l-2 23q-3 25-33 27-30-2-33-27z"
        fill={paint("skin")}
      />
      <ellipse cx="77" cy="92" rx="11" ry="8" fill={paint("cheek")} />
      <ellipse cx="123" cy="92" rx="11" ry="8" fill={paint("cheek")} />
      <path
        d="M77 71q6-4 13-1m20 0q7-3 13 1"
        fill="none"
        stroke="#6b4533"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <g>
        <ellipse cx="85" cy="82" rx="6.2" ry="8" fill="#fffdf8" />
        <ellipse cx="115" cy="82" rx="6.2" ry="8" fill="#fffdf8" />
        <ellipse cx="86" cy="83" rx="4.1" ry="5.6" fill="#624231" />
        <ellipse cx="114" cy="83" rx="4.1" ry="5.6" fill="#624231" />
        <ellipse cx="86.5" cy="84" rx="2.5" ry="4" fill="#292631" />
        <ellipse cx="113.5" cy="84" rx="2.5" ry="4" fill="#292631" />
        <circle cx="87.5" cy="80" r="1.8" fill="white" />
        <circle cx="114.5" cy="80" r="1.8" fill="white" />
      </g>
      <path
        d="M98 84q-4 8 3 8"
        fill="none"
        stroke="#d49b79"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M89 98q11 8 22 0-3 13-11 12-8 0-11-12z"
        fill="#874c40"
        stroke="#874c40"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M91 99q9 5 18 0l-2 4q-7 2-14 0z" fill="#fffaf3" />
      <path
        d="M97 107q4-3 8 0"
        stroke="#d98982"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M63 81q-8-14-4-27 2-13 15-17 6-13 22-10 14-8 28 3 18 4 18 23 2 17-7 29l-4-21q-7 4-14-7-19 18-42 8l-5 20z"
        fill={paint("hair")}
      />
      <path
        d="M71 53q18 4 35-10M84 38q15-5 29 0M123 43q9 4 10 13"
        fill="none"
        stroke="#c28a5e"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity=".5"
      />

      {outfit.head === "explorer-cap" && (
        <g strokeLinejoin="round">
          <path
            d="M62 58q-1-32 37-33 35-1 39 33z"
            fill={paint("cap")}
            stroke="#205bc0"
            strokeWidth="1.2"
          />
          <path
            d="M96 29q-14 9-14 27m18-27q17 8 20 27"
            fill="none"
            stroke="#a8d0ff"
            strokeWidth="1.3"
            opacity=".55"
          />
          <ellipse cx="99" cy="26" rx="4" ry="2.5" fill="#2b75e2" />
          <path
            d="M62 57q35-7 74 0 17 4 9 12-10 7-37-2-20-5-46-3z"
            fill={paint("cap")}
            stroke="#205bc0"
            strokeWidth="1.4"
          />
          <path
            d="M70 59q33-5 62 1"
            fill="none"
            stroke="#8bc3ff"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="m94 48 5-9 6 9h-4l-2-3-2 3z" fill="white" opacity=".9" />
        </g>
      )}
      {outfit.head === "star-crown" && (
        <g strokeLinejoin="round">
          <path
            d="m66 48-5-25 20 12 19-23 19 23 20-12-5 25z"
            fill={paint("gold")}
            stroke="#cc9039"
            strokeWidth="2"
          />
          <rect
            x="66"
            y="44"
            width="68"
            height="10"
            rx="5"
            fill={paint("gold")}
            stroke="#cc9039"
            strokeWidth="1.4"
          />
          <path
            d="m100 27 5 6-5 7-5-7z"
            fill="#65bed9"
            stroke="#e8fbff"
            strokeWidth="1.5"
          />
          <circle cx="79" cy="43" r="2.6" fill="#fff7c9" />
          <circle cx="121" cy="43" r="2.6" fill="#fff7c9" />
        </g>
      )}
      {outfit.head === "stargazer-beanie" && (
        <g strokeLinejoin="round">
          <path
            d="M63 57q-3-32 36-32t38 32z"
            fill="#8c79bb"
            stroke="#62528b"
            strokeWidth="1.4"
          />
          <path
            d="M74 52q0-15 10-22m9 22 6-22m10 22-1-22m17 22-7-20"
            fill="none"
            stroke="#c1b3df"
            strokeWidth="2"
            opacity=".6"
          />
          <circle cx="100" cy="22" r="8" fill="#aa98cf" />
          <rect
            x="62"
            y="51"
            width="76"
            height="15"
            rx="7"
            fill="#716097"
            stroke="#62528b"
            strokeWidth="1.4"
          />
          <path
            d="m99 54 2 4 5 1-4 3 1 4-4-2-4 2 1-4-4-3 5-1z"
            fill="#fff0aa"
          />
        </g>
      )}
      {outfit.accessory === "star-badge" && (
        <g strokeLinejoin="round">
          <path
            d="m120 129 3.7 7.3 8 1.3-5.8 5.8 1.2 8-7.1-3.8-7.1 3.8 1.2-8-5.8-5.8 8-1.3z"
            fill={paint("gold")}
            stroke="#cc9039"
            strokeWidth="1.3"
          />
          <path
            d="m119 134-2 5-4 1"
            fill="none"
            stroke="#fff5bb"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>
      )}
      {outfit.accessory === "scholar-scarf" && (
        <g strokeLinejoin="round">
          <path
            d="M108 122q10-3 17 1l-3 31q-7 4-15-1z"
            fill={paint("scarf")}
            stroke="#7351a6"
            strokeWidth="1.2"
          />
          <path
            d="M78 113q22 13 44 0l3 10q-25 15-50 0z"
            fill={paint("scarf")}
            stroke="#7351a6"
            strokeWidth="1.2"
          />
          <path
            d="M80 118q20 9 39 0m-9 29h10m-11 4h10"
            fill="none"
            stroke="#d8c5f4"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="m109 154-1 4m6-4v4m5-4v4"
            stroke="#8962c1"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      )}
      {outfit.accessory === "explorer-satchel" && (
        <g strokeLinejoin="round">
          <path
            d="m85 116 39 45"
            stroke="#654939"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="m85 115 39 45"
            stroke="#bb9973"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect
            x="107"
            y="144"
            width="34"
            height="31"
            rx="8"
            fill="#c59862"
            stroke="#805f40"
            strokeWidth="1.5"
          />
          <path
            d="M108 149q16 17 32 0v-3q0-5-7-5h-18q-7 0-7 5z"
            fill="#d5af7a"
            stroke="#977046"
            strokeWidth="1.3"
          />
          <rect
            x="121"
            y="151"
            width="7"
            height="10"
            rx="2"
            fill="#ffe4a0"
            stroke="#b18b48"
            strokeWidth="1"
          />
        </g>
      )}
    </svg>
  );
}
