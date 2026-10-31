import { notFound } from "next/navigation";
import { ProductEditView } from "@/components/admin/product-edit-view";
import { categories, products } from "../../../_data";
import { ADMIN } from "../../../_adapters";
import { AdminFrame } from "../../_frame";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = products.find((x) => x.id === id);
  if (!p) notFound();
  return (
    <AdminFrame active="products">
      <ProductEditView
        base={ADMIN}
        isNew={false}
        categories={categories}
        product={{ ...p, updatedBy: "staff@example.com", updatedAt: p.updatedAt }}
      />
    </AdminFrame>
  );
}
