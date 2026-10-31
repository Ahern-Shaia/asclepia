import { lab, SITE, twd } from "../_content";
import s from "./style.module.css";

const tel = `tel:${lab.company.phone.replace(/-/g, "")}`;
const price = (p: (typeof lab.latest)[number]) => (p.priceTwd ? twd(p.priceTwd) : lab.askPrice);

export function View() {
  const { company } = lab;
  const fig = lab.latest[0];
  return (
    <div className={s.page}>
      <header className={s.header}>
        <a href="#top" className={s.brand}>
          <strong>{lab.brand.toUpperCase()}</strong>
          <span>{lab.tagline}</span>
        </a>
        <nav aria-label="主要導覽" className={s.nav}>
          {lab.nav.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <a className={s.phone} href={tel}>
          <span>TEL</span> {company.phone}
        </a>
      </header>

      <main id="top">
        <section className={s.hero}>
          <div className={s.heroText}>
            <p className={s.eyebrow}>{lab.eyebrow}</p>
            <h1 className={s.h1}>
              {lab.headline.split(/(?<=，)/).map((part) => (
                <span key={part}>{part}</span>
              ))}
            </h1>
            <p className={s.lead}>{lab.lead}</p>
            <form className={s.search} action={`${SITE}/products`} role="search">
              <span className={s.prompt} aria-hidden="true">
                &gt;
              </span>
              <input
                name="q"
                type="search"
                aria-label={lab.searchPlaceholder}
                placeholder={lab.searchPlaceholder}
              />
              <button type="submit">{lab.searchButton}</button>
            </form>
          </div>

          <a
            href={fig.href}
            className={s.figure}
            aria-label={`${fig.brand} ${fig.model} ${fig.nameZh}`}
          >
            <span className={s.figHead}>
              <span>FIG. 1</span>
              <span>{lab.latestTitle}</span>
            </span>
            <span className={s.figPlate}>
              {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
              <img src={fig.image} alt="" width={480} height={360} />
              <span className={s.scan} aria-hidden="true" />
              <span className={s.corner} aria-hidden="true" />
            </span>
            <span className={s.readout}>
              <span>
                <small>MODEL</small>
                {fig.brand} {fig.model}
              </span>
              <span>
                <small>YEAR</small>
                {fig.year}
              </span>
              <span>
                <small>COND.</small>
                {fig.condition}
              </span>
              <span>
                <small>PRICE</small>
                {price(fig)}
              </span>
            </span>
          </a>
        </section>

        <ul className={s.promises}>
          {lab.promises.map((p) => (
            <li key={p.id}>
              <span className={s.code}>{p.id.toUpperCase()}</span>
              <h2>{p.title}</h2>
              <p>{p.body}</p>
            </li>
          ))}
        </ul>

        <section className={s.section} aria-labelledby="cat-title">
          <header className={s.secHead}>
            <h2 id="cat-title">{lab.categoriesTitle}</h2>
            <span className={s.rule} aria-hidden="true" />
          </header>
          <ul className={s.cats}>
            {lab.categories.map((c) => (
              <li key={c.id}>
                <a href={c.href} className={s.cat}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                  <img src={c.image} alt="" width={480} height={360} />
                  <span className={s.catText}>
                    <span className={s.code}>{c.id.toUpperCase()}</span>
                    <span className={s.catName}>{c.name}</span>
                  </span>
                  <span className={s.catCount}>
                    {String(c.count).padStart(2, "0")}
                    <small>件</small>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.section} aria-labelledby="new-title">
          <header className={s.secHead}>
            <h2 id="new-title">{lab.latestTitle}</h2>
            <span className={s.rule} aria-hidden="true" />
            <a href={`${SITE}/products`} className={s.more}>
              {lab.viewAll} →
            </a>
          </header>
          <div className={s.table}>
            <div className={s.thead} aria-hidden="true">
              <span />
              <span>品牌 · 型號</span>
              <span>品名</span>
              <span>年份 · 狀況</span>
              <span>保固</span>
              <span>價格</span>
            </div>
            <ul>
              {lab.latest.map((p) => (
                <li key={p.id}>
                  <a href={p.href} className={`${s.row} ${p.sold ? s.sold : ""}`}>
                    <span className={s.thumb}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                      <img src={p.image} alt="" width={480} height={360} />
                    </span>
                    <span className={s.model}>
                      {p.brand} · {p.model}
                    </span>
                    <span className={s.name}>{p.nameZh}</span>
                    <span className={s.mono}>
                      {p.year} · {p.condition}
                    </span>
                    <span className={s.mono}>{p.warranty ? `保固${p.warranty}` : "—"}</span>
                    <span className={s.price}>
                      {p.sold ? (
                        <>
                          <span className={s.soldTag}>{lab.sold}</span>
                          <s>{price(p)}</s>
                        </>
                      ) : (
                        price(p)
                      )}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={s.section} aria-labelledby="steps-title">
          <header className={s.secHead}>
            <h2 id="steps-title">{lab.stepsTitle}</h2>
            <span className={s.rule} aria-hidden="true" />
          </header>
          <ol className={s.steps}>
            {lab.steps.map((st, i) => (
              <li key={st.title}>
                <span className={s.node} aria-hidden="true">
                  {i + 1}
                </span>
                <span className={s.code}>
                  STEP {i + 1}/{lab.steps.length}
                </span>
                <h3>{st.title}</h3>
                <p>{st.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="services" className={s.section} aria-labelledby="svc-title">
          <header className={s.secHead}>
            <h2 id="svc-title">{lab.servicesTitle}</h2>
            <span className={s.rule} aria-hidden="true" />
          </header>
          <div className={s.svcGrid}>
            {lab.services.map((sv) => (
              <div key={sv.id} className={s.svc}>
                <span className={s.code}>{sv.id.toUpperCase()}</span>
                <h3>{sv.title}</h3>
                <p>{sv.body}</p>
              </div>
            ))}
            <a href={tel} className={s.call}>
              {lab.call}
            </a>
          </div>
        </section>
      </main>

      <footer id="contact" className={s.footer}>
        <p className={s.footBrand}>{company.name}</p>
        <dl className={s.kv}>
          <div>
            <dt>TEL</dt>
            <dd>
              <a href={tel}>{company.phone}</a>
            </dd>
          </div>
          <div>
            <dt>MAIL</dt>
            <dd>
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </dd>
          </div>
          <div>
            <dt>ADDR</dt>
            <dd>{company.address}</dd>
          </div>
          <div>
            <dt>HOURS</dt>
            <dd>{company.hours}</dd>
          </div>
        </dl>
        <p className={s.copy}>{lab.copyright}</p>
      </footer>
    </div>
  );
}
