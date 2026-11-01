import { describe, expect, it } from "vitest";
import { DEFAULT_HOME, homeInputSchema, readHome } from "./home";
import { palette, themePresets } from "@/theme/tokens";
import { readTheme } from "./theme";

describe("home layout", () => {
  it("defaults to every block on, in the default order", () => {
    expect(readHome(undefined)).toEqual(DEFAULT_HOME);
  });

  it("keeps the stored order, drops unknown and repeated entries, appends missing blocks", () => {
    const layout = readHome({
      blocks: [
        { id: "services", on: false },
        { id: "nope", on: true },
        { id: "latest", on: true },
        { id: "services", on: true },
      ],
    });
    expect(layout.map((r) => `${r.id}:${r.on}`)).toEqual([
      "services:false",
      "latest:true",
      "categories:true",
      "brands:true",
      "buy:true",
    ]);
  });

  it("accepts only every block exactly once from the back office", () => {
    expect(homeInputSchema.safeParse(DEFAULT_HOME).success).toBe(true);
    expect(homeInputSchema.safeParse(DEFAULT_HOME.slice(1)).success).toBe(false);
    const twice = [...DEFAULT_HOME.slice(1), DEFAULT_HOME[1]];
    expect(homeInputSchema.safeParse(twice).success).toBe(false);
  });
});

describe("theme read", () => {
  it("falls back to the default for malformed values and for a pair that fails contrast", () => {
    const forest = themePresets[1];
    expect(readTheme({ primary: forest.primary, accent: forest.accent, radius: "large" })).toEqual({
      primary: forest.primary,
      accent: forest.accent,
      radius: "large",
    });
    expect(readTheme({ primary: "blue", radius: 3 })).toMatchObject({ radius: "medium" });
    // the yellow tag colour under white text is far below 4.5:1
    const yellow = { primary: palette.tag, accent: palette.accent, radius: "small" };
    expect(readTheme(yellow).primary).not.toBe(palette.tag);
  });
});

describe("profile read", () => {
  it("keeps an https map link and drops anything else", async () => {
    const { profileSchema } = await import("./profile");
    expect(profileSchema.parse({ map: "https://maps.app.goo.gl/abc" }).map).toBe(
      "https://maps.app.goo.gl/abc",
    );
    expect(profileSchema.parse({ map: "javascript:alert(1)" }).map).toBe("");
    expect(profileSchema.parse({ map: "http://example.com" }).map).toBe("");
  });
});
