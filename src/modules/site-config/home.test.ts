import { describe, expect, it } from "vitest";
import { DEFAULT_HOME, homeInputSchema, readHome } from "./home";
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
    expect(readTheme({ primary: "#1F5F4A", accent: "#9A3412", radius: "large" })).toEqual({
      primary: "#1F5F4A",
      accent: "#9A3412",
      radius: "large",
    });
    expect(readTheme({ primary: "blue", radius: 3 })).toMatchObject({ radius: "medium" });
    expect(readTheme({ primary: "#FFF59D", accent: "#9A3412", radius: "small" }).primary).not.toBe(
      "#FFF59D",
    );
  });
});
