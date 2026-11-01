import { AdminShell } from "@/components/admin/admin-shell";
import { formatTime } from "@/components/admin/catalog-data";
import { InquiryList } from "@/components/admin/inquiry-list";
import { INQUIRY_STATUSES, type InquiryStatusValue } from "@/modules/inquiry/admin-input";
import { INQUIRY_PAGE, listInquiries } from "@/modules/inquiry/server/admin";
import { requireAdmin } from "@/server/auth";

// Every back-office page reads the session, which can't be in the static shell (see products/page).
export const instant = false;

export default async function Page({ searchParams }: PageProps<"/admin/inquiries">) {
  const admin = await requireAdmin();
  const sp = await searchParams;
  const status = INQUIRY_STATUSES.find((s) => s === sp.status);
  const cursor = typeof sp.cursor === "string" && sp.cursor.length <= 40 ? sp.cursor : undefined;
  const list = await listInquiries({ status, cursor });
  return (
    <AdminShell base="/admin" active="inquiries" user={admin.email} newInquiries={list.counts.NEW}>
      <InquiryList
        rows={list.rows.map((r) => ({
          id: r.id,
          createdAt: formatTime(r.createdAt),
          name: r.name,
          org: r.org,
          phone: r.phone,
          firstItem: r.items[0]?.titleSnap ?? "—",
          itemCount: r._count.items,
          status: r.status as InquiryStatusValue,
        }))}
        nextCursor={list.nextCursor}
        status={status ?? ""}
        paged={!!cursor}
        counts={list.counts}
        pageSize={INQUIRY_PAGE}
      />
    </AdminShell>
  );
}
