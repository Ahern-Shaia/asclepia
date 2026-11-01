import { AdminShell } from "@/components/admin/admin-shell";
import { formatTime } from "@/components/admin/catalog-data";
import { SiteSettings } from "@/components/admin/site-settings";
import { countNewInquiries } from "@/modules/inquiry/server/admin";
import { getSettings } from "@/modules/site-config/server/admin";
import { requireAdmin } from "@/server/auth";

// Session-bound like every back-office page (see admin/categories/page.tsx).
export const instant = false;

export default async function Page() {
  const admin = await requireAdmin();
  const [settings, newCount] = await Promise.all([getSettings(), countNewInquiries()]);
  const stamp = <T extends { savedAt: Date | null }>(x: T) => ({
    ...x,
    savedAt: x.savedAt ? formatTime(x.savedAt) : null,
  });
  return (
    <AdminShell base="/admin" active="settings" user={admin.email} newInquiries={newCount}>
      <SiteSettings data={{ profile: stamp(settings.profile), notes: stamp(settings.notes) }} />
    </AdminShell>
  );
}
