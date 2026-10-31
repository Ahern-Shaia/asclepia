import { notFound } from "next/navigation";
import { DetailView } from "@/components/catalog/detail-view";
import { company, publicProducts } from "../../../_data";
import { categoryName, SITE, toCard } from "../../../_adapters";

export function generateStaticParams() {
  return publicProducts.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = publicProducts.find((x) => x.id === id);
  if (!p) notFound();
  return (
    <DetailView
      base={SITE}
      phone={company.phone}
      product={{
        ...p,
        sold: p.status === "SOLD",
        categoryName: categoryName(p.categoryId),
        categoryHref: `${SITE}/products?cat=${p.categoryId}`,
      }}
      related={publicProducts
        .filter((x) => x.categoryId === p.categoryId && x.id !== p.id)
        .concat(publicProducts.filter((x) => x.id !== p.id))
        .slice(0, 4)
        .map(toCard)}
    />
  );
}
