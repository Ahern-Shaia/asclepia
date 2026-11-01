// Theme derivation and contrast gate (docs/modules/site-config.md §4.3). Pure: the back-office
// preview uses it live, and the M2 save path calls the same function server-side to block a save.
import { contrastRatio } from "./contrast";
import { palette, radiusSteps } from "./tokens";

export type RadiusStep = keyof typeof radiusSteps;
export type ThemeInput = { primary: string; accent: string; radius: RadiusStep };

export const AA = 4.5;
const WHITE = palette.bg;
const BLACK = "#000000";

export const isHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v);

// Linear sRGB-space mix toward `target` by `weight` (0 = colour unchanged, 1 = target).
function mix(hex: string, target: string, weight: number): string {
  if (!isHex(hex)) throw new Error(`expected #RRGGBB, got ${hex}`);
  const channel = (h: string, i: number) => parseInt(h.slice(1 + i, 3 + i), 16);
  const out = [0, 2, 4].map((i) => {
    const c = channel(hex, i);
    return Math.round(c + (channel(target, i) - c) * weight)
      .toString(16)
      .padStart(2, "0");
  });
  return `#${out.join("")}`.toUpperCase();
}

export function deriveTheme({ primary, accent, radius }: ThemeInput) {
  return {
    primary: primary.toUpperCase(),
    primaryDeep: mix(primary, BLACK, 0.3), // hero band, link hover
    primaryBg: mix(primary, WHITE, 0.9),
    onDeepMuted: mix(primary, WHITE, 0.8), // secondary text on the hero band
    link: primary.toUpperCase(),
    accent: accent.toUpperCase(),
    accentBg: mix(accent, WHITE, 0.92),
    // small illustrations follow the primary hue (§B0: illustrations only at small scale)
    illusSurface: mix(primary, WHITE, 0.9),
    illusShade: mix(primary, WHITE, 0.7),
    illusGlow: mix(primary, WHITE, 0.5),
    radius: radiusSteps[radius].base,
    radiusSM: radiusSteps[radius].sm,
  };
}
export type DerivedTheme = ReturnType<typeof deriveTheme>;
export const DEFAULT_THEME: ThemeInput = {
  primary: palette.primary,
  accent: palette.accent,
  radius: "medium",
};

export type ContrastCheckId =
  | "onPrimary"
  | "primaryOnWhite"
  | "onAccent"
  | "accentOnWhite"
  | "primaryOnTint"
  | "accentOnTint"
  | "mutedOnDeep";
export type ContrastCheck = {
  id: ContrastCheckId;
  fg: string;
  bg: string;
  ratio: number;
  pass: boolean;
};

// The pairs a save is gated on: the two chosen colours on white and under white text, and the
// derived tints and hero band they end up on (site-config.md §4.3 "M2 要補": selected menu item,
// 「已在清單」 button, secondary text on the hero). A failing list is the save's error.
export function checkTheme({ primary, accent }: Pick<ThemeInput, "primary" | "accent">) {
  const d = deriveTheme({ primary, accent, radius: "medium" });
  const pairs: [ContrastCheckId, string, string][] = [
    ["onPrimary", WHITE, primary],
    ["primaryOnWhite", primary, WHITE],
    ["onAccent", WHITE, accent],
    ["accentOnWhite", accent, WHITE],
    ["primaryOnTint", primary, d.primaryBg],
    ["accentOnTint", accent, d.accentBg],
    ["mutedOnDeep", d.onDeepMuted, d.primaryDeep],
  ];
  return pairs.map(([id, fg, bg]): ContrastCheck => {
    const ratio = contrastRatio(fg, bg);
    return { id, fg, bg, ratio, pass: ratio >= AA };
  });
}
