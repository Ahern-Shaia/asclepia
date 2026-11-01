import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/server/db";
import { listCategoryConfigs } from "../attributes";
import { type PublicAttr, VISIBLE } from "../../public-types";

// Reads every public request shares; each is cached on its own so a page's per-request work is only
// its product query (performance-baseline §0 #3: ≤ 5 DB queries per request).
export async function publicConfigs(): Promise<Record<string, PublicAttr[]>> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  const all = await listCategoryConfigs();
  return Object.fromEntries(
    Object.entries(all).map(([id, rows]) => [
      id,
      rows.map((r) => ({
        key: r.key,
        label: r.label,
        type: r.type,
        options: r.options,
        unit: r.unit ?? undefined,
        required: r.required,
        inTitle: r.inTitle,
        onCard: r.onCard,
        inNameplate: r.inNameplate,
        filterable: r.filterable && r.type !== "TEXT",
      })),
    ]),
  );
}

export async function publicCategories() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  const rows = await db().category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: 200,
    select: {
      id: true,
      name: true,
      iconKey: true,
      _count: { select: { products: { where: { status: { in: [...VISIBLE] } } } } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    iconKey: r.iconKey,
    count: r._count.products,
  }));
}

// 「新到」 is derived, not stored (§B0): the two most recently published visible products.
export async function newestIds() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  const rows = await db().product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    take: 2,
    select: { id: true },
  });
  return rows.map((r) => r.id);
}
