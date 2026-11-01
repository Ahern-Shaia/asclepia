"use client";

import { FilterOutlined, PhoneOutlined } from "@ant-design/icons";
import { Drawer } from "antd";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import s from "@/components/home-v5/home-v5.module.css";
import { shopCopy } from "@/copy/shop";
import { type CategoryAttr, filtersFor, formatValue } from "./attrs";
import { ShopCard, type ShopCardProduct } from "./product-card";
import { homeOf, type ShopCategory } from "./shop-shell";
import l from "./shop.module.css";

const c = shopCopy.list;
export const YEAR_STEPS = [2020, 2015, 2010];

export type ListProduct = ShopCardProduct & { categoryId: string };
export type ListSort = keyof typeof c.sortOptions;

// Counts next to each filter. `categories` follow the keyword only, `values` the keyword and the
// category (the same scopes the panel offers). null = not known: the panel shows no numbers.
export type ListFacets = {
  all: number | null;
  categories: Record<string, number> | null;
  values: Record<string, Record<string, number>> | null;
};

// Filter state lives in the URL (CLAUDE.md §2.2): cat, q, sort, cursor and one `f.<key>` param per
// selected attribute value (YEAR filters hold a single "from" year). The page decides what
// `products` holds for those params; this view only renders them and edits the URL.
export function ShopListView({
  base,
  phone,
  categories,
  products,
  total,
  facets,
  nextCursor,
  configs,
}: {
  base: string;
  phone: string;
  categories: ShopCategory[];
  products: ListProduct[];
  total: number;
  facets: ListFacets;
  nextCursor: string | null;
  configs: Record<string, CategoryAttr[]>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const [pending, startTransition] = useTransition();
  // The URL is the state, but the next URL only lands when the server has answered; the controls
  // show the requested state meanwhile.
  const [query, setQuery] = useOptimistic(params.toString());
  const view = new URLSearchParams(query);
  const cat = params.get("cat") ?? "";
  const q = (params.get("q") ?? "").trim();
  const sort = (view.get("sort") as ListSort) || "new";
  const current = categories.find((x) => x.id === cat);
  const filters = filtersFor(cat ? [configs[cat] ?? []] : Object.values(configs));
  const active = filters.reduce((n, f) => n + view.getAll(`f.${f.key}`).length, 0);

  const hrefWith = (mutate: (sp: URLSearchParams) => void, from = params.toString()) => {
    const sp = new URLSearchParams(from);
    mutate(sp);
    return `${pathname}${sp.size ? `?${sp}` : ""}`;
  };
  // Any change to what is listed starts again from the first page.
  const go = (mutate: (sp: URLSearchParams) => void) =>
    startTransition(() => {
      const href = hrefWith((sp) => {
        sp.delete("cursor");
        mutate(sp);
      }, query);
      setQuery(href.split("?")[1] ?? "");
      router.replace(href, { scroll: false });
    });
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
  const countOf = (key: string, value: string) => facets.values?.[key]?.[value];

  const panel = (
    <div className={l.filters}>
      <fieldset>
        <legend>{c.category}</legend>
        <ul className={l.catList}>
          <li>
            <Link href={catHref("")} aria-current={!cat ? "page" : undefined}>
              {c.allCategories}
              {facets.all !== null && <span>{facets.all}</span>}
            </Link>
          </li>
          {categories.map((x) => (
            <li key={x.id}>
              <Link href={catHref(x.id)} aria-current={cat === x.id ? "page" : undefined}>
                {x.name}
                {facets.categories && <span>{facets.categories[x.id] ?? 0}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </fieldset>
      {filters.map((f) => {
        const picked = view.getAll(`f.${f.key}`);
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
        const options = (f.options ?? []).filter(
          (o) => !facets.values || (countOf(f.key, o) ?? 0) > 0 || picked.includes(o),
        );
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
                {facets.values && <span className={l.optionCount}>{countOf(f.key, o) ?? 0}</span>}
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
  const paged = params.has("cursor");

  return (
    <main className={`${s.container} ${l.listPage}`}>
      <nav aria-label="麵包屑" className={l.crumbs}>
        <Link href={homeOf(base)}>{shopCopy.crumbs.home}</Link>
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
          <span className={l.resultCount}>{c.resultCount(total)}</span>
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
        <div className={`${l.results} ${pending ? l.pending : ""}`} aria-busy={pending}>
          {pending && (
            <span className={l.srOnly} role="status">
              {c.loading}
            </span>
          )}
          {products.length ? (
            <>
              <ul className={`${s.cards} ${l.listCards}`}>
                {products.map((p) => (
                  <ShopCard
                    key={p.id}
                    base={base}
                    product={p}
                    config={configs[p.categoryId] ?? []}
                  />
                ))}
              </ul>
              {(paged || nextCursor) && (
                <nav aria-label={c.pager} className={l.pager}>
                  {paged && (
                    <Link href={hrefWith((sp) => sp.delete("cursor"))} className={l.secondaryBtn}>
                      {c.first}
                    </Link>
                  )}
                  {nextCursor && (
                    <Link
                      href={hrefWith((sp) => sp.set("cursor", nextCursor))}
                      className={l.secondaryBtn}
                    >
                      {c.next}
                    </Link>
                  )}
                </nav>
              )}
            </>
          ) : (
            <div className={l.empty} role="status">
              <h2>{c.emptyTitle}</h2>
              <p>{phone ? c.emptyBody : c.emptyBodyNoPhone}</p>
              <div className={l.emptyActions}>
                {active > 0 && (
                  <button type="button" className={l.clearBtn} onClick={clear}>
                    {c.clear}
                  </button>
                )}
                {(q || cat || paged) && active === 0 && (
                  <Link href={`${base}/products`} className={l.secondaryBtn}>
                    {c.viewAll}
                  </Link>
                )}
                {phone && (
                  <a href={`tel:${phone}`} className={l.callBtn}>
                    <PhoneOutlined aria-hidden /> {c.emptyCall(phone)}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={c.filters}
        placement="bottom"
        size="large"
        footer={
          <button type="button" className={l.applyBtn} onClick={() => setDrawer(false)}>
            {c.apply(total)}
          </button>
        }
      >
        {panel}
      </Drawer>
    </main>
  );
}
