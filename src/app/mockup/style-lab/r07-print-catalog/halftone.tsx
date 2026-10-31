// Amplitude-modulated halftone disc: a 45° dot screen whose dot radius falls off from the centre,
// like a printed tone ramp. Pure geometry, computed once at module load.
const STEP = 11;
const SIZE = 264;
const C = SIZE / 2;

const dots: { x: number; y: number; r: number }[] = [];
for (let row = 0; row * STEP <= SIZE; row++) {
  for (let col = 0; col * STEP <= SIZE; col++) {
    const x = col * STEP + (row % 2 ? STEP / 2 : 0);
    const y = row * STEP;
    const d = Math.hypot(x - C, y - C) / C;
    const r = d < 1 ? +(4.6 * (1 - d ** 1.6)).toFixed(2) : 0;
    if (r > 0.35) dots.push({ x, y, r });
  }
}

export function Halftone({ className }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={className} aria-hidden>
      {dots.map((d) => (
        <circle key={`${d.x}-${d.y}`} cx={d.x} cy={d.y} r={d.r} />
      ))}
    </svg>
  );
}

// Printer's registration target (folio marks, colophon).
export function RegMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12 1 V23 M1 12 H23" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
    </svg>
  );
}
