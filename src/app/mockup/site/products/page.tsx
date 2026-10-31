import { ListView } from "@/components/catalog/list-view";
import { brands, categories, publicProducts } from "../../_data";
import { SITE, toCard } from "../../_adapters";

export default function Page() {
  return (
    <ListView
      base={SITE}
      categories={categories}
      brands={brands}
      products={publicProducts.map(toCard)}
    />
  );
}
