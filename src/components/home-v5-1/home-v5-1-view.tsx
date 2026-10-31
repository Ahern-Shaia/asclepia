"use client";

import {
  CalendarOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  MenuOutlined,
  PhoneOutlined,
  PlusOutlined,
  ProfileOutlined,
  RightOutlined,
  SearchOutlined,
  SwapOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { Drawer } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type CSSProperties, type FormEvent, useState } from "react";
import { formatTwd } from "@/components/catalog/format";
import { MockBanner } from "@/components/catalog/mock-banner";
import type { CompanyInfo } from "@/components/catalog/site-footer";
import { homeV3Copy as c } from "@/copy/home-v3";
import { homeV4Copy as c4 } from "@/copy/home-v4";
import { homeV5Copy as c5 } from "@/copy/home-v5";
import { siteCopy } from "@/copy/site";
import { palette } from "@/theme/tokens";
import { type EquipKind, EquipIllus, StepIllus } from "@/components/home-v4/equip-illus";
import s from "@/components/home-v5/home-v5.module.css";
import { PhotoSlot } from "@/components/home-v5/photo-slot";
import t from "./home-v5-1.module.css";

export type V5Category = { id: EquipKind; name: string; count: number };
export type V5Product = {
  id: string;
  categoryName: string;
  brand: string;
  model: string;
  nameZh: string;
  year?: number;
  condition?: string;
  warranty?: string;
  priceTwd?: number;
  sold: boolean;
  isNew: boolean;
  kind: EquipKind;
};

const vars = {
  "--navy": palette.primary,
  "--navy-ink": palette.navyInk,
  "--navy-bg": palette.primaryBg,
  "--accent": palette.accent,
  "--accent-bg": palette.accentBg,
  "--ink": palette.text,
  "--ink-2": palette.textSecondary,
  "--paper": palette.bgSection,
  "--line": palette.border,
  "--white": palette.bg,
  "--on-navy-muted": palette.onNavyMuted,
  "--illus-surface": palette.illusSurface,
  "--illus-shade": palette.illusShade,
  "--illus-glow": palette.illusGlow,
} as CSSProperties;

const serviceIcon = { buy: <SwapOutlined />, repair: <ToolOutlined />, rent: <CalendarOutlined /> };

export function HomeV51View({
  base,
  categories,
  brands,
  latest,
  company,
}: {
  base: string;
  categories: V5Category[];
  brands: string[];
  latest: V5Product[];
  company: CompanyInfo;
}) {
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [list, setList] = useState<string[]>([]);
  const total = categories.reduce((n, x) => n + x.count, 0);
  const toggle = (id: string) =>
    setList((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  const search = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const sp = new URLSearchParams();
    for (const key of ["cat", "q"]) {
      const value = form.get(key)?.toString().trim();
      if (value) sp.set(key, value);
    }
    router.push(`${base}/products${sp.size ? `?${sp}` : ""}`);
  };
  const listButton = (
    <Link
      href="#inquiry-list"
      className={s.listBtn}
      aria-label={`${c.header.inquiryList} ${list.length} 件`}
    >
      <ProfileOutlined aria-hidden />
      <span className={s.desktopOnly}>{c.header.inquiryList}</span>
      <span className={`${s.badge} ${list.length ? s.badgeOn : ""}`} key={list.length}>
        {list.length}
      </span>
    </Link>
  );

  return (
    <div className={s.page} style={vars}>
      <MockBanner />

      <div className={s.util}>
        <div className={`${s.container} ${s.utilRow}`}>
          <span>
            <ClockCircleOutlined aria-hidden /> {c.util.hours(company.hours)}
          </span>
          <span className={s.desktopOnly}>{c.util.visit}</span>
          <a href={`tel:${company.phone}`} className={s.utilPhone}>
            <PhoneOutlined aria-hidden /> {company.phone}
          </a>
        </div>
      </div>

      <header className={s.header}>
        <div className={`${s.container} ${s.headerRow}`}>
          <Link href={base} className={s.brand} aria-label={`${siteCopy.name} 首頁`}>
            <span className={s.mark} aria-hidden>
              A
            </span>
            <span className={s.brandText}>
              <strong>{siteCopy.name}</strong>
              <span>{siteCopy.tagline}</span>
            </span>
          </Link>
          {/* home page: the hero search is the only search; header search lives on inner pages */}
          <div className={`${s.headerActions} ${t.pushEnd}`}>
            {listButton}
            <a href={`tel:${company.phone}`} className={`${s.bookBtn} ${s.desktopOnly}`}>
              {c.header.book}
            </a>
            <button
              type="button"
              className={`${s.iconBtn} ${s.mobileOnly}`}
              aria-label="開啟選單"
              onClick={() => setMenu(true)}
            >
              <MenuOutlined aria-hidden />
            </button>
          </div>
        </div>
        <nav className={`${s.catNav} ${s.desktopOnly}`} aria-label="設備分類">
          <div className={`${s.container} ${s.catNavRow}`}>
            {categories.map((x) => (
              <Link key={x.id} href={`${base}/products?cat=${x.id}`}>
                {x.name}
              </Link>
            ))}
            <Link href={`${base}/products`} className={s.catNavAll}>
              {c.categories.all}
            </Link>
          </div>
        </nav>
        <Drawer open={menu} onClose={() => setMenu(false)} title={siteCopy.name} size="default">
          <nav className={s.drawerNav} aria-label="主選單">
            {categories.map((x) => (
              <Link key={x.id} href={`${base}/products?cat=${x.id}`} onClick={() => setMenu(false)}>
                {x.name}
                <span>{x.count}</span>
              </Link>
            ))}
          </nav>
        </Drawer>
      </header>

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
              {latest.map((p) => {
                const added = list.includes(p.id);
                const meta = [
                  p.year && c.latest.year(p.year),
                  p.condition?.split("，")[0],
                  p.warranty && c.latest.warranty(p.warranty),
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <li key={p.id} className={`${s.card} ${p.sold ? s.cardSold : ""}`}>
                    <Link href={`${base}/products/${p.id}`} className={s.cardLink}>
                      <span className={s.photo}>
                        <PhotoSlot
                          className={s.photoSlot}
                          label={c5.photo.card.label}
                          spec={c5.photo.card.spec}
                        />
                        {p.sold ? (
                          <span className={`${s.tag} ${s.tagSold}`}>{c.latest.sold}</span>
                        ) : (
                          p.isNew && (
                            <span className={`${s.tag} ${s.tagNew}`}>{c.latest.newTag}</span>
                          )
                        )}
                      </span>
                      <span className={s.cardBody}>
                        <span className={s.cardCat}>{p.categoryName}</span>
                        <span className={s.cardTitle}>
                          {p.brand} {p.model}
                        </span>
                        <span className={s.cardName}>{p.nameZh}</span>
                        <span className={s.cardMeta}>{meta}</span>
                        <span className={s.price}>
                          {p.priceTwd ? formatTwd(p.priceTwd) : c.latest.askPrice}
                        </span>
                      </span>
                    </Link>
                    {!p.sold && (
                      <button
                        type="button"
                        className={`${s.addBtn} ${added ? s.addBtnOn : ""}`}
                        aria-pressed={added}
                        onClick={() => toggle(p.id)}
                      >
                        {added ? <CheckOutlined aria-hidden /> : <PlusOutlined aria-hidden />}
                        {added ? c.latest.added : c.latest.add}
                      </button>
                    )}
                  </li>
                );
              })}
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

      <footer id="contact" className={s.footer}>
        <div className={`${s.container} ${s.footerRow}`}>
          <div className={s.brand}>
            <span className={`${s.mark} ${s.markInv}`} aria-hidden>
              A
            </span>
            <span className={s.brandText}>
              <strong>{company.name}</strong>
              <span>{siteCopy.tagline}</span>
            </span>
          </div>
          <ul className={s.footerContact}>
            <li>
              <PhoneOutlined aria-hidden /> <a href={`tel:${company.phone}`}>{company.phone}</a>
            </li>
            <li>
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </li>
            <li>{company.address}</li>
            <li>{company.hours}</li>
          </ul>
          <p className={s.copy}>{siteCopy.copyright}</p>
        </div>
      </footer>

      <div className={`${s.mobileBar} ${s.mobileOnlyFlex}`}>
        <a href={`tel:${company.phone}`}>
          <PhoneOutlined aria-hidden /> {c.mobileBar.call}
        </a>
        <Link href="#inquiry-list" className={s.mobileBarMain}>
          <ProfileOutlined aria-hidden /> {c.mobileBar.inquiry}（{list.length}）
        </Link>
      </div>
    </div>
  );
}
