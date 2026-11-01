"use client";

import { FilterOutlined, PhoneOutlined } from "@ant-design/icons";
import { Drawer } from "antd";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import s from "@/components/home-v5/home-v5.module.css";
import { shopCopy } from "@/copy/shop";
import { type Attrs, type CategoryAttr, filtersFor, formatValue, titleOf } from "./attrs";
import { ShopCard, type ShopCardProduct } from "./product-card";
import type { ShopCategory } from "./shop-shell";
import l from "./shop.module.css";

const c = shopCopy.list;
const YEAR_STEPS = [2020, 2015, 2010];

export type ListProduct = ShopCardProduct & { categoryId: string };
type Sort = keyof typeof c.sortOptions;

// Filter state lives in the URL (CLAUDE.md §2.2): cat, q, sort, and one `f.<key>` param per
// selected attribute value (YEAR filters hold a single "from" year).
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

export function ShopListView({
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
  configs: Record<string, CategoryAttr[]>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const cat = params.get("cat") ?? "";
  const q = (params.get("q") ?? "").trim();
  const sort = (params.get("sort") as Sort) || "new";
  const current = categories.find((x) => x.id === cat);

  const configOf = (p: { categoryId: string }) => configs[p.categoryId] ?? [];
  const searchable = (p: ListProduct) =>
    [titleOf(configOf(p), p.attrs), p.name, ...Object.values(p.attrs as Attrs)]
      .join(" ")
      .toLowerCase();
  const inQuery = products.filter((p) => !q || searchable(p).includes(q.toLowerCase()));
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
  const active = filters.reduce((n, f) => n + params.getAll(`f.${f.key}`).length, 0);

  const go = (mutate: (sp: URLSearchParams) => void) => {
    const sp = new URLSearchParams(params.toString());
    mutate(sp);
    router.replace(`${pathname}${sp.size ? `?${sp}` : ""}`, { scroll: false });
  };
  const toggleValue = (key: string, value: string) =>
    go((sp) => {
      const all = sp.getAll(`f.${key}`);
      sp.delete(`f.${key}`);
      for (const v of all.includes(value) ? all.filter((x) => x !== value) : [...all, value])
        sp.append(`f.${key}`, v);
    });
  const setYear = (key: string, value: string) =>
    go((sp) => (value ? sp.set(`f.${key}`, value) : sp.delete(`f.${key}`)));
  const clear = () => go((sp) => filters.forEach((f) => sp.delete(`f.${f.key}`)));
  const catHref = (id: string) => {
    const sp = new URLSearchParams();
    if (id) sp.set("cat", id);
    if (q) sp.set("q", q);
    return `${pathname}${sp.size ? `?${sp}` : ""}`;
  };

  const count = (key: string, value: string) =>
    inCat.filter((p) => String(p.attrs[key] ?? "") === value).length;

  const panel = (
    <div className={l.filters}>
      <fieldset>
        <legend>{c.category}</legend>
        <ul className={l.catList}>
          <li>
            <Link href={catHref("")} aria-current={!cat ? "page" : undefined}>
              {c.allCategories}
              <span>{inQuery.length}</span>
            </Link>
          </li>
          {categories.map((x) => (
            <li key={x.id}>
              <Link href={catHref(x.id)} aria-current={cat === x.id ? "page" : undefined}>
                {x.name}
                <span>{inQuery.filter((p) => p.categoryId === x.id).length}</span>
              </Link>
            </li>
          ))}
        </ul>
      </fieldset>
      {filters.map((f) => {
        const picked = params.getAll(`f.${f.key}`);
        if (f.type === "YEAR" || f.type === "NUMBER")
          return (
            <fieldset key={f.key}>
              <legend>{f.label}</legend>
              {["", ...YEAR_STEPS.map(String)].map((y) => (
                <label key={y} className={l.option}>
                  <input
                    type="radio"
                    name={`f.${f.key}`}
                    checked={(picked[0] ?? "") === y}
                    onChange={() => setYear(f.key, y)}
                  />
                  {y ? c.yearFrom(Number(y)) : c.yearAny}
                </label>
              ))}
            </fieldset>
          );
        const options = (f.options ?? []).filter((o) => count(f.key, o) > 0 || picked.includes(o));
        if (!options.length) return null;
        return (
          <fieldset key={f.key}>
            <legend>{f.label}</legend>
            {options.map((o) => (
              <label key={o} className={l.option}>
                <input
                  type="checkbox"
                  checked={picked.includes(o)}
                  onChange={() => toggleValue(f.key, o)}
                />
                {formatValue(f, o)}
                <span className={l.optionCount}>{count(f.key, o)}</span>
              </label>
            ))}
          </fieldset>
        );
      })}
      {active > 0 && (
        <button type="button" className={l.clearBtn} onClick={clear}>
          {c.clear}
        </button>
      )}
    </div>
  );

  const heading = q ? c.keyword(q) : (current?.name ?? c.title);

  return (
    <main className={`${s.container} ${l.listPage}`}>
      <nav aria-label="麵包屑" className={l.crumbs}>
        <Link href={base}>{shopCopy.crumbs.home}</Link>
        <span aria-hidden>/</span>
        {current ? (
          <>
            <Link href={`${base}/products`}>{shopCopy.crumbs.products}</Link>
            <span aria-hidden>/</span>
            <span aria-current="page">{current.name}</span>
          </>
        ) : (
          <span aria-current="page">{shopCopy.crumbs.products}</span>
        )}
      </nav>

      <div className={l.listHead}>
        <h1>
          {heading}
          <span className={l.resultCount}>{c.resultCount(shown.length)}</span>
        </h1>
        <div className={l.listTools}>
          <button
            type="button"
            className={`${l.filterBtn} ${l.narrowOnly}`}
            onClick={() => setDrawer(true)}
          >
            <FilterOutlined aria-hidden /> {c.filterOpen(active)}
          </button>
          <label className={l.sort}>
            <span>{c.sort}</span>
            <select
              value={sort}
              onChange={(e) =>
                go((sp) =>
                  e.target.value === "new" ? sp.delete("sort") : sp.set("sort", e.target.value),
                )
              }
            >
              {Object.entries(c.sortOptions).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className={l.listBody}>
        <aside className={l.wideOnly} aria-label={c.filters}>
          {panel}
        </aside>
        {shown.length ? (
          <ul className={`${s.cards} ${l.listCards}`}>
            {shown.map((p) => (
              <ShopCard key={p.id} base={base} product={p} config={configOf(p)} />
            ))}
          </ul>
        ) : (
          <div className={l.empty} role="status">
            <h2>{c.emptyTitle}</h2>
            <p>{c.emptyBody}</p>
            <div className={l.emptyActions}>
              {active > 0 && (
                <button type="button" className={l.clearBtn} onClick={clear}>
                  {c.clear}
                </button>
              )}
              <a href={`tel:${phone}`} className={l.callBtn}>
                <PhoneOutlined aria-hidden /> {c.emptyCall(phone)}
              </a>
            </div>
          </div>
        )}
      </div>

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={c.filters}
        placement="bottom"
        size="large"
        footer={
          <button type="button" className={l.applyBtn} onClick={() => setDrawer(false)}>
            {c.apply(shown.length)}
          </button>
        }
      >
        {panel}
      </Drawer>
    </main>
  );
}
