// Admin-defined product attributes (docs/modules/site-config.md §4.1). Views never name a field
// such as "brand": they ask the category's attribute config what goes in the title, on the card,
// in the nameplate and in the filters.

export type AttrType = "TEXT" | "NUMBER" | "YEAR" | "SELECT";
export type AttrValue = string | number;

export type AttrDef = {
  key: string;
  label: string;
  type: AttrType;
  options?: string[];
  unit?: string;
};

export type CategoryAttr = AttrDef & {
  required: boolean;
  inTitle: boolean;
  onCard: boolean;
  inNameplate: boolean;
  filterable: boolean;
};

export type Attrs = Record<string, AttrValue | undefined>;

const has = (v: AttrValue | undefined): v is AttrValue => v !== undefined && v !== "";

export function formatValue(def: AttrDef, v: AttrValue): string {
  if (def.type === "YEAR") return `${v} 年`;
  if (def.unit) return `${v} ${def.unit}`;
  return String(v);
}

// Card meta line: SELECT and YEAR values read on their own ("2019 年 · 良好");
// free text needs its label to make sense ("保固 三個月").
function cardText(def: AttrDef, v: AttrValue): string {
  return def.type === "TEXT" || def.type === "NUMBER"
    ? `${def.label} ${formatValue(def, v)}`
    : formatValue(def, v);
}

export const titleOf = (config: CategoryAttr[], attrs: Attrs) =>
  config
    .filter((a) => a.inTitle && has(attrs[a.key]))
    .map((a) => String(attrs[a.key]))
    .join(" ");

export const cardMeta = (config: CategoryAttr[], attrs: Attrs) =>
  config
    .filter((a) => a.onCard && has(attrs[a.key]))
    .map((a) => cardText(a, attrs[a.key]!))
    .join(" · ");

export const nameplateRows = (config: CategoryAttr[], attrs: Attrs) =>
  config
    .filter((a) => a.inNameplate && has(attrs[a.key]))
    .map((a) => ({ key: a.key, label: a.label, value: formatValue(a, attrs[a.key]!) }));

// Filters shown on the list page: the union of filterable attributes across the categories in view,
// deduplicated by key (a site-wide attribute library means "品牌" is one filter, not one per category).
export function filtersFor(configs: CategoryAttr[][]): CategoryAttr[] {
  const seen = new Map<string, CategoryAttr>();
  for (const config of configs)
    for (const a of config) if (a.filterable && !seen.has(a.key)) seen.set(a.key, a);
  return [...seen.values()];
}
