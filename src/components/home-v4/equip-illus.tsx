import type { ReactNode } from "react";
import s from "./illus.module.css";

// Flat duotone equipment drawings (home v4). One drawing per category, reused in the hero,
// category tiles and as photo placeholders. Colours come from CSS variables (tokens.ts).
// viewBox 0 0 200 200, every machine stands on y≈184 with a floor shadow.
export type EquipKind =
  "ultrasound" | "monitor" | "analyzer" | "centrifuge" | "microscope" | "dental";

const shadow = (rx = 64) => <ellipse className={s.shadow} cx="100" cy="186" rx={rx} ry="6" />;

const drawings: Record<EquipKind, ReactNode> = {
  ultrasound: (
    <>
      {shadow(60)}
      <circle className={s.dark} cx="84" cy="174" r="5" />
      <circle className={s.dark} cx="116" cy="174" r="5" />
      <path className={s.surface} d="M58 164 H142 L148 172 H52 Z" />
      <circle className={s.dark} cx="66" cy="178" r="7" />
      <circle className={s.dark} cx="134" cy="178" r="7" />
      <rect className={s.shade} x="92" y="116" width="16" height="48" />
      <path className={s.line} d="M54 102 H46 V114 H54" />
      <rect className={s.white} x="54" y="96" width="92" height="22" rx="5" />
      {[62, 72, 82].map((x) => (
        <rect key={x} className={s.shade} x={x} y="101" width="7" height="5" rx="1" />
      ))}
      {[62, 72, 82].map((x) => (
        <rect key={`b${x}`} className={s.shade} x={x} y="109" width="7" height="5" rx="1" />
      ))}
      <circle className={s.navy} cx="100" cy="107" r="5" />
      {[116, 126, 136].map((x) => (
        <circle key={x} className={s.shade} cx={x} cy="107" r="3" />
      ))}
      <rect className={s.surface} x="146" y="98" width="8" height="14" rx="2" />
      <path className={s.line} d="M150 112 C 164 130, 162 150, 146 162" />
      <rect className={s.shade} x="96" y="80" width="8" height="16" />
      <rect className={s.white} x="60" y="26" width="80" height="56" rx="5" />
      <rect className={s.screen} x="66" y="32" width="68" height="44" rx="2" />
      <path className={s.glow} d="M100 36 L80 70 A40 40 0 0 0 120 70 Z" />
      <circle className={s.accent} cx="132" cy="79" r="1.8" />
    </>
  ),
  monitor: (
    <>
      {shadow(52)}
      <path
        className={s.thick}
        d="M100 170 L62 178 M100 170 L138 178 M100 170 L84 184 M100 170 L116 184"
      />
      {[
        [62, 178],
        [138, 178],
        [84, 184],
        [116, 184],
      ].map(([cx, cy]) => (
        <circle key={cx} className={s.dark} cx={cx} cy={cy} r="4" />
      ))}
      <rect className={s.shade} x="96" y="96" width="8" height="76" />
      <rect className={s.surface} x="88" y="90" width="24" height="8" rx="2" />
      <path className={s.line} d="M80 22 V15 H120 V22" />
      <rect className={s.white} x="44" y="22" width="112" height="72" rx="6" />
      <rect className={s.screen} x="52" y="30" width="80" height="56" rx="2" />
      <path className={s.ecg} d="M56 50 H70 L74 40 L79 62 L83 46 L87 50 H128" />
      <path className={s.trace} d="M56 72 C 64 66, 70 78, 78 72 S 92 66, 100 72 S 116 78, 128 72" />
      <rect className={s.accent} x="136" y="32" width="14" height="9" rx="1" />
      <rect className={s.glow} x="136" y="46" width="14" height="6" rx="1" />
      <rect className={s.glow} x="136" y="57" width="10" height="6" rx="1" />
      <circle className={s.shade} cx="143" cy="82" r="4" />
    </>
  ),
  analyzer: (
    <>
      {shadow(66)}
      <rect className={s.shade} x="44" y="136" width="6" height="44" />
      <rect className={s.shade} x="150" y="136" width="6" height="44" />
      <rect className={s.surface} x="44" y="162" width="112" height="5" />
      <rect className={s.shade} x="36" y="128" width="128" height="8" rx="2" />
      <rect className={s.white} x="46" y="56" width="108" height="72" rx="8" />
      <rect className={s.screen} x="54" y="64" width="40" height="30" rx="3" />
      <rect className={s.glow} x="60" y="71" width="20" height="3" />
      <rect className={s.glow} x="60" y="78" width="26" height="3" />
      <rect className={s.glow} x="60" y="85" width="14" height="3" />
      <rect className={s.surface} x="102" y="66" width="44" height="26" rx="3" />
      {[108, 116, 124, 132].map((x) => (
        <g key={x}>
          <rect className={s.shade} x={x} y="72" width="5" height="15" rx="2" />
          <rect className={s.accent} x={x} y="70" width="5" height="3" rx="1" />
        </g>
      ))}
      <rect className={s.surface} x="54" y="102" width="92" height="16" rx="3" />
      <path className={s.thin} d="M62 110 H92 M100 110 H138" />
      <circle className={s.accent} cx="146" cy="62" r="2.5" />
    </>
  ),
  centrifuge: (
    <>
      {shadow(62)}
      <rect className={s.shade} x="38" y="166" width="6" height="16" />
      <rect className={s.shade} x="156" y="166" width="6" height="16" />
      <rect className={s.shade} x="28" y="158" width="144" height="8" rx="2" />
      <rect className={s.white} x="50" y="100" width="100" height="58" rx="14" />
      <path className={s.surface} d="M54 106 C 60 76, 140 76, 146 106 Z" />
      <ellipse className={s.screen} cx="100" cy="94" rx="24" ry="7" />
      <ellipse className={s.glow} cx="100" cy="94" rx="11" ry="3" />
      <rect className={s.screen} x="64" y="118" width="42" height="18" rx="3" />
      <rect className={s.glow} x="70" y="124" width="20" height="6" rx="1" />
      <circle className={s.accent} cx="120" cy="127" r="5" />
      <circle className={s.shade} cx="134" cy="127" r="5" />
    </>
  ),
  microscope: (
    <>
      {shadow(48)}
      <rect className={s.surface} x="60" y="162" width="84" height="16" rx="6" />
      <path
        className={s.shade}
        d="M112 162 H128 C 136 130, 134 92, 116 68 L104 76 C 120 96, 120 130, 112 162 Z"
      />
      <rect className={s.surface} x="88" y="134" width="20" height="10" rx="2" />
      <circle className={s.glow} cx="98" cy="154" r="5" />
      <rect className={s.white} x="68" y="118" width="60" height="8" rx="2" />
      <path className={s.surface} d="M80 58 L68 28 L79 24 L91 56 Z" />
      <path className={s.surface} d="M97 56 L95 24 L106 24 L108 56 Z" />
      <rect
        className={s.navy}
        x="66"
        y="22"
        width="14"
        height="6"
        rx="2"
        transform="rotate(-20 73 25)"
      />
      <rect className={s.navy} x="94" y="20" width="13" height="6" rx="2" />
      <rect className={s.white} x="70" y="56" width="48" height="24" rx="6" />
      <rect className={s.shade} x="84" y="80" width="26" height="10" rx="3" />
      <rect className={s.navy} x="87" y="90" width="5" height="14" rx="1" />
      <rect className={s.navy} x="95" y="90" width="5" height="19" rx="1" />
      <rect className={s.navy} x="103" y="90" width="5" height="11" rx="1" />
      <circle className={s.white} cx="126" cy="136" r="9" />
      <circle className={s.shade} cx="126" cy="136" r="4" />
    </>
  ),
  dental: (
    <>
      {shadow(66)}
      <path className={s.shade} d="M70 178 H150 L144 168 H76 Z" />
      <rect className={s.shade} x="104" y="138" width="14" height="32" />
      <path className={s.line} d="M112 142 L150 112" />
      <rect className={s.surface} x="146" y="104" width="30" height="8" rx="2" />
      <path className={s.thin} d="M152 104 V96 M160 104 V94 M168 104 V97" />
      <path className={s.white} d="M140 132 L170 150 C 175 153, 172 160, 166 157 L136 144 Z" />
      <path className={s.white} d="M58 132 L34 94 C 30 87, 37 81, 43 86 L72 128 Z" />
      <path className={s.surface} d="M28 82 L39 71 L48 79 L37 90 Z" />
      <path
        className={s.white}
        d="M58 132 H140 C 148 132, 150 140, 146 145 H64 C 57 145, 54 137, 58 132 Z"
      />
      <rect className={s.surface} x="82" y="122" width="34" height="6" rx="3" />
      <path className={s.thick} d="M120 138 V44 H150" />
      <path className={s.surface} d="M142 38 H172 L166 54 H148 Z" />
      <rect className={s.accent} x="150" y="54" width="12" height="3" rx="1" />
    </>
  ),
};

export function EquipIllus({
  kind,
  className,
  outline,
  label,
}: {
  kind: EquipKind;
  className?: string;
  outline?: boolean;
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`${s.illus} ${outline ? s.outline : ""} ${className ?? ""}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {drawings[kind]}
    </svg>
  );
}

export const EQUIP_KINDS = Object.keys(drawings) as EquipKind[];
export const isEquipKind = (v: string | null | undefined): v is EquipKind =>
  !!v && (EQUIP_KINDS as string[]).includes(v);

// Neutral stand-in for a category without a matching drawing: a plain benchtop unit.
export function GenericEquipIllus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={`${s.illus} ${className ?? ""}`} aria-hidden>
      {shadow(62)}
      <rect className={s.surface} x="42" y="76" width="116" height="104" rx="8" />
      <rect className={s.screen} x="56" y="92" width="56" height="38" rx="4" />
      <rect className={s.glow} x="62" y="98" width="30" height="5" rx="2" />
      <circle className={s.white} cx="136" cy="102" r="9" />
      <circle className={s.shade} cx="136" cy="128" r="6" />
      <rect className={s.shade} x="56" y="146" width="88" height="10" rx="3" />
      <rect className={s.accent} x="56" y="162" width="20" height="4" rx="2" />
    </svg>
  );
}

// Spot illustrations for the three buying steps (viewBox 0 0 64 64).
export function StepIllus({ step }: { step: 0 | 1 | 2 }) {
  return (
    <svg viewBox="0 0 64 64" className={s.illus} aria-hidden>
      {step === 0 && (
        <>
          <rect className={s.surface} x="6" y="10" width="40" height="28" rx="6" />
          <path className={s.surface} d="M14 38 L12 48 L24 38 Z" />
          {[16, 26, 36].map((x) => (
            <circle key={x} className={s.accent} cx={x} cy="24" r="3" />
          ))}
          <rect className={s.white} x="38" y="26" width="20" height="32" rx="4" />
          <rect className={s.screen} x="41" y="30" width="14" height="20" rx="1" />
          <circle className={s.shade} cx="48" cy="54" r="1.5" />
        </>
      )}
      {step === 1 && (
        <>
          <path className={s.surface} d="M6 28 L30 12 L54 28 V56 H6 Z" />
          <rect className={s.shade} x="20" y="36" width="20" height="20" />
          <path className={s.thin} d="M20 42 H40 M20 48 H40" />
          <circle className={s.white} cx="44" cy="38" r="9" />
          <path className={s.thick} d="M50 44 L58 52" />
          <circle className={s.accent} cx="44" cy="38" r="3" />
        </>
      )}
      {step === 2 && (
        <>
          <rect className={s.white} x="4" y="18" width="34" height="28" rx="2" />
          <rect className={s.accent} x="4" y="30" width="34" height="4" />
          <path className={s.surface} d="M38 26 H50 L58 36 V46 H38 Z" />
          <rect className={s.screen} x="42" y="29" width="8" height="7" rx="1" />
          <circle className={s.dark} cx="14" cy="48" r="5" />
          <circle className={s.dark} cx="48" cy="48" r="5" />
          <path className={s.thin} d="M2 56 H62" />
        </>
      )}
    </svg>
  );
}

// Stylised street map for the viewing-location card.
export function MiniMap() {
  return (
    <svg viewBox="0 0 320 120" className={`${s.illus} ${s.map}`} aria-hidden>
      <rect className={s.mapBg} x="0" y="0" width="320" height="120" rx="6" />
      <path className={s.road} d="M0 70 H320 M110 0 V120 M230 0 V120" />
      <path className={s.roadThin} d="M0 26 H110 M230 100 H320 M170 70 V120" />
      <rect className={s.block} x="128" y="14" width="86" height="42" rx="3" />
      <rect className={s.block} x="14" y="84" width="82" height="28" rx="3" />
      <rect className={s.block} x="246" y="14" width="62" height="42" rx="3" />
      <path
        className={s.pin}
        d="M171 20 C 160 20, 154 28, 154 36 C 154 48, 171 62, 171 62 C 171 62, 188 48, 188 36 C 188 28, 182 20, 171 20 Z"
      />
      <circle className={s.white} cx="171" cy="36" r="6" />
    </svg>
  );
}
