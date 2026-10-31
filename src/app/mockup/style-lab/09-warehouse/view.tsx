import Link from "next/link";
import { lab, SITE, twd } from "../_content";
import s from "./style.module.css";

// Rack-label barcode: bar widths derived from the category id's letters (decorative, not scannable).
function Bars({ seed }: { seed: string }) {
  return (
    <span className={s.bars} aria-hidden="true">
      {[...seed.repeat(2)].map((ch, i) => (
        <i key={i} style={{ width: `${(ch.charCodeAt(0) % 3) + 1}px` }} />
      ))}
    </span>
  );
}

export function View() {
  const c = lab.company;
  return (
    <div className={s.root}>
      <div className={s.tapeThin} aria-hidden="true" />
      <header className={s.header}>
        <Link href="/mockup/style-lab/09-warehouse" className={s.brand}>
          <span className={s.brandMark}>{lab.brand}</span>
          <span className={s.tagline}>{lab.tagline}</span>
        </Link>
        <nav aria-label="主選單" className={s.nav}>
          {lab.nav.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <a href={`tel:${c.phone}`} className={s.phone}>
          <span className={s.phoneLabel}>來電</span>
          {c.phone}
        </a>
      </header>

      <main>
        <section className={s.hero}>
          <p className={s.eyebrow}>{lab.eyebrow}</p>
          <h1 className={s.h1}>
            <span className={s.paint}>{lab.headlineShort[0]}</span>
            <span className={s.paint}>{lab.headlineShort[1]}</span>
          </h1>
          <div className={s.heroFoot}>
            <p className={s.lead}>{lab.lead}</p>
            <form action={`${SITE}/products`} className={s.search} role="search">
              <label htmlFor="wh-q" className={s.searchLabel}>
                找設備
              </label>
              <div className={s.searchRow}>
                <input
                  id="wh-q"
                  name="q"
                  aria-label={lab.searchPlaceholder}
                  placeholder={lab.searchPlaceholder}
                  className={s.input}
                />
                <button type="submit" className={s.go}>
                  {lab.searchButton}
                </button>
              </div>
            </form>
          </div>
        </section>
        <div className={s.tape} aria-hidden="true" />

        <ul className={s.promises}>
          {lab.promises.map((p) => (
            <li key={p.id}>
              <strong>{p.title}</strong>
              <span>{p.body}</span>
            </li>
          ))}
        </ul>

        <section className={s.section} aria-labelledby="wh-cat">
          <h2 id="wh-cat" className={s.h2}>
            {lab.categoriesTitle}
          </h2>
          <ul className={s.rack}>
            {lab.categories.map((cat) => (
              <li key={cat.id} className={s.bay}>
                <Link href={cat.href} className={s.bayLink}>
                  <span className={s.crate}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img src={cat.image} alt="" width={480} height={360} />
                  </span>
                  <span className={s.beam} aria-hidden="true" />
                  <span className={s.rackLabel}>
                    <span className={s.code}>{cat.id.toUpperCase()}</span>
                    <span className={s.labelName}>{cat.name}</span>
                    <span className={s.labelCount}>
                      <b>{cat.count}</b> 件
                    </span>
                    <Bars seed={cat.id} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.section} aria-labelledby="wh-new">
          <div className={s.sectionHead}>
            <h2 id="wh-new" className={s.h2}>
              {lab.latestTitle}
            </h2>
            <Link href={`${SITE}/products`} className={s.more}>
              {lab.viewAll} →
            </Link>
          </div>
          <ul className={s.tags}>
            {lab.latest.map((p) => (
              <li key={p.id}>
                <Link href={p.href} className={`${s.tag} ${p.sold ? s.sold : ""}`}>
                  <span className={s.hole} aria-hidden="true" />
                  <span className={s.tagHead}>
                    {p.brand} · {p.model}
                  </span>
                  <span className={s.tagImg}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img src={p.image} alt="" width={480} height={360} />
                  </span>
                  <span className={s.tagName}>{p.nameZh}</span>
                  <span className={s.tagMeta}>
                    {[p.year, p.condition].filter(Boolean).join(" · ")}
                    {p.warranty && ` · 保固 ${p.warranty}`}
                  </span>
                  <span className={s.price}>{p.priceTwd ? twd(p.priceTwd) : lab.askPrice}</span>
                  {p.sold && <span className={s.soldTape}>{lab.sold}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.floor} aria-labelledby="wh-steps">
          <h2 id="wh-steps" className={s.h2}>
            {lab.stepsTitle}
          </h2>
          <ol className={s.steps}>
            {lab.steps.map((st, i) => (
              <li key={st.title} className={s.step}>
                <span className={s.stepNo} aria-hidden="true">
                  {i + 1}
                </span>
                <span className={s.stepText}>
                  <strong>{st.title}</strong>
                  <span>{st.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section id="services" className={s.services} aria-labelledby="wh-svc">
          <h2 id="wh-svc" className={s.h2}>
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
          <a href={`tel:${c.phone}`} className={s.call}>
            {lab.call}
          </a>
        </section>
      </main>

      <div className={s.tapeThin} aria-hidden="true" />
      <footer id="contact" className={s.footer}>
        <p className={s.footName}>{c.name}</p>
        <dl className={s.contact}>
          <div>
            <dt>電話</dt>
            <dd>
              <a href={`tel:${c.phone}`}>{c.phone}</a>
            </dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${c.email}`}>{c.email}</a>
            </dd>
          </div>
          <div>
            <dt>地址</dt>
            <dd>{c.address}</dd>
          </div>
          <div>
            <dt>營業時間</dt>
            <dd>{c.hours}</dd>
          </div>
        </dl>
        <p className={s.copy}>{lab.copyright}</p>
      </footer>
    </div>
  );
}
