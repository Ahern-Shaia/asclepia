// Security-paper background art: a hypotrochoid rosette and a woven wave band. Pure geometry,
// no emblem or text, so it reads as "formal document" without imitating any real agency.
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

function trochoid(R: number, r: number, d: number, step = 0.05) {
  const turns = r / gcd(R, r);
  const pts: string[] = [];
  for (let t = 0; t <= 2 * Math.PI * turns + step; t += step) {
    const x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
    const y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
    pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}

const outer = trochoid(150, 46, 92);
const inner = trochoid(90, 34, 52);

export function Rosette({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-260 -260 520 520" aria-hidden>
      <path d={outer} />
      <path d={inner} />
      <circle r="250" />
      <circle r="243" />
    </svg>
  );
}

export function WaveBand({ className, id }: { className?: string; id: string }) {
  return (
    <svg className={className} aria-hidden>
      <defs>
        <pattern id={id} width="48" height="24" patternUnits="userSpaceOnUse">
          <path d="M0 12 C12 0, 12 0, 24 12 S36 24, 48 12" />
          <path d="M0 12 C12 24, 12 24, 24 12 S36 0, 48 12" />
          <path d="M0 6 C12 -6, 12 -6, 24 6 S36 18, 48 6" />
          <path d="M0 18 C12 30, 12 30, 24 18 S36 6, 48 18" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
