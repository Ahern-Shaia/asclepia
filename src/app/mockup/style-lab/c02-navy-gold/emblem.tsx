// Guilloche-style seal drawn in hairlines: concentric rings, a tick ring and a diamond ring.
// Purely decorative (no text, no claims). Stroke colour comes from `currentColor`.
export function Emblem({ className }: { className?: string }) {
  const ticks = Array.from({ length: 120 }, (_, i) => i * 3);
  const dots = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden fill="none" stroke="currentColor">
      <circle cx="200" cy="200" r="196" strokeWidth="1" />
      <circle cx="200" cy="200" r="188" strokeWidth="0.6" />
      {ticks.map((a) => (
        <line
          key={a}
          x1="200"
          y1="14"
          x2="200"
          y2={a % 15 === 0 ? 30 : 22}
          strokeWidth="0.8"
          transform={`rotate(${a} 200 200)`}
        />
      ))}
      <circle cx="200" cy="200" r="166" strokeWidth="0.6" />
      {dots.map((a) => (
        <path
          key={a}
          d="M200 38 L204 44 L200 50 L196 44 Z"
          fill="currentColor"
          stroke="none"
          transform={`rotate(${a} 200 200)`}
        />
      ))}
      <circle cx="200" cy="200" r="158" strokeWidth="1" />
    </svg>
  );
}

// Small rule with a centred diamond, used under section titles.
export function Rule({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 12" className={className} aria-hidden>
      <path d="M0 6 H50 M70 6 H120" stroke="currentColor" strokeWidth="1" />
      <path d="M60 1 L65 6 L60 11 L55 6 Z" fill="currentColor" />
    </svg>
  );
}
