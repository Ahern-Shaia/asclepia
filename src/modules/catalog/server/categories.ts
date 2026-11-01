import "server-only";
import { audit } from "@/server/audit";
import { type Db, db } from "@/server/db";
import { DomainError } from "@/server/errors";
import { processImage } from "@/server/images/process";
import { newKey, putImage, removeImage } from "@/server/images/storage";
import type { Tx } from "./tx";

export async function listCategories(client: Db = db()) {
  return client.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      sortOrder: true,
      iconKey: true,
      iconAsset: { select: { storageKey: true } },
      _count: { select: { products: true } },
    },
    take: 200,
  });
}

export async function saveCategory(
  input: { id?: string; name: string },
  actor: string,
  client: Db = db(),
) {
  return client.$transaction(async (tx) => {
    const row = input.id
      ? await tx.category.update({ where: { id: input.id }, data: { name: input.name } })
      : await tx.category.create({
          data: { name: input.name, sortOrder: await tx.category.count() },
        });
    await audit(
      {
        actorId: actor,
        action: input.id ? "category.rename" : "category.create",
        targetType: "category",
        targetId: row.id,
        result: "ok",
        diff: { name: row.name },
      },
      tx,
    );
    return { id: row.id };
  });
}

export async function reorderCategories(ids: string[], actor: string, client: Db = db()) {
  return client.$transaction(async (tx) => {
    const known = await tx.category.count({ where: { id: { in: ids } } });
    if (known !== ids.length || known !== (await tx.category.count()))
      throw new DomainError("CONFLICT");
    for (const [i, id] of ids.entries())
      await tx.category.update({ where: { id }, data: { sortOrder: i } });
    await audit(
      {
        actorId: actor,
        action: "category.reorder",
        targetType: "category",
        targetId: "*",
        result: "ok",
        diff: { ids },
      },
      tx,
    );
    return { count: ids.length };
  });
}

// Products restrict deletion at the FK too; checking first gives a sentence instead of an error code.
export async function deleteCategory(id: string, actor: string, client: Db = db()) {
  return client.$transaction(async (tx) => {
    const products = await tx.product.count({ where: { categoryId: id } });
    if (products > 0)
      throw new DomainError("IN_USE", { detail: [`還有 ${products} 件商品在這個分類`] });
    const row = await tx.category.delete({ where: { id } });
    await audit(
      {
        actorId: actor,
        action: "category.delete",
        targetType: "category",
        targetId: id,
        result: "ok",
        diff: { name: row.name },
      },
      tx,
    );
    return { id };
  });
}

// A category shows one icon: an uploaded image, a built-in drawing, or the generic drawing.
// Choosing a drawing (or none) drops an uploaded image; uploading replaces any of them.
async function dropUploaded(tx: Tx, categoryId: string) {
  const cat = await tx.category.findUnique({
    where: { id: categoryId },
    select: { iconAsset: { select: { id: true, storageKey: true } } },
  });
  if (!cat) throw new DomainError("NOT_FOUND");
  if (!cat.iconAsset) return null;
  await tx.category.update({ where: { id: categoryId }, data: { iconAssetId: null } });
  await tx.siteAsset.delete({ where: { id: cat.iconAsset.id } });
  return cat.iconAsset.storageKey;
}

export async function setCategoryIconKey(
  input: { id: string; iconKey: string | null },
  actor: string,
  client: Db = db(),
) {
  const old = await client.$transaction(async (tx) => {
    const dropped = await dropUploaded(tx, input.id);
    await tx.category.update({ where: { id: input.id }, data: { iconKey: input.iconKey } });
    await audit(
      {
        actorId: actor,
        action: "category.icon",
        targetType: "category",
        targetId: input.id,
        result: "ok",
        diff: { iconKey: input.iconKey, droppedUpload: dropped !== null },
      },
      tx,
    );
    return dropped;
  });
  if (old) await removeImage(old); // after commit
  return { id: input.id };
}

export async function setCategoryIconImage(
  categoryId: string,
  input: Buffer,
  actor: string,
  client: Db = db(),
) {
  const processed = await processImage(input); // CPU work outside the transaction
  const key = newKey();
  await putImage(key, processed.files);
  try {
    const old = await client.$transaction(async (tx) => {
      // lock the category: two uploads at once leave exactly one icon
      const locked = await tx.$queryRaw<{ id: string }[]>`
        select "id" from "Category" where "id" = ${categoryId} for update`;
      if (!locked.length) throw new DomainError("NOT_FOUND");
      const dropped = await dropUploaded(tx, categoryId);
      const asset = await tx.siteAsset.create({
        data: {
          kind: "CATEGORY_ICON",
          storageKey: key,
          width: processed.width,
          height: processed.height,
        },
        select: { id: true },
      });
      await tx.category.update({
        where: { id: categoryId },
        data: { iconAssetId: asset.id, iconKey: null },
      });
      await audit(
        {
          actorId: actor,
          action: "category.icon.upload",
          targetType: "category",
          targetId: categoryId,
          result: "ok",
          diff: { width: processed.width, height: processed.height, replaced: dropped !== null },
        },
        tx,
      );
      return dropped;
    });
    if (old) await removeImage(old);
    return { id: categoryId };
  } catch (e) {
    await removeImage(key);
    throw e;
  }
}
