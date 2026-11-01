import { z } from "zod";
import { adminCopy } from "@/copy/admin";
import { homeV3Copy } from "@/copy/home-v3";
import { homeV4Copy } from "@/copy/home-v4";

// Editable site copy with defaults in src/copy (site-config.md §4.5: empty = the default):
// the hero heading (2 lines), the three 怎麼買 steps, one footer line (no default: none shown).
// Stored next to the store statements in SiteConfig COPY (notes.ts).
export const TEXT_LIMITS = { headingLine: 16, stepTitle: 8, stepBody: 40, footerLine: 60 } as const;
const L = TEXT_LIMITS;
const DEFAULT_STEPS = homeV3Copy.buy.steps;

export type SiteTexts = {
  heading: string[];
  steps: { title: string; body: string }[];
  footerLine: string;
};

const str = (max: number) => z.string().trim().max(max).catch("");
const readSchema = z.object({
  heading: z.array(z.unknown()).catch([]),
  steps: z.array(z.unknown()).catch([]),
  footerLine: str(L.footerLine),
});
const step = z
  .object({ title: str(L.stepTitle), body: str(L.stepBody) })
  .catch({ title: "", body: "" });

export function readTexts(value: unknown): SiteTexts {
  const v = readSchema.parse(value && typeof value === "object" ? value : {});
  const lines = v.heading
    .slice(0, 2)
    .map((x) => str(L.headingLine).parse(x))
    .filter(Boolean);
  return {
    heading: lines.length ? lines : [...homeV4Copy.heading],
    steps: DEFAULT_STEPS.map((d, i) => {
      const s = step.parse(v.steps[i] ?? {});
      return { title: s.title || d.title, body: s.body || d.body };
    }),
    footerLine: v.footerLine,
  };
}
export const DEFAULT_TEXTS: SiteTexts = readTexts({});

// What is actually stored, empty where nothing was typed: the back-office form shows these and
// puts the defaults in as placeholders (§4.5 「留空就用預設文字（欄位裡的灰字）」).
export type RawTexts = {
  heading: [string, string];
  steps: [StepText, StepText, StepText];
  footerLine: string;
};
type StepText = { title: string; body: string };
export function rawTexts(value: unknown): RawTexts {
  const v = readSchema.parse(value && typeof value === "object" ? value : {});
  const line = (i: number) => str(L.headingLine).parse(v.heading[i]);
  const st = (i: number) => step.parse(v.steps[i] ?? {});
  return {
    heading: [line(0), line(1)],
    steps: [st(0), st(1), st(2)],
    footerLine: v.footerLine,
  };
}

// Strict, for the back office: empty fields are allowed (they mean "use the default").
const v = adminCopy.settings.invalid;
const field = (label: string, max: number) => z.string().trim().max(max, v.tooLong(label, max));
const stepInput = (n: number) =>
  z.object({
    title: field(`第 ${n} 步標題`, L.stepTitle),
    body: field(`第 ${n} 步說明`, L.stepBody),
  });
export const textsInputSchema = z.object({
  heading: z.tuple([field("標題第 1 行", L.headingLine), field("標題第 2 行", L.headingLine)]),
  steps: z.tuple([stepInput(1), stepInput(2), stepInput(3)]),
  footerLine: field("頁尾一句話", L.footerLine),
});
