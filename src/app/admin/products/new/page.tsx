import { AdminShell } from "@/components/admin/admin-shell";
import { toFormConfigs } from "@/components/admin/catalog-data";
import { ProductEditor } from "@/components/admin/product-editor";
import { listCategoryConfigs } from "@/modules/catalog/server/attributes";
import { listCategories } from "@/modules/catalog/server/categories";
import { TRANSITIONS } from "@/modules/catalog/server/products";
import { countNewInquiries } from "@/modules/inquiry/server/admin";
import { requireAdmin } from "@/server/auth";

// Every back-office page reads the session, which can't be in the static shell; it blocks on the
// server by design (next docs: authentication-with-cache-components; `use cache: private` is
// banned by stack-rules P7-1).
export const instant = false;

export default async function Page() {
  const admin = await requireAdmin();
  const [categories, configs, newCount] = await Promise.all([
    listCategories(),
    listCategoryConfigs(),
    countNewInquiries(),
  ]);
  return (
    <AdminShell base="/admin" active="products" user={admin.email} newInquiries={newCount}>
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
          images: [],
        }}
        transitions={TRANSITIONS.DRAFT}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        configs={toFormConfigs(configs)}
      />
    </AdminShell>
  );
}
