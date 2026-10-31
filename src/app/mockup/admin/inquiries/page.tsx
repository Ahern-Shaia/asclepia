import { InquiriesView } from "@/components/admin/inquiries-view";
import { inquiries, products } from "../../_data";
import { AdminFrame } from "../_frame";

export default function Page() {
  const name = (id: string) => {
    const p = products.find((x) => x.id === id);
    return p ? `${p.brand} ${p.model} ${p.nameZh}` : "—";
  };
  return (
    <AdminFrame active="inquiries">
      <InquiriesView rows={inquiries.map((q) => ({ ...q, product: name(q.productId) }))} />
    </AdminFrame>
  );
}
