import Link from "next/link";
import { lab, SITE, twd } from "../_content";
import s from "./style.module.css";

const tel = `tel:${lab.company.phone}`;
const priceOf = (p: (typeof lab.latest)[number]) => (p.priceTwd ? twd(p.priceTwd) : lab.askPrice);
const ticker = lab.latest.map(
  (p) => `${p.brand} ${p.model}　${p.nameZh}　${p.sold ? lab.sold : priceOf(p)}`,
);

function Screws() {
  return (
    <>
      <i className={`${s.screw} ${s.tl}`} aria-hidden="true" />
      <i className={`${s.screw} ${s.tr}`} aria-hidden="true" />
      <i className={`${s.screw} ${s.bl}`} aria-hidden="true" />
      <i className={`${s.screw} ${s.br}`} aria-hidden="true" />
    </>
  );
}

export function View() {
  return (
    <div className={s.root}>
      <header className={s.header}>
        <Link href={SITE} className={s.brand}>
          <i className={`${s.led} ${s.ledOn} ${s.pulse}`} aria-hidden="true" />
          <strong>{lab.brand.toUpperCase()}</strong>
          <span>{lab.tagline}</span>
        </Link>
        <nav className={s.nav} aria-label="主要">
          {lab.nav.map((n) => (
            <Link key={n.href} href={n.href} className={s.key}>
              {n.label}
            </Link>
          ))}
        </nav>
        <a href={tel} className={s.telLcd}>
          <span className={s.silk}>TEL</span>
          <span className={s.lcdText}>{lab.company.phone}</span>
        </a>
      </header>

      <main className={s.main}>
        <section className={`${s.panel} ${s.hero}`}>
          <Screws />
          <div className={s.display}>
            <p className={s.status}>
              <span>{lab.eyebrow}</span>
              <span className={s.ready}>READY</span>
            </p>
            <h1 className={s.h1}>
              <span>{lab.headlineShort[0]}</span>
              <span>
                {lab.headlineShort[1]}
                <i className={s.cursor} aria-hidden="true" />
              </span>
            </h1>
            <div className={s.marquee} aria-hidden="true">
              <div className={s.track}>
                {[0, 1].map((k) => (
                  <span key={k} className={s.run}>
                    {ticker.map((t) => (
                      <span key={t}>◆ {t}</span>
                    ))}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={s.controls}>
            <p className={s.lead}>{lab.lead}</p>
            <form action={`${SITE}/products`} className={s.search} role="search">
              <label htmlFor="lcd-q" className={s.silk}>
                SEARCH · {lab.searchPlaceholder}
              </label>
              <div className={s.searchRow}>
                <input
                  id="lcd-q"
                  name="q"
                  type="search"
                  aria-label={lab.searchPlaceholder}
                  placeholder="_"
                  autoComplete="off"
                />
                <button type="submit" className={`${s.key} ${s.keyAmber}`}>
                  {lab.searchButton}
                </button>
              </div>
            </form>
            <ul className={s.lamps}>
              {lab.promises.map((p) => (
                <li key={p.id}>
                  <i className={`${s.led} ${s.ledOn}`} aria-hidden="true" />
                  <strong>{p.title}</strong>
                  <span>{p.body}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={s.panel} aria-labelledby="l-cat">
          <Screws />
          <h2 id="l-cat" className={s.h2}>
            <span className={s.silk}>CHANNEL</span>
            {lab.categoriesTitle}
          </h2>
          <ul className={s.channels}>
            {lab.categories.map((c) => (
              <li key={c.id}>
                <Link href={c.href} className={s.channel}>
                  <span className={s.count}>
                    {String(c.count).padStart(2, "0")}
                    <small>件</small>
                  </span>
                  <span className={s.chName}>{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.panel} aria-labelledby="l-new">
          <Screws />
          <div className={s.head}>
            <h2 id="l-new" className={s.h2}>
              <span className={s.silk}>LATEST</span>
              {lab.latestTitle}
            </h2>
            <Link href={`${SITE}/products`} className={s.key}>
              {lab.viewAll} ▸
            </Link>
          </div>
          <ul className={s.modules}>
            {lab.latest.map((p) => (
              <li key={p.id}>
                <Link href={p.href} className={s.module}>
                  <span className={s.screen}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img src={p.image} alt="" width={480} height={360} />
                  </span>
                  <span className={s.modBrand}>
                    {p.brand} · {p.model}
                  </span>
                  <strong className={s.modName}>{p.nameZh}</strong>
                  <span className={s.modMeta}>
                    {[p.year, p.condition, p.warranty && `保固${p.warranty}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  <span className={s.readout}>
                    <i className={`${s.led} ${p.sold ? s.ledRed : s.ledOn}`} aria-hidden="true" />
                    {p.sold ? (
                      <>
                        <span className={s.soldTag}>{lab.sold}</span>
                        <del>{priceOf(p)}</del>
                      </>
                    ) : (
                      <span>{priceOf(p)}</span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.panel} aria-labelledby="l-steps">
          <Screws />
          <h2 id="l-steps" className={s.h2}>
            <span className={s.silk}>OPERATION</span>
            {lab.stepsTitle}
          </h2>
          <ol className={s.steps}>
            {lab.steps.map((st, i) => (
              <li key={st.title}>
                <span className={s.stepKey} aria-hidden="true">
                  {i + 1}
                </span>
                <strong>{st.title}</strong>
                <span>{st.body}</span>
              </li>
            ))}
          </ol>
        </section>

        <section id="services" className={`${s.panel} ${s.services}`} aria-labelledby="l-svc">
          <Screws />
          <h2 id="l-svc" className={s.h2}>
            <span className={s.silk}>SERVICE</span>
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
          <a href={tel} className={`${s.key} ${s.keyCall}`}>
            {lab.call}
          </a>
        </section>
      </main>

      <footer id="contact" className={s.footer}>
        <div className={s.plate}>
          <Screws />
          <p className={s.plateTitle}>{lab.company.name}</p>
          <dl className={s.plateRows}>
            <div>
              <dt>TEL</dt>
              <dd>
                <a href={tel}>{lab.company.phone}</a>
              </dd>
            </div>
            <div>
              <dt>MAIL</dt>
              <dd>
                <a href={`mailto:${lab.company.email}`}>{lab.company.email}</a>
              </dd>
            </div>
            <div>
              <dt>ADDR</dt>
              <dd>{lab.company.address}</dd>
            </div>
            <div>
              <dt>HOURS</dt>
              <dd>{lab.company.hours}</dd>
            </div>
          </dl>
          <p className={s.copy}>{lab.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
