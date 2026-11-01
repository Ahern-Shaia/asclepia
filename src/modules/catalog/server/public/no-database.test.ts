import { afterAll, describe, expect, it, vi } from "vitest";

// A build or deployment without DATABASE_URL (the mockup share site) must not fail: the public
// catalog reads answer empty without touching a database.
vi.mock("next/cache", () => ({ cacheLife: () => {}, cacheTag: () => {} }));
vi.mock("@/server/db", () => ({
  db: () => {
    throw new Error("must not reach the database");
  },
}));
vi.stubEnv("DATABASE_URL", "");

const catalog = await import("./catalog");
const { siteProfile } = await import("@/modules/site-config/server/public/profile");
afterAll(() => vi.unstubAllEnvs());

describe("public reads without a configured database", () => {
  it("return empty results instead of throwing", async () => {
    expect(await catalog.publicProducts({})).toEqual({ total: 0, items: [], nextCursor: null });
    expect(await catalog.publicProduct("x")).toBeNull();
    expect(await catalog.publicCategories()).toEqual([]);
    expect(await catalog.publicConfigs()).toEqual({});
    expect(await catalog.newestIds()).toEqual([]);
    expect(await catalog.publicBrands()).toEqual([]);
    expect(await catalog.publicCardsByIds(["a"])).toEqual([]);
    expect(await catalog.publicFacets({})).toBeNull();
    expect(await siteProfile()).toMatchObject({ name: "Asclepia", phone: "" });
  });
});
