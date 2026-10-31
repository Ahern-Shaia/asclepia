import Link from "next/link";
import type { ReactNode } from "react";
import { lab, SITE, twd } from "../_content";
import s from "./style.module.css";

const maxCount = Math.max(...lab.categories.map((c) => c.count));
const tel = `tel:${lab.company.phone}`;

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className={s.tag} aria-hidden="true">
      {children}
    </span>
  );
}

export function View() {
  return (
    <div className={s.root}>
      <header className={s.header}>
        <Link href={SITE} className={s.brand}>
          <strong>{lab.brand.toUpperCase()}</strong>
          <span>{lab.tagline}</span>
        </Link>
        <nav className={s.nav} aria-label="主要">
          {lab.nav.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <a href={tel} className={s.tel}>
          TEL {lab.company.phone}
        </a>
      </header>

      <main>
        <section className={s.hero}>
          <Tag>h1</Tag>
          <p className={s.eyebrow}>{lab.eyebrow}</p>
          <h1 className={s.h1}>
            {lab.headlineShort[0]}
            <br />
            {lab.headlineShort[1]}
            <span className={s.caret} aria-hidden="true" />
          </h1>
          <div className={s.heroFoot}>
            <p className={s.lead}>{lab.lead}</p>
            <form action={`${SITE}/products`} className={s.search} role="search">
              <label htmlFor="bq" className={s.method}>
                GET {SITE}/products?q=
              </label>
              <div className={s.searchRow}>
                <input
                  id="bq"
                  name="q"
                  type="search"
                  aria-label={lab.searchPlaceholder}
                  placeholder={lab.searchPlaceholder}
                />
                <button type="submit">{lab.searchButton} →</button>
              </div>
            </form>
          </div>
        </section>

        <ul className={s.promises}>
          {lab.promises.map((p) => (
            <li key={p.id}>
              <strong>{p.title}</strong>
              <span>{p.body}</span>
            </li>
          ))}
        </ul>

        <section className={s.block} aria-labelledby="b-cat">
          <Tag>GET {SITE}/products?cat=</Tag>
          <h2 id="b-cat" className={s.h2}>
            {lab.categoriesTitle}
          </h2>
          <ul className={s.cats}>
            {lab.categories.map((c) => (
              <li key={c.id}>
                <Link href={c.href} className={s.cat}>
                  <span className={s.catName}>{c.name}</span>
                  <span className={s.bar} aria-hidden="true">
                    {"█".repeat(c.count)}
                    <span className={s.barRest}>{"░".repeat(maxCount - c.count)}</span>
                  </span>
                  <span className={s.count}>{String(c.count).padStart(2, "0")} 件</span>
                  <span className={s.path}>?cat={c.id}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.block} aria-labelledby="b-new">
          <Tag>ORDER BY updated_at DESC LIMIT 4</Tag>
          <div className={s.blockHead}>
            <h2 id="b-new" className={s.h2}>
              {lab.latestTitle}
            </h2>
            <Link href={`${SITE}/products`} className={s.more}>
              {lab.viewAll} →
            </Link>
          </div>
          <ul className={s.items}>
            {lab.latest.map((p) => (
              <li key={p.id} className={p.sold ? s.isSold : undefined}>
                <Link href={p.href} className={s.item}>
                  <span className={s.shot}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img src={p.image} alt="" width={480} height={360} />
                    {p.sold && <span className={s.soldStamp}>{lab.sold}</span>}
                  </span>
                  <span className={s.itemName}>
                    <span className={s.model}>
                      {p.brand} · {p.model}
                    </span>
                    <strong>{p.nameZh}</strong>
                  </span>
                  <dl className={s.kv}>
                    <dt>年份</dt>
                    <dd>{p.year ?? "—"}</dd>
                    <dt>狀況</dt>
                    <dd>{p.condition ?? "—"}</dd>
                    {p.warranty && (
                      <>
                        <dt>保固</dt>
                        <dd>{p.warranty}</dd>
                      </>
                    )}
                    <dt>價格</dt>
                    <dd className={s.price}>
                      {p.sold ? (
                        <>
                          <del>{p.priceTwd ? twd(p.priceTwd) : lab.askPrice}</del> {lab.sold}
                        </>
                      ) : p.priceTwd ? (
                        twd(p.priceTwd)
                      ) : (
                        lab.askPrice
                      )}
                    </dd>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.block} aria-labelledby="b-steps">
          <Tag>ol</Tag>
          <h2 id="b-steps" className={s.h2}>
            {lab.stepsTitle}
          </h2>
          <ol className={s.steps}>
            {lab.steps.map((st, i) => (
              <li key={st.title}>
                <span className={s.stepNo} aria-hidden="true">
                  {i + 1}
                </span>
                <strong>{st.title}</strong>
                <span>{st.body}</span>
              </li>
            ))}
          </ol>
        </section>

        <section id="services" className={s.block} aria-labelledby="b-svc">
          <Tag>#services</Tag>
          <h2 id="b-svc" className={s.h2}>
            {lab.servicesTitle}
          </h2>
          <div className={s.svcGrid}>
            <ul className={s.services}>
              {lab.services.map((sv) => (
                <li key={sv.id}>
                  <strong>{sv.title}</strong>
                  <span>{sv.body}</span>
                </li>
              ))}
            </ul>
            <a href={tel} className={s.call}>
              {lab.call}
            </a>
          </div>
        </section>
      </main>

      <footer id="contact" className={s.footer}>
        <Tag>#contact</Tag>
        <dl className={s.contact}>
          <dt>NAME</dt>
          <dd>{lab.company.name}</dd>
          <dt>TEL</dt>
          <dd>
            <a href={tel}>{lab.company.phone}</a>
          </dd>
          <dt>MAIL</dt>
          <dd>
            <a href={`mailto:${lab.company.email}`}>{lab.company.email}</a>
          </dd>
          <dt>ADDR</dt>
          <dd>{lab.company.address}</dd>
          <dt>OPEN</dt>
          <dd>{lab.company.hours}</dd>
        </dl>
        <p className={s.copy}>{lab.copyright}</p>
      </footer>
    </div>
  );
}
