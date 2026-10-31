import { lab, SITE, twd } from "../_content";
import s from "./style.module.css";

type Item = (typeof lab.latest)[number];
const tel = `tel:${lab.company.phone.replace(/-/g, "")}`;
const price = (p: Item) => (p.priceTwd ? twd(p.priceTwd) : lab.askPrice);
const kanji = ["一", "二", "三"];
const cover = lab.latest[0];

function Tag({ p }: { p: Item }) {
  return (
    <span className={s.hang}>
      <span className={s.tag}>
        <span className={s.tagModel}>
          {p.brand}・{p.model}
        </span>
        <span className={s.tagName}>{p.nameZh}</span>
        <span className={s.tagMeta}>
          {[p.year && `${p.year} 年`, p.condition, p.warranty && `保固${p.warranty}`]
            .filter(Boolean)
            .join("／")}
        </span>
        <span className={s.tagPrice}>{p.sold ? <del>{price(p)}</del> : price(p)}</span>
        {p.sold && <span className={s.stamp}>{lab.sold}</span>}
      </span>
    </span>
  );
}

export function View() {
  return (
    <div className={s.root}>
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
          <h1 className={s.h1}>
            {lab.headlineShort.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </h1>
          <div className={s.heroText}>
            <p className={s.eyebrow}>{lab.eyebrow}</p>
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
          <a href={cover.href} className={s.heroItem}>
            {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
            <img src={cover.image} alt={`${cover.brand} ${cover.model}`} />
            <Tag p={cover} />
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

        <section className={s.section}>
          <h2 className={s.h2}>{lab.categoriesTitle}</h2>
          <ul className={s.cats}>
            {lab.categories.map((c) => (
              <li key={c.id}>
                <a href={c.href}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                  <img src={c.image} alt="" />
                  <span className={s.catName}>{c.name}</span>
                  <span className={s.catCount}>{c.count} 件</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.section}>
          <div className={s.secHead}>
            <h2 className={s.h2}>{lab.latestTitle}</h2>
            <a href={`${SITE}/products`} className={s.more}>
              {lab.viewAll}
            </a>
          </div>
          <ul className={s.items}>
            {lab.latest.map((p) => (
              <li key={p.id} className={p.sold ? s.isSold : undefined}>
                <a href={p.href}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                  <img src={p.image} alt="" />
                  <Tag p={p} />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.section}>
          <h2 className={s.h2}>{lab.stepsTitle}</h2>
          <ol className={s.steps}>
            {lab.steps.map((st, i) => (
              <li key={st.title}>
                <span className={s.kanji} aria-hidden="true">
                  {kanji[i]}
                </span>
                <h3>{st.title}</h3>
                <p>{st.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="services" className={s.section}>
          <h2 className={s.h2}>{lab.servicesTitle}</h2>
          <ul className={s.services}>
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
        <p className={s.footBrand}>{lab.company.name}</p>
        <dl>
          <dt>電話</dt>
          <dd>
            <a href={tel}>{lab.company.phone}</a>
          </dd>
          <dt>信箱</dt>
          <dd>
            <a href={`mailto:${lab.company.email}`}>{lab.company.email}</a>
          </dd>
          <dt>地址</dt>
          <dd>{lab.company.address}</dd>
          <dt>營業</dt>
          <dd>{lab.company.hours}</dd>
        </dl>
        <small>{lab.copyright}</small>
      </footer>
    </div>
  );
}
