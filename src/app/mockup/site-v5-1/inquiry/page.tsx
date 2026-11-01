import { ShopInquiryView } from "@/components/shop/inquiry-view";
import { ShopShell } from "@/components/shop/shop-shell";
import { categoryAttributes, SHOP, shopProducts } from "../../_attrs";
import { categories, company } from "../../_data";

export default function Page() {
  return (
    <ShopShell base={SHOP} company={company} categories={categories}>
      <ShopInquiryView base={SHOP} products={shopProducts} configs={categoryAttributes} />
    </ShopShell>
  );
}
