import { lab, SITE, twd } from "../_content";
import s from "./style.module.css";

type Item = (typeof lab.latest)[number];
const tel = `tel:${lab.company.phone.replace(/-/g, "")}`;
const svcTone = [s.red, s.green, s.black];

export function View() {
  return (
    <div className={s.root}>
      <header className={s.header}>
        <div className={s.signWrap}>
          <a href={SITE} className={s.sign}>
            <span className={s.signBrand}>{lab.brand}</span>
            <span className={s.signName}>{lab.tagline}</span>
            <span className={s.signServices} aria-hidden="true">
              {lab.services.map((sv) => sv.title).join("・")}
            </span>
          </a>
          <a href={tel} className={s.signPhone}>
            <span>TEL</span>
            {lab.company.phone}
          </a>
        </div>
        <nav aria-label="主選單" className={s.awning}>
          {lab.nav.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
      </header>

      <main className={s.main}>
        <section className={s.hero}>
          <p className={s.vertical}>{lab.eyebrow}</p>
          <div className={s.board}>
            <h1 className={s.h1}>
              {lab.headlineShort.map((l) => (
                <span key={l}>{l}</span>
              ))}
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
        </section>

        <ul className={s.plates}>
          {lab.promises.map((p) => (
            <li key={p.id}>
              <h2>{p.title}</h2>
              <p>{p.body}</p>
            </li>
          ))}
        </ul>

        <section className={s.section}>
          <h2 className={s.banner}>{lab.categoriesTitle}</h2>
          <ul className={s.boxes}>
            {lab.categories.map((c) => (
              <li key={c.id}>
                <a href={c.href} className={s.box}>
                  <span className={s.boxTop}>{c.name}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                  <img src={c.image} alt="" />
                  <span className={s.boxCount}>{c.count} 件</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.section}>
          <div className={s.bannerRow}>
            <h2 className={s.banner}>{lab.latestTitle}</h2>
            <a href={`${SITE}/products`} className={s.more}>
              {lab.viewAll} ▶
            </a>
          </div>
          <ul className={s.cards}>
            {lab.latest.map((p: Item) => (
              <li key={p.id}>
                <a href={p.href} className={`${s.card} ${p.sold ? s.isSold : ""}`}>
                  <span className={s.cardImg}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img src={p.image} alt="" />
                    {p.sold && <span className={s.soldPaper}>{lab.sold}</span>}
                  </span>
                  <span className={s.cardModel}>
                    {p.brand}・{p.model}
                  </span>
                  <strong className={s.cardName}>{p.nameZh}</strong>
                  <span className={s.cardMeta}>
                    {[p.year && `${p.year} 年`, p.condition].filter(Boolean).join("・")}
                  </span>
                  {p.warranty && <span className={s.warranty}>保固 {p.warranty}</span>}
                  <span className={s.cardPrice}>
                    {p.sold ? (
                      <del>{p.priceTwd ? twd(p.priceTwd) : lab.askPrice}</del>
                    ) : p.priceTwd ? (
                      twd(p.priceTwd)
                    ) : (
                      lab.askPrice
                    )}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.section}>
          <h2 className={s.banner}>{lab.stepsTitle}</h2>
          <ol className={s.steps}>
            {lab.steps.map((st, i) => (
              <li key={st.title}>
                <span className={s.stepNum} aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{st.title}</h3>
                <p>{st.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="services" className={s.night}>
          <h2 className={s.nightTitle}>{lab.servicesTitle}</h2>
          <ul className={s.hanging}>
            {lab.services.map((sv, i) => (
              <li key={sv.id}>
                <h3 className={`${s.hangSign} ${svcTone[i]}`}>{sv.title}</h3>
                <p>{sv.body}</p>
              </li>
            ))}
          </ul>
          <a href={tel} className={s.neon}>
            {lab.call}
          </a>
        </section>
      </main>

      <footer id="contact" className={s.footer}>
        <div className={s.footBoard}>
          <strong>{lab.company.name}</strong>
          <a href={tel}>電話 {lab.company.phone}</a>
          <a href={`mailto:${lab.company.email}`}>{lab.company.email}</a>
          <span>{lab.company.hours}</span>
        </div>
        <address className={s.doorPlate}>{lab.company.address}</address>
        <small className={s.copy}>{lab.copyright}</small>
      </footer>
    </div>
  );
}
