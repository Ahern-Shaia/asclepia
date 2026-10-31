import Link from "next/link";
import { lab, SITE, twd } from "../_content";
import s from "./style.module.css";

const roman = ["I", "II", "III"];

export function View() {
  const c = lab.company;
  return (
    <div className={s.root}>
      <header className={s.header}>
        <nav aria-label="主選單" className={s.nav}>
          {lab.nav.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <Link href="/mockup/style-lab/14-auction" className={s.brand}>
          <span className={s.wordmark}>{lab.brand}</span>
          <span className={s.tagline}>{lab.tagline}</span>
        </Link>
        <a href={`tel:${c.phone}`} className={s.phone}>
          <span>來電</span> {c.phone}
        </a>
      </header>

      <main>
        <section className={s.cover}>
          <div className={s.frame}>
            <p className={s.eyebrow}>{lab.eyebrow}</p>
            <span className={s.rule} aria-hidden="true" />
            <h1 className={s.h1}>
              {lab.headline.split("，").map((part, i, all) => (
                <span key={part}>{i < all.length - 1 ? `${part}，` : part}</span>
              ))}
            </h1>
            <p className={s.lead}>{lab.lead}</p>
            <form action={`${SITE}/products`} className={s.search} role="search">
              <input
                name="q"
                aria-label={lab.searchPlaceholder}
                placeholder={lab.searchPlaceholder}
                className={s.input}
              />
              <button type="submit" className={s.searchBtn}>
                {lab.searchButton}
              </button>
            </form>
            <dl className={s.viewing}>
              <div>
                <dt>Viewing · 看機</dt>
                <dd>{c.hours}，請先來電預約</dd>
              </div>
              <div>
                <dt>Location · 地點</dt>
                <dd>{c.address}</dd>
              </div>
            </dl>
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

        <section className={s.lotsSection} aria-labelledby="au-lots">
          <div className={s.head}>
            <h2 id="au-lots" className={s.h2}>
              {lab.latestTitle}
            </h2>
            <Link href={`${SITE}/products`} className={s.textLink}>
              {lab.viewAll}
            </Link>
          </div>
          <ol className={s.lots}>
            {lab.latest.map((p, i) => (
              <li key={p.id}>
                <Link href={p.href} className={`${s.lot} ${p.sold ? s.sold : ""}`}>
                  <span className={s.lotNo}>
                    <small>Lot</small>
                    <em>{i + 1}</em>
                  </span>
                  <span className={s.plate}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img src={p.image} alt="" width={480} height={360} />
                  </span>
                  <span className={s.lotText}>
                    <span className={s.maker}>
                      {p.brand} · {p.model}
                    </span>
                    <span className={s.lotName}>{p.nameZh}</span>
                    <span className={s.prov}>
                      {[p.year && `${p.year} 年`, p.condition].filter(Boolean).join(" · ")}
                      {p.warranty && `　保固 ${p.warranty}`}
                    </span>
                    <span className={s.priceLine}>
                      {p.sold ? (
                        <>
                          <span className={s.soldMark}>{lab.sold}</span>
                          {p.priceTwd && <s className={s.struck}>{twd(p.priceTwd)}</s>}
                        </>
                      ) : (
                        <span className={s.price}>
                          {p.priceTwd ? twd(p.priceTwd) : lab.askPrice}
                        </span>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section className={s.index} aria-labelledby="au-dept">
          <h2 id="au-dept" className={s.h2}>
            {lab.categoriesTitle}
          </h2>
          <ul className={s.toc}>
            {lab.categories.map((cat) => (
              <li key={cat.id}>
                <Link href={cat.href} className={s.tocRow}>
                  <span className={s.tocName}>{cat.name}</span>
                  <span className={s.leader} aria-hidden="true" />
                  <span className={s.tocCount}>
                    <em>{cat.count}</em> 件
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.dark} aria-labelledby="au-steps">
          <h2 id="au-steps" className={s.h2}>
            {lab.stepsTitle}
          </h2>
          <ol className={s.steps}>
            {lab.steps.map((st, i) => (
              <li key={st.title}>
                <span className={s.numeral} aria-hidden="true">
                  {roman[i]}
                </span>
                <strong>{st.title}</strong>
                <span>{st.body}</span>
              </li>
            ))}
          </ol>
        </section>

        <section id="services" className={s.services} aria-labelledby="au-svc">
          <h2 id="au-svc" className={s.h2}>
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
