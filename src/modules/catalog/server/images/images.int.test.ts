import { mkdtemp, readdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, inject, it, vi } from "vitest";
import { createDb } from "@/server/db";
import { DomainError } from "@/server/errors";
import { addImage, deleteImage, MAX_IMAGES, reorderImages } from ".";
import { _slotsInUse, processImage } from "./process";
import { changeStatus } from "../products";

const db = createDb(inject("appDatabaseUrl"), 3);
const ADMIN = "owner@example.com";
let dir = "";
let categoryId = "";

const jpeg = (w: number, h: number) =>
  sharp({ create: { width: w, height: h, channels: 3, background: { r: 51, g: 102, b: 170 } } })
    .jpeg()
    .toBuffer();
const files = async () => (await readdir(dir)).sort();
const code = async (p: Promise<unknown>) => {
  try {
    await p;
  } catch (e) {
    return e instanceof DomainError ? e.code : `other:${(e as Error).name}`;
  }
  return "resolved";
};
const newProduct = async (name = "測試") =>
  (await db.product.create({ data: { categoryId, name } })).id;

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "asclepia-uploads-"));
  vi.stubEnv("UPLOAD_DIR", dir);
  categoryId = (await db.category.create({ data: { name: `圖片-${Date.now()}`, sortOrder: 0 } }))
    .id;
});
afterAll(async () => {
  vi.unstubAllEnvs();
  await db.$disconnect();
});

describe("processImage (catalog.md §4.2, stack-rules S2-3)", () => {
  it("re-encodes to WebP 1600/400 and drops EXIF, including GPS", async () => {
    const withGps = await sharp(await jpeg(2400, 1800))
      .withExif({
        IFD0: { Make: "Probe" },
        IFD3: { GPSLatitudeRef: "N", GPSLatitude: "25/1 2/1 0/1" },
      })
      .jpeg()
      .toBuffer();
    expect((await sharp(withGps).metadata()).exif).toBeDefined(); // the fixture really carries EXIF
    const out = await processImage(withGps);
    expect([out.width, out.height]).toEqual([1600, 1200]);
    const big = await sharp(out.files[1600]).metadata();
    const small = await sharp(out.files[400]).metadata();
    expect(big.format).toBe("webp");
    expect(big.exif).toBeUndefined();
    expect(big.icc).toBeUndefined();
    expect([small.width, small.height]).toEqual([400, 300]);
  });

  it("applies the camera orientation before dropping it", async () => {
    const portrait = await sharp(await jpeg(200, 100))
      .withMetadata({ orientation: 6 })
      .jpeg()
      .toBuffer();
    const out = await processImage(portrait);
    expect([out.width, out.height]).toEqual([100, 200]);
  });

  it("refuses SVG and HEIC before sharp, and maps parser failures to a plain error", async () => {
    expect(await code(processImage(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>")))).toBe(
      "IMAGE_UNSUPPORTED",
    );
    expect(await code(processImage(Buffer.from([0, 0, 0, 0x18, ...Buffer.from("ftypheic")])))).toBe(
      "IMAGE_UNSUPPORTED",
    );
    expect(await code(processImage((await jpeg(400, 300)).subarray(0, 200)))).toBe(
      "IMAGE_UNREADABLE",
    );
  });

  it("refuses a decompression bomb (pixel cap)", async () => {
    const bomb = await sharp({
      create: { width: 8000, height: 8000, channels: 3, background: "#fff" },
    })
      .png({ compressionLevel: 9 })
      .toBuffer();
    expect(bomb.length).toBeLessThan(1_000_000); // small file, 64 M pixels
    expect(await code(processImage(bomb))).toBe("IMAGE_UNREADABLE");
  });

  it("processes at most 2 images at a time (P4-2)", async () => {
    const input = await jpeg(3000, 2000);
    let max = 0;
    const timer = setInterval(() => (max = Math.max(max, _slotsInUse())), 1);
    await Promise.all(Array.from({ length: 5 }, () => processImage(input)));
    clearInterval(timer);
    expect(max).toBe(2); // positive control: the probe saw parallel work, and never more than 2
  });
});

describe("product images", () => {
  it("adds, stores two sizes, reorders, and enforces the 20-image cap without orphan files", async () => {
    const id = await newProduct();
    const a = await addImage(id, await jpeg(800, 600), ADMIN, db);
    const b = await addImage(id, await jpeg(800, 600), ADMIN, db);
    expect([a.sortOrder, b.sortOrder]).toEqual([0, 1]);
    expect(await files()).toEqual(
      expect.arrayContaining([`${a.storageKey}-1600.webp`, `${a.storageKey}-400.webp`]),
    );
    await reorderImages(id, [b.id, a.id], ADMIN, db);
    expect((await db.productImage.findUniqueOrThrow({ where: { id: b.id } })).sortOrder).toBe(0);

    await db.productImage.createMany({
      data: Array.from({ length: MAX_IMAGES - 2 }, (_, i) => ({
        productId: id,
        sortOrder: i + 2,
        storageKey: `img_${String(i).padStart(32, "0")}`,
        width: 1,
        height: 1,
      })),
    });
    const before = await files();
    expect(await code(addImage(id, await jpeg(800, 600), ADMIN, db))).toBe("IMAGE_LIMIT");
    expect(await files()).toEqual(before);
  });

  it("keeps at least one photo on a product that has been public, and deletes files on removal", async () => {
    const id = await newProduct();
    const img = await addImage(id, await jpeg(800, 600), ADMIN, db);
    await changeStatus({ id, to: "PUBLISHED" }, ADMIN, db);
    expect(await code(deleteImage(img.id, ADMIN, db))).toBe("IN_USE");

    const draft = await newProduct("草稿");
    const d = await addImage(draft, await jpeg(800, 600), ADMIN, db);
    await deleteImage(d.id, ADMIN, db);
    expect((await files()).some((f) => f.startsWith(d.storageKey))).toBe(false);
    expect(await readFile(join(dir, `${img.storageKey}-400.webp`))).toBeTruthy();
  });
});
