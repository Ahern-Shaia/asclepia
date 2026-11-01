import "server-only";
import type { Prisma, ProductStatus } from "@/generated/prisma/client";
import { audit } from "@/server/audit";
import { type Db, db } from "@/server/db";
import { DomainError } from "@/server/errors";
import { attributesSchema, type AttrValues, type SaveMode } from "../attribute-schema";
import { findEfficacyWords } from "../efficacy-words";
import type { ProductInput } from "../product-input";
import { loadRules } from "./rules";
import type { Client } from "./tx";

export const LIST_MAX = 48; // performance-baseline §0 #2

// Which status changes the back office offers (catalog.md OQ-CAT-8: sold items stay visible).
export const TRANSITIONS: Record<ProductStatus, ProductStatus[]> = {
  DRAFT: ["PUBLISHED"],
  PUBLISHED: ["HIDDEN", "SOLD"],
  HIDDEN: ["PUBLISHED", "SOLD"],
  SOLD: ["PUBLISHED", "HIDDEN"],
};

async function validAttributes(client: Client, categoryId: string, raw: unknown, mode: SaveMode) {
  const r = attributesSchema(await loadRules(client, categoryId), mode).safeParse(raw);
  if (r.success) return r.data;
  throw new DomainError("INVALID", {
    fieldErrors: Object.fromEntries(
      r.error.issues.map((i) => [`attributes.${i.path.join(".")}`, i.message]),
    ),
  });
}

// What still blocks publishing, in plain words (catalog.md §4.3: checked on publish, not on draft).
async function missingForPublish(
  client: Client,
  p: { name: string; categoryId: string; attributes: unknown; imageCount: number },
) {
  const missing: string[] = [];
  if (!p.name.trim()) missing.push("品名");
  const r = attributesSchema(await loadRules(client, p.categoryId), "publish").safeParse(
    p.attributes ?? {},
  );
  if (!r.success) missing.push(...r.error.issues.map((i) => i.message));
  if (p.imageCount < 1) missing.push("至少一張商品照片");
  return missing;
}

function efficacyHits(input: ProductInput, attrs: AttrValues) {
  const text = [
    input.name,
    ...input.highlights,
    ...input.features,
    ...input.specs.flatMap((s) => [s.label, s.value]),
    input.specNote ?? "",
    ...Object.values(attrs).filter((x): x is string => typeof x === "string"),
  ].join("\n");
  return findEfficacyWords(text);
}

export async function saveProduct(
  args: { id?: string; expectedUpdatedAt?: string; input: ProductInput },
  actor: string,
  client: Db = db(),
) {
  const { id, input } = args;
  return client.$transaction(async (tx) => {
    const category = await tx.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });
    if (!category) throw new DomainError("INVALID", { fieldErrors: { categoryId: "請選擇分類" } });

    const existing = id
      ? await tx.product.findUnique({
          where: { id },
          select: { status: true, updatedAt: true, _count: { select: { images: true } } },
        })
      : null;
    if (id && !existing) throw new DomainError("NOT_FOUND");
    if (
      existing &&
      args.expectedUpdatedAt &&
      existing.updatedAt.toISOString() !== args.expectedUpdatedAt
    )
      throw new DomainError("CONFLICT");

    // A product that is already public must stay complete; drafts may be partial.
    const live = !!existing && existing.status !== "DRAFT";
    const attributes = await validAttributes(
      tx,
      input.categoryId,
      input.attributes,
      live ? "publish" : "draft",
    );
    if (live) {
      const missing = await missingForPublish(tx, {
        ...input,
        attributes,
        imageCount: existing._count.images,
      });
      if (missing.length) throw new DomainError("PUBLISH_INCOMPLETE", { detail: missing });
    }

    const data = {
      categoryId: input.categoryId,
      name: input.name,
      attributes: attributes as Prisma.InputJsonObject,
      priceTwd: input.priceTwd,
      highlights: input.highlights,
      features: input.features,
      specNote: input.specNote,
      sourceName: input.sourceName,
      sourceContact: input.sourceContact,
    };
    const specs = input.specs.map((s, sortOrder) => ({ ...s, sortOrder }));
    let productId: string;
    if (existing && id) {
      // Conditional on the version we read, so two editors can't silently overwrite each other.
      const n = await tx.product.updateMany({ where: { id, updatedAt: existing.updatedAt }, data });
      if (n.count !== 1) throw new DomainError("CONFLICT");
      await tx.productSpec.deleteMany({ where: { productId: id } });
      await tx.productSpec.createMany({ data: specs.map((s) => ({ ...s, productId: id })) });
      productId = id;
    } else {
      productId = (await tx.product.create({ data: { ...data, specs: { create: specs } } })).id;
    }

    const hits = efficacyHits(input, attributes);
    await audit(
      {
        actorId: actor,
        action: existing ? "product.update" : "product.create",
        targetType: "product",
        targetId: productId,
        result: hits.length ? "warn" : "ok",
        diff: hits.length ? { efficacyWords: hits } : undefined,
      },
      tx,
    );
    const saved = await tx.product.findUniqueOrThrow({
      where: { id: productId },
      select: { updatedAt: true },
    });
    return { id: productId, updatedAt: saved.updatedAt.toISOString(), efficacyWords: hits };
  });
}

export async function changeStatus(
  args: { id: string; to: ProductStatus; expectedUpdatedAt?: string },
  actor: string,
  client: Db = db(),
) {
  return client.$transaction(async (tx) => {
    const p = await tx.product.findUnique({
      where: { id: args.id },
      select: {
        status: true,
        name: true,
        categoryId: true,
        attributes: true,
        publishedAt: true,
        updatedAt: true,
        _count: { select: { images: true } },
      },
    });
    if (!p) throw new DomainError("NOT_FOUND");
    if (args.expectedUpdatedAt && p.updatedAt.toISOString() !== args.expectedUpdatedAt)
      throw new DomainError("CONFLICT");
    if (!TRANSITIONS[p.status].includes(args.to)) throw new DomainError("BAD_TRANSITION");
    if (args.to === "PUBLISHED") {
      const missing = await missingForPublish(tx, { ...p, imageCount: p._count.images });
      if (missing.length) throw new DomainError("PUBLISH_INCOMPLETE", { detail: missing });
    }
    const n = await tx.product.updateMany({
      where: { id: args.id, updatedAt: p.updatedAt },
      data: {
        status: args.to,
        publishedAt: args.to === "PUBLISHED" ? (p.publishedAt ?? new Date()) : p.publishedAt,
      },
    });
    if (n.count !== 1) throw new DomainError("CONFLICT");
    await audit(
      {
        actorId: actor,
        action: "product.status",
        targetType: "product",
        targetId: args.id,
        result: "ok",
        diff: { from: p.status, to: args.to },
      },
      tx,
    );
    return { id: args.id, status: args.to };
  });
}

// Only drafts that nobody has asked about can be deleted; everything else is hidden instead
// (catalog.md 7-bis: keep sale and provenance records).
export async function deleteDraft(id: string, actor: string, client: Db = db()) {
  return client.$transaction(async (tx) => {
    const p = await tx.product.findUnique({
      where: { id },
      select: { status: true, name: true, _count: { select: { inquiryItems: true } } },
    });
    if (!p) throw new DomainError("NOT_FOUND");
    if (p.status !== "DRAFT" || p._count.inquiryItems > 0) throw new DomainError("BAD_TRANSITION");
    await tx.product.delete({ where: { id } });
    await audit(
      {
        actorId: actor,
        action: "product.delete",
        targetType: "product",
        targetId: id,
        result: "ok",
        diff: { name: p.name },
      },
      tx,
    );
    return { id };
  });
}

export type AdminListParams = {
  status?: ProductStatus;
  categoryId?: string;
  q?: string;
  cursor?: string;
};

// Back-office list: newest edits first, keyset-paginated, ≤ LIST_MAX rows (stack-rules P2).
export async function listProducts(params: AdminListParams, client: Db = db()) {
  const q = params.q?.trim();
  const textKeys = q
    ? (
        await client.attributeDef.findMany({
          where: { type: { in: ["TEXT", "SELECT"] } },
          select: { key: true },
          take: 50,
        })
      ).map((d) => d.key)
    : [];
  const rows = await client.product.findMany({
    where: {
      status: params.status,
      categoryId: params.categoryId,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              ...textKeys.map((key) => ({ attributes: { path: [key], string_contains: q } })),
            ],
          }
        : {}),
    },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: LIST_MAX + 1,
    ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
    select: {
      id: true,
      name: true,
      status: true,
      priceTwd: true,
      attributes: true,
      updatedAt: true,
      category: { select: { id: true, name: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { storageKey: true } },
      _count: { select: { images: true } },
    },
  });
  return {
    rows: rows.slice(0, LIST_MAX),
    nextCursor: rows.length > LIST_MAX ? rows[LIST_MAX - 1].id : null,
  };
}

export async function getProductForEdit(id: string, client: Db = db()) {
  return client.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      specs: { orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}
