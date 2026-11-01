import { AdminShell } from "@/components/admin/admin-shell";
import { attrValues, formatTime, priceOf, toFormConfigs } from "@/components/admin/catalog-data";
import { ProductEditor, ProductMissing } from "@/components/admin/product-editor";
import { listCategoryConfigs } from "@/modules/catalog/server/attributes";
import { listCategories } from "@/modules/catalog/server/categories";
import { getProductForEdit, TRANSITIONS } from "@/modules/catalog/server/products";
import { countNewInquiries } from "@/modules/inquiry/server/admin";
import { requireAdmin } from "@/server/auth";

// Every back-office page reads the session, which can't be in the static shell; it blocks on the
// server by design (next docs: authentication-with-cache-components; `use cache: private` is
// banned by stack-rules P7-1).
export const instant = false;

export default async function Page({ params }: PageProps<"/admin/products/[id]">) {
  const admin = await requireAdmin();
  const { id } = await params;
  const [p, categories, configs, newCount] = await Promise.all([
    id.length <= 40 ? getProductForEdit(id) : null,
    listCategories(),
    listCategoryConfigs(),
    countNewInquiries(),
  ]);
  return (
    <AdminShell base="/admin" active="products" user={admin.email} newInquiries={newCount}>
      {p ? (
        <ProductEditor
          product={{
            id: p.id,
            status: p.status,
            categoryId: p.categoryId,
            name: p.name,
            attributes: attrValues(p.attributes),
            priceTwd: priceOf(p.priceTwd),
            highlights: p.highlights,
            features: p.features,
            specs: p.specs.map((s) => ({ label: s.label, value: s.value })),
            specNote: p.specNote ?? "",
            sourceName: p.sourceName ?? "",
            sourceContact: p.sourceContact ?? "",
            images: p.images.map((i) => ({ id: i.id, storageKey: i.storageKey })),
            updatedAt: p.updatedAt.toISOString(),
            updatedAtText: formatTime(p.updatedAt),
          }}
          transitions={TRANSITIONS[p.status]}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          configs={toFormConfigs(configs)}
        />
      ) : (
        <ProductMissing />
      )}
    </AdminShell>
  );
}
