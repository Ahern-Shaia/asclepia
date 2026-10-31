"use client";

import {
  CalendarOutlined,
  MenuOutlined,
  PhoneOutlined,
  RightOutlined,
  SwapOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { Button, ConfigProvider, Drawer, Input } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type CSSProperties, useState } from "react";
import type { CompanyInfo } from "@/components/catalog/site-footer";
import { MockBanner } from "@/components/catalog/mock-banner";
import { catalogCopy } from "@/copy/catalog";
import { homeCopy } from "@/copy/home";
import { siteCopy } from "@/copy/site";
import { palette } from "@/theme/tokens";
import { HeroDrawing } from "./hero-drawing";
import s from "./home-v2.module.css";
import { type TileProduct, ProductTile } from "./product-tile";

export type V2Category = { id: string; name: string; count: number; image: string };

const vars = {
  "--navy": palette.primary,
  "--navy-ink": palette.navyInk,
  "--on-navy": palette.bg,
  "--on-navy-muted": palette.onNavyMuted,
  "--draft-line": palette.draftLine,
  "--draft-grid": palette.draftGrid,
  "--tag": palette.tag,
  "--tag-edge": palette.tagEdge,
  "--ink": palette.text,
  "--ink-2": palette.textSecondary,
  "--paper": palette.bgSection,
  "--line": palette.border,
  "--white": palette.bg,
} as CSSProperties;

// Search button on the navy band: inspection-tag yellow with ink text (contrast pair in tokens).
const heroSearchTheme = {
  token: { colorPrimary: palette.tag, colorPrimaryHover: palette.tagEdge },
  components: { Button: { primaryColor: palette.text } },
};

const serviceIcon = { buy: <SwapOutlined />, repair: <ToolOutlined />, rent: <CalendarOutlined /> };

export function HomeV2View({
  base,
  categories,
  latest,
  company,
}: {
  base: string;
  categories: V2Category[];
  latest: TileProduct[];
  company: CompanyInfo;
}) {
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const search = (q: string) =>
    router.push(`${base}/products${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  const h = homeCopy;
  const nav = [
    { href: `${base}/products`, label: catalogCopy.nav.products },
    { href: "#services", label: catalogCopy.nav.services },
    { href: "#contact", label: catalogCopy.nav.contact },
  ];

  return (
    <div className={s.page} style={vars}>
      <MockBanner />

      <header className={s.header}>
        <div className={`${s.container} ${s.headerRow}`}>
          <Link href={base} className={s.brand} aria-label={`${siteCopy.name} 首頁`}>
            <span className={s.mark} aria-hidden>
              A
            </span>
            <span className={s.brandText}>
              <span className={s.brandName}>{siteCopy.name}</span>
              <span className={s.brandTag}>{siteCopy.tagline}</span>
            </span>
          </Link>
          <nav className={s.nav} aria-label="主選單">
            {nav.map((n) => (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
          </nav>
          <Button
            className={s.desktopOnly}
            icon={<PhoneOutlined />}
            href={`tel:${company.phone}`}
            size="large"
          >
            {company.phone}
          </Button>
          <div className={s.mobileOnly}>
            <Button
              type="text"
              size="large"
              icon={<PhoneOutlined />}
              href={`tel:${company.phone}`}
              aria-label={`${h.header.call} ${company.phone}`}
            />
            <Button
              type="text"
              size="large"
              icon={<MenuOutlined />}
              aria-label="開啟選單"
              onClick={() => setMenu(true)}
            />
          </div>
        </div>
        <Drawer open={menu} onClose={() => setMenu(false)} title={siteCopy.name} size="default">
          <nav className={s.drawerNav} aria-label="主選單">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setMenu(false)}>
                {n.label}
              </Link>
            ))}
          </nav>
        </Drawer>
      </header>

      <main>
        <section className={s.hero} aria-labelledby="hero-title">
          <GridPaper />
          <div className={`${s.container} ${s.heroInner}`}>
            <div className={s.heroText}>
              <p className={s.eyebrow}>{h.hero.eyebrow}</p>
              <h1 id="hero-title" className={s.heroTitle}>
                {h.hero.heading.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h1>
              <p className={s.heroLead}>{h.hero.lead}</p>
              <ConfigProvider theme={heroSearchTheme}>
                <Input.Search
                  size="large"
                  placeholder={catalogCopy.search.placeholder}
                  aria-label={catalogCopy.search.placeholder}
                  enterButton={catalogCopy.search.button}
                  onSearch={search}
                  className={s.heroSearch}
                />
              </ConfigProvider>
              <div className={s.quick}>
                <span className={s.quickLabel}>{h.hero.quick}</span>
                {categories.slice(0, 4).map((c) => (
                  <Link key={c.id} href={`${base}/products?cat=${c.id}`} className={s.chip}>
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
            <HeroDrawing />
            <ul className={s.promiseList}>
              {h.hero.callouts.map((c) => (
                <li key={c.id}>
                  <strong>{c.title}</strong>
                  <span>{c.body}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={s.section} aria-labelledby="h-cat">
          <div className={s.container}>
            <div className={s.sectionHead}>
              <h2 id="h-cat" className={s.sectionTitle}>
                {h.categories.title}
              </h2>
            </div>
            <ul className={s.catGrid}>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`${base}/products?cat=${c.id}`} className={s.catTile}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img src={c.image} alt="" className={s.catImg} />
                    <span className={s.catName}>{c.name}</span>
                    <span className={s.catCount}>
                      {c.count} {h.categories.unit}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`${s.section} ${s.sectionTight}`} aria-labelledby="h-latest">
          <div className={s.container}>
            <div className={s.sectionHead}>
              <h2 id="h-latest" className={s.sectionTitle}>
                {h.latest.title}
              </h2>
              <Link href={`${base}/products`} className={s.more}>
                {h.latest.viewAll} <RightOutlined aria-hidden />
              </Link>
            </div>
            <ul className={s.tileGrid}>
              {latest.map((p) => (
                <li key={p.id}>
                  <ProductTile product={p} href={`${base}/products/${p.id}`} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`${s.section} ${s.paper}`} aria-labelledby="h-steps">
          <div className={s.container}>
            <div className={s.sectionHead}>
              <h2 id="h-steps" className={s.sectionTitle}>
                {h.steps.title}
              </h2>
            </div>
            <ol className={s.steps}>
              {h.steps.items.map((st, i) => (
                <li key={st.title} className={s.step}>
                  <span className={s.stepNo} aria-hidden>
                    {i + 1}
                  </span>
                  <strong className={s.stepTitle}>{st.title}</strong>
                  <span className={s.stepBody}>{st.body}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="services" className={s.section} aria-labelledby="h-services">
          <div className={s.container}>
            <div className={s.sectionHead}>
              <h2 id="h-services" className={s.sectionTitle}>
                {h.services.title}
              </h2>
              <Button
                type="primary"
                size="large"
                icon={<PhoneOutlined />}
                href={`tel:${company.phone}`}
              >
                {h.services.call(company.phone)}
              </Button>
            </div>
            <ul className={s.services}>
              {h.services.items.map((sv) => (
                <li key={sv.id} className={s.service}>
                  <span className={s.serviceIcon} aria-hidden>
                    {serviceIcon[sv.id]}
                  </span>
                  <span className={s.serviceText}>
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
        <div className={`${s.container} ${s.footerInner}`}>
          <div className={s.brand}>
            <span className={`${s.mark} ${s.markOnNavy}`} aria-hidden>
              A
            </span>
            <span className={s.brandText}>
              <span className={s.brandName}>{company.name}</span>
              <span className={s.brandTag}>{siteCopy.tagline}</span>
            </span>
          </div>
          <dl className={s.contact}>
            <div>
              <dt>{h.footer.phone}</dt>
              <dd>
                <a href={`tel:${company.phone}`}>{company.phone}</a>
              </dd>
            </div>
            <div>
              <dt>{h.footer.email}</dt>
              <dd>
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </dd>
            </div>
            <div>
              <dt>{h.footer.address}</dt>
              <dd>{company.address}</dd>
            </div>
            <div>
              <dt>{catalogCopy.footer.hours}</dt>
              <dd>{company.hours}</dd>
            </div>
          </dl>
          <p className={s.copyright}>{siteCopy.copyright}</p>
        </div>
      </footer>
    </div>
  );
}

function GridPaper() {
  return (
    <svg className={s.grid} aria-hidden>
      <defs>
        <pattern id="v2-minor" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0 H0 V24" fill="none" className={s.gridMinor} />
        </pattern>
        <pattern id="v2-major" width="120" height="120" patternUnits="userSpaceOnUse">
          <rect width="120" height="120" fill="url(#v2-minor)" />
          <path d="M120 0 H0 V120" fill="none" className={s.gridMajor} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#v2-major)" />
    </svg>
  );
}
