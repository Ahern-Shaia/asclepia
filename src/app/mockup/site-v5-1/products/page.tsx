import { ShopListView } from "@/components/shop/list-view";
import { ShopShell } from "@/components/shop/shop-shell";
import { categoryAttributes, SHOP, shopProducts } from "../../_attrs";
import { categories, company } from "../../_data";

export default function Page() {
  return (
    <ShopShell base={SHOP} company={company} categories={categories}>
      <ShopListView
        base={SHOP}
        phone={company.phone}
        categories={categories}
        products={shopProducts}
        configs={categoryAttributes}
      />
    </ShopShell>
  );
}
