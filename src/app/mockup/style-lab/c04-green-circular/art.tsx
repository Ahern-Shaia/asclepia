import type { CSSProperties } from "react";

// Three-arc loop with arrowheads (the reuse cycle). viewBox 0 0 400 400, colours via classes.
const C = 200;
const pt = (r: number, t: number) => {
  const a = (t * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
};
const f = (n: number) => n.toFixed(1);

function arc(r: number, t0: number, t1: number) {
  const [x0, y0] = pt(r, t0);
  const [x1, y1] = pt(r, t1);
  const a = (t1 * Math.PI) / 180;
  const [tx, ty] = [-Math.sin(a), Math.cos(a)];
  const [nx, ny] = [Math.cos(a), Math.sin(a)];
  const head = `M${f(x1 + tx * 22)} ${f(y1 + ty * 22)} L${f(x1 + nx * 15)} ${f(y1 + ny * 15)} L${f(x1 - nx * 15)} ${f(y1 - ny * 15)} Z`;
  return { line: `M${f(x0)} ${f(y0)} A${r} ${r} 0 0 1 ${f(x1)} ${f(y1)}`, head };
}

export function CycleRing({ className, tones }: { className?: string; tones: string[] }) {
  const arcs = [-80, 40, 160].map((t0) => arc(176, t0, t0 + 96));
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden fill="none">
      <circle
        cx={C}
        cy={C}
        r="150"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 8"
        className={tones[3]}
      />
      {arcs.map((a, i) => (
        <g key={a.line} className={tones[i]}>
          <path d={a.line} stroke="currentColor" strokeWidth="14" strokeLinecap="round" />
          <path d={a.head} fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}

// A single leaf with midrib and side veins. viewBox centred on 0,0.
export function Leaf({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="-30 -50 60 100" className={className} style={style} aria-hidden>
      <path d="M0 -46 C 30 -26, 30 22, 0 46 C -30 22, -30 -26, 0 -46 Z" />
      <path
        d="M0 -38 V 40 M0 -14 L 13 -24 M0 2 L 15 -8 M0 18 L 13 8 M0 -6 L -13 -16 M0 10 L -15 0 M0 26 L -12 16"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
