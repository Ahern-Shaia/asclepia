import { AdminShell } from "@/components/admin/admin-shell";
import { type LibraryDef, AttributesView, type Sample } from "@/components/admin/attributes-view";
import { attrValues, priceOf, toFormConfigs } from "@/components/admin/catalog-data";
import { listAttributeDefs, listCategoryConfigs } from "@/modules/catalog/server/attributes";
import { listCategories } from "@/modules/catalog/server/categories";
import { listProducts } from "@/modules/catalog/server/products";
import { requireAdmin } from "@/server/auth";

// Every back-office page reads the session, which can't be in the static shell; it blocks on the
// server by design (next docs: authentication-with-cache-components; `use cache: private` is
// banned by stack-rules P7-1).
export const instant = false;

export default async function Page() {
  const admin = await requireAdmin();
  const [defs, categories, configs, recent] = await Promise.all([
    listAttributeDefs(),
    listCategories(),
    listCategoryConfigs(),
    listProducts({}),
  ]);
  const library: LibraryDef[] = defs.map((d) => ({
    id: d.id,
    key: d.key,
    label: d.label,
    type: d.type,
    options: d.options,
    unit: d.unit ?? undefined,
    maxLength: d.maxLength,
    usedBy: d.usedBy,
    categoryCount: d._count.categories,
    // Removing an option that products still use is checked by the server, which names them.
    optionUse: {},
  }));
  // Preview data: the most recently edited product of each category (from the first list page).
  const samples: Record<string, Sample> = {};
  for (const p of recent.rows)
    samples[p.category.id] ??= {
      name: p.name,
      attrs: attrValues(p.attributes),
      priceTwd: priceOf(p.priceTwd) ?? undefined,
    };
  return (
    <AdminShell base="/admin" active="attributes" user={admin.email}>
      <AttributesView
        live
        defs={library}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        configs={toFormConfigs(configs)}
        samples={samples}
      />
    </AdminShell>
  );
}
