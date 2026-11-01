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
import {
  createContext,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  Suspense,
  useContext,
  useState,
} from "react";
import { MockBanner } from "@/components/catalog/mock-banner";
import type { CompanyInfo } from "@/components/catalog/site-footer";
import s from "@/components/home-v5/home-v5.module.css";
import t from "@/components/home-v5-1/home-v5-1.module.css";
import { homeV3Copy as c } from "@/copy/home-v3";
import { siteCopy } from "@/copy/site";
import { palette } from "@/theme/tokens";
import { useInquiryList } from "./inquiry-store";

export type ShopCategory = { id: string; name: string; count: number };
export type ShopBrand = { name: string; tagline: string };

// Mockups render the same views with sample data; only they show the MOCKUP banner and photo
// placeholders. Real pages never set it.
const MockContext = createContext(false);
export const useShopMock = () => useContext(MockContext);

// `base` is "" on the real site and "/mockup/site-v5-1" on the mockup.
export const homeOf = (base: string) => base || "/";

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

// The search boxes show the current cat/q, which only exist per request. They sit in their own
// Suspense boundary so the rest of the header stays in the prerendered shell; the fallback is the
// same form, empty.
const NO_PARAMS = new URLSearchParams();
function WithParams({ children }: { children: (params: URLSearchParams) => ReactNode }) {
  return children(useSearchParams());
}

// Header search lives on inner pages only; the home page has its single search in the hero (§B0).
function HeaderSearch({
  base,
  categories,
  params,
}: {
  base: string;
  categories: ShopCategory[];
  params: URLSearchParams;
}) {
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

function MobileSearch({ base, params }: { base: string; params: URLSearchParams }) {
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

// Store details may be empty until the settings editor exists (site-config.md G1): anything
// without a value is left out, never shown as an empty row or a `tel:` link to nowhere.
export function ShopShell({
  base,
  company,
  categories,
  brand = { name: siteCopy.name, tagline: siteCopy.tagline },
  search = true,
  mock = false,
  children,
}: {
  base: string;
  company: CompanyInfo;
  categories: ShopCategory[];
  brand?: ShopBrand;
  search?: boolean;
  mock?: boolean;
  children: ReactNode;
}) {
  const [menu, setMenu] = useState(false);
  const { ids } = useInquiryList();
  const listHref = `${base}/inquiry`;
  const { phone, email, address, hours } = company;

  return (
    <MockContext.Provider value={mock}>
      <div className={s.page} style={vars}>
        {mock && <MockBanner />}

        {(hours || phone) && (
          <div className={s.util}>
            <div className={`${s.container} ${s.utilRow}`}>
              {hours && (
                <span>
                  <ClockCircleOutlined aria-hidden /> {c.util.hours(hours)}
                </span>
              )}
              {phone && <span className={s.desktopOnly}>{c.util.visit}</span>}
              {phone && (
                <a href={`tel:${phone}`} className={s.utilPhone}>
                  <PhoneOutlined aria-hidden /> {phone}
                </a>
              )}
            </div>
          </div>
        )}

        <header className={s.header}>
          <div className={`${s.container} ${s.headerRow}`}>
            <Link href={homeOf(base)} className={s.brand} aria-label={`${brand.name} 首頁`}>
              <span className={s.mark} aria-hidden>
                {[...brand.name][0]}
              </span>
              <span className={s.brandText}>
                <strong>{brand.name}</strong>
                {brand.tagline && <span>{brand.tagline}</span>}
              </span>
            </Link>
            {search && (
              <Suspense
                fallback={<HeaderSearch base={base} categories={categories} params={NO_PARAMS} />}
              >
                <WithParams>
                  {(params) => <HeaderSearch base={base} categories={categories} params={params} />}
                </WithParams>
              </Suspense>
            )}
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
              {phone && (
                <a href={`tel:${phone}`} className={`${s.bookBtn} ${s.desktopOnly}`}>
                  {c.header.book}
                </a>
              )}
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
          {search && (
            <Suspense fallback={<MobileSearch base={base} params={NO_PARAMS} />}>
              <WithParams>{(params) => <MobileSearch base={base} params={params} />}</WithParams>
            </Suspense>
          )}
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
          <Drawer open={menu} onClose={() => setMenu(false)} title={brand.name} size="default">
            <nav className={s.drawerNav} aria-label="主選單">
              {categories.map((x) => (
                <Link
                  key={x.id}
                  href={`${base}/products?cat=${x.id}`}
                  onClick={() => setMenu(false)}
                >
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
                {[...brand.name][0]}
              </span>
              <span className={s.brandText}>
                <strong>{company.name}</strong>
                {brand.tagline && <span>{brand.tagline}</span>}
              </span>
            </div>
            {(phone || email || address || hours) && (
              <ul className={s.footerContact}>
                {phone && (
                  <li>
                    <PhoneOutlined aria-hidden /> <a href={`tel:${phone}`}>{phone}</a>
                  </li>
                )}
                {email && (
                  <li>
                    <a href={`mailto:${email}`}>{email}</a>
                  </li>
                )}
                {address && <li>{address}</li>}
                {hours && <li>{hours}</li>}
              </ul>
            )}
            <p className={s.copy}>{siteCopy.copyright}</p>
          </div>
        </footer>

        <div className={`${s.mobileBar} ${s.mobileOnlyFlex}`}>
          {phone && (
            <a href={`tel:${phone}`}>
              <PhoneOutlined aria-hidden /> {c.mobileBar.call}
            </a>
          )}
          <Link href={listHref} className={s.mobileBarMain}>
            <ProfileOutlined aria-hidden /> {c.mobileBar.inquiry}（{ids.length}）
          </Link>
        </div>
      </div>
    </MockContext.Provider>
  );
}
