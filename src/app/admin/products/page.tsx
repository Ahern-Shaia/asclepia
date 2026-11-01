import { AdminShell } from "@/components/admin/admin-shell";
import {
  attrValues,
  formatTime,
  PRODUCT_STATUSES,
  type ProductStatus,
  priceOf,
  toFormConfigs,
} from "@/components/admin/catalog-data";
import { ProductList } from "@/components/admin/product-list";
import { titleOf } from "@/components/shop/attrs";
import { listCategories } from "@/modules/catalog/server/categories";
import { listCategoryConfigs } from "@/modules/catalog/server/attributes";
import { LIST_MAX, listProducts } from "@/modules/catalog/server/products";
import { requireAdmin } from "@/server/auth";

// Every back-office page reads the session, which can't be in the static shell; it blocks on the
// server by design (next docs: authentication-with-cache-components; `use cache: private` is
// banned by stack-rules P7-1).
export const instant = false;

const param = (v: string | string[] | undefined, max: number) =>
  typeof v === "string" && v.trim() && v.length <= max ? v.trim() : undefined;

export default async function Page({ searchParams }: PageProps<"/admin/products">) {
  const admin = await requireAdmin();
  const sp = await searchParams;
  const s = param(sp.status, 10);
  const filters = {
    status: PRODUCT_STATUSES.includes(s as ProductStatus) ? (s as ProductStatus) : undefined,
    categoryId: param(sp.category, 40),
    q: param(sp.q, 100),
    cursor: param(sp.cursor, 40),
  };
  const [list, categories, rawConfigs] = await Promise.all([
    listProducts(filters),
    listCategories(),
    listCategoryConfigs(),
  ]);
  const configs = toFormConfigs(rawConfigs);
  const rows = list.rows.map((p) => ({
    id: p.id,
    name: p.name,
    title: titleOf(configs[p.category.id] ?? [], attrValues(p.attributes)),
    category: p.category.name,
    status: p.status,
    priceTwd: priceOf(p.priceTwd),
    updatedAt: formatTime(p.updatedAt),
    imageCount: p._count.images,
  }));
  return (
    <AdminShell base="/admin" active="products" user={admin.email}>
      <ProductList
        rows={rows}
        nextCursor={list.nextCursor}
        filters={{
          status: filters.status ?? "",
          category: filters.categoryId ?? "",
          q: filters.q ?? "",
          paged: !!filters.cursor,
        }}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        pageSize={LIST_MAX}
      />
    </AdminShell>
  );
}
