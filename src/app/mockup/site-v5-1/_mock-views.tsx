"use client";

// MOCKUP ONLY. The shop views take their data and their "send" from the page; on the real site
// that is the catalog read and the inquiry Server Action. Here: a fixed sample array filtered in
// the browser, and a send that waits half a second and pretends it worked.
import { useSearchParams } from "next/navigation";
import { type Attrs, type CategoryAttr, filtersFor, titleOf } from "@/components/shop/attrs";
import { type DetailProduct, ShopDetailView } from "@/components/shop/detail-view";
import type { SendInquiry } from "@/components/shop/inquiry-send";
import { useInquiryList } from "@/components/shop/inquiry-store";
import { type InquiryItem, ShopInquiryView } from "@/components/shop/inquiry-view";
import { type ListProduct, ShopListView } from "@/components/shop/list-view";
import type { ShopCategory } from "@/components/shop/shop-shell";

type Configs = Record<string, CategoryAttr[]>;

const nameOf = (configs: Configs, p: ListProduct) =>
  [titleOf(configs[p.categoryId] ?? [], p.attrs), p.name].filter(Boolean).join(" ");

const fakeSend =
  (products: ListProduct[], configs: Configs): SendInquiry =>
  (input) =>
    new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            ok: true,
            data: {
              id: "mock",
              titles: input.productIds
                .map((id) => products.find((p) => p.id === id))
                .filter((p): p is ListProduct => !!p)
                .map((p) => nameOf(configs, p)),
            },
          }),
        500,
      ),
    );

function matches(p: ListProduct, filters: CategoryAttr[], params: URLSearchParams) {
  return filters.every((f) => {
    const picked = params.getAll(`f.${f.key}`);
    if (!picked.length) return true;
    const v = p.attrs[f.key];
    if (v === undefined) return false;
    return f.type === "YEAR" || f.type === "NUMBER"
      ? Number(v) >= Number(picked[0])
      : picked.includes(String(v));
  });
}

export function MockListView({
  base,
  phone,
  categories,
  products,
  configs,
}: {
  base: string;
  phone: string;
  categories: ShopCategory[];
  products: ListProduct[];
  configs: Configs;
}) {
  const params = useSearchParams();
  const cat = params.get("cat") ?? "";
  const q = (params.get("q") ?? "").trim().toLowerCase();
  const sort = params.get("sort") ?? "new";
  const configOf = (p: ListProduct) => configs[p.categoryId] ?? [];
  const searchable = (p: ListProduct) =>
    [titleOf(configOf(p), p.attrs), p.name, ...Object.values(p.attrs as Attrs)]
      .join(" ")
      .toLowerCase();
  const inQuery = products.filter((p) => !q || searchable(p).includes(q));
  const inCat = inQuery.filter((p) => !cat || p.categoryId === cat);
  const filters = filtersFor(cat ? [configs[cat] ?? []] : Object.values(configs));
  const shown = inCat
    .filter((p) => matches(p, filters, params))
    .sort((a, b) => {
      if (sort === "new") return 0;
      if (a.priceTwd === undefined || b.priceTwd === undefined)
        return (a.priceTwd === undefined ? 1 : 0) - (b.priceTwd === undefined ? 1 : 0); // 歡迎詢價 last
      return (sort === "priceAsc" ? 1 : -1) * (a.priceTwd - b.priceTwd);
    });
  const values: Record<string, Record<string, number>> = {};
  for (const f of filters) {
    values[f.key] = {};
    for (const p of inCat) {
      const v = p.attrs[f.key];
      if (v !== undefined) values[f.key][String(v)] = (values[f.key][String(v)] ?? 0) + 1;
    }
  }
  return (
    <ShopListView
      base={base}
      phone={phone}
      categories={categories}
      products={shown}
      total={shown.length}
      facets={{
        all: inQuery.length,
        categories: Object.fromEntries(
          categories.map((x) => [x.id, inQuery.filter((p) => p.categoryId === x.id).length]),
        ),
        values,
      }}
      nextCursor={null}
      configs={configs}
    />
  );
}

export function MockDetailView(
  props: Omit<Parameters<typeof ShopDetailView>[0], "send"> & { product: DetailProduct },
) {
  return <ShopDetailView {...props} send={fakeSend([props.product], props.configs)} />;
}

// Review states without touching the visitor's real list (docs/mockups): ?demo=empty|sold|success.
const DEMO: Record<string, string[]> = { sold: ["p1", "p3", "p4"], success: ["p1", "p3"] };

export function MockInquiryView({
  base,
  phone,
  products,
  configs,
}: {
  base: string;
  phone: string;
  products: InquiryItem[];
  configs: Configs;
}) {
  const demo = useSearchParams().get("demo") ?? "";
  const list = useInquiryList();
  const fixed = demo === "empty" ? [] : DEMO[demo];
  const ids = fixed ?? list.ids;
  const items = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is InquiryItem => !!p);
  return (
    <ShopInquiryView
      key={demo}
      base={base}
      phone={phone}
      items={items}
      configs={configs}
      onRemove={(id) => (fixed ? undefined : list.remove(id))}
      onSent={() => (fixed ? undefined : list.clear())}
      send={fakeSend(products, configs)}
      initialSent={demo === "success" ? items.map((p) => nameOf(configs, p)) : null}
    />
  );
}
