import Link from "next/link";
import { lab, SITE, twd } from "../_content";
import s from "./style.module.css";

const stickerShapes = [s.round, s.tag, s.burst];
const tileColors = [s.cYellow, s.cLime, s.cSky, s.cPink, s.cTomato, s.cWhite];

export function View() {
  const c = lab.company;
  return (
    <div className={s.root}>
      <header className={s.header}>
        <Link href="/mockup/style-lab/04-neo-brutal" className={s.brand}>
          <span className={s.brandChip}>{lab.brand}</span>
          <span className={s.tagline}>{lab.tagline}</span>
        </Link>
        <nav aria-label="主選單" className={s.nav}>
          {lab.nav.map((n) => (
            <a key={n.href} href={n.href} className={s.navLink}>
              {n.label}
            </a>
          ))}
        </nav>
        <a href={`tel:${c.phone}`} className={`${s.btn} ${s.btnTomato} ${s.phone}`}>
          {c.phone}
        </a>
      </header>

      <main>
        <section className={s.hero}>
          <div className={s.heroText}>
            <p className={s.eyebrow}>{lab.eyebrow}</p>
            <h1 className={s.h1}>
              <span className={s.slabA}>{lab.headlineShort[0]}</span>
              <span className={s.slabB}>{lab.headlineShort[1]}</span>
            </h1>
            <p className={s.lead}>{lab.lead}</p>
            <form action={`${SITE}/products`} className={s.search} role="search">
              <input
                name="q"
                aria-label={lab.searchPlaceholder}
                placeholder={lab.searchPlaceholder}
                className={s.input}
              />
              <button type="submit" className={`${s.btn} ${s.btnLime}`}>
                {lab.searchButton}
              </button>
            </form>
          </div>
          <ul className={s.sheet} aria-label="我們的做法">
            {lab.promises.map((p, i) => (
              <li key={p.id} className={`${s.sticker} ${stickerShapes[i]}`}>
                <strong>{p.title}</strong>
                <span>{p.body}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.section} aria-labelledby="nb-cat">
          <h2 id="nb-cat" className={s.h2}>
            {lab.categoriesTitle}
          </h2>
          <ul className={s.tiles}>
            {lab.categories.map((cat, i) => (
              <li key={cat.id}>
                <Link href={cat.href} className={`${s.tile} ${tileColors[i]}`}>
                  <span className={s.plate}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img src={cat.image} alt="" width={480} height={360} />
                  </span>
                  <span className={s.tileName}>{cat.name}</span>
                  <span className={s.count}>{cat.count} 件</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.section} aria-labelledby="nb-new">
          <div className={s.sectionHead}>
            <h2 id="nb-new" className={s.h2}>
              {lab.latestTitle}
            </h2>
            <Link href={`${SITE}/products`} className={`${s.btn} ${s.btnWhite}`}>
              {lab.viewAll} →
            </Link>
          </div>
          <ul className={s.cards}>
            {lab.latest.map((p) => (
              <li key={p.id}>
                <Link href={p.href} className={`${s.card} ${p.sold ? s.isSold : ""}`}>
                  <span className={s.cardImg}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img src={p.image} alt="" width={480} height={360} />
                    {p.sold && <span className={s.soldStamp}>{lab.sold}</span>}
                  </span>
                  <span className={s.priceDot}>{p.priceTwd ? twd(p.priceTwd) : lab.askPrice}</span>
                  <span className={s.model}>
                    {p.brand} · {p.model}
                  </span>
                  <span className={s.nameZh}>{p.nameZh}</span>
                  <span className={s.meta}>
                    {[p.year, p.condition].filter(Boolean).join(" · ")}
                  </span>
                  {p.warranty && <span className={s.warranty}>保固 {p.warranty}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${s.section} ${s.stepsBand}`} aria-labelledby="nb-steps">
          <h2 id="nb-steps" className={s.h2}>
            {lab.stepsTitle}
          </h2>
          <ol className={s.steps}>
            {lab.steps.map((st, i) => (
              <li key={st.title} className={s.step}>
                <span className={s.stepNo} aria-hidden="true">
                  {i + 1}
                </span>
                <strong>{st.title}</strong>
                <span>{st.body}</span>
              </li>
            ))}
          </ol>
        </section>

        <section id="services" className={s.section} aria-labelledby="nb-svc">
          <h2 id="nb-svc" className={s.h2}>
            {lab.servicesTitle}
          </h2>
          <div className={s.services}>
            {lab.services.map((sv) => (
              <div key={sv.id} className={s.service}>
                <strong>{sv.title}</strong>
                <span>{sv.body}</span>
              </div>
            ))}
            <a href={`tel:${c.phone}`} className={`${s.btn} ${s.btnTomato} ${s.call}`}>
              {lab.call}
            </a>
          </div>
        </section>
      </main>

      <footer id="contact" className={s.footer}>
        <div className={s.footInner}>
          <p className={s.footBrand}>{c.name}</p>
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
        </div>
      </footer>
    </div>
  );
}
