// Hero illustration: a friendly showroom corner — monitor on a cart (live trace), microscope,
// centrifuge. Drawn here so it can carry the pastel palette; the placeholder SVGs are gray.
import s from "./style.module.css";

export function Scene() {
  return (
    <svg viewBox="0 0 520 440" className={s.scene} aria-hidden="true">
      <circle cx="270" cy="220" r="196" fill="#ffd9c7" />
      <circle cx="430" cy="92" r="46" fill="#e3dbff" />
      <circle cx="78" cy="352" r="34" fill="#bfe8d8" />
      <ellipse cx="270" cy="404" rx="210" ry="18" fill="#23323a" opacity="0.08" />
      {/* cart + monitor */}
      <rect
        x="170"
        y="96"
        width="210"
        height="150"
        rx="26"
        fill="#ffffff"
        stroke="#23323a"
        strokeWidth="6"
      />
      <rect x="192" y="118" width="166" height="106" rx="14" fill="#2f4f5a" />
      <path
        className={s.trace}
        d="M198 178 H236 L248 150 L262 206 L274 170 L284 178 H352"
        fill="none"
        stroke="#bfe8d8"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="258" y="246" width="34" height="96" fill="#23323a" />
      <rect
        x="196"
        y="334"
        width="158"
        height="24"
        rx="12"
        fill="#ffffff"
        stroke="#23323a"
        strokeWidth="6"
      />
      <circle cx="214" cy="386" r="14" fill="#ffffff" stroke="#23323a" strokeWidth="6" />
      <circle cx="336" cy="386" r="14" fill="#ffffff" stroke="#23323a" strokeWidth="6" />
      {/* microscope */}
      <g transform="translate(398 230)">
        <rect
          x="0"
          y="144"
          width="86"
          height="20"
          rx="10"
          fill="#e3dbff"
          stroke="#23323a"
          strokeWidth="6"
        />
        <path
          d="M60 144 V70 A30 30 0 0 0 30 40"
          fill="none"
          stroke="#23323a"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <rect
          x="14"
          y="0"
          width="28"
          height="70"
          rx="14"
          transform="rotate(-24 28 35)"
          fill="#ffffff"
          stroke="#23323a"
          strokeWidth="6"
        />
        <rect
          x="6"
          y="98"
          width="62"
          height="12"
          rx="6"
          fill="#ffffff"
          stroke="#23323a"
          strokeWidth="6"
        />
      </g>
      {/* centrifuge */}
      <g transform="translate(40 250)">
        <rect
          x="0"
          y="40"
          width="110"
          height="74"
          rx="26"
          fill="#ffffff"
          stroke="#23323a"
          strokeWidth="6"
        />
        <ellipse cx="55" cy="40" rx="55" ry="22" fill="#bfe8d8" stroke="#23323a" strokeWidth="6" />
        <circle cx="30" cy="84" r="8" fill="#ffd9c7" stroke="#23323a" strokeWidth="4" />
      </g>
      <path
        d="M118 120 l6 14 l14 6 l-14 6 l-6 14 l-6 -14 l-14 -6 l14 -6 z"
        fill="#ffffff"
        className={s.twinkle}
      />
      <path
        d="M452 186 l4 9 l9 4 l-9 4 l-4 9 l-4 -9 l-9 -4 l9 -4 z"
        fill="#ffffff"
        className={s.twinkle}
      />
    </svg>
  );
}

export function Icon({ name }: { name: string }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
      {name === "photos" && (
        <g {...p}>
          <rect x="4" y="9" width="24" height="17" rx="5" />
          <circle cx="16" cy="17.5" r="4.5" />
          <path d="M11 9 l2 -3 h6 l2 3" />
        </g>
      )}
      {name === "visit" && (
        <g {...p}>
          <rect x="5" y="7" width="22" height="20" rx="5" />
          <path d="M5 13 H27 M11 4 V9 M21 4 V9" />
          <path d="M12 20 l3 3 l6 -6" />
        </g>
      )}
      {name === "install" && (
        <g {...p}>
          <path d="M3 9 H19 V22 H3 Z" />
          <path d="M19 13 H25 L29 18 V22 H19" />
          <circle cx="9" cy="24" r="3" fill="#ffffff" />
          <circle cx="24" cy="24" r="3" fill="#ffffff" />
        </g>
      )}
    </svg>
  );
}
