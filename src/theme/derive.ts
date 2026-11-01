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
    primaryDeep: mix(primary, BLACK, 0.3),
    primaryBg: mix(primary, WHITE, 0.9),
    link: primary.toUpperCase(),
    accent: accent.toUpperCase(),
    accentBg: mix(accent, WHITE, 0.92),
    radius: radiusSteps[radius].base,
    radiusSM: radiusSteps[radius].sm,
  };
}

export type ContrastCheckId = "onPrimary" | "primaryOnWhite" | "onAccent" | "accentOnWhite";
export type ContrastCheck = {
  id: ContrastCheckId;
  fg: string;
  bg: string;
  ratio: number;
  pass: boolean;
};

// The four pairs a save is gated on. A failing list is the save's error: it names the pair and ratio.
export function checkTheme({ primary, accent }: Pick<ThemeInput, "primary" | "accent">) {
  const pairs: [ContrastCheckId, string, string][] = [
    ["onPrimary", WHITE, primary],
    ["primaryOnWhite", primary, WHITE],
    ["onAccent", WHITE, accent],
    ["accentOnWhite", accent, WHITE],
  ];
  return pairs.map(([id, fg, bg]): ContrastCheck => {
    const ratio = contrastRatio(fg, bg);
    return { id, fg, bg, ratio, pass: ratio >= AA };
  });
}
