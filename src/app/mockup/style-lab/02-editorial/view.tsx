import { lab, SITE, twd } from "../_content";
import s from "./style.module.css";

const tel = `tel:${lab.company.phone.replace(/-/g, "")}`;
const [cover, ...rest] = lab.latest;
const [h1a, h1b] = lab.headline.split("，");
const headLines = [`${h1a}，`, h1b];
const meta = (p: (typeof lab.latest)[number]) =>
  [p.year && `${p.year} 年`, p.condition].filter(Boolean).join(" · ");
const price = (p: (typeof lab.latest)[number]) => (p.priceTwd ? twd(p.priceTwd) : lab.askPrice);

function Pick({ p, big }: { p: (typeof lab.latest)[number]; big?: boolean }) {
  return (
    <a href={p.href} className={`${s.pick} ${big ? s.pickBig : ""} ${p.sold ? s.sold : ""}`}>
      <span className={s.pickImg}>
        {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
        <img src={p.image} alt="" />
      </span>
      <span className={s.pickModel}>
        {p.brand} {p.model}
      </span>
      <strong className={s.pickName}>{p.nameZh}</strong>
      <span className={s.pickMeta}>
        {meta(p)}
        {p.warranty && ` · 保固 ${p.warranty}`}
      </span>
      <span className={s.pickPrice}>
        {p.sold ? (
          <>
            <del>{price(p)}</del> <em className={s.soldTag}>{lab.sold}</em>
          </>
        ) : (
          price(p)
        )}
      </span>
    </a>
  );
}

export function View() {
  return (
    <div className={s.root}>
      <header className={s.mast}>
        <div className={s.mastTop}>
          <span>{lab.eyebrow}</span>
          <a href={tel}>{lab.company.phone}</a>
        </div>
        <div className={s.mastMain}>
          <a href={SITE} className={s.brand}>
            {lab.brand}
          </a>
          <span className={s.tagline}>{lab.tagline}</span>
          <nav className={s.nav} aria-label="主選單">
            {lab.nav.map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <section className={s.hero}>
          <h1 className={s.h1}>
            {headLines.map((l) => (
              <span key={l} className={s.line}>
                <span>{l}</span>
              </span>
            ))}
          </h1>
          <div className={s.heroBody}>
            <div className={s.leadCol}>
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
            <figure className={s.heroFig}>
              <a href={cover.href} className={s.heroPlate}>
                {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                <img src={cover.image} alt={`${cover.brand} ${cover.model} ${cover.nameZh}`} />
              </a>
              <figcaption>
                <b>圖</b> {cover.brand} {cover.model}，{cover.nameZh}。
                {cover.priceTwd ? twd(cover.priceTwd) : lab.askPrice}
              </figcaption>
            </figure>
          </div>
        </section>

        <section className={s.deck} aria-label="我們提供">
          {lab.promises.map((p) => (
            <div key={p.id} className={s.deckItem}>
              <h2>{p.title}</h2>
              <p>{p.body}</p>
            </div>
          ))}
        </section>

        <section className={s.toc}>
          <div className={s.tocHead}>
            <span className={s.kicker}>Contents</span>
            <h2 className={s.h2}>{lab.categoriesTitle}</h2>
          </div>
          <ol className={s.tocList}>
            {lab.categories.map((c) => (
              <li key={c.id}>
                <a href={c.href}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                  <img src={c.image} alt="" className={s.tocThumb} />
                  <span className={s.tocName}>{c.name}</span>
                  <span className={s.tocDots} aria-hidden="true" />
                  <span className={s.tocCount}>{c.count} 件</span>
                </a>
              </li>
            ))}
          </ol>
          <div className={s.tocPlate} aria-hidden="true">
            {lab.categories.map((c) => (
              // eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs
              <img key={c.id} src={c.image} alt="" />
            ))}
          </div>
        </section>

        <section className={s.latest}>
          <div className={s.secHead}>
            <span className={s.kicker}>New arrivals</span>
            <h2 className={s.h2}>{lab.latestTitle}</h2>
            <a href={`${SITE}/products`} className={s.more}>
              {lab.viewAll} →
            </a>
          </div>
          <div className={s.picks}>
            <Pick p={cover} big />
            {rest.map((p) => (
              <Pick key={p.id} p={p} />
            ))}
          </div>
        </section>

        <section className={s.lower}>
          <div className={s.steps}>
            <span className={s.kicker}>How to buy</span>
            <h2 className={s.h2}>{lab.stepsTitle}</h2>
            <ol>
              {lab.steps.map((st, i) => (
                <li key={st.title}>
                  <span className={s.num}>{i + 1}</span>
                  <div>
                    <h3>{st.title}</h3>
                    <p>{st.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <aside id="services" className={s.side}>
            <h2>{lab.servicesTitle}</h2>
            <ul>
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
          </aside>
        </section>
      </main>

      <footer id="contact" className={s.colophon}>
        <span className={s.colBrand}>{lab.brand}</span>
        <dl>
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
            <dt>信箱</dt>
            <dd>
              <a href={`mailto:${lab.company.email}`}>{lab.company.email}</a>
            </dd>
          </div>
          <div>
            <dt>地址</dt>
            <dd>{lab.company.address}</dd>
          </div>
          <div>
            <dt>時間</dt>
            <dd>{lab.company.hours}</dd>
          </div>
        </dl>
        <small>{lab.copyright}</small>
      </footer>
    </div>
  );
}
