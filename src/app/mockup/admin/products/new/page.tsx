import { ProductEditView } from "@/components/admin/product-edit-view";
import { categories } from "../../../_data";
import { ADMIN } from "../../../_adapters";
import { AdminFrame } from "../../_frame";

export default function Page() {
  return (
    <AdminFrame active="products">
      <ProductEditView
        base={ADMIN}
        isNew
        categories={categories}
        product={{ status: "DRAFT", images: [], highlights: [], specs: [], features: [] }}
      />
    </AdminFrame>
  );
}
