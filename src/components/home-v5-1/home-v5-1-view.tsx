"use client";

import {
  CalendarOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  RightOutlined,
  SearchOutlined,
  SwapOutlined,
  TagOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import type { CompanyInfo } from "@/components/catalog/site-footer";
import {
  type EquipKind,
  EquipIllus,
  GenericEquipIllus,
  StepIllus,
} from "@/components/home-v4/equip-illus";
import s from "@/components/home-v5/home-v5.module.css";
import { PhotoSlot } from "@/components/home-v5/photo-slot";
import type { CategoryAttr } from "@/components/shop/attrs";
import { type ShopCardProduct, ShopCard } from "@/components/shop/product-card";
import { type ShopBrand, ShopShell, useShopSearch } from "@/components/shop/shop-shell";
import { homeV3Copy as c } from "@/copy/home-v3";
import { homeV4Copy as c4 } from "@/copy/home-v4";
import { homeV5Copy as c5 } from "@/copy/home-v5";
import { DEFAULT_HOME, type HomeBlock, type HomeLayout } from "@/modules/site-config/home";
import type { SiteImages } from "@/modules/site-config/images";
import type { ServiceKind, SiteNotes } from "@/modules/site-config/notes";
import { type DerivedTheme } from "@/theme/derive";
import t from "./home-v5-1.module.css";

// `icon` picks a drawing when the category's iconKey names a known kind; otherwise a neutral one.
export type V51Category = { id: string; name: string; count: number; icon?: EquipKind | null };

const serviceIcon: Record<ServiceKind, ReactNode> = {
  buy: <SwapOutlined />,
  repair: <ToolOutlined />,
  rent: <CalendarOutlined />,
  other: <TagOutlined />,
};

// Blocks in the order the back office set (site-config.md §4.4). White blocks that follow another
// white block drop their top padding (the paper-tinted 怎麼買 block has its own); the class is
// computed from what is actually shown, so reordering or switching a block off keeps the rhythm.
const PAPER: ReadonlySet<HomeBlock> = new Set(["buy"]);
function renderBlocks(
  layout: HomeLayout,
  render: Record<HomeBlock, (top: string) => ReactNode>,
  tight: string,
) {
  let prevWhite = false;
  return layout
    .filter((b) => b.on)
    .map((b) => {
      const white = !PAPER.has(b.id);
      const node = render[b.id](white && prevWhite ? tight : "");
      if (node) prevWhite = white;
      return node ? <Fragment key={b.id}>{node}</Fragment> : null;
    });
}

export function HomeV51View({
  base,
  categories,
  brands,
  latest,
  configs,
  company,
  notes,
  home = DEFAULT_HOME,
  theme,
  images = {},
  brand,
  mock = false,
}: {
  base: string;
  categories: V51Category[];
  brands: string[];
  latest: (ShopCardProduct & { categoryId: string })[];
  configs: Record<string, CategoryAttr[]>;
  company: CompanyInfo;
  // the store's own statements; each block is left out while it has none (site-config notes.ts)
  notes: SiteNotes;
  home?: HomeLayout;
  theme?: DerivedTheme;
  images?: SiteImages;
  brand?: ShopBrand;
  mock?: boolean;
}) {
  const search = useShopSearch(base);
  const total = categories.reduce((n, x) => n + x.count, 0);
  const visit = !!(company.address || company.hours || company.phone);

  return (
    <ShopShell
      base={base}
      company={company}
      categories={categories}
      brand={brand}
      theme={theme}
      logo={images.LOGO}
      search={false}
      mock={mock}
    >
      <main>
        <section
          className={`${s.hero} ${mock || images.HERO ? "" : t.heroBare}`}
          aria-labelledby="hero-title"
        >
          {/* real site: the photo set in the back office, plain deep band until there is one */}
          {!mock && images.HERO && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP from /media */}
              <img src={images.HERO.src} alt="" className={t.heroImg} decoding="async" />
              <span className={t.heroScrim} aria-hidden />
            </>
          )}
          {mock && (
            <PhotoSlot
              tone="dark"
              corner
              className={s.heroPhoto}
              label={c5.photo.hero.label}
              spec={c5.photo.hero.spec}
            />
          )}
          <div className={`${s.container} ${s.heroRow}`}>
            <div className={s.heroText}>
              {notes.eyebrow && <span className={s.eyebrow}>{notes.eyebrow}</span>}
              <h1 id="hero-title">
                {c4.heading.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h1>
              {notes.heroPoints.length > 0 && (
                <ul className={s.points}>
                  {notes.heroPoints.map((p) => (
                    <li key={p}>
                      <CheckOutlined aria-hidden /> {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className={`${s.container} ${s.finderWrap}`}>
            <form className={t.heroSearch} role="search" onSubmit={search}>
              <select name="cat" aria-label={c.hero.finder.category} defaultValue="">
                <option value="">
                  {c.header.allCategories}（{total}）
                </option>
                {categories.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}（{x.count}）
                  </option>
                ))}
              </select>
              <input
                name="q"
                type="search"
                placeholder={c.header.searchPlaceholder}
                aria-label={c.header.searchPlaceholder}
              />
              <button type="submit" className={s.finderBtn}>
                <SearchOutlined aria-hidden /> {c.header.search}
              </button>
            </form>
          </div>
        </section>

        {renderBlocks(
          home,
          {
            categories: (top) =>
              categories.length > 0 ? (
                <section className={`${s.section} ${top}`} aria-labelledby="h-cat">
                  <div className={s.container}>
                    <div className={s.head}>
                      <h2 id="h-cat">{c.categories.title}</h2>
                    </div>
                    <ul className={s.cats}>
                      {categories.map((x) => (
                        <li key={x.id}>
                          <Link href={`${base}/products?cat=${x.id}`} className={s.cat}>
                            <span className={s.catArt}>
                              {x.icon ? <EquipIllus kind={x.icon} /> : <GenericEquipIllus />}
                            </span>
                            <span className={s.catName}>{x.name}</span>
                            <span className={s.catCount}>
                              {x.count} {c.categories.unit}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              ) : null,
            latest: (top) =>
              latest.length > 0 ? (
                <section className={`${s.section} ${top}`} aria-labelledby="h-latest">
                  <div className={s.container}>
                    <div className={s.head}>
                      <h2 id="h-latest">{c.latest.title}</h2>
                      <Link href={`${base}/products`} className={s.more}>
                        {c.latest.viewAll} <RightOutlined aria-hidden />
                      </Link>
                    </div>
                    <ul className={s.cards}>
                      {latest.map((p) => (
                        <ShopCard
                          key={p.id}
                          base={base}
                          product={p}
                          config={configs[p.categoryId] ?? []}
                        />
                      ))}
                    </ul>
                  </div>
                </section>
              ) : null,
            brands: (top) =>
              brands.length > 0 ? (
                <section className={`${s.section} ${top}`} aria-labelledby="h-brands">
                  <div className={s.container}>
                    <div className={s.head}>
                      <h2 id="h-brands">{c.brands.title}</h2>
                      {mock && <span className={s.headNote}>{c5.brandsNote}</span>}
                    </div>
                    <ul className={s.brands}>
                      {brands.map((b) => (
                        <li key={b}>
                          <Link href={`${base}/products?f.brand=${encodeURIComponent(b)}`}>
                            {b}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              ) : null,
            buy: () => (
              <section className={`${s.section} ${s.paper}`} aria-labelledby="h-buy">
                <div className={`${s.container} ${s.buyRow} ${visit ? "" : t.buyRowSolo}`}>
                  <div>
                    <div className={s.head}>
                      <h2 id="h-buy">{c.buy.title}</h2>
                    </div>
                    <ol className={s.steps}>
                      {c.buy.steps.map((st, i) => (
                        <li key={st.title}>
                          <span className={s.stepArt}>
                            <StepIllus step={i as 0 | 1 | 2} />
                            <span className={s.stepNo} aria-hidden>
                              {i + 1}
                            </span>
                          </span>
                          <span>
                            <strong>{st.title}</strong>
                            <span>{st.body}</span>
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  {visit && (
                    <aside className={s.visit} aria-labelledby="h-visit">
                      {mock && (
                        <PhotoSlot
                          label={c5.photo.visit.label}
                          spec={c5.photo.visit.spec}
                          className={s.visitPhoto}
                        />
                      )}
                      <h2 id="h-visit">{c.visit.title}</h2>
                      {(company.address || company.hours) && (
                        <dl>
                          {company.address && (
                            <div>
                              <dt>
                                <EnvironmentOutlined aria-hidden /> {c.visit.address}
                              </dt>
                              <dd>{company.address}</dd>
                            </div>
                          )}
                          {company.hours && (
                            <div>
                              <dt>
                                <ClockCircleOutlined aria-hidden /> {c.visit.hours}
                              </dt>
                              <dd>{company.hours}</dd>
                            </div>
                          )}
                        </dl>
                      )}
                      {company.phone && (
                        <>
                          <p>{c.visit.note}</p>
                          <a href={`tel:${company.phone}`} className={s.visitBtn}>
                            <PhoneOutlined aria-hidden /> {c.visit.call} {company.phone}
                          </a>
                        </>
                      )}
                    </aside>
                  )}
                </div>
              </section>
            ),
            services: (top) =>
              notes.services.length > 0 ? (
                <section
                  id="services"
                  className={`${s.section} ${top}`}
                  aria-labelledby="h-services"
                >
                  <div className={s.container}>
                    <div className={s.head}>
                      <h2 id="h-services">{c.services.title}</h2>
                    </div>
                    <ul className={s.services}>
                      {notes.services.map((sv) => (
                        <li key={sv.title}>
                          <span className={s.serviceIcon} aria-hidden>
                            {serviceIcon[sv.kind]}
                          </span>
                          <span>
                            <strong>{sv.title}</strong>
                            {sv.body && <span>{sv.body}</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              ) : null,
          },
          s.sectionTop0,
        )}
      </main>
    </ShopShell>
  );
}
