import { describe, expect, it } from "vitest";
import { type AttrRule, attributesSchema } from "./attribute-schema";

const rules: AttrRule[] = [
  { key: "brand", label: "品牌", type: "SELECT", options: ["GE", "Philips"], required: true },
  { key: "model", label: "型號", type: "TEXT", options: [], maxLength: 10, required: true },
  { key: "year", label: "年份", type: "YEAR", options: [], required: false },
  { key: "weight", label: "重量", type: "NUMBER", options: [], required: false },
];

const errors = (r: ReturnType<ReturnType<typeof attributesSchema>["safeParse"]>) =>
  r.success ? {} : Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]));

describe("attributesSchema (site-config.md §4.1)", () => {
  it("accepts valid values, trims text, coerces numbers and drops blanks", () => {
    const r = attributesSchema(rules, "publish").safeParse({
      brand: "GE",
      model: " LOGIQ e ",
      year: "2019",
      weight: "",
    });
    expect(r.success && r.data).toEqual({ brand: "GE", model: "LOGIQ e", year: 2019 });
  });

  it("lets a draft skip required fields but not invalid ones", () => {
    const draft = attributesSchema(rules, "draft");
    expect(draft.safeParse({}).success).toBe(true);
    expect(errors(draft.safeParse({ brand: "Sony" }))).toEqual({
      brand: "「品牌」請從選項裡挑一個",
    });
  });

  it("requires required fields on publish", () => {
    expect(errors(attributesSchema(rules, "publish").safeParse({ year: 2019 }))).toEqual({
      brand: "請填寫「品牌」",
      model: "請填寫「型號」",
    });
  });

  it("rejects unknown keys, over-long text, bad years and negative numbers", () => {
    const e = errors(
      attributesSchema(rules, "draft").safeParse({
        colour: "red",
        model: "x".repeat(11),
        year: 1900,
        weight: -1,
      }),
    );
    expect(Object.keys(e).sort()).toEqual(["colour", "model", "weight", "year"]);
    expect(e.model).toBe("「型號」最多 10 個字");
  });
});
