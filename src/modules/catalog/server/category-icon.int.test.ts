import { mkdtemp, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, inject, it, vi } from "vitest";
import { createDb } from "@/server/db";
import { listCategories, setCategoryIconImage, setCategoryIconKey } from "./categories";

// Category icon: a built-in drawing or an uploaded image, never both (low-privilege app role).
const db = createDb(inject("appDatabaseUrl"), 3);
const actor = "owner@example.com";
let dir = "";
let id = "";
const png = () =>
  sharp({
    create: { width: 300, height: 300, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .png()
    .toBuffer();

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "asclepia-cat-icons-"));
  vi.stubEnv("UPLOAD_DIR", dir);
  id = (await db.category.create({ data: { name: `圖示-${Date.now()}`, sortOrder: 0 } })).id;
});
afterAll(async () => {
  vi.unstubAllEnvs();
  await db.$disconnect();
});

const row = async () => (await listCategories(db)).find((c) => c.id === id)!;

describe("category icons", () => {
  it("sets a built-in drawing, then an upload replaces it, then a drawing drops the upload", async () => {
    await setCategoryIconKey({ id, iconKey: "microscope" }, actor, db);
    expect((await row()).iconKey).toBe("microscope");

    await setCategoryIconImage(id, await png(), actor, db);
    let r = await row();
    expect(r.iconKey).toBeNull();
    expect(r.iconAsset?.storageKey).toMatch(/^img_[0-9a-f]{32}$/);
    expect((await readdir(dir)).length).toBe(2);

    await setCategoryIconImage(id, await png(), actor, db); // a second upload replaces the first
    expect((await readdir(dir)).length).toBe(2);
    expect(
      await db.siteAsset.count({ where: { kind: "CATEGORY_ICON", categories: { some: { id } } } }),
    ).toBe(1);

    await setCategoryIconKey({ id, iconKey: null }, actor, db);
    r = await row();
    expect([r.iconKey, r.iconAsset]).toEqual([null, null]);
    expect(await readdir(dir)).toEqual([]);
    const audits = await db.auditLog.count({
      where: { targetId: id, action: { startsWith: "category.icon" } },
    });
    expect(audits).toBe(4);
  });
});
