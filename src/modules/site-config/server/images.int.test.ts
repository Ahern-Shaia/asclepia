import { mkdtemp, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, inject, it, vi } from "vitest";
import { createDb } from "@/server/db";
import {
  listSiteImages,
  removeBrandLogo,
  removeSiteImage,
  reorderBrandLogos,
  setBrandLogo,
  setSiteImage,
} from "./images";

// Store logo / hero photo (site-config.md §4.2 SiteAsset) on the low-privilege app role. Only this
// file writes SiteAsset LOGO/HERO.
vi.mock("next/cache", () => ({ cacheLife: () => {}, cacheTag: () => {} }));
const db = createDb(inject("appDatabaseUrl"), 3);
const actor = "owner@example.com";
let dir = "";
const png = (w: number, h: number) =>
  sharp({
    create: { width: w, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .png()
    .toBuffer();

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "asclepia-site-images-"));
  vi.stubEnv("UPLOAD_DIR", dir);
});
afterAll(async () => {
  vi.unstubAllEnvs();
  await db.$disconnect();
});

describe("site images", () => {
  it("sets one image per kind, replacing the old row and its files", async () => {
    const first = await setSiteImage("LOGO", await png(600, 200), actor, db);
    expect(first).toMatchObject({ width: 600, height: 200 });
    const second = await setSiteImage("LOGO", await png(300, 100), actor, db);
    expect(await db.siteAsset.count({ where: { kind: "LOGO" } })).toBe(1);
    expect((await listSiteImages(db)).LOGO).toEqual({
      src: second.src,
      width: 300,
      height: 100,
    });
    // only the second logo's two sizes are on disk
    expect((await readdir(dir)).length).toBe(2);
    const audit = await db.auditLog.findFirstOrThrow({
      where: { action: "site-config.image.set", targetId: "LOGO" },
      orderBy: { id: "desc" },
    });
    expect(audit.diff).toMatchObject({ width: 300, height: 100, replaced: 1 });
  });

  it("is read by the public settings query together with the sections", async () => {
    await setSiteImage("HERO", await png(2400, 1350), actor, db);
    const { siteConfigValues } = await import("./public/values");
    const { images } = await siteConfigValues();
    expect(images.HERO).toMatchObject({ width: 1600, height: 900 }); // stored at most 1600 wide
    expect(images.LOGO?.src).toMatch(/^\/media\/img_[0-9a-f]{32}-400\.webp$/); // shown 40 px tall
    expect(images.HERO?.src).toMatch(/-1600\.webp$/);
  });

  it("removes an image and its files", async () => {
    expect(await removeSiteImage("HERO", actor, db)).toEqual({ removed: 1 });
    expect((await listSiteImages(db)).HERO).toBeUndefined();
    expect((await readdir(dir)).length).toBe(2); // the logo stays
    expect(await removeSiteImage("HERO", actor, db)).toEqual({ removed: 0 });
  });
});

describe("favicon, visit photo and brand logos", () => {
  it("makes the favicon a set of square PNGs and serves the 512 master", async () => {
    const before = (await readdir(dir)).length;
    const r = await setSiteImage("FAVICON", await png(800, 500), actor, db);
    expect(r.src).toMatch(/^\/media\/img_[0-9a-f]{32}-512\.png$/);
    const pngs = (await readdir(dir)).filter((f) => f.endsWith(".png"));
    expect(pngs).toHaveLength(3);
    expect((await readdir(dir)).length).toBe(before + 3);
    const meta = await sharp(
      join(
        dir,
        pngs.find((f) => f.endsWith("-32.png"))!,
      ),
    ).metadata();
    expect([meta.width, meta.height, meta.format]).toEqual([32, 32, "png"]);
    await removeSiteImage("FAVICON", actor, db);
    expect((await readdir(dir)).filter((f) => f.endsWith(".png"))).toEqual([]);
  });

  it("keeps one logo per brand, in the order set, and removes one brand's logo only", async () => {
    await setBrandLogo("GE", await png(400, 200), actor, db);
    await setBrandLogo("Philips", await png(400, 200), actor, db);
    await setBrandLogo("GE", await png(300, 100), actor, db); // replaced, keeps its place
    expect((await listSiteImages(db)).brands?.map((b) => b.brand)).toEqual(["GE", "Philips"]);

    await reorderBrandLogos(["Philips", "GE"], actor, db);
    const { siteConfigValues } = await import("./public/values");
    expect((await siteConfigValues()).images.brands?.map((b) => b.brand)).toEqual([
      "Philips",
      "GE",
    ]);
    // a list that isn't exactly the brands with logos is refused
    await expect(reorderBrandLogos(["GE"], actor, db)).rejects.toMatchObject({ code: "CONFLICT" });

    expect(await removeBrandLogo("GE", actor, db)).toEqual({ removed: 1 });
    expect((await listSiteImages(db)).brands?.map((b) => b.brand)).toEqual(["Philips"]);
    await removeBrandLogo("Philips", actor, db);
  });
});
