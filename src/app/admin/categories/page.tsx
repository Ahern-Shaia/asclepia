import { AdminShell } from "@/components/admin/admin-shell";
import { CategoriesView } from "@/components/admin/categories-view";
import { listCategories } from "@/modules/catalog/server/categories";
import { requireAdmin } from "@/server/auth";

// Every back-office page reads the session, which can't be in the static shell; it blocks on the
// server by design (next docs: authentication-with-cache-components; `use cache: private` is
// banned by stack-rules P7-1).
export const instant = false;

export default async function Page() {
  const admin = await requireAdmin();
  const categories = await listCategories();
  return (
    <AdminShell base="/admin" active="categories" user={admin.email}>
      <CategoriesView
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          products: c._count.products,
        }))}
      />
    </AdminShell>
  );
}
