import "server-only";
import { audit } from "@/server/audit";
import { type Db, db } from "@/server/db";
import { DomainError } from "@/server/errors";
import { processIcon, processImage } from "@/server/images/process";
import { newKey, putIcon, putImage, removeImage } from "@/server/images/storage";
import type { SiteImageKind, SiteImages } from "../images";
import { srcOf } from "./media";

// Re-encode and write the files; the caller writes the row. Favicon → square PNGs.
async function store(kind: string, input: Buffer) {
  const key = newKey();
  if (kind === "FAVICON") {
    const p = await processIcon(input);
    await putIcon(key, p.files);
    return { key, width: p.width, height: p.height };
  }
  const p = await processImage(input);
  await putImage(key, p.files);
  return { key, width: p.width, height: p.height };
}

// One image per kind: setting a new one replaces the old row and, after the commit, its files.
export async function setSiteImage(
  kind: SiteImageKind,
  input: Buffer,
  actor: string,
  client: Db = db(),
) {
  const processed = await store(kind, input); // CPU work outside the transaction
  const { key } = processed;
  let old: string[] = [];
  try {
    const row = await client.$transaction(async (tx) => {
      // serialise two uploads of the same kind: the second waits, then replaces the first
      await tx.$executeRaw`select pg_advisory_xact_lock(hashtext(${`site-image:${kind}`}))`;
      old = (await tx.siteAsset.findMany({ where: { kind }, select: { storageKey: true } })).map(
        (r) => r.storageKey,
      );
      await tx.siteAsset.deleteMany({ where: { kind } });
      const created = await tx.siteAsset.create({
        data: { kind, storageKey: key, width: processed.width, height: processed.height },
        select: { id: true, width: true, height: true },
      });
      await audit(
        {
          actorId: actor,
          action: "site-config.image.set",
          targetType: "site-config",
          targetId: kind,
          result: "ok",
          diff: { width: created.width, height: created.height, replaced: old.length },
        },
        tx,
      );
      return created;
    });
    for (const k of old) await removeImage(k);
    return { ...row, src: srcOf(kind, key) };
  } catch (e) {
    await removeImage(key); // no orphan files when the row isn't written
    throw e;
  }
}

export async function removeSiteImage(kind: SiteImageKind, actor: string, client: Db = db()) {
  const keys = await client.$transaction(async (tx) => {
    const rows = await tx.siteAsset.findMany({ where: { kind }, select: { storageKey: true } });
    await tx.siteAsset.deleteMany({ where: { kind } });
    await audit(
      {
        actorId: actor,
        action: "site-config.image.remove",
        targetType: "site-config",
        targetId: kind,
        result: "ok",
        diff: { removed: rows.length },
      },
      tx,
    );
    return rows.map((r) => r.storageKey);
  });
  for (const k of keys) await removeImage(k);
  return { removed: keys.length };
}

// Brand logos (home 「依品牌找」): one per brand name, shown in sortOrder. Replacing keeps the
// brand's place; a new brand goes last.
export async function setBrandLogo(brand: string, input: Buffer, actor: string, client: Db = db()) {
  const processed = await store("BRAND_LOGO", input);
  let old: string[] = [];
  try {
    const row = await client.$transaction(async (tx) => {
      await tx.$executeRaw`select pg_advisory_xact_lock(hashtext('site-image:BRAND_LOGO'))`;
      const rows = await tx.siteAsset.findMany({
        where: { kind: "BRAND_LOGO" },
        select: { id: true, alt: true, storageKey: true, sortOrder: true },
      });
      const same = rows.filter((r) => r.alt === brand);
      old = same.map((r) => r.storageKey);
      const sortOrder = same[0]?.sortOrder ?? Math.max(-1, ...rows.map((r) => r.sortOrder)) + 1;
      await tx.siteAsset.deleteMany({ where: { id: { in: same.map((r) => r.id) } } });
      const created = await tx.siteAsset.create({
        data: {
          kind: "BRAND_LOGO",
          alt: brand,
          storageKey: processed.key,
          width: processed.width,
          height: processed.height,
          sortOrder,
        },
        select: { id: true },
      });
      await audit(
        {
          actorId: actor,
          action: "site-config.brand-logo.set",
          targetType: "site-config",
          targetId: "BRAND_LOGO",
          result: "ok",
          diff: { brand, replaced: old.length },
        },
        tx,
      );
      return created;
    });
    for (const k of old) await removeImage(k);
    return { ...row, brand, src: srcOf("BRAND_LOGO", processed.key) };
  } catch (e) {
    await removeImage(processed.key);
    throw e;
  }
}

export async function removeBrandLogo(brand: string, actor: string, client: Db = db()) {
  const keys = await client.$transaction(async (tx) => {
    const rows = await tx.siteAsset.findMany({
      where: { kind: "BRAND_LOGO", alt: brand },
      select: { storageKey: true },
    });
    await tx.siteAsset.deleteMany({ where: { kind: "BRAND_LOGO", alt: brand } });
    await audit(
      {
        actorId: actor,
        action: "site-config.brand-logo.remove",
        targetType: "site-config",
        targetId: "BRAND_LOGO",
        result: "ok",
        diff: { brand, removed: rows.length },
      },
      tx,
    );
    return rows.map((r) => r.storageKey);
  });
  for (const k of keys) await removeImage(k);
  return { removed: keys.length };
}

// `brands` must be exactly the brands that have a logo, in the new order (anything else: someone
// changed the set meanwhile → CONFLICT, like category reordering).
export async function reorderBrandLogos(brands: string[], actor: string, client: Db = db()) {
  return client.$transaction(async (tx) => {
    await tx.$executeRaw`select pg_advisory_xact_lock(hashtext('site-image:BRAND_LOGO'))`;
    const rows = await tx.siteAsset.findMany({
      where: { kind: "BRAND_LOGO" },
      select: { id: true, alt: true },
    });
    const have = new Set(rows.map((r) => r.alt));
    if (brands.length !== rows.length || new Set(brands).size !== brands.length)
      throw new DomainError("CONFLICT");
    if (!brands.every((b) => have.has(b))) throw new DomainError("CONFLICT");
    for (const [i, b] of brands.entries())
      await tx.siteAsset.updateMany({
        where: { kind: "BRAND_LOGO", alt: b },
        data: { sortOrder: i },
      });
    await audit(
      {
        actorId: actor,
        action: "site-config.brand-logo.reorder",
        targetType: "site-config",
        targetId: "BRAND_LOGO",
        result: "ok",
        diff: { brands },
      },
      tx,
    );
    return { count: brands.length };
  });
}

// For the admin editor (uncached).
export async function listSiteImages(client: Db = db()): Promise<SiteImages> {
  const rows = await client.siteAsset.findMany({
    where: { kind: { in: ["LOGO", "HERO", "VISIT", "FAVICON", "BRAND_LOGO"] } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { kind: true, alt: true, storageKey: true, width: true, height: true },
  });
  const out: SiteImages = { brands: [] };
  for (const r of rows) {
    const src = srcOf(r.kind, r.storageKey);
    if (r.kind === "BRAND_LOGO") out.brands!.push({ brand: r.alt ?? "", src });
    else out[r.kind as SiteImageKind] = { src, width: r.width, height: r.height };
  }
  return out;
}
