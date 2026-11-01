import { notFound } from "next/navigation";
import { ShopShell } from "@/components/shop/shop-shell";
import { categoryAttributes, SHOP, shopProducts } from "../../../_attrs";
import { categories, company, sampleNotes } from "../../../_data";
import { MockDetailView } from "../../_mock-views";

export function generateStaticParams() {
  return shopProducts.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = shopProducts.find((x) => x.id === id);
  if (!p) notFound();
  const related = shopProducts
    .filter((x) => x.id !== p.id)
    .sort((a, b) => Number(b.categoryId === p.categoryId) - Number(a.categoryId === p.categoryId))
    .slice(0, 4);
  return (
    <ShopShell base={SHOP} company={company} categories={categories} mock>
      <MockDetailView
        base={SHOP}
        phone={company.phone}
        product={p}
        config={categoryAttributes[p.categoryId] ?? []}
        related={related}
        configs={categoryAttributes}
        terms={sampleNotes.terms}
      />
    </ShopShell>
  );
}
