import { AdminShell } from "@/components/admin/admin-shell";
import { ProductsOverview } from "@/components/admin/products-overview";
import { requireAdmin } from "@/server/auth";
import { db } from "@/server/db";

export default async function Page() {
  const admin = await requireAdmin();
  const count = await db().product.count();
  return (
    <AdminShell base="/admin" active="products" user={admin.email}>
      <ProductsOverview count={count} />
    </AdminShell>
  );
}
