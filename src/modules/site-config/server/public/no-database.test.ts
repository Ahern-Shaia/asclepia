import { afterAll, describe, expect, it, vi } from "vitest";

// Same contract as catalog/server/public/no-database.test.ts: no DATABASE_URL → defaults, no DB.
vi.mock("next/cache", () => ({ cacheLife: () => {}, cacheTag: () => {} }));
vi.mock("@/server/db", () => ({
  db: () => {
    throw new Error("must not reach the database");
  },
}));
vi.stubEnv("DATABASE_URL", "");

const { siteProfile } = await import("./profile");
afterAll(() => vi.unstubAllEnvs());

describe("site profile without a configured database", () => {
  it("answers the defaults instead of throwing", async () => {
    expect(await siteProfile()).toMatchObject({ name: "Asclepia", phone: "" });
  });
});
