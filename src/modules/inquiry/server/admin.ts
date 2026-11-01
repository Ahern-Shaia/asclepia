import "server-only";
import type { InquiryStatus } from "@/generated/prisma/client";
import { audit } from "@/server/audit";
import { type Db, db } from "@/server/db";
import { DomainError } from "@/server/errors";

export const INQUIRY_PAGE = 48; // performance-baseline §0 #2

// Back-office list (inquiry.md B4): newest first, keyset-paginated. Contact fields are shown here
// because calling back is the whole job of this page; it is behind requireAdmin like every admin read.
export async function listInquiries(
  params: { status?: InquiryStatus; cursor?: string },
  client: Db = db(),
) {
  const [rows, groups] = await Promise.all([
    client.inquiry.findMany({
      where: { status: params.status },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: INQUIRY_PAGE + 1,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
      select: {
        id: true,
        createdAt: true,
        status: true,
        name: true,
        phone: true,
        org: true,
        items: { orderBy: { sortOrder: "asc" }, take: 1, select: { titleSnap: true } },
        _count: { select: { items: true } },
      },
    }),
    client.inquiry.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const counts = { NEW: 0, CONTACTED: 0, CLOSED_WON: 0, CLOSED_LOST: 0 } as Record<
    InquiryStatus,
    number
  >;
  for (const g of groups) counts[g.status] = g._count._all;
  return {
    rows: rows.slice(0, INQUIRY_PAGE),
    nextCursor: rows.length > INQUIRY_PAGE ? rows[INQUIRY_PAGE - 1].id : null,
    counts,
  };
}

// The menu badge on every back-office page.
export const countNewInquiries = (client: Db = db()) =>
  client.inquiry.count({ where: { status: "NEW" } });

export async function getInquiry(id: string, client: Db = db()) {
  return client.inquiry.findUnique({
    where: { id },
    select: {
      id: true,
      createdAt: true,
      purgeAfter: true,
      status: true,
      name: true,
      phone: true,
      email: true,
      org: true,
      message: true,
      consentText: true,
      note: true,
      items: {
        orderBy: { sortOrder: "asc" },
        select: {
          titleSnap: true,
          priceSnap: true,
          product: {
            select: {
              id: true,
              name: true,
              status: true,
              priceTwd: true,
              attributes: true,
              categoryId: true,
            },
          },
        },
      },
    },
  });
}

// Status and internal note (inquiry.md §7-bis.4). Applies only if the row still holds what the form
// was opened with, so two people answering the same inquiry can't silently overwrite each other.
// The audit diff never carries the note: it is free text about a person.
export async function updateInquiry(
  input: {
    id: string;
    status: InquiryStatus;
    note: string | null;
    expected: { status: InquiryStatus; note: string | null };
  },
  actor: string,
  client: Db = db(),
) {
  const { id, status, note, expected } = input;
  if (status === expected.status && note === expected.note) return { id, status, note };
  return client.$transaction(async (tx) => {
    const n = await tx.inquiry.updateMany({
      where: { id, status: expected.status, note: expected.note },
      data: { status, note },
    });
    if (n.count !== 1) {
      const exists = await tx.inquiry.count({ where: { id } });
      throw new DomainError(exists ? "CONFLICT" : "NOT_FOUND");
    }
    await audit(
      {
        actorId: actor,
        action: "inquiry.update",
        targetType: "inquiry",
        targetId: id,
        result: "ok",
        diff: {
          ...(status !== expected.status ? { status: { from: expected.status, to: status } } : {}),
          noteChanged: note !== expected.note,
        },
      },
      tx,
    );
    return { id, status, note };
  });
}

// On the person's request (inquiry.md §7-bis.5). Items cascade; the products are untouched.
// The audit row records only the id and the item count, never the content.
export async function deleteInquiry(id: string, actor: string, client: Db = db()) {
  return client.$transaction(async (tx) => {
    const itemCount = await tx.inquiryItem.count({ where: { inquiryId: id } });
    const n = await tx.inquiry.deleteMany({ where: { id } });
    if (n.count !== 1) throw new DomainError("NOT_FOUND");
    await audit(
      {
        actorId: actor,
        action: "inquiry.delete",
        targetType: "inquiry",
        targetId: id,
        result: "ok",
        diff: { itemCount },
      },
      tx,
    );
    return { id };
  });
}
