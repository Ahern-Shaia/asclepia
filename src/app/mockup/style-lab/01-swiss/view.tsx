import { lab, SITE, twd } from "../_content";
import s from "./style.module.css";

const tel = `tel:${lab.company.phone.replace(/-/g, "")}`;

export function View() {
  const { company } = lab;
  return (
    <div className={s.page}>
      <header className={s.header}>
        <a href="#top" className={s.brand}>
          <strong>{lab.brand}</strong>
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
          {company.phone}
        </a>
      </header>

      <main id="top">
        <section className={s.hero} aria-labelledby="hero-title">
          <p className={s.eyebrow}>{lab.eyebrow}</p>
          <h1 id="hero-title" className={s.h1}>
            {lab.headlineShort.map((line) => (
              <span key={line} className={s.mask}>
                <span>{line}</span>
              </span>
            ))}
          </h1>
          <p className={s.lead}>{lab.lead}</p>
          <form className={s.search} action={`${SITE}/products`} role="search">
            <span className={s.searchLabel}>型錄搜尋</span>
            <div className={s.searchRow}>
              <input
                name="q"
                type="search"
                aria-label={lab.searchPlaceholder}
                placeholder={lab.searchPlaceholder}
              />
              <button type="submit">{lab.searchButton} →</button>
            </div>
          </form>
        </section>

        <section className={s.band} aria-label="購買前可以知道的事">
          <h2 className={s.bandHead}>每一件</h2>
          <ul className={s.promises}>
            {lab.promises.map((p) => (
              <li key={p.id}>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.band} aria-labelledby="cat-title">
          <h2 id="cat-title" className={s.bandHead}>
            {lab.categoriesTitle}
          </h2>
          <ul className={s.cats}>
            {lab.categories.map((c) => (
              <li key={c.id}>
                <a href={c.href} className={s.cat}>
                  <span className={s.catName}>{c.name}</span>
                  <span className={s.catCount}>
                    {c.count}
                    <small>件</small>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.band} aria-labelledby="new-title">
          <div className={s.bandHead}>
            <h2 id="new-title">{lab.latestTitle}</h2>
            <a href={`${SITE}/products`} className={s.more}>
              {lab.viewAll} →
            </a>
          </div>
          <ul className={s.products}>
            {lab.latest.map((p) => (
              <li key={p.id} className={p.sold ? s.isSold : undefined}>
                <a href={p.href} className={s.product}>
                  <span className={s.shot}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img src={p.image} alt="" width={480} height={360} />
                  </span>
                  <span className={s.pMeta}>
                    {p.brand} · {p.model}
                  </span>
                  <span className={s.pName}>{p.nameZh}</span>
                  <span className={s.pSub}>
                    {p.year} · {p.condition}
                    {p.warranty ? ` · 保固${p.warranty}` : ""}
                  </span>
                  <span className={s.pPrice}>
                    {p.sold ? (
                      <>
                        <s>{p.priceTwd ? twd(p.priceTwd) : lab.askPrice}</s>
                        <em className={s.soldTag}>{lab.sold}</em>
                      </>
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

        <section className={s.band} aria-labelledby="steps-title">
          <h2 id="steps-title" className={s.bandHead}>
            {lab.stepsTitle}
          </h2>
          <ol className={s.steps}>
            {lab.steps.map((st, i) => (
              <li key={st.title}>
                <span className={s.stepNo} aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{st.title}</h3>
                <p>{st.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="services" className={s.band} aria-labelledby="svc-title">
          <h2 id="svc-title" className={s.bandHead}>
            {lab.servicesTitle}
          </h2>
          <div className={s.svcWrap}>
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
          </div>
        </section>
      </main>

      <footer id="contact" className={s.footer}>
        <p className={s.footBrand}>{company.name}</p>
        <dl className={s.contact}>
          <div>
            <dt>電話</dt>
            <dd>
              <a href={tel}>{company.phone}</a>
            </dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </dd>
          </div>
          <div>
            <dt>地址</dt>
            <dd>{company.address}</dd>
          </div>
          <div>
            <dt>營業時間</dt>
            <dd>{company.hours}</dd>
          </div>
        </dl>
        <p className={s.copy}>{lab.copyright}</p>
      </footer>
    </div>
  );
}
