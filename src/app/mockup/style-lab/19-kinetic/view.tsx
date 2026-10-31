import Link from "next/link";
import type { CSSProperties } from "react";
import { lab, SITE, twd } from "../_content";
import s from "./style.module.css";

function Chars({ text, offset }: { text: string; offset: number }) {
  return [...text].map((ch, i) => (
    <span key={i} className={s.char} style={{ "--i": offset + i } as CSSProperties}>
      {ch}
    </span>
  ));
}

function CategoryRun({ hidden }: { hidden?: boolean }) {
  return (
    <ul className={s.run} aria-hidden={hidden || undefined}>
      {lab.categories.map((cat) => (
        <li key={cat.id}>
          <Link href={cat.href} className={s.word} tabIndex={hidden ? -1 : undefined}>
            {cat.name}
            <span className={s.chip}>
              {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
              <img src={cat.image} alt="" width={480} height={360} />
            </span>
            <span className={s.wordCount}>{cat.count} 件</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function View() {
  const c = lab.company;
  const [l1, l2] = lab.headlineShort;
  return (
    <div className={s.root}>
      <header className={s.header}>
        <Link href="/mockup/style-lab/19-kinetic" className={s.brand}>
          {lab.brand}
          <span>{lab.tagline}</span>
        </Link>
        <nav aria-label="主選單" className={s.nav}>
          {lab.nav.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <a href={`tel:${c.phone}`} className={s.phone}>
          {c.phone}
        </a>
      </header>

      <main>
        <section className={s.hero}>
          <p className={s.eyebrow}>{lab.eyebrow}</p>
          <h1 className={s.h1}>
            <span className={s.sr}>{l1 + l2}</span>
            <span className={`${s.line} ${s.lineA}`} aria-hidden="true">
              <Chars text={l1} offset={0} />
            </span>
            <span className={`${s.line} ${s.lineB}`} aria-hidden="true">
              <Chars text={l2} offset={l1.length} />
            </span>
          </h1>
          <div className={s.heroFoot}>
            <p className={s.lead}>{lab.lead}</p>
            <form action={`${SITE}/products`} className={s.search} role="search">
              <input
                name="q"
                aria-label={lab.searchPlaceholder}
                placeholder={lab.searchPlaceholder}
                className={s.input}
              />
              <button type="submit" className={s.go}>
                {lab.searchButton}
              </button>
            </form>
          </div>
        </section>

        <section className={s.cats} aria-labelledby="kn-cat">
          <h2 id="kn-cat" className={s.label}>
            {lab.categoriesTitle}
          </h2>
          <div className={s.marquee}>
            <div className={s.track}>
              <CategoryRun />
              <CategoryRun hidden />
            </div>
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

        <section className={s.latest} aria-labelledby="kn-new">
          <div className={s.latestHead}>
            <h2 id="kn-new" className={s.label}>
              {lab.latestTitle}
            </h2>
            <Link href={`${SITE}/products`} className={s.all}>
              {lab.viewAll} →
            </Link>
          </div>
          <ul className={s.rows}>
            {lab.latest.map((p) => (
              <li key={p.id}>
                <Link href={p.href} className={`${s.row} ${p.sold ? s.sold : ""}`}>
                  <span className={s.thumb}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img src={p.image} alt="" width={480} height={360} />
                  </span>
                  <span className={s.ident}>
                    <span className={s.model}>{p.model}</span>
                    <span className={s.sub}>
                      {p.brand} · {p.nameZh}
                    </span>
                  </span>
                  <span className={s.meta}>
                    {[p.year, p.condition].filter(Boolean).join(" · ")}
                    {p.warranty && <span>保固 {p.warranty}</span>}
                  </span>
                  <span className={s.price}>
                    {p.sold && <span className={s.soldTag}>{lab.sold}</span>}
                    <span className={s.priceVal}>
                      {p.priceTwd ? twd(p.priceTwd) : lab.askPrice}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.steps} aria-labelledby="kn-steps">
          <h2 id="kn-steps" className={s.label}>
            {lab.stepsTitle}
          </h2>
          <ol className={s.stepList}>
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

        <section id="services" className={s.services} aria-labelledby="kn-svc">
          <h2 id="kn-svc" className={s.label}>
            {lab.servicesTitle}
          </h2>
          <ul className={s.svc}>
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
