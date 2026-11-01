import { z } from "zod";
import { adminCopy } from "@/copy/admin";

// Feature switches (site-config.md §4.6), stored in SiteConfig FEATURES. All on until saved.
export const VISIT_LABEL_MAX = 6;
export const DEFAULT_VISIT_LABEL = "預約看機";
const on = z.boolean().catch(true);
const readSchema = z.object({
  showPrice: on, // off: every price reads 「歡迎詢價」 and price sorting is off (prices never sent)
  inquiryList: on, // off: only 「詢價這件」; no list button, count or /inquiry page
  visit: on, // off: the header button, the 看機地點 card and the "call first" note are hidden
  visitLabel: z.string().trim().max(VISIT_LABEL_MAX).catch(""),
});
export type SiteFeatures = z.output<typeof readSchema>;

export function readFeatures(value: unknown): SiteFeatures {
  const f = readSchema.parse(value && typeof value === "object" ? value : {});
  return { ...f, visitLabel: f.visitLabel || DEFAULT_VISIT_LABEL };
}
export const ALL_ON: SiteFeatures = readFeatures({});

export const featuresInputSchema = z.object({
  showPrice: z.boolean(),
  inquiryList: z.boolean(),
  visit: z.boolean(),
  visitLabel: z
    .string()
    .trim()
    .max(VISIT_LABEL_MAX, adminCopy.settings.invalid.tooLong("按鈕文字", VISIT_LABEL_MAX)),
});
