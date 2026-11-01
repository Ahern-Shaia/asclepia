import { AdminShell } from "@/components/admin/admin-shell";
import { toFormConfigs } from "@/components/admin/catalog-data";
import { ProductEditor } from "@/components/admin/product-editor";
import { listCategoryConfigs } from "@/modules/catalog/server/attributes";
import { listCategories } from "@/modules/catalog/server/categories";
import { TRANSITIONS } from "@/modules/catalog/server/products";
import { requireAdmin } from "@/server/auth";

export default async function Page() {
  const admin = await requireAdmin();
  const [categories, configs] = await Promise.all([listCategories(), listCategoryConfigs()]);
  return (
    <AdminShell base="/admin" active="products" user={admin.email}>
      <ProductEditor
        product={{
          status: "DRAFT",
          name: "",
          attributes: {},
          priceTwd: null,
          highlights: [],
          features: [],
          specs: [],
          specNote: "",
          sourceName: "",
          sourceContact: "",
          imageCount: 0,
        }}
        transitions={TRANSITIONS.DRAFT}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        configs={toFormConfigs(configs)}
      />
    </AdminShell>
  );
}
