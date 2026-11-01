import "server-only";
import { audit } from "@/server/audit";
import { type Db, db } from "@/server/db";
import { processImage } from "@/server/images/process";
import { fileName, newKey, putImage, removeImage } from "@/server/images/storage";
import { SITE_IMAGE_SIZE, type SiteImageKind, type SiteImages } from "../images";

// One image per kind: setting a new one replaces the old row and, after the commit, its files.
export async function setSiteImage(
  kind: SiteImageKind,
  input: Buffer,
  actor: string,
  client: Db = db(),
) {
  const processed = await processImage(input); // CPU work outside the transaction
  const key = newKey();
  await putImage(key, processed.files);
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
    return { ...row, src: `/media/${fileName(key, SITE_IMAGE_SIZE[kind])}` };
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

// For the admin editor (uncached).
export async function listSiteImages(client: Db = db()): Promise<SiteImages> {
  const rows = await client.siteAsset.findMany({
    where: { kind: { in: ["LOGO", "HERO"] } },
    select: { kind: true, storageKey: true, width: true, height: true },
  });
  return Object.fromEntries(
    rows.map((r) => [
      r.kind,
      {
        src: `/media/${fileName(r.storageKey, SITE_IMAGE_SIZE[r.kind as SiteImageKind])}`,
        width: r.width,
        height: r.height,
      },
    ]),
  );
}
