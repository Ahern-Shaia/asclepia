import { lab, SITE, twd } from "../_content";
import s from "./style.module.css";

const tel = `tel:${lab.company.phone.replace(/-/g, "")}`;
const circled = ["①", "②", "③"];

// A red-pen loop drawn around the price when the reader's eye (pointer / focus) lands on an ad.
function PenCircle() {
  return (
    <svg className={s.pen} viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M14 36 C 8 14, 74 4, 124 7 S 198 20, 190 36 S 132 58, 86 55 S 2 46, 12 26 S 70 6, 118 10"
        pathLength={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function View() {
  const { company } = lab;
  return (
    <div className={s.page}>
      <header className={s.top}>
        <nav aria-label="主要導覽" className={s.nav}>
          {lab.nav.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <a className={s.phone} href={tel}>
          電話 {company.phone}
        </a>
      </header>
      <div className={s.masthead}>
        <a href="#top" className={s.brand}>
          {lab.brand}
        </a>
        <p className={s.tagline}>
          <span>{lab.tagline}</span>
          <span aria-hidden="true">·</span>
          <span>{lab.eyebrow}</span>
        </p>
      </div>

      <main id="top" className={s.main}>
        <section className={s.banner}>
          <div className={s.bannerText}>
            <h1 className={s.h1}>
              {lab.headline.split(/(?<=，)/).map((part) => (
                <span key={part}>{part}</span>
              ))}
            </h1>
            <p className={s.lead}>{lab.lead}</p>
          </div>
          <div className={s.bannerSide}>
            <form className={s.search} action={`${SITE}/products`} role="search">
              <span className={s.searchLabel}>查型錄</span>
              <div className={s.searchRow}>
                <input
                  name="q"
                  type="search"
                  aria-label={lab.searchPlaceholder}
                  placeholder={lab.searchPlaceholder}
                />
                <button type="submit">{lab.searchButton}</button>
              </div>
            </form>
            <ul className={s.promises}>
              {lab.promises.map((p) => (
                <li key={p.id}>
                  <strong>{p.title}</strong>
                  {p.body}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className={s.board}>
          <section className={`${s.box} ${s.index}`} aria-labelledby="cat-title">
            <h2 id="cat-title" className={s.bar}>
              {lab.categoriesTitle}
            </h2>
            <ul>
              {lab.categories.map((c) => (
                <li key={c.id}>
                  <a href={c.href} className={s.indexRow}>
                    <span>{c.name}</span>
                    <span className={s.leader} aria-hidden="true" />
                    <span className={s.count}>{c.count} 件</span>
                  </a>
                </li>
              ))}
            </ul>
            <a href={`${SITE}/products`} className={s.allLink}>
              {lab.viewAll} →
            </a>
          </section>

          <section className={s.sale} aria-labelledby="new-title">
            <h2 id="new-title" className={s.saleBar}>
              <span>{lab.latestTitle}</span>
              <a href={`${SITE}/products`}>{lab.viewAll} →</a>
            </h2>
            <ul className={s.ads}>
              {lab.latest.map((p) => (
                <li key={p.id}>
                  <a href={p.href} className={`${s.box} ${s.ad} ${p.sold ? s.sold : ""}`}>
                    <span className={s.adHead}>{p.nameZh}</span>
                    <span className={s.adBody}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                      <img src={p.image} alt="" width={480} height={360} />
                      <span className={s.adCopy}>
                        <b>
                          {p.brand} {p.model}
                        </b>
                        ，{p.year}年，{p.condition}
                        {p.warranty ? `，保固${p.warranty}` : ""}。
                      </span>
                    </span>
                    <span className={s.price}>
                      {p.sold ? (
                        <s>{p.priceTwd ? twd(p.priceTwd) : lab.askPrice}</s>
                      ) : (
                        <span className={s.priceInk}>
                          {p.priceTwd ? twd(p.priceTwd) : lab.askPrice}
                          <PenCircle />
                        </span>
                      )}
                    </span>
                    {p.sold && <span className={s.stamp}>{lab.sold}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${s.box} ${s.steps}`} aria-labelledby="steps-title">
            <h2 id="steps-title" className={s.bar}>
              {lab.stepsTitle}
            </h2>
            <ol>
              {lab.steps.map((st, i) => (
                <li key={st.title}>
                  <span className={s.stepNo} aria-hidden="true">
                    {circled[i]}
                  </span>
                  <span>
                    <strong>{st.title}</strong>
                    {st.body}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section id="services" className={s.services} aria-labelledby="svc-title">
          <h2 id="svc-title" className={s.rubric}>
            {lab.servicesTitle}
          </h2>
          <ul className={s.svcList}>
            {lab.services.map((sv) => (
              <li key={sv.id} className={s.box}>
                <h3 className={s.svcHead}>{sv.title}</h3>
                <p>{sv.body}</p>
              </li>
            ))}
            <li className={`${s.box} ${s.callBox}`}>
              <a href={tel} className={s.call}>
                {lab.call}
              </a>
              <span>{company.hours}</span>
            </li>
          </ul>
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
            <dt>信箱</dt>
            <dd>
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </dd>
          </div>
          <div>
            <dt>地址</dt>
            <dd>{company.address}</dd>
          </div>
          <div>
            <dt>時間</dt>
            <dd>{company.hours}</dd>
          </div>
        </dl>
        <p className={s.copy}>{lab.copyright}</p>
      </footer>
    </div>
  );
}
