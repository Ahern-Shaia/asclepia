import type { CSSProperties } from "react";
import s from "./style.module.css";

// Flowing signal lines (a nod to monitor traces). Each line is periodic, so translating its group
// by one period loops seamlessly; the path runs two periods past the right edge.
const lines = [
  { y: 120, a: 26, p: 720, w: 1.6, c: "#2f5bff", o: 0.5 },
  { y: 170, a: 40, p: 960, w: 1.2, c: "#6a3cf0", o: 0.4 },
  { y: 220, a: 18, p: 480, w: 2.2, c: "#2fb8ff", o: 0.4 },
  { y: 260, a: 54, p: 1440, w: 1, c: "#6a3cf0", o: 0.5 },
  { y: 300, a: 30, p: 720, w: 1.4, c: "#2f5bff", o: 0.3 },
];

const wave = (y: number, a: number, p: number) => {
  let d = `M0 ${y} Q ${p / 4} ${y - a * 2} ${p / 2} ${y}`;
  for (let x = p; x <= 1440 + p * 2; x += p / 2) d += ` T ${x} ${y}`;
  return d;
};

export function Waves({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 400"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
      fill="none"
    >
      {lines.map((l, i) => (
        <g
          key={l.y}
          className={s.drift}
          style={{ animationDuration: `${22 + i * 7}s`, "--p": `-${l.p}px` } as CSSProperties}
        >
          <path d={wave(l.y, l.a, l.p)} stroke={l.c} strokeWidth={l.w} opacity={l.o} />
        </g>
      ))}
    </svg>
  );
}
