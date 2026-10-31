import { lab, SITE, twd } from "../_content";
import { Icon, Scene } from "./scene";
import s from "./style.module.css";

const tel = `tel:${lab.company.phone.replace(/-/g, "")}`;
const tints = [s.mint, s.peach, s.lilac, s.sky];

export function View() {
  return (
    <div className={s.page}>
      <header className={s.header}>
        <div className={s.bar}>
          <a href={SITE} className={s.brand}>
            <span className={s.logo} aria-hidden="true">
              A
            </span>
            <span className={s.brandText}>
              <strong>{lab.brand}</strong>
              <span>{lab.tagline}</span>
            </span>
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
        <section className={s.hero}>
          <div className={s.heroText}>
            <p className={s.eyebrow}>{lab.eyebrow}</p>
            <h1 className={s.title}>
              {lab.headlineShort[0]}
              <br />
              <span className={s.mark}>{lab.headlineShort[1]}</span>
            </h1>
            <p className={s.lead}>{lab.lead}</p>
            <form action={`${SITE}/products`} role="search" className={s.search}>
              <input
                type="search"
                name="q"
                aria-label={lab.searchPlaceholder}
                placeholder={lab.searchPlaceholder}
              />
              <button type="submit" className={s.squish}>
                {lab.searchButton}
              </button>
            </form>
          </div>
          <Scene />
        </section>

        <ul className={s.promises}>
          {lab.promises.map((p, i) => (
            <li key={p.id} className={tints[i]}>
              <span className={s.icon}>
                <Icon name={p.id} />
              </span>
              <span>
                <strong>{p.title}</strong>
                <span>{p.body}</span>
              </span>
            </li>
          ))}
        </ul>

        <section className={s.section} aria-labelledby="cat-title">
          <h2 id="cat-title" className={s.h2}>
            {lab.categoriesTitle}
          </h2>
          <ul className={s.cats}>
            {lab.categories.map((c, i) => (
              <li key={c.id}>
                <a href={c.href} className={`${s.cat} ${tints[i % 4]}`}>
                  <span className={s.bubble}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img src={c.image} alt="" />
                  </span>
                  <span className={s.catName}>{c.name}</span>
                  <span className={s.count}>{c.count} 件</span>
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
              {lab.viewAll}
            </a>
          </div>
          <ul className={s.products}>
            {lab.latest.map((p, i) => (
              <li key={p.id}>
                <a href={p.href} className={`${s.card} ${p.sold ? s.isSold : ""}`}>
                  <span className={`${s.photo} ${tints[i % 4]}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img src={p.image} alt="" />
                    {p.sold && <span className={s.sticker}>{lab.sold}</span>}
                  </span>
                  <span className={s.model}>
                    {p.brand} · {p.model}
                  </span>
                  <span className={s.name}>{p.nameZh}</span>
                  <span className={s.meta}>
                    {[p.year && `${p.year} 年`, p.condition].filter(Boolean).join(" · ")}
                  </span>
                  <span className={s.foot}>
                    <span className={s.price}>{p.priceTwd ? twd(p.priceTwd) : lab.askPrice}</span>
                    {p.warranty && <span className={s.chip}>保固 {p.warranty}</span>}
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
              <li key={st.title} className={tints[i]}>
                <span className={s.num}>{i + 1}</span>
                <h3>{st.title}</h3>
                <p>{st.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="services" className={s.services} aria-labelledby="svc-title">
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
          <a href={tel} className={`${s.call} ${s.squish}`}>
            {lab.call}
          </a>
        </section>
      </main>

      <footer id="contact" className={s.footer}>
        <div className={s.footInner}>
          <p className={s.footName}>{lab.company.name}</p>
          <ul className={s.footList}>
            <li>
              <a href={tel}>{lab.company.phone}</a>
            </li>
            <li>
              <a href={`mailto:${lab.company.email}`}>{lab.company.email}</a>
            </li>
            <li>{lab.company.address}</li>
            <li>{lab.company.hours}</li>
          </ul>
          <p className={s.copy}>{lab.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
