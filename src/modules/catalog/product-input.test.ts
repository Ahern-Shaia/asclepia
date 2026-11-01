import { describe, expect, it } from "vitest";
import { productInputSchema } from "./product-input";

const base = { categoryId: "c1", name: "攜帶式超音波" };

describe("productInputSchema", () => {
  it("normalises blanks: empty price is 歡迎詢價, empty lines and spec rows are dropped", () => {
    const r = productInputSchema.parse({
      ...base,
      priceTwd: "",
      highlights: ["兩支探頭", "  "],
      specs: [
        { label: "重量", value: "4.6 kg" },
        { label: "", value: "" },
      ],
      sourceName: "",
    });
    expect(r).toMatchObject({
      priceTwd: null,
      highlights: ["兩支探頭"],
      specs: [{ label: "重量", value: "4.6 kg" }],
      sourceName: null,
    });
  });

  it("rejects a negative or fractional price and too many highlights", () => {
    expect(productInputSchema.safeParse({ ...base, priceTwd: -1 }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...base, priceTwd: 10.5 }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...base, highlights: Array(31).fill("x") }).success).toBe(
      false,
    );
  });

  it("allows an empty name (drafts); publishing checks it separately", () => {
    expect(productInputSchema.safeParse({ ...base, name: "" }).success).toBe(true);
  });
});
