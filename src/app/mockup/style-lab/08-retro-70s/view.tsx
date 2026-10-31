import Link from "next/link";
import { lab, SITE, twd } from "../_content";
import s from "./style.module.css";

const tel = `tel:${lab.company.phone}`;
const heroItem = lab.latest[0];

function Stripes({ className }: { className?: string }) {
  return (
    <div className={`${s.stripes} ${className ?? ""}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}

export function View() {
  return (
    <div className={s.root}>
      <header className={s.header}>
        <Link href={SITE} className={s.brand}>
          <span className={s.brandName}>{lab.brand}</span>
          <span className={s.tagline}>{lab.tagline}</span>
        </Link>
        <nav className={s.nav} aria-label="主要">
          {lab.nav.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
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
            <h1 className={s.h1}>
              <span>{lab.headlineShort[0]}</span>
              <span className={s.h1b}>{lab.headlineShort[1]}</span>
            </h1>
            <p className={s.lead}>{lab.lead}</p>
            <form action={`${SITE}/products`} className={s.search} role="search">
              <input
                name="q"
                type="search"
                aria-label={lab.searchPlaceholder}
                placeholder={lab.searchPlaceholder}
              />
              <button type="submit">{lab.searchButton}</button>
            </form>
          </div>
          <div className={s.arch} aria-hidden="true">
            <i className={s.a1} />
            <i className={s.a2} />
            <i className={s.a3} />
            <i className={s.a4} />
            <span className={s.window}>
              {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
              <img src={heroItem.image} alt="" width={480} height={360} />
            </span>
          </div>
        </section>
        <Stripes className={s.heroBand} />

        <ul className={s.promises}>
          {lab.promises.map((p) => (
            <li key={p.id}>
              <strong>{p.title}</strong>
              <span>{p.body}</span>
            </li>
          ))}
        </ul>

        <section className={s.section} aria-labelledby="r-cat">
          <h2 id="r-cat" className={s.h2}>
            {lab.categoriesTitle}
          </h2>
          <ul className={s.cats}>
            {lab.categories.map((c) => (
              <li key={c.id}>
                <Link href={c.href} className={s.cat}>
                  <span className={s.plate}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img src={c.image} alt="" width={480} height={360} />
                  </span>
                  <span className={s.catName}>{c.name}</span>
                  <span className={s.count}>
                    <b>{c.count}</b> 件
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.section} aria-labelledby="r-new">
          <div className={s.head}>
            <h2 id="r-new" className={s.h2}>
              {lab.latestTitle}
            </h2>
            <Link href={`${SITE}/products`} className={s.more}>
              {lab.viewAll}
            </Link>
          </div>
          <ul className={s.items}>
            {lab.latest.map((p) => (
              <li key={p.id}>
                <Link href={p.href} className={`${s.item} ${p.sold ? s.sold : ""}`}>
                  <span className={s.screen}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img src={p.image} alt="" width={480} height={360} />
                    {p.sold && <span className={s.sticker}>{lab.sold}</span>}
                  </span>
                  <span className={s.model}>
                    {p.brand} · {p.model}
                  </span>
                  <strong className={s.name}>{p.nameZh}</strong>
                  <span className={s.meta}>
                    {[p.year, p.condition].filter(Boolean).join(" · ")}
                    {p.warranty && ` · 保固${p.warranty}`}
                  </span>
                  <span className={s.price}>
                    {p.sold ? (
                      <del>{p.priceTwd ? twd(p.priceTwd) : lab.askPrice}</del>
                    ) : p.priceTwd ? (
                      twd(p.priceTwd)
                    ) : (
                      lab.askPrice
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.section} aria-labelledby="r-steps">
          <h2 id="r-steps" className={s.h2}>
            {lab.stepsTitle}
          </h2>
          <ol className={s.steps}>
            {lab.steps.map((st, i) => (
              <li key={st.title}>
                <span className={s.disc} aria-hidden="true">
                  {i + 1}
                </span>
                <strong>{st.title}</strong>
                <span>{st.body}</span>
              </li>
            ))}
          </ol>
        </section>

        <section id="services" className={s.services} aria-labelledby="r-svc">
          <h2 id="r-svc" className={s.h2}>
            {lab.servicesTitle}
          </h2>
          <ul className={s.svcList}>
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
        </section>
      </main>

      <footer id="contact" className={s.footer}>
        <Stripes />
        <div className={s.footInner}>
          <p className={s.footBrand}>{lab.brand}</p>
          <dl className={s.contact}>
            <div>
              <dt>公司</dt>
              <dd>{lab.company.name}</dd>
            </div>
            <div>
              <dt>電話</dt>
              <dd>
                <a href={tel}>{lab.company.phone}</a>
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${lab.company.email}`}>{lab.company.email}</a>
              </dd>
            </div>
            <div>
              <dt>地址</dt>
              <dd>{lab.company.address}</dd>
            </div>
            <div>
              <dt>營業</dt>
              <dd>{lab.company.hours}</dd>
            </div>
          </dl>
          <p className={s.copy}>{lab.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
