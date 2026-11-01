import { describe, expect, it } from "vitest";
import { homeV3Copy } from "@/copy/home-v3";
import { homeV4Copy } from "@/copy/home-v4";
import { ALL_ON, DEFAULT_VISIT_LABEL, featuresInputSchema, readFeatures } from "./features";
import { readTexts, textsInputSchema } from "./texts";

describe("site texts", () => {
  it("uses the code defaults until edited, and has no footer line by default", () => {
    const t = readTexts(undefined);
    expect(t.heading).toEqual([...homeV4Copy.heading]);
    expect(t.steps).toEqual(homeV3Copy.buy.steps.map((s) => ({ ...s })));
    expect(t.footerLine).toBe("");
  });

  it("fills each empty field with its own default, keeps a one-line heading", () => {
    const t = readTexts({
      heading: ["二手設備專賣", ""],
      steps: [{ title: "", body: "先打電話" }, "broken"],
      footerLine: "  週日公休  ",
    });
    expect(t.heading).toEqual(["二手設備專賣"]);
    expect(t.steps[0]).toEqual({ title: homeV3Copy.buy.steps[0].title, body: "先打電話" });
    expect(t.steps[1]).toEqual({ ...homeV3Copy.buy.steps[1] });
    expect(t.footerLine).toBe("週日公休");
  });

  it("refuses a line longer than the layout holds, with a sentence", () => {
    const r = textsInputSchema.safeParse({
      heading: ["一二三四五六七八九十一二三四五六七", ""],
      steps: [0, 1, 2].map(() => ({ title: "", body: "" })),
      footerLine: "",
    });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toBe("「標題第 1 行」最多 16 個字。");
  });
});

describe("site features", () => {
  it("is all on with the default button label until saved; malformed values fall back", () => {
    expect(ALL_ON).toEqual({
      showPrice: true,
      inquiryList: true,
      visit: true,
      visitLabel: DEFAULT_VISIT_LABEL,
    });
    expect(readFeatures({ showPrice: false, inquiryList: "no", visitLabel: "看貨" })).toEqual({
      showPrice: false,
      inquiryList: true,
      visit: true,
      visitLabel: "看貨",
    });
    expect(
      featuresInputSchema.safeParse({
        showPrice: true,
        inquiryList: true,
        visit: true,
        visitLabel: "預約來店看機",
      }).success,
    ).toBe(true);
  });
});
