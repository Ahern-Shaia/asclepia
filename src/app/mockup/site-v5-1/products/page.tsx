import { ShopShell } from "@/components/shop/shop-shell";
import { categoryAttributes, SHOP, shopProducts } from "../../_attrs";
import { categories, company } from "../../_data";
import { MockListView } from "../_mock-views";

export default function Page() {
  return (
    <ShopShell base={SHOP} company={company} categories={categories} mock>
      <MockListView
        base={SHOP}
        phone={company.phone}
        categories={categories}
        products={shopProducts}
        configs={categoryAttributes}
      />
    </ShopShell>
  );
}
