import "server-only";
import { audit } from "@/server/audit";
import { type Db, db } from "@/server/db";
import { DomainError } from "@/server/errors";

export async function listCategories(client: Db = db()) {
  return client.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      sortOrder: true,
      iconKey: true,
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
