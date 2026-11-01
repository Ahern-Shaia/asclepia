"use client";

import {
  ClockCircleOutlined,
  MenuOutlined,
  PhoneOutlined,
  ProfileOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Drawer } from "antd";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type CSSProperties, type FormEvent, type ReactNode, useState } from "react";
import { MockBanner } from "@/components/catalog/mock-banner";
import type { CompanyInfo } from "@/components/catalog/site-footer";
import s from "@/components/home-v5/home-v5.module.css";
import t from "@/components/home-v5-1/home-v5-1.module.css";
import { homeV3Copy as c } from "@/copy/home-v3";
import { siteCopy } from "@/copy/site";
import { palette } from "@/theme/tokens";
import { useInquiryList } from "./inquiry-store";

export type ShopCategory = { id: string; name: string; count: number };

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

export function useShopSearch(base: string) {
  const router = useRouter();
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const sp = new URLSearchParams();
    for (const key of ["cat", "q"]) {
      const value = form.get(key)?.toString().trim();
      if (value) sp.set(key, value);
    }
    router.push(`${base}/products${sp.size ? `?${sp}` : ""}`);
  };
}

// Header search lives on inner pages only; the home page has its single search in the hero (§B0).
function HeaderSearch({ base, categories }: { base: string; categories: ShopCategory[] }) {
  const params = useSearchParams();
  const search = useShopSearch(base);
  const key = params.toString();
  return (
    <form
      key={`d${key}`}
      className={`${s.search} ${s.desktopOnly}`}
      role="search"
      onSubmit={search}
    >
      <select
        name="cat"
        aria-label={c.header.allCategories}
        className={s.searchSelect}
        defaultValue={params.get("cat") ?? ""}
      >
        <option value="">{c.header.allCategories}</option>
        {categories.map((x) => (
          <option key={x.id} value={x.id}>
            {x.name}
          </option>
        ))}
      </select>
      <input
        name="q"
        type="search"
        defaultValue={params.get("q") ?? ""}
        placeholder={c.header.searchPlaceholder}
        aria-label={c.header.searchPlaceholder}
      />
      <button type="submit">
        <SearchOutlined aria-hidden /> {c.header.search}
      </button>
    </form>
  );
}

function MobileSearch({ base }: { base: string }) {
  const params = useSearchParams();
  const search = useShopSearch(base);
  return (
    <form
      key={params.toString()}
      className={`${s.container} ${s.mobileSearch} ${s.mobileOnly}`}
      role="search"
      onSubmit={search}
    >
      {params.get("cat") && <input type="hidden" name="cat" value={params.get("cat")!} />}
      <input
        name="q"
        type="search"
        defaultValue={params.get("q") ?? ""}
        placeholder={c.header.searchPlaceholder}
        aria-label={c.header.searchPlaceholder}
      />
      <button type="submit" aria-label={c.header.search}>
        <SearchOutlined aria-hidden />
      </button>
    </form>
  );
}

export function ShopShell({
  base,
  company,
  categories,
  search = true,
  children,
}: {
  base: string;
  company: CompanyInfo;
  categories: ShopCategory[];
  search?: boolean;
  children: ReactNode;
}) {
  const [menu, setMenu] = useState(false);
  const { ids } = useInquiryList();
  const listHref = `${base}/inquiry`;

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
          {search && <HeaderSearch base={base} categories={categories} />}
          <div className={`${s.headerActions} ${search ? "" : t.pushEnd}`}>
            <Link
              href={listHref}
              className={s.listBtn}
              aria-label={`${c.header.inquiryList} ${ids.length} 件`}
            >
              <ProfileOutlined aria-hidden />
              <span className={s.desktopOnly}>{c.header.inquiryList}</span>
              <span className={`${s.badge} ${ids.length ? s.badgeOn : ""}`} key={ids.length}>
                {ids.length}
              </span>
            </Link>
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
        {search && <MobileSearch base={base} />}
        <nav className={`${s.catNav} ${s.desktopOnly}`} aria-label="商品分類">
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

      {children}

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
        <Link href={listHref} className={s.mobileBarMain}>
          <ProfileOutlined aria-hidden /> {c.mobileBar.inquiry}（{ids.length}）
        </Link>
      </div>
    </div>
  );
}
