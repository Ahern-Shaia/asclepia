import { z } from "zod";
import { adminCopy } from "@/copy/admin";
import { checkTheme, isHex } from "@/theme/derive";
import { featuresInputSchema } from "./features";
import { homeInputSchema } from "./home";
import { NOTE_LIMITS as N, SERVICE_KINDS } from "./notes";
import { PROFILE_LIMITS as P } from "./profile";
import { textsInputSchema } from "./texts";
import { RADIUS_STEPS } from "./theme";

// Back-office input for 站台設定 (site-config.md §4.2, §4.5-bis). Strict, unlike the public
// readers: a value that would be cut or dropped on the public side is refused here with a sentence.
const v = adminCopy.settings.invalid;
const PHONE = /^[0-9 +\-()#]*$/; // shown as a tel: link
const text = (label: string, max: number) => z.string().trim().max(max, v.tooLong(label, max));
const line = (label: string, max: number) => text(label, max).min(1, v.required(label));

export const profileInputSchema = z.object({
  name: line("店名", P.name),
  tagline: text("標語", P.tagline),
  phone: text("電話", P.phone).regex(PHONE, v.phone),
  email: z.union([z.literal(""), z.email(v.email).max(P.email, v.tooLong("Email", P.email))]),
  address: text("地址", P.address),
  hours: text("營業時間", P.hours),
});

export const notesInputSchema = z.object({
  eyebrow: text("首屏小標", N.eyebrow),
  heroPoints: z
    .array(line("首屏重點", N.heroPoints.length))
    .max(N.heroPoints.count, v.tooMany("首屏重點", N.heroPoints.count)),
  terms: z
    .array(line("交易說明", N.terms.length))
    .max(N.terms.count, v.tooMany("交易說明", N.terms.count)),
  services: z
    .array(
      z.object({
        kind: z.enum(SERVICE_KINDS),
        title: line("服務名稱", N.services.title),
        body: text("服務說明", N.services.body),
      }),
    )
    .max(N.services.count, v.tooMany("服務", N.services.count)),
});

// The contrast gate runs here, on the server (site-config.md §4.3): the editor shows the same
// checks live, but a crafted request must not get an unreadable theme in.
const t = adminCopy.settings.theme;
export const themeInputSchema = z
  .object({
    primary: z.string().refine(isHex, t.hexInvalid),
    accent: z.string().refine(isHex, t.hexInvalid),
    radius: z.enum(RADIUS_STEPS),
  })
  .transform((v) => ({ ...v, primary: v.primary.toUpperCase(), accent: v.accent.toUpperCase() }))
  .superRefine((v, ctx) => {
    for (const c of checkTheme(v).filter((x) => !x.pass))
      ctx.addIssue({
        code: "custom",
        path: [],
        message: t.blocked(t.pairs[c.id], t.ratio(c.ratio)),
      });
  });

// Optimistic lock: the version the editor was opened with (0 = never saved).
const version = z.number().int().min(0);
export const saveProfileSchema = z.object({ value: profileInputSchema, expectedVersion: version });
// The 文案 tab saves the whole COPY section: store statements (notes) and editable texts.
export const copyInputSchema = notesInputSchema.extend(textsInputSchema.shape);
export const saveCopySchema = z.object({ value: copyInputSchema, expectedVersion: version });
export const saveFeaturesSchema = z.object({
  value: featuresInputSchema,
  expectedVersion: version,
});
export const saveThemeSchema = z.object({ value: themeInputSchema, expectedVersion: version });
export const saveHomeSchema = z.object({
  value: z.object({ blocks: homeInputSchema }),
  expectedVersion: version,
});
export const SETTINGS_SECTIONS = ["PROFILE", "COPY", "THEME", "HOME", "FEATURES"] as const;
export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];
export const restoreSettingsSchema = z.object({
  section: z.enum(SETTINGS_SECTIONS),
  expectedVersion: version,
});
export type ProfileInput = z.output<typeof profileInputSchema>;
export type NotesInput = z.output<typeof notesInputSchema>;
export type CopyInput = z.output<typeof copyInputSchema>;
export type ThemeValue = z.output<typeof themeInputSchema>;
