import s from "./style.module.css";

// Hero instrument art (viewBox 550×400, same aspect as the scene): a protractor arc behind the
// equipment and a vernier caliper whose sliding jaw closes in on load. Scale marks only — no readings.
const beamTicks = Array.from({ length: 97 }, (_, i) => i);
const vernierTicks = Array.from({ length: 11 }, (_, i) => i);
const arcTicks = Array.from({ length: 37 }, (_, i) => i * 5);

export function Protractor() {
  const cx = 275;
  const cy = 392;
  const r = 236;
  return (
    <svg viewBox="0 0 550 400" className={s.protractor} aria-hidden>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} />
      <path d={`M ${cx - r + 28} ${cy} A ${r - 28} ${r - 28} 0 0 1 ${cx + r - 28} ${cy}`} />
      {arcTicks.map((deg) => {
        const a = (Math.PI * (180 - deg)) / 180;
        const len = deg % 30 === 0 ? 18 : deg % 10 === 0 ? 11 : 6;
        const x1 = cx + r * Math.cos(a);
        const y1 = cy - r * Math.sin(a);
        const x2 = cx + (r - len) * Math.cos(a);
        const y2 = cy - (r - len) * Math.sin(a);
        return (
          <g key={deg}>
            <line x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)} />
            {deg % 30 === 0 && (
              <text
                x={(cx + (r + 14) * Math.cos(a)).toFixed(1)}
                y={(cy - (r + 14) * Math.sin(a) + 4).toFixed(1)}
              >
                {deg}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function Caliper() {
  return (
    <svg viewBox="0 0 550 400" className={s.caliper} aria-hidden>
      {/* beam */}
      <rect className={s.calBeam} x="8" y="18" width="534" height="34" rx="2" />
      {beamTicks.map((i) => {
        const x = 46 + i * 5;
        const h = i % 10 === 0 ? 14 : i % 5 === 0 ? 10 : 6;
        return <line key={i} className={s.calTick} x1={x} y1={52} x2={x} y2={52 - h} />;
      })}
      {beamTicks
        .filter((i) => i % 10 === 0)
        .map((i) => (
          <text key={i} className={s.calNum} x={46 + i * 5} y={30}>
            {i / 10}
          </text>
        ))}
      {/* fixed jaw */}
      <path className={s.calJaw} d="M8 52 H44 V176 L30 204 H22 L8 176 Z" />
      <line className={s.calZero} x1="46" y1="20" x2="46" y2="52" />
      {/* sliding jaw + vernier plate */}
      <g className={s.slider}>
        <rect className={s.calPlate} x="420" y="12" width="104" height="48" rx="3" />
        {vernierTicks.map((i) => {
          const x = 432 + i * 4.5;
          return (
            <line key={i} className={s.calTick} x1={x} y1={60} x2={x} y2={i % 5 === 0 ? 48 : 52} />
          );
        })}
        <circle className={s.calScrew} cx="508" cy="26" r="6" />
        <path className={s.calJaw} d="M494 60 H524 V176 L512 204 H504 L494 176 Z" />
      </g>
    </svg>
  );
}

// Countersunk screw head for machined plates.
export function Screw({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} aria-hidden>
      <circle cx="6" cy="6" r="5" />
      <path d="M3 9 L9 3" />
    </svg>
  );
}
