import { homeCopy } from "@/copy/home";
import s from "./home-v2.module.css";

// Hero signature: a drafting-sheet line drawing of an ultrasound cart with the shop's three
// promises called out, and the yellow tag hanging off the console. Colours come from CSS
// variables set by HomeV2View (tokens.ts). Labels are HTML so they stay readable and selectable.
const CALLOUT_Y = { test: 108, warranty: 258, install: 408 } as const;
const VIEW = { w: 760, h: 480 };

export function HeroDrawing() {
  const t = homeCopy.hero;
  return (
    <div className={s.drawing}>
      <svg
        viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
        role="img"
        aria-label="超音波推車的線稿，標出出貨前檢測、保固維修、到場安裝三項"
        className={s.drawingSvg}
      >
        <g className={s.lines}>
          {/* monitor + ultrasound sector image */}
          <rect pathLength={1} x="170" y="40" width="220" height="150" rx="6" />
          <rect pathLength={1} x="184" y="54" width="192" height="122" rx="2" />
          <path pathLength={1} d="M280 62 L225 160 A112 112 0 0 0 335 160 Z" />
          <path pathLength={1} d="M245.7 123.3 A70 70 0 0 0 314.3 123.3" />
          {/* arm, console, controls */}
          <rect pathLength={1} x="270" y="190" width="20" height="40" />
          <rect pathLength={1} x="150" y="230" width="260" height="58" rx="6" />
          <circle pathLength={1} cx="280" cy="259" r="13" />
          {[175, 195, 215, 235].map((x) => (
            <rect pathLength={1} key={`k1-${x}`} x={x} y="244" width="14" height="10" rx="2" />
          ))}
          {[175, 195, 215, 235].map((x) => (
            <rect pathLength={1} key={`k2-${x}`} x={x} y="264" width="14" height="10" rx="2" />
          ))}
          {[322, 348, 374].map((x) => (
            <circle pathLength={1} key={`d-${x}`} cx={x} cy="259" r="8" />
          ))}
          {/* column, base, casters, floor */}
          <rect pathLength={1} x="262" y="288" width="36" height="108" />
          <path pathLength={1} d="M170 396 H390 L410 420 H150 Z" />
          <circle pathLength={1} cx="172" cy="436" r="12" />
          <circle pathLength={1} cx="388" cy="436" r="12" />
          <circle pathLength={1} cx="218" cy="432" r="8" />
          <circle pathLength={1} cx="342" cy="432" r="8" />
        </g>
        <g className={s.speckle} aria-hidden>
          {[
            [262, 118],
            [292, 132],
            [276, 146],
            [304, 110],
            [254, 140],
            [286, 104],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" />
          ))}
        </g>
        <line className={s.floor} x1="90" y1="450" x2="470" y2="450" />

        {/* leader lines to the HTML callouts (desktop only) */}
        <g className={s.leaders}>
          <circle cx="390" cy={CALLOUT_Y.test} r="4" />
          <line x1="390" y1={CALLOUT_Y.test} x2="500" y2={CALLOUT_Y.test} />
          <circle cx="410" cy={CALLOUT_Y.warranty} r="4" />
          <line x1="410" y1={CALLOUT_Y.warranty} x2="500" y2={CALLOUT_Y.warranty} />
          <circle cx="400" cy={CALLOUT_Y.install} r="4" />
          <line x1="400" y1={CALLOUT_Y.install} x2="500" y2={CALLOUT_Y.install} />
        </g>

        {/* yellow tag hanging from the console */}
        <g className={s.swing}>
          <path className={s.string} d="M150 246 Q 122 250 104.5 278" />
          <g transform="translate(60 270) rotate(-8)">
            <path className={s.tagShape} d="M12 0 H74 L86 14 V112 H0 V14 Z" />
            <circle className={s.tagHole} cx="43" cy="14" r="5" />
            <text className={s.tagTitle} x="43" y="62" textAnchor="middle">
              {t.tag.title}
            </text>
            <text className={s.tagSub} x="43" y="88" textAnchor="middle">
              {t.tag.sub}
            </text>
          </g>
        </g>
      </svg>

      <ul className={s.callouts}>
        {t.callouts.map((c) => (
          <li
            key={c.id}
            className={s.callout}
            style={{
              top: `${(CALLOUT_Y[c.id] / VIEW.h) * 100}%`,
              left: `${(508 / VIEW.w) * 100}%`,
            }}
          >
            <strong>{c.title}</strong>
            <span>{c.body}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
