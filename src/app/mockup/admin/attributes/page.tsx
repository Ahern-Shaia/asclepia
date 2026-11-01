import { type LibraryDef, AttributesView, type Sample } from "@/components/admin/attributes-view";
import { attributeDefs, attrsOf, categoryAttributes, usedBy } from "../../_attrs";
import { categories, products } from "../../_data";
import { AdminFrame } from "../_frame";

// Which products use each SELECT option, so the editor can block removing one that is in use.
const optionUse = (key: string, options: string[] = []) =>
  Object.fromEntries(
    options.map((o) => [
      o,
      products.filter((p) => attrsOf(p)[key] === o).map((p) => `${p.brand} ${p.model}`),
    ]),
  );

export default function Page() {
  const defs: LibraryDef[] = attributeDefs.map((d) => ({
    ...d,
    usedBy: usedBy(d.key),
    optionUse: optionUse(d.key, d.options),
  }));
  const samples: Record<string, Sample> = {};
  for (const c of categories) {
    const p = products.find((x) => x.categoryId === c.id);
    if (p) samples[c.id] = { name: p.nameZh, attrs: attrsOf(p), priceTwd: p.priceTwd };
  }
  return (
    <AdminFrame active="attributes">
      <AttributesView
        defs={defs}
        categories={categories.map(({ id, name }) => ({ id, name }))}
        configs={categoryAttributes}
        samples={samples}
      />
    </AdminFrame>
  );
}
