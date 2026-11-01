import { z } from "zod";
import { validationCopy as v } from "@/copy/validation";

// Non-attribute product fields (catalog.md §4.1). Limits mirror the CHECK constraints in the
// migrations; the database is the last line, this gives the readable message.
const text = (label: string, max: number) => z.string().trim().max(max, v.tooLong(label, max));
const optionalText = (label: string, max: number) =>
  text(label, max)
    .optional()
    .transform((s) => s || null);
const lines = (label: string, maxItems: number, maxLen: number) =>
  z
    .array(text(label, maxLen))
    .transform((xs) => xs.filter(Boolean))
    .pipe(z.array(z.string()).max(maxItems, v.tooMany(label, maxItems)));

export const PRICE_MAX = 999_999_999_999; // Decimal(12, 0)

export const productInputSchema = z.object({
  categoryId: z.string().min(1, v.required("分類")),
  name: text("品名", 160),
  attributes: z.record(z.string(), z.unknown()).default({}),
  // "" / missing = 歡迎詢價 (null). Form inputs arrive as strings.
  priceTwd: z
    .preprocess(
      (x) =>
        x === "" || x === null || x === undefined ? null : typeof x === "string" ? Number(x) : x,
      z
        .number(v.notNumber("價格"))
        .int(v.notNumber("價格"))
        .min(0, v.negative("價格"))
        .max(PRICE_MAX, v.tooLong("價格", 12))
        .nullable(),
    )
    .optional()
    .transform((x) => x ?? null),
  highlights: lines("產品訊息", 30, 200).default([]),
  features: lines("特色", 50, 200).default([]),
  specs: z
    .array(z.object({ label: text("規格標籤", 80), value: text("規格內容", 500) }))
    .transform((rows) => rows.filter((r) => r.label))
    .pipe(
      z.array(z.object({ label: z.string(), value: z.string() })).max(100, v.tooMany("規格", 100)),
    )
    .default([]),
  specNote: optionalText("規格補充", 5000),
  sourceName: optionalText("來源", 100),
  sourceContact: optionalText("來源聯絡方式", 200),
});

export type ProductInput = z.infer<typeof productInputSchema>;
