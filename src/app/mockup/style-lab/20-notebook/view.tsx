import { lab, SITE, twd } from "../_content";
import s from "./style.module.css";

const tel = `tel:${lab.company.phone.replace(/-/g, "")}`;
const featured = lab.latest[0];
const notes = [s.yellow, s.pink, s.green];
// Circle the word 實機 in red pen when the headline contains it; otherwise render as-is.
const [before, after] = lab.headlineShort[0].split("實機");

function Circled({ children }: { children: string }) {
  return (
    <span className={s.circled}>
      {children}
      <svg viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true">
        <path
          pathLength={1}
          d="M30 22 C 70 4, 168 6, 188 40 C 202 70, 140 96, 84 92 C 30 88, 4 66, 14 40 C 20 24, 52 12, 96 10"
        />
      </svg>
    </span>
  );
}

export function View() {
  return (
    <div className={s.page}>
      <header className={s.header}>
        <a href={SITE} className={s.brand}>
          {lab.brand}
          <span>— {lab.tagline}</span>
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
            <h1 className={s.title}>
              <span>
                {after === undefined ? (
                  lab.headlineShort[0]
                ) : (
                  <>
                    {before}
                    <Circled>實機</Circled>
                    {after}
                  </>
                )}
              </span>
              <span>{lab.headlineShort[1]}</span>
            </h1>
            <p className={s.lead}>{lab.lead}</p>
            <form action={`${SITE}/products`} role="search" className={s.search}>
              <input
                type="search"
                name="q"
                aria-label={lab.searchPlaceholder}
                placeholder={lab.searchPlaceholder}
              />
              <button type="submit" className={s.boxed}>
                {lab.searchButton}
              </button>
            </form>
          </div>

          <div className={s.pinboard}>
            <p className={`${s.note} ${s.yellow} ${s.eyebrow}`}>
              {lab.eyebrow.split(" · ").map((part) => (
                <span key={part}>{part}</span>
              ))}
            </p>
            <a href={featured.href} className={s.specimen}>
              <span className={s.tape} aria-hidden="true" />
              {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
              <img src={featured.image} alt={`${featured.brand} ${featured.model}`} />
              <span className={s.caption}>
                <span className={s.hand}>
                  {featured.brand} {featured.model}
                </span>
                <span>{featured.nameZh}</span>
              </span>
            </a>
            <svg className={s.arrow} viewBox="0 0 120 80" aria-hidden="true">
              <path pathLength={1} d="M6 70 C 40 72, 80 54, 104 18 M88 22 L106 14 L108 34" />
            </svg>
          </div>
        </section>

        <ul className={s.notes}>
          {lab.promises.map((p, i) => (
            <li key={p.id} className={`${s.note} ${notes[i]}`}>
              <h2>{p.title}</h2>
              <p>{p.body}</p>
            </li>
          ))}
        </ul>

        <section className={s.section} aria-labelledby="cat-title">
          <h2 id="cat-title" className={s.h2}>
            {lab.categoriesTitle}
          </h2>
          <ul className={s.index}>
            {lab.categories.map((c) => (
              <li key={c.id}>
                <a href={c.href}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                  <img src={c.image} alt="" />
                  <span className={s.indexName}>{c.name}</span>
                  <span className={s.leader} aria-hidden="true" />
                  <span className={s.hand}>{c.count}</span>
                  <span>件</span>
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
                    <span className={s.tape} aria-hidden="true" />
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img src={p.image} alt="" />
                    {p.sold && <span className={s.soldMark}>{lab.sold}</span>}
                  </span>
                  <span className={s.hand}>
                    {p.brand} · {p.model}
                  </span>
                  <span className={s.name}>{p.nameZh}</span>
                  <span className={s.meta}>
                    {[p.year && `${p.year} 年`, p.condition].filter(Boolean).join("，")}
                  </span>
                  <span className={s.priceRow}>
                    <span className={s.price}>{p.priceTwd ? twd(p.priceTwd) : lab.askPrice}</span>
                    {p.warranty && <span className={s.meta}>保固 {p.warranty}</span>}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.section} aria-labelledby="steps-title">
          <h2 id="steps-title" className={s.h2}>
            {lab.stepsTitle}
          </h2>
          <ol className={s.steps}>
            {lab.steps.map((st, i) => (
              <li key={st.title}>
                <span className={s.stepNo}>{i + 1}.</span>
                <span className={s.check} aria-hidden="true" />
                <h3>{st.title}</h3>
                <p>{st.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="services" className={s.section} aria-labelledby="svc-title">
          <div className={s.margin}>
            <h2 id="svc-title" className={s.h2}>
              {lab.servicesTitle}
            </h2>
            <ul className={s.svc}>
              {lab.services.map((sv) => (
                <li key={sv.id}>
                  <h3>{sv.title}</h3>
                  <p>{sv.body}</p>
                </li>
              ))}
            </ul>
            <a href={tel} className={`${s.boxed} ${s.call}`}>
              {lab.call}
            </a>
          </div>
        </section>
      </main>

      <footer id="contact" className={s.footer}>
        <p className={s.footName}>{lab.company.name}</p>
        <ul className={s.footList}>
          <li>
            電話 <a href={tel}>{lab.company.phone}</a>
          </li>
          <li>
            Email <a href={`mailto:${lab.company.email}`}>{lab.company.email}</a>
          </li>
          <li>地址 {lab.company.address}</li>
          <li>營業 {lab.company.hours}</li>
        </ul>
        <p className={s.copy}>{lab.copyright}</p>
      </footer>
    </div>
  );
}
