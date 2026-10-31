import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";
import { contrastPairs } from "./tokens";

describe("contrastRatio", () => {
  // Positive and negative controls: the probe itself must be right before we trust it.
  it("matches known WCAG values", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
    expect(contrastRatio("#777777", "#FFFFFF")).toBeCloseTo(4.48, 2);
    expect(contrastRatio("#FFFFFF", "#FFFFFF")).toBe(1);
  });
});

describe("theme tokens", () => {
  it.each(contrastPairs)("%s on %s (%s) meets AA 4.5:1", (fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
});
