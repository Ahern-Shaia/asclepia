import "server-only";
import { audit } from "@/server/audit";
import { type Db, db } from "@/server/db";
import { DomainError } from "@/server/errors";
import { processImage } from "./process";
import { newKey, putImage, removeImage } from "./storage";

export const MAX_IMAGES = 20; // catalog.md §4.2

export async function addImage(productId: string, input: Buffer, actor: string, client: Db = db()) {
  const processed = await processImage(input); // CPU work outside the transaction
  const key = newKey();
  await putImage(key, processed.files);
  try {
    return await client.$transaction(async (tx) => {
      // Lock the product row so two parallel uploads can't both pass the 20-image check.
      const locked = await tx.$queryRaw<{ id: string }[]>`
        select "id" from "Product" where "id" = ${productId} for update`;
      if (!locked.length) throw new DomainError("NOT_FOUND");
      const agg = await tx.productImage.aggregate({
        where: { productId },
        _count: true,
        _max: { sortOrder: true },
      });
      if (agg._count >= MAX_IMAGES) throw new DomainError("IMAGE_LIMIT");
      const row = await tx.productImage.create({
        data: {
          productId,
          storageKey: key,
          width: processed.width,
          height: processed.height,
          sortOrder: (agg._max.sortOrder ?? -1) + 1,
        },
        select: { id: true, storageKey: true, width: true, height: true, sortOrder: true },
      });
      await audit(
        {
          actorId: actor,
          action: "product.image.add",
          targetType: "product",
          targetId: productId,
          result: "ok",
          diff: { imageId: row.id, width: row.width, height: row.height },
        },
        tx,
      );
      return row;
    });
  } catch (e) {
    await removeImage(key); // no orphan files when the row isn't written
    throw e;
  }
}

export async function deleteImage(imageId: string, actor: string, client: Db = db()) {
  const removed = await client.$transaction(async (tx) => {
    const img = await tx.productImage.findUnique({
      where: { id: imageId },
      select: { productId: true, storageKey: true, product: { select: { status: true } } },
    });
    if (!img) throw new DomainError("NOT_FOUND");
    const count = await tx.productImage.count({ where: { productId: img.productId } });
    if (img.product.status !== "DRAFT" && count <= 1)
      throw new DomainError("IN_USE", {
        detail: ["公開過的商品至少要留一張照片；要換照片請先上傳新的再刪舊的"],
      });
    await tx.productImage.delete({ where: { id: imageId } });
    const rest = await tx.productImage.findMany({
      where: { productId: img.productId },
      orderBy: { sortOrder: "asc" },
      select: { id: true },
    });
    for (const [i, r] of rest.entries())
      await tx.productImage.update({ where: { id: r.id }, data: { sortOrder: i } });
    await audit(
      {
        actorId: actor,
        action: "product.image.delete",
        targetType: "product",
        targetId: img.productId,
        result: "ok",
        diff: { imageId },
      },
      tx,
    );
    return img;
  });
  await removeImage(removed.storageKey); // after commit: a rollback must not lose the file
  return { productId: removed.productId };
}

// ids in the new order; the first one is the main photo.
export async function reorderImages(
  productId: string,
  ids: string[],
  actor: string,
  client: Db = db(),
) {
  return client.$transaction(async (tx) => {
    const current = await tx.productImage.findMany({ where: { productId }, select: { id: true } });
    const same = current.length === ids.length && current.every((c) => ids.includes(c.id));
    if (!same || new Set(ids).size !== ids.length) throw new DomainError("CONFLICT");
    for (const [i, id] of ids.entries())
      await tx.productImage.update({ where: { id }, data: { sortOrder: i } });
    await audit(
      {
        actorId: actor,
        action: "product.image.reorder",
        targetType: "product",
        targetId: productId,
        result: "ok",
        diff: { ids },
      },
      tx,
    );
    return { productId };
  });
}
