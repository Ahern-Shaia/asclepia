import { lab, SITE, twd } from "../_content";
import s from "./style.module.css";

const tel = `tel:${lab.company.phone.replace(/-/g, "")}`;
const meta = (year?: number, condition?: string) =>
  [year && `${year} 年`, condition].filter(Boolean).join(" · ");
const featured = lab.latest[0];

export function View() {
  return (
    <div className={s.page}>
      <header className={s.header}>
        <div className={s.bar}>
          <a href={SITE} className={s.brand}>
            <span className={s.brandName}>{lab.brand}</span>
            <span className={s.tagline}>{lab.tagline}</span>
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
        </div>
      </header>

      <main>
        <section className={s.hero} aria-labelledby="hero-title">
          <p className={`${s.eyebrow} ${s.in1}`}>{lab.eyebrow}</p>
          <h1 id="hero-title" className={s.title}>
            <span className={s.in2}>{lab.headlineShort[0]}</span>
            <span className={s.in3}>{lab.headlineShort[1]}</span>
          </h1>
          <p className={`${s.lead} ${s.in4}`}>{lab.lead}</p>
          <form action={`${SITE}/products`} role="search" className={`${s.search} ${s.in4}`}>
            <input
              type="search"
              name="q"
              aria-label={lab.searchPlaceholder}
              placeholder={lab.searchPlaceholder}
            />
            <button type="submit">{lab.searchButton}</button>
          </form>

          <figure className={s.stage}>
            <div className={s.product}>
              {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
              <img src={featured.image} alt={`${featured.brand} ${featured.model}`} />
            </div>
            <div className={s.floor} aria-hidden="true" />
            <figcaption className={s.callouts}>
              <a href={featured.href} className={`${s.callout} ${s.cA}`}>
                <span className={s.mono}>
                  {featured.brand} {featured.model}
                </span>
                <span>{featured.nameZh}</span>
              </a>
              <span className={`${s.callout} ${s.cB}`}>
                <span className={s.mono}>年份 · 狀況</span>
                <span>{meta(featured.year, featured.condition)}</span>
              </span>
              {featured.warranty && (
                <span className={`${s.callout} ${s.cC}`}>
                  <span className={s.mono}>保固</span>
                  <span>{featured.warranty}</span>
                </span>
              )}
              <span className={`${s.callout} ${s.cD}`}>
                <span className={s.mono}>售價</span>
                <span>{featured.priceTwd ? twd(featured.priceTwd) : lab.askPrice}</span>
              </span>
            </figcaption>
          </figure>
        </section>

        <ul className={`${s.promises} ${s.reveal}`}>
          {lab.promises.map((p) => (
            <li key={p.id}>
              <h2>{p.title}</h2>
              <p>{p.body}</p>
            </li>
          ))}
        </ul>

        <section className={`${s.section} ${s.reveal}`} aria-labelledby="cat-title">
          <h2 id="cat-title" className={s.h2}>
            {lab.categoriesTitle}
          </h2>
          <ul className={s.cats}>
            {lab.categories.map((c) => (
              <li key={c.id}>
                <a href={c.href} className={s.cat}>
                  <span className={s.catImg}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img src={c.image} alt="" />
                  </span>
                  <span className={s.catName}>{c.name}</span>
                  <span className={s.catCount}>{c.count} 件</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${s.section} ${s.reveal}`} aria-labelledby="new-title">
          <div className={s.sectionHead}>
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
                  <span className={s.cardImg}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img src={p.image} alt="" />
                    {p.sold && <span className={s.soldTag}>{lab.sold}</span>}
                  </span>
                  <span className={s.mono}>
                    {p.brand} · {p.model}
                  </span>
                  <span className={s.cardName}>{p.nameZh}</span>
                  <span className={s.cardMeta}>{meta(p.year, p.condition)}</span>
                  <span className={s.cardFoot}>
                    <span className={s.price}>{p.priceTwd ? twd(p.priceTwd) : lab.askPrice}</span>
                    {p.warranty && <span className={s.warranty}>保固 {p.warranty}</span>}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${s.section} ${s.reveal}`} aria-labelledby="steps-title">
          <h2 id="steps-title" className={s.h2}>
            {lab.stepsTitle}
          </h2>
          <ol className={s.steps}>
            {lab.steps.map((st, i) => (
              <li key={st.title}>
                <span className={s.stepNo}>{i + 1}</span>
                <h3>{st.title}</h3>
                <p>{st.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="services" className={`${s.services} ${s.reveal}`} aria-labelledby="svc-title">
          <h2 id="svc-title" className={s.h2}>
            {lab.servicesTitle}
          </h2>
          <ul className={s.svcList}>
            {lab.services.map((sv) => (
              <li key={sv.id}>
                <h3>{sv.title}</h3>
                <p>{sv.body}</p>
              </li>
            ))}
          </ul>
          <a href={tel} className={s.call}>
            {lab.call}
          </a>
        </section>
      </main>

      <footer id="contact" className={s.footer}>
        <div className={s.footInner}>
          <p className={s.footName}>{lab.company.name}</p>
          <dl className={s.footList}>
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
              <dt>營業時間</dt>
              <dd>{lab.company.hours}</dd>
            </div>
          </dl>
          <p className={s.copy}>{lab.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
