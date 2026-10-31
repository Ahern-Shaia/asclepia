import s from "./style.module.css";

// Staff figure standing beside the machine (viewBox 0 0 120 200), drawn in the same
// stroke language as EquipIllus so the two read as one scene.
export function Staff({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 200" className={`${s.staff} ${className ?? ""}`} aria-hidden>
      <ellipse className={s.staffShadow} cx="60" cy="192" rx="38" ry="6" />
      <path className={s.staffPants} d="M40 126 H80 L78 186 H64 L60 140 L56 186 H42 Z" />
      <path className={s.staffShoe} d="M40 184 H58 V190 H36 Z M62 184 H80 L84 190 H62 Z" />
      <path
        className={s.staffCoat}
        d="M34 74 C34 64 44 58 60 58 C76 58 86 64 86 74 L90 134 H30 Z"
      />
      <path className={s.staffLine} d="M60 62 V134 M48 60 L60 82 L72 60" />
      <rect className={s.staffBoard} x="64" y="88" width="26" height="32" rx="3" />
      <path className={s.staffLine} d="M70 98 H84 M70 105 H84 M70 112 H80" />
      <path className={s.staffSkin} d="M86 92 C 92 98, 92 106, 86 108 L80 104 Z" />
      <path className={s.staffCoat} d="M34 76 L20 108 C18 114, 24 118, 28 114 L40 92" />
      <circle className={s.staffSkin} cx="24" cy="112" r="5" />
      <rect className={s.staffSkin} x="54" y="46" width="12" height="14" rx="4" />
      <circle className={s.staffSkin} cx="60" cy="34" r="16" />
      <path className={s.staffHair} d="M44 32 C44 16 76 14 77 32 C70 26 56 24 44 32 Z" />
      <path className={s.staffSmile} d="M54 39 C57 42 63 42 66 39" />
      <circle className={s.staffEye} cx="54" cy="33" r="1.6" />
      <circle className={s.staffEye} cx="66" cy="33" r="1.6" />
    </svg>
  );
}

// Soft wave edge. `flip` turns it into a top edge.
export function Wave({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className={`${s.wave} ${flip ? s.waveFlip : ""} ${className ?? ""}`}
      aria-hidden
    >
      <path
        className={s.waveBack}
        d="M0 60 C 240 10, 480 10, 720 52 S 1200 110, 1440 40 V120 H0 Z"
      />
      <path
        className={s.waveFront}
        d="M0 86 C 300 40, 560 50, 820 84 S 1260 112, 1440 70 V120 H0 Z"
      />
    </svg>
  );
}

// Concentric curve lines behind the hero text.
export function Ripples({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMinYMid slice"
      className={className}
      aria-hidden
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={`M-40 ${120 + i * 46} C 160 ${40 + i * 46}, 360 ${220 + i * 46}, 840 ${90 + i * 46}`}
        />
      ))}
    </svg>
  );
}
