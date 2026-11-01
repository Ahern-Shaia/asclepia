// MOCKUP DATA — the seed attribute library (docs/modules/site-config.md §4.1): the company's
// current equipment fields expressed as admin-defined attributes.
import type { AttrDef, Attrs, CategoryAttr } from "@/components/shop/attrs";
import { brands, categories, type MockProduct, products, publicProducts } from "./_data";

export const attributeDefs: AttrDef[] = [
  { key: "brand", label: "品牌", type: "SELECT", options: brands },
  { key: "model", label: "型號", type: "TEXT" },
  { key: "nameEn", label: "英文品名", type: "TEXT" },
  { key: "year", label: "年份", type: "YEAR" },
  { key: "condition", label: "狀況", type: "SELECT", options: ["近新", "良好", "堪用"] },
  { key: "conditionNote", label: "狀況說明", type: "TEXT" },
  { key: "warranty", label: "保固", type: "TEXT" },
  { key: "licenseNo", label: "醫療器材許可證字號", type: "TEXT" },
];

type Flags = Omit<CategoryAttr, keyof AttrDef>;
const def = (key: string) => attributeDefs.find((d) => d.key === key)!;
const pick = (key: string, flags: Partial<Flags>): CategoryAttr => {
  return {
    ...def(key),
    required: false,
    inTitle: false,
    onCard: false,
    inNameplate: true,
    filterable: false,
    ...flags,
  };
};

const equipment = [
  pick("brand", { required: true, inTitle: true, filterable: true }),
  pick("model", { required: true, inTitle: true }),
  pick("nameEn", {}),
  pick("year", { onCard: true, filterable: true }),
  pick("condition", { required: true, onCard: true, filterable: true }),
  pick("conditionNote", {}),
  pick("warranty", { onCard: true }),
];
// The licence number is only ticked for categories whose items are registered medical devices.
const medical = [...equipment, pick("licenseNo", {})];

export const categoryAttributes: Record<string, CategoryAttr[]> = {
  ultrasound: medical,
  monitor: medical,
  analyzer: medical,
  dental: medical,
  centrifuge: equipment,
  microscope: equipment,
};

// How many products (any status) carry a value for this attribute: deleting or retyping is blocked
// while this is non-zero (site-config.md §4.1).
export const usedBy = (key: string) =>
  products.filter((p) => {
    const v = attrsOf(p)[key];
    return v !== undefined && v !== "";
  }).length;

export function attrsOf(p: MockProduct): Attrs {
  const [condition, conditionNote] = (p.condition ?? "").split("，");
  return {
    brand: p.brand,
    model: p.model,
    nameEn: p.nameEn,
    year: p.year,
    condition: condition === "可用" ? "堪用" : condition || undefined,
    conditionNote,
    warranty: p.warranty,
    licenseNo: p.licenseNo,
  };
}

// "新到" is derived (two most recently updated public items), not a stored status.
const newest = [...publicProducts]
  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  .slice(0, 2)
  .map((p) => p.id);

export type ShopProduct = {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  attrs: Attrs;
  priceTwd?: number;
  sold: boolean;
  isNew: boolean;
  highlights: string[];
  specs: { label: string; value: string }[];
  features: string[];
};

export const toShop = (p: MockProduct): ShopProduct => ({
  id: p.id,
  categoryId: p.categoryId,
  categoryName: categories.find((c) => c.id === p.categoryId)?.name ?? "—",
  name: p.nameZh,
  attrs: attrsOf(p),
  priceTwd: p.priceTwd,
  sold: p.status === "SOLD",
  isNew: newest.includes(p.id),
  highlights: p.highlights,
  specs: p.specs,
  features: p.features,
});

export const shopProducts = publicProducts.map(toShop);
export const SHOP = "/mockup/site-v5-1";
