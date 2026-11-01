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
  ToolOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import type { CompanyInfo } from "@/components/catalog/site-footer";
import { type EquipKind, EquipIllus, StepIllus } from "@/components/home-v4/equip-illus";
import s from "@/components/home-v5/home-v5.module.css";
import { PhotoSlot } from "@/components/home-v5/photo-slot";
import type { CategoryAttr } from "@/components/shop/attrs";
import { type ShopCardProduct, ShopCard } from "@/components/shop/product-card";
import { ShopShell, useShopSearch } from "@/components/shop/shop-shell";
import { homeV3Copy as c } from "@/copy/home-v3";
import { homeV4Copy as c4 } from "@/copy/home-v4";
import { homeV5Copy as c5 } from "@/copy/home-v5";
import t from "./home-v5-1.module.css";

export type V51Category = { id: EquipKind; name: string; count: number };

const serviceIcon = { buy: <SwapOutlined />, repair: <ToolOutlined />, rent: <CalendarOutlined /> };

export function HomeV51View({
  base,
  categories,
  brands,
  latest,
  configs,
  company,
}: {
  base: string;
  categories: V51Category[];
  brands: string[];
  latest: (ShopCardProduct & { categoryId: string })[];
  configs: Record<string, CategoryAttr[]>;
  company: CompanyInfo;
}) {
  const search = useShopSearch(base);
  const total = categories.reduce((n, x) => n + x.count, 0);

  return (
    <ShopShell base={base} company={company} categories={categories} search={false}>
      <main>
        <section className={s.hero} aria-labelledby="hero-title">
          <PhotoSlot
            tone="dark"
            corner
            className={s.heroPhoto}
            label={c5.photo.hero.label}
            spec={c5.photo.hero.spec}
          />
          <div className={`${s.container} ${s.heroRow}`}>
            <div className={s.heroText}>
              <span className={s.eyebrow}>{c4.eyebrow}</span>
              <h1 id="hero-title">
                {c4.heading.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h1>
              <ul className={s.points}>
                {c.hero.points.map((p) => (
                  <li key={p}>
                    <CheckOutlined aria-hidden /> {p}
                  </li>
                ))}
              </ul>
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

        <section className={s.section} aria-labelledby="h-cat">
          <div className={s.container}>
            <div className={s.head}>
              <h2 id="h-cat">{c.categories.title}</h2>
            </div>
            <ul className={s.cats}>
              {categories.map((x) => (
                <li key={x.id}>
                  <Link href={`${base}/products?cat=${x.id}`} className={s.cat}>
                    <span className={s.catArt}>
                      <EquipIllus kind={x.id} />
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

        <section className={`${s.section} ${s.sectionTop0}`} aria-labelledby="h-latest">
          <div className={s.container}>
            <div className={s.head}>
              <h2 id="h-latest">{c.latest.title}</h2>
              <Link href={`${base}/products`} className={s.more}>
                {c.latest.viewAll} <RightOutlined aria-hidden />
              </Link>
            </div>
            <ul className={s.cards}>
              {latest.map((p) => (
                <ShopCard key={p.id} base={base} product={p} config={configs[p.categoryId] ?? []} />
              ))}
            </ul>
          </div>
        </section>

        <section className={`${s.section} ${s.sectionTop0}`} aria-labelledby="h-brands">
          <div className={s.container}>
            <div className={s.head}>
              <h2 id="h-brands">{c.brands.title}</h2>
              <span className={s.headNote}>{c5.brandsNote}</span>
            </div>
            <ul className={s.brands}>
              {brands.map((b) => (
                <li key={b}>
                  <Link href={`${base}/products?brand=${encodeURIComponent(b)}`}>{b}</Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`${s.section} ${s.paper}`} aria-labelledby="h-buy">
          <div className={`${s.container} ${s.buyRow}`}>
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
            <aside className={s.visit} aria-labelledby="h-visit">
              <PhotoSlot
                label={c5.photo.visit.label}
                spec={c5.photo.visit.spec}
                className={s.visitPhoto}
              />
              <h2 id="h-visit">{c.visit.title}</h2>
              <dl>
                <div>
                  <dt>
                    <EnvironmentOutlined aria-hidden /> {c.visit.address}
                  </dt>
                  <dd>{company.address}</dd>
                </div>
                <div>
                  <dt>
                    <ClockCircleOutlined aria-hidden /> {c.visit.hours}
                  </dt>
                  <dd>{company.hours}</dd>
                </div>
              </dl>
              <p>{c.visit.note}</p>
              <a href={`tel:${company.phone}`} className={s.visitBtn}>
                <PhoneOutlined aria-hidden /> {c.visit.call} {company.phone}
              </a>
            </aside>
          </div>
        </section>

        <section id="services" className={s.section} aria-labelledby="h-services">
          <div className={s.container}>
            <div className={s.head}>
              <h2 id="h-services">{c.services.title}</h2>
            </div>
            <ul className={s.services}>
              {c.services.items.map((sv) => (
                <li key={sv.id}>
                  <span className={s.serviceIcon} aria-hidden>
                    {serviceIcon[sv.id]}
                  </span>
                  <span>
                    <strong>{sv.title}</strong>
                    <span>{sv.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </ShopShell>
  );
}
