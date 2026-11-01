import "server-only";
import type { z } from "zod";
import { audit } from "@/server/audit";
import { type Db, db } from "@/server/db";
import { DomainError } from "@/server/errors";
import type { attributeDefSchema, categoryConfigSchema } from "../admin-input";
import type { Client } from "./tx";

type DefInput = z.output<typeof attributeDefSchema>;
type ConfigInput = z.output<typeof categoryConfigSchema>;

// How many products carry a value for each key (any status). Deleting or retyping is blocked while
// this is non-zero (site-config.md §4.1). One query for the whole library.
async function usage(client: Client): Promise<Map<string, number>> {
  const rows = await client.$queryRaw<{ key: string; used: number }[]>`
    select d."key", count(p."id")::int as used
    from "AttributeDef" d
    left join "Product" p on jsonb_exists(p."attributes", d."key")
    group by d."key"`;
  return new Map(rows.map((r) => [r.key, r.used]));
}

export async function listAttributeDefs(client: Db = db()) {
  const [defs, used] = await Promise.all([
    client.attributeDef.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { categories: true } } },
      take: 200,
    }),
    usage(client),
  ]);
  return defs.map((d) => ({ ...d, usedBy: used.get(d.key) ?? 0 }));
}

async function productsUsingOption(client: Client, key: string, options: string[]) {
  if (!options.length) return [];
  return client.$queryRaw<{ name: string }[]>`
    select "name" from "Product"
    where "attributes" ->> ${key} = any(${options})
    order by "updatedAt" desc limit 10`;
}

export async function saveAttributeDef(input: DefInput, actor: string, client: Db = db()) {
  return client.$transaction(async (tx) => {
    const data = {
      label: input.label,
      type: input.type,
      options: input.type === "SELECT" ? input.options : [],
      unit: input.unit,
      maxLength: input.type === "TEXT" ? input.maxLength : null,
    };
    if (!input.id) {
      const row = await tx.attributeDef.create({ data: { key: input.key, ...data } });
      await audit(
        {
          actorId: actor,
          action: "attribute.create",
          targetType: "attribute",
          targetId: row.id,
          result: "ok",
          diff: { key: row.key, type: row.type },
        },
        tx,
      );
      return { id: row.id };
    }
    const current = await tx.attributeDef.findUnique({ where: { id: input.id } });
    if (!current) throw new DomainError("NOT_FOUND");
    if (current.key !== input.key)
      throw new DomainError("INVALID", { fieldErrors: { key: "代號建立後不能改" } });
    const used = (await usage(tx)).get(current.key) ?? 0;
    if (used > 0 && current.type !== input.type)
      throw new DomainError("IN_USE", { detail: [`有 ${used} 件商品在用這個欄位，不能改類型`] });
    const removed = current.options.filter((o) => !data.options.includes(o));
    const blocked = await productsUsingOption(tx, current.key, removed);
    if (blocked.length)
      throw new DomainError("IN_USE", {
        detail: [
          `要刪的選項還有商品在用：${blocked.map((p) => p.name || "（未命名草稿）").join("、")}`,
        ],
      });
    await tx.attributeDef.update({ where: { id: input.id }, data });
    await audit(
      {
        actorId: actor,
        action: "attribute.update",
        targetType: "attribute",
        targetId: input.id,
        result: "ok",
        diff: { key: current.key, label: [current.label, data.label], removedOptions: removed },
      },
      tx,
    );
    return { id: input.id };
  });
}

export async function deleteAttributeDef(id: string, actor: string, client: Db = db()) {
  return client.$transaction(async (tx) => {
    const def = await tx.attributeDef.findUnique({
      where: { id },
      include: { _count: { select: { categories: true } } },
    });
    if (!def) throw new DomainError("NOT_FOUND");
    const used = (await usage(tx)).get(def.key) ?? 0;
    if (used > 0 || def._count.categories > 0)
      throw new DomainError("IN_USE", {
        detail: [
          used
            ? `有 ${used} 件商品在用，先在所有分類取消勾選並清空`
            : `還有 ${def._count.categories} 個分類勾選它`,
        ],
      });
    await tx.attributeDef.delete({ where: { id } });
    await audit(
      {
        actorId: actor,
        action: "attribute.delete",
        targetType: "attribute",
        targetId: id,
        result: "ok",
        diff: { key: def.key },
      },
      tx,
    );
    return { id };
  });
}

export async function getCategoryConfig(categoryId: string, client: Db = db()) {
  return client.categoryAttribute.findMany({
    where: { categoryId },
    orderBy: { sortOrder: "asc" },
    include: { attribute: { select: { key: true, label: true, type: true } } },
  });
}

// Replaces the category's whole config (order = array order).
export async function saveCategoryConfig(input: ConfigInput, actor: string, client: Db = db()) {
  return client.$transaction(async (tx) => {
    const defs = await tx.attributeDef.findMany({
      where: { id: { in: input.rows.map((r) => r.attributeId) } },
      select: { id: true, label: true, type: true },
    });
    if (defs.length !== new Set(input.rows.map((r) => r.attributeId)).size)
      throw new DomainError("CONFLICT");
    const textFilter = input.rows.filter(
      (r) => r.filterable && defs.find((d) => d.id === r.attributeId)?.type === "TEXT",
    );
    if (textFilter.length)
      throw new DomainError("INVALID", {
        detail: textFilter.map(
          (r) => `「${defs.find((d) => d.id === r.attributeId)?.label}」是文字欄位，不能設成可篩選`,
        ),
      });
    await tx.categoryAttribute.deleteMany({ where: { categoryId: input.categoryId } });
    await tx.categoryAttribute.createMany({
      data: input.rows.map((r, sortOrder) => ({ ...r, categoryId: input.categoryId, sortOrder })),
    });
    await audit(
      {
        actorId: actor,
        action: "category.attributes",
        targetType: "category",
        targetId: input.categoryId,
        result: "ok",
        diff: { attributes: input.rows.map((r) => r.attributeId) },
      },
      tx,
    );
    return { categoryId: input.categoryId };
  });
}

// Every category's config in one query, for the product form (switching category swaps fields
// without another round trip). Shape matches src/components/shop/attrs.ts CategoryAttr.
export async function listCategoryConfigs(client: Db = db()) {
  const rows = await client.categoryAttribute.findMany({
    orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
    include: { attribute: true },
    take: 2000,
  });
  const out: Record<
    string,
    {
      attributeId: string;
      key: string;
      label: string;
      type: "TEXT" | "NUMBER" | "YEAR" | "SELECT";
      options: string[];
      unit: string | null;
      maxLength: number | null;
      required: boolean;
      inTitle: boolean;
      onCard: boolean;
      inNameplate: boolean;
      filterable: boolean;
    }[]
  > = {};
  for (const r of rows)
    (out[r.categoryId] ??= []).push({
      attributeId: r.attributeId,
      key: r.attribute.key,
      label: r.attribute.label,
      type: r.attribute.type,
      options: r.attribute.options,
      unit: r.attribute.unit,
      maxLength: r.attribute.maxLength,
      required: r.required,
      inTitle: r.inTitle,
      onCard: r.onCard,
      inNameplate: r.inNameplate,
      filterable: r.filterable,
    });
  return out;
}
