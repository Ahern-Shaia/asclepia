import { z } from "zod";
import { checkTheme, DEFAULT_THEME, isHex, type ThemeInput } from "@/theme/derive";

// Theme (site-config.md §4.3): two colours and a radius step, stored in SiteConfig THEME.
// Reading falls back to the default for anything malformed — and for a stored pair that no longer
// passes the contrast gate (a rule tightened after the save), so the site is never unreadable.
export const RADIUS_STEPS = ["small", "medium", "large"] as const;
const hex = (fallback: string) =>
  z
    .string()
    .refine(isHex)
    .transform((v) => v.toUpperCase())
    .catch(fallback);
const readSchema = z.object({
  primary: hex(DEFAULT_THEME.primary),
  accent: hex(DEFAULT_THEME.accent),
  radius: z.enum(RADIUS_STEPS).catch(DEFAULT_THEME.radius),
});

export function readTheme(value: unknown): ThemeInput {
  const t = readSchema.parse(value && typeof value === "object" ? value : {});
  return checkTheme(t).every((c) => c.pass) ? t : DEFAULT_THEME;
}
