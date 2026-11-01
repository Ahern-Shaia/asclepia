import { ShopShell } from "@/components/shop/shop-shell";
import { categoryAttributes, SHOP, shopProducts } from "../../_attrs";
import { categories, company } from "../../_data";
import { MockInquiryView } from "../_mock-views";

export default function Page() {
  return (
    <ShopShell base={SHOP} company={company} categories={categories} mock>
      <MockInquiryView
        base={SHOP}
        phone={company.phone}
        products={shopProducts}
        configs={categoryAttributes}
      />
    </ShopShell>
  );
}
