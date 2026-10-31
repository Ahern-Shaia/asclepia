import { describe, expect, it } from "vitest";
import { parseSpecs } from "./spec-parse";

describe("parseSpecs", () => {
  it("splits the reference page's spec block (positive control)", () => {
    // Verbatim lines from https://www.used-equip.com.tw/product/22/67 (2026-10-31)
    const text = [
      "頻寬: HDMI:25-600MHz,TMDS 6Gb/s",
      "HDCP規格: 支援HDCP 2.2, HDCP CTS暫不支援",
      "顯示器規格: 12.1吋 TFT全彩24bits顯示器",
      "HDMI 2.0 6Gbps, 4K, 3D",
    ].join("\n");
    const { rows, leftovers } = parseSpecs(text);
    expect(rows).toEqual([
      { label: "頻寬", value: "HDMI:25-600MHz,TMDS 6Gb/s" },
      { label: "HDCP規格", value: "支援HDCP 2.2, HDCP CTS暫不支援" },
      { label: "顯示器規格", value: "12.1吋 TFT全彩24bits顯示器" },
    ]);
    expect(leftovers).toEqual(["HDMI 2.0 6Gbps, 4K, 3D"]);
  });

  it("accepts full-width colon, tab and numbered lines", () => {
    expect(parseSpecs("重量：4.6 kg\nColor Space\tRGB/YCbCr\n1. 電源: AC 100–240 V").rows).toEqual([
      { label: "重量", value: "4.6 kg" },
      { label: "Color Space", value: "RGB/YCbCr" },
      { label: "電源", value: "AC 100–240 V" },
    ]);
  });

  it("returns nothing for empty or separator-less input (negative control)", () => {
    expect(parseSpecs("")).toEqual({ rows: [], leftovers: [] });
    expect(parseSpecs("   \n\n")).toEqual({ rows: [], leftovers: [] });
    expect(parseSpecs("no separator here").rows).toEqual([]);
    expect(parseSpecs("標籤:").rows).toEqual([]);
  });
});
