import { AdminShell } from "@/components/admin/admin-shell";
import { CategoriesView } from "@/components/admin/categories-view";
import { listCategories } from "@/modules/catalog/server/categories";
import { requireAdmin } from "@/server/auth";

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
