import type { ReactNode } from "react";
import { lab, SITE, twd } from "../_content";
import s from "./style.module.css";

const tel = `tel:${lab.company.phone.replace(/-/g, "")}`;
const price = (n?: number) => (n ? twd(n) : lab.askPrice);
const featured = lab.latest[0];

function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`${s.tag} ${className}`}>
      <span className={s.string} aria-hidden="true" />
      <span className={s.tagBody}>{children}</span>
    </span>
  );
}

export function View() {
  return (
    <div className={s.page}>
      <header className={s.header}>
        <a href={SITE} className={s.brand}>
          {lab.brand}
          <span>{lab.tagline}</span>
        </a>
        <nav aria-label="主選單" className={s.nav}>
          {lab.nav.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <a href={tel} className={s.phone}>
          {lab.company.phone}
        </a>
      </header>

      <main>
        <section className={s.hero}>
          <div className={s.heroText}>
            <p className={s.eyebrow}>{lab.eyebrow}</p>
            <h1 className={s.title}>
              {lab.headline.split("，").map((part, i, all) => (
                <span key={part}>{i < all.length - 1 ? `${part}，` : part}</span>
              ))}
            </h1>
            <p className={s.lead}>{lab.lead}</p>
            <form action={`${SITE}/products`} role="search" className={s.search}>
              <input
                type="search"
                name="q"
                aria-label={lab.searchPlaceholder}
                placeholder={lab.searchPlaceholder}
              />
              <button type="submit">{lab.searchButton}</button>
            </form>
          </div>

          <a href={featured.href} className={s.cabinet}>
            <span className={s.niche}>
              {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
              <img
                src={featured.image}
                alt={`${featured.brand} ${featured.model} ${featured.nameZh}`}
              />
            </span>
            <span className={s.shelfEdge} aria-hidden="true" />
            <Tag className={s.heroTag}>
              <span className={s.tagModel}>
                {featured.brand} {featured.model}
              </span>
              <span className={s.tagPrice}>{price(featured.priceTwd)}</span>
            </Tag>
          </a>
        </section>

        <ul className={s.promises}>
          {lab.promises.map((p) => (
            <li key={p.id}>
              <h2>{p.title}</h2>
              <p>{p.body}</p>
            </li>
          ))}
        </ul>

        <section className={s.section} aria-labelledby="cat-title">
          <h2 id="cat-title" className={s.h2}>
            {lab.categoriesTitle}
          </h2>
          <ul className={s.shelf}>
            {lab.categories.map((c) => (
              <li key={c.id}>
                <a href={c.href} className={s.cubby}>
                  <span className={s.cubbyImg}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img src={c.image} alt="" />
                  </span>
                  <span className={s.label}>
                    <span>{c.name}</span>
                    <span className={s.count}>{c.count} 件</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.section} aria-labelledby="new-title">
          <div className={s.head}>
            <h2 id="new-title" className={s.h2}>
              {lab.latestTitle}
            </h2>
            <a href={`${SITE}/products`} className={s.more}>
              {lab.viewAll} →
            </a>
          </div>
          <ul className={s.products}>
            {lab.latest.map((p) => (
              <li key={p.id}>
                <a href={p.href} className={`${s.card} ${p.sold ? s.isSold : ""}`}>
                  <span className={s.photo}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img src={p.image} alt="" />
                    <Tag className={p.sold ? s.soldTag : ""}>
                      {p.sold ? <span className={s.tagSold}>{lab.sold}</span> : null}
                      <span className={s.tagPrice}>{price(p.priceTwd)}</span>
                    </Tag>
                  </span>
                  <span className={s.model}>
                    {p.brand} · {p.model}
                  </span>
                  <span className={s.name}>{p.nameZh}</span>
                  <span className={s.meta}>
                    {[p.year && `${p.year} 年`, p.condition, p.warranty && `保固 ${p.warranty}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.band} aria-labelledby="steps-title">
          <div className={s.bandInner}>
            <h2 id="steps-title" className={s.h2}>
              {lab.stepsTitle}
            </h2>
            <ol className={s.steps}>
              {lab.steps.map((st, i) => (
                <li key={st.title}>
                  <span className={s.num}>{i + 1}</span>
                  <h3>{st.title}</h3>
                  <p>{st.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="services" className={s.services} aria-labelledby="svc-title">
          <div className={s.svcHead}>
            <h2 id="svc-title" className={s.h2}>
              {lab.servicesTitle}
            </h2>
            <a href={tel} className={s.call}>
              {lab.call}
            </a>
          </div>
          <ul className={s.svc}>
            {lab.services.map((sv) => (
              <li key={sv.id}>
                <h3>{sv.title}</h3>
                <p>{sv.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer id="contact" className={s.footer}>
        <div className={s.footInner}>
          <p className={s.footName}>{lab.company.name}</p>
          <address className={s.footList}>
            <a href={tel}>{lab.company.phone}</a>
            <a href={`mailto:${lab.company.email}`}>{lab.company.email}</a>
            <span>{lab.company.address}</span>
            <span>{lab.company.hours}</span>
          </address>
          <p className={s.copy}>{lab.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
