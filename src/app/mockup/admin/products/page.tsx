import { ProductsView } from "@/components/admin/products-view";
import { categories, products } from "../../_data";
import { ADMIN, categoryName } from "../../_adapters";
import { AdminFrame } from "../_frame";

export default function Page() {
  return (
    <AdminFrame active="products">
      <ProductsView
        base={ADMIN}
        categories={categories}
        rows={products.map((p) => ({
          id: p.id,
          image: p.images[0],
          brand: p.brand,
          model: p.model,
          nameZh: p.nameZh,
          category: categoryName(p.categoryId),
          licenseNo: p.licenseNo,
          priceTwd: p.priceTwd,
          status: p.status,
          updatedAt: p.updatedAt,
        }))}
      />
    </AdminFrame>
  );
}
