import s from "./style.module.css";

// Generic city skyline (viewBox 0 0 1440 220): two depth layers, a stepped tower and lit
// windows. Not any specific building.
const back = [
  [0, 70, 90],
  [64, 50, 130],
  [120, 80, 100],
  [210, 44, 150],
  [262, 90, 80],
  [360, 60, 120],
  [430, 100, 96],
  [540, 54, 140],
  [600, 80, 110],
  [690, 60, 70],
  [760, 90, 124],
  [860, 50, 150],
  [920, 110, 90],
  [1040, 64, 136],
  [1110, 90, 104],
  [1210, 54, 146],
  [1270, 100, 92],
  [1376, 64, 124],
] as const;
const front = [
  [20, 90, 60],
  [118, 60, 84],
  [186, 110, 50],
  [300, 70, 96],
  [380, 120, 64],
  [512, 66, 88],
  [586, 96, 56],
  [800, 70, 76],
  [880, 120, 58],
  [1010, 60, 92],
  [1080, 130, 66],
  [1220, 80, 84],
  [1310, 130, 54],
] as const;

export function Skyline({ className, id }: { className?: string; id: string }) {
  const H = 220;
  return (
    <svg
      viewBox="0 0 1440 220"
      preserveAspectRatio="xMidYMax slice"
      className={`${s.skyline} ${className ?? ""}`}
      aria-hidden
    >
      <defs>
        <pattern id={`${id}-win`} width="12" height="14" patternUnits="userSpaceOnUse">
          <rect x="3" y="4" width="5" height="6" />
        </pattern>
        <clipPath id={`${id}-clip`}>
          {back.map(([x, w, h]) => (
            <rect key={x} x={x} y={H - h} width={w} height={h} />
          ))}
        </clipPath>
      </defs>
      <g className={s.skyBack}>
        {back.map(([x, w, h]) => (
          <rect key={x} x={x} y={H - h} width={w} height={h} />
        ))}
        <path d="M692 220 V96 H700 V64 H708 V30 H712 V0 H716 V30 H720 V64 H728 V96 H736 V220 Z" />
      </g>
      <rect
        className={s.skyWin}
        width="1440"
        height="220"
        fill={`url(#${id}-win)`}
        clipPath={`url(#${id}-clip)`}
      />
      <g className={s.skyFront}>
        {front.map(([x, w, h]) => (
          <rect key={x} x={x} y={H - h} width={w} height={h} />
        ))}
      </g>
    </svg>
  );
}
