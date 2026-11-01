import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";
import { newestIds, publicCategories, publicConfigs } from "./shared";
import { type PublicAttr, type PublicCard, PUBLIC_PAGE, VISIBLE } from "../../public-types";

// Public catalog reads (catalog.md A3). Rules that make this safe to expose:
// - only PUBLISHED and SOLD products exist here; drafts and hidden items are invisible (S4-4)
// - fixed `select` shapes: no acquisition source, notes or internal timestamps (stack-rules P6-2)
// - attribute values are filtered to the category's configured keys (hidden values stay hidden)
// - cached with 'use cache' + tags; every admin write calls updateTag (stack-rules P7-1..3)
const cardSelect = {
  id: true,
  name: true,
  status: true,
  priceTwd: true,
  attributes: true,
  categoryId: true,
  images: { orderBy: { sortOrder: "asc" }, take: 1, select: { storageKey: true } },
} satisfies Prisma.ProductSelect;
type CardRow = Prisma.ProductGetPayload<{ select: typeof cardSelect }>;

function pickAttrs(raw: unknown, config: PublicAttr[] = []) {
  const src = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const out: Record<string, string | number> = {};
  for (const a of config) {
    const v = src[a.key];
    if (typeof v === "string" || typeof v === "number") out[a.key] = v;
  }
  return out;
}

function toCard(
  r: CardRow,
  configs: Record<string, PublicAttr[]>,
  newest: string[],
  categoryName: (id: string) => string,
): PublicCard {
  return {
    id: r.id,
    name: r.name,
    categoryId: r.categoryId,
    categoryName: categoryName(r.categoryId),
    attrs: pickAttrs(r.attributes, configs[r.categoryId]),
    priceTwd: r.priceTwd === null ? undefined : Number(r.priceTwd),
    sold: r.status === "SOLD",
    isNew: newest.includes(r.id),
    image: r.images[0]?.storageKey ?? null,
  };
}

export type PublicQuery = {
  cat?: string;
  q?: string;
  filters?: Record<string, string[]>;
  sort?: "new" | "priceAsc" | "priceDesc";
  cursor?: string;
};

// The list filter, shared by the page query and its facet counts so the two can't disagree.
function whereOf(query: PublicQuery, configs: Record<string, PublicAttr[]>) {
  const scope = query.cat ? (configs[query.cat] ?? []) : Object.values(configs).flat();
  const byKey = new Map(scope.filter((a) => a.filterable).map((a) => [a.key, a]));
  const textKeys = [
    ...new Set(scope.filter((a) => a.type === "TEXT" || a.type === "SELECT").map((a) => a.key)),
  ];

  const and: Prisma.ProductWhereInput[] = [];
  for (const [key, values] of Object.entries(query.filters ?? {})) {
    const a = byKey.get(key); // unknown or non-filterable keys are ignored
    const vs = values.filter(Boolean).slice(0, 20);
    if (!a || !vs.length) continue;
    if (a.type === "YEAR" || a.type === "NUMBER") {
      const n = Number(vs[0]);
      if (Number.isFinite(n)) and.push({ attributes: { path: [key], gte: n } });
    } else and.push({ OR: vs.map((v) => ({ attributes: { path: [key], equals: v } })) });
  }
  const q = query.q?.trim().slice(0, 100);
  if (q)
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        ...textKeys
          .slice(0, 50)
          .map((key) => ({ attributes: { path: [key], string_contains: q } })),
      ],
    });

  const where: Prisma.ProductWhereInput = {
    status: { in: [...VISIBLE] },
    ...(query.cat ? { categoryId: query.cat } : {}),
    ...(and.length ? { AND: and } : {}),
  };
  return where;
}

export async function publicProducts(query: PublicQuery) {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  const [configs, categories, newest] = await Promise.all([
    publicConfigs(),
    publicCategories(),
    newestIds(),
  ]);
  const nameOf = (id: string) => categories.find((c) => c.id === id)?.name ?? "";
  const where = whereOf(query, configs);
  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    query.sort === "priceAsc" || query.sort === "priceDesc"
      ? [
          { priceTwd: { sort: query.sort === "priceAsc" ? "asc" : "desc", nulls: "last" } },
          { id: "asc" },
        ]
      : [{ publishedAt: { sort: "desc", nulls: "last" } }, { id: "desc" }];

  const [rows, total] = await Promise.all([
    db().product.findMany({
      where,
      orderBy,
      take: PUBLIC_PAGE + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      select: cardSelect,
    }),
    db().product.count({ where }),
  ]);
  return {
    total,
    items: rows.slice(0, PUBLIC_PAGE).map((r) => toCard(r, configs, newest, nameOf)),
    nextCursor: rows.length > PUBLIC_PAGE ? rows[PUBLIC_PAGE - 1].id : null,
  };
}

// Counts beside the list filters (catalog list page): per category for the keyword, and per value
// of each filterable SELECT attribute for the keyword + category — the same scopes the panel
// offers, through the same filter as the list. Capped reads of `categoryId` + `attributes` (two when
// a category is picked); when a cap is hit the counts would be wrong, so none are returned.
const FACET_CAP = 2000;
export type PublicFacets = {
  all: number;
  categories: Record<string, number>;
  values: Record<string, Record<string, number>>;
} | null;

export async function publicFacets(query: Pick<PublicQuery, "cat" | "q">): Promise<PublicFacets> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  const configs = await publicConfigs();
  const read = (where: Prisma.ProductWhereInput) =>
    db().product.findMany({
      where,
      select: { categoryId: true, attributes: true },
      take: FACET_CAP + 1,
    });
  const [rows, inCat] = await Promise.all([
    read(whereOf({ q: query.q }, configs)),
    query.cat ? read(whereOf({ q: query.q, cat: query.cat }, configs)) : null,
  ]);
  if (rows.length > FACET_CAP || (inCat?.length ?? 0) > FACET_CAP) return null;
  const categories: Record<string, number> = {};
  for (const r of rows) categories[r.categoryId] = (categories[r.categoryId] ?? 0) + 1;
  const scope = query.cat ? (configs[query.cat] ?? []) : Object.values(configs).flat();
  const keys = [
    ...new Set(scope.filter((a) => a.filterable && a.type === "SELECT").map((a) => a.key)),
  ];
  const values: Record<string, Record<string, number>> = Object.fromEntries(
    keys.map((k) => [k, {}]),
  );
  for (const r of inCat ?? rows) {
    const attrs = pickAttrs(r.attributes, configs[r.categoryId]); // hidden values don't count
    for (const k of keys) {
      const v = attrs[k];
      if (typeof v === "string") values[k][v] = (values[k][v] ?? 0) + 1;
    }
  }
  return { all: rows.length, categories, values };
}

export async function publicProduct(id: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", `product:${id}`);
  const [p, configs, newest, categories] = await Promise.all([
    db().product.findFirst({
      where: { id, status: { in: [...VISIBLE] } },
      select: {
        ...cardSelect,
        highlights: true,
        features: true,
        specNote: true,
        specs: { orderBy: { sortOrder: "asc" }, select: { label: true, value: true } },
        images: {
          orderBy: { sortOrder: "asc" },
          select: { storageKey: true, width: true, height: true },
        },
      },
    }),
    publicConfigs(),
    newestIds(),
    publicCategories(),
  ]);
  if (!p) return null;
  const nameOf = (cid: string) => categories.find((c) => c.id === cid)?.name ?? "";
  return {
    ...toCard({ ...p, images: p.images.slice(0, 1) }, configs, newest, nameOf),
    config: configs[p.categoryId] ?? [],
    highlights: p.highlights,
    features: p.features,
    specNote: p.specNote,
    specs: p.specs,
    images: p.images,
  };
}

// Values of the "brand" attribute that visible products actually carry (home 依品牌找).
// Hidden when no category uses a `brand` attribute.
export async function publicBrands() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  // Only categories that actually use a `brand` attribute count, so values hidden by a category
  // switch never surface here.
  const rows = await db().$queryRaw<{ v: string }[]>`
    select distinct p."attributes" ->> 'brand' as v
    from "Product" p
    join "CategoryAttribute" ca on ca."categoryId" = p."categoryId"
    join "AttributeDef" d on d."id" = ca."attributeId" and d."key" = 'brand'
    where p."status" in ('PUBLISHED', 'SOLD') and jsonb_exists(p."attributes", 'brand')
    order by v limit 30`;
  return rows.map((r) => r.v).filter(Boolean);
}

export { newestIds, publicCategories, publicConfigs } from "./shared";
export type { PublicAttr, PublicCard } from "../../public-types";
export { PUBLIC_PAGE, VISIBLE } from "../../public-types";

// Cards for the inquiry list page (ids come from the visitor's browser). Sold items come back with
// `sold: true` so the page can flag them; drafts and hidden items don't come back at all.
export async function publicCardsByIds(ids: string[]) {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  const wanted = [...new Set(ids)].slice(0, 10);
  if (!wanted.length) return [];
  const [rows, configs, categories, newest] = await Promise.all([
    db().product.findMany({
      where: { id: { in: wanted }, status: { in: [...VISIBLE] } },
      select: cardSelect,
    }),
    publicConfigs(),
    publicCategories(),
    newestIds(),
  ]);
  const nameOf = (cid: string) => categories.find((c) => c.id === cid)?.name ?? "";
  return rows.map((r) => toCard(r, configs, newest, nameOf));
}
