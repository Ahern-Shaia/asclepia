import { AdminShell } from "@/components/admin/admin-shell";
import { attrValues, formatTime, priceOf, toFormConfigs } from "@/components/admin/catalog-data";
import { InquiryDetail, InquiryMissing } from "@/components/admin/inquiry-detail";
import { titleOf } from "@/components/shop/attrs";
import { listCategoryConfigs } from "@/modules/catalog/server/attributes";
import type { InquiryStatusValue } from "@/modules/inquiry/admin-input";
import { countNewInquiries, getInquiry } from "@/modules/inquiry/server/admin";
import { requireAdmin } from "@/server/auth";

// Every back-office page reads the session, which can't be in the static shell (see products/page).
export const instant = false;

// Snapshots are built in SQL with single spaces; compare titles whitespace-insensitively.
const squash = (s: string) => s.replace(/\s+/g, " ").trim();

export default async function Page({ params }: PageProps<"/admin/inquiries/[id]">) {
  const admin = await requireAdmin();
  const { id } = await params;
  const [inquiry, rawConfigs, newCount] = await Promise.all([
    id.length <= 40 ? getInquiry(id) : null,
    listCategoryConfigs(),
    countNewInquiries(),
  ]);
  const configs = toFormConfigs(rawConfigs);
  return (
    <AdminShell base="/admin" active="inquiries" user={admin.email} newInquiries={newCount}>
      {inquiry ? (
        <InquiryDetail
          key={`${inquiry.status}:${inquiry.note ?? ""}`}
          inquiry={{
            id: inquiry.id,
            createdAt: formatTime(inquiry.createdAt),
            keepUntil: formatTime(inquiry.purgeAfter).slice(0, 10),
            status: inquiry.status as InquiryStatusValue,
            name: inquiry.name,
            phone: inquiry.phone,
            email: inquiry.email,
            org: inquiry.org,
            message: inquiry.message,
            consentText: inquiry.consentText,
            note: inquiry.note,
            items: inquiry.items.map((it) => {
              const p = it.product;
              const title = titleOf(configs[p.categoryId] ?? [], attrValues(p.attributes));
              const now = squash([title, p.name].filter(Boolean).join(" "));
              const then = squash(it.titleSnap);
              return {
                productId: p.id,
                titleThen: then,
                priceThen: priceOf(it.priceSnap),
                titleNow: now,
                priceNow: priceOf(p.priceTwd),
                statusNow: p.status,
              };
            }),
          }}
        />
      ) : (
        <InquiryMissing />
      )}
    </AdminShell>
  );
}
