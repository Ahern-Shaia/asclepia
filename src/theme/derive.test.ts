import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";
import { checkTheme, deriveTheme } from "./derive";
import { palette, themePresets } from "./tokens";

describe("checkTheme", () => {
  it.each(themePresets)("preset $id passes all four pairs", (p) => {
    const checks = checkTheme(p);
    expect(checks.map((c) => c.id)).toEqual([
      "onPrimary",
      "primaryOnWhite",
      "onAccent",
      "accentOnWhite",
    ]);
    expect(checks.filter((c) => !c.pass)).toEqual([]);
  });

  it("blocks a light yellow primary and names the failing pairs", () => {
    const failing = checkTheme({ primary: "#FFF59D", accent: palette.accent }).filter(
      (c) => !c.pass,
    );
    expect(failing.map((c) => c.id)).toEqual(["onPrimary", "primaryOnWhite"]);
    expect(failing[0].ratio).toBeLessThan(1.5);
  });

  it("fails a pair just under AA and passes one just over", () => {
    // #777777 on white is 4.48:1, #767676 is 4.54:1 (WCAG reference values).
    const checks = checkTheme({ primary: "#777777", accent: "#767676" });
    const pass = (id: string) => checks.find((c) => c.id === id)!.pass;
    expect(pass("primaryOnWhite")).toBe(false);
    expect(pass("accentOnWhite")).toBe(true);
  });
});

describe("deriveTheme", () => {
  const d = deriveTheme({ primary: palette.primary, accent: palette.accent, radius: "medium" });

  it("keeps the chosen colours and maps the radius step", () => {
    expect(d.primary).toBe(palette.primary);
    expect(d.accent).toBe(palette.accent);
    expect([d.radius, d.radiusSM]).toEqual([6, 4]);
  });

  it("derives a deeper primary and light tints that keep the base colour readable", () => {
    expect(contrastRatio(palette.bg, d.primaryDeep)).toBeGreaterThan(
      contrastRatio(palette.bg, d.primary),
    );
    expect(contrastRatio(d.primary, d.primaryBg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(d.accent, d.accentBg)).toBeGreaterThanOrEqual(4.5);
  });

  it("rejects a colour that is not #RRGGBB", () => {
    expect(() =>
      deriveTheme({ primary: "blue", accent: palette.accent, radius: "small" }),
    ).toThrow();
  });
});
