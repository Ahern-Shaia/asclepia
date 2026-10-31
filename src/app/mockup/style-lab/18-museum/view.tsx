import Link from "next/link";
import type { CSSProperties } from "react";
import { lab, SITE, twd } from "../_content";
import s from "./style.module.css";

type Item = (typeof lab.latest)[number];

const tel = `tel:${lab.company.phone}`;
const featured = lab.latest[0];
const wings = [lab.categories.slice(0, 3), lab.categories.slice(3)];
const [headA, headB] = lab.headline.split("，");
// Where each placeholder drawing ends (px of 480×360), so the object sits on its plinth.
const drawingBottom: Record<string, number> = {
  ultrasound: 296,
  monitor: 244,
  analyzer: 274,
  centrifuge: 264,
};
const objectStyle = (p: Item) => ({ "--b": drawingBottom[p.categoryId] ?? 300 }) as CSSProperties;
const priceOf = (p: Item) => (p.priceTwd ? twd(p.priceTwd) : lab.askPrice);

function Label({ p }: { p: Item }) {
  return (
    <span className={s.label}>
      <span className={s.maker}>
        {p.brand} · {p.model}
      </span>
      <strong className={s.title}>{p.nameZh}</strong>
      <span className={s.meta}>
        {[p.year, p.condition].filter(Boolean).join("，")}
        {p.warranty && `｜保固${p.warranty}`}
      </span>
      <span className={s.price}>
        {p.sold ? (
          <>
            <i className={s.redDot} aria-hidden="true" />
            {lab.sold}　<del>{priceOf(p)}</del>
          </>
        ) : (
          priceOf(p)
        )}
      </span>
    </span>
  );
}

export function View() {
  return (
    <div className={s.root}>
      <header className={s.header}>
        <Link href={SITE} className={s.brand}>
          {lab.brand}
          <span>{lab.tagline}</span>
        </Link>
        <nav className={s.nav} aria-label="主要">
          {lab.nav.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
          <a href={tel}>{lab.company.phone}</a>
        </nav>
      </header>

      <main>
        <section className={s.hero}>
          <div className={s.wallText}>
            <p className={s.eyebrow}>{lab.eyebrow}</p>
            <h1 className={s.h1}>
              <span>{headA}，</span>
              <span>{headB}</span>
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

          <Link href={featured.href} className={`${s.exhibit} ${s.feature}`}>
            <span className={s.spot} aria-hidden="true" />
            <span className={s.object} style={objectStyle(featured)}>
              {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
              <img src={featured.image} alt="" width={480} height={360} />
            </span>
            <span className={s.plinth} aria-hidden="true" />
            <Label p={featured} />
          </Link>
        </section>

        <ul className={s.promises}>
          {lab.promises.map((p) => (
            <li key={p.id}>
              <strong>{p.title}</strong>
              <span>{p.body}</span>
            </li>
          ))}
        </ul>

        <section className={s.section} aria-labelledby="m-cat">
          <h2 id="m-cat" className={s.h2}>
            {lab.categoriesTitle}
          </h2>
          <p className={s.note}>展廳面積依件數比例</p>
          <div className={s.plan}>
            {wings.map((wing, i) => (
              <ul key={i} className={s.wing}>
                {wing.map((c) => (
                  <li key={c.id} style={{ flexGrow: c.count, "--n": c.count } as CSSProperties}>
                    <Link href={c.href} className={s.room}>
                      <span className={s.roomName}>{c.name}</span>
                      <span className={s.roomCount}>{c.count} 件</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </section>

        <section className={s.section} aria-labelledby="m-new">
          <div className={s.head}>
            <h2 id="m-new" className={s.h2}>
              {lab.latestTitle}
            </h2>
            <Link href={`${SITE}/products`} className={s.more}>
              {lab.viewAll}
            </Link>
          </div>
          <ul className={s.gallery}>
            {lab.latest.map((p) => (
              <li key={p.id}>
                <Link href={p.href} className={`${s.exhibit} ${p.sold ? s.sold : ""}`}>
                  <span className={s.object} style={objectStyle(p)}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img src={p.image} alt="" width={480} height={360} />
                  </span>
                  <span className={s.plinth}>
                    <Label p={p} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.section} aria-labelledby="m-steps">
          <h2 id="m-steps" className={s.h2}>
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

        <section id="services" className={s.services} aria-labelledby="m-svc">
          <h2 id="m-svc" className={s.h2}>
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
        <p className={s.footBrand}>{lab.brand}</p>
        <dl className={s.desk}>
          <div>
            <dt>營業時間</dt>
            <dd>{lab.company.hours}</dd>
          </div>
          <div>
            <dt>地址</dt>
            <dd>{lab.company.address}</dd>
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
            <dt>公司</dt>
            <dd>{lab.company.name}</dd>
          </div>
        </dl>
        <p className={s.copy}>{lab.copyright}</p>
      </footer>
    </div>
  );
}
