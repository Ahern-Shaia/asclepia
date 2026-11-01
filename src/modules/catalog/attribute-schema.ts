import { z } from "zod";
import { validationCopy as v } from "@/copy/validation";

// Product attributes are validated against the category's attribute config on every write
// (site-config.md §4.1). The server is the authority; the form uses the same schema for hints.

export type AttrType = "TEXT" | "NUMBER" | "YEAR" | "SELECT";
export type AttrRule = {
  key: string;
  label: string;
  type: AttrType;
  options: string[];
  maxLength?: number | null;
  required: boolean;
};
export type AttrValues = Record<string, string | number>;
export type SaveMode = "draft" | "publish";

export const TEXT_MAX_DEFAULT = 80;
const maxYear = () => new Date().getFullYear() + 1;

// "", null and undefined all mean "not filled".
const blank = (x: unknown) => x === undefined || x === null || (typeof x === "string" && !x.trim());

function valueSchema(rule: AttrRule) {
  switch (rule.type) {
    case "TEXT": {
      const max = rule.maxLength ?? TEXT_MAX_DEFAULT;
      return z.string(v.tooLong(rule.label, max)).trim().max(max, v.tooLong(rule.label, max));
    }
    case "NUMBER":
      return z.coerce
        .number(v.notNumber(rule.label))
        .refine(Number.isFinite, v.notNumber(rule.label))
        .refine((n) => n >= 0, v.negative(rule.label));
    case "YEAR":
      return z.coerce
        .number(v.notYear(rule.label, maxYear()))
        .int(v.notYear(rule.label, maxYear()))
        .min(1950, v.notYear(rule.label, maxYear()))
        .max(maxYear(), v.notYear(rule.label, maxYear()));
    case "SELECT":
      return z.string().refine((s) => rule.options.includes(s), v.notOption(rule.label));
  }
}

export function attributesSchema(rules: AttrRule[], mode: SaveMode) {
  const known = new Set(rules.map((r) => r.key));
  return z.record(z.string(), z.unknown()).transform((input, ctx): AttrValues => {
    const out: AttrValues = {};
    for (const key of Object.keys(input))
      if (!known.has(key))
        ctx.addIssue({ code: "custom", path: [key], message: v.unknownField(key) });
    for (const rule of rules) {
      const raw = input[rule.key];
      if (blank(raw)) {
        if (mode === "publish" && rule.required)
          ctx.addIssue({ code: "custom", path: [rule.key], message: v.required(rule.label) });
        continue;
      }
      const r = valueSchema(rule).safeParse(raw);
      if (r.success) out[rule.key] = r.data;
      else ctx.addIssue({ code: "custom", path: [rule.key], message: r.error.issues[0].message });
    }
    return out;
  });
}
