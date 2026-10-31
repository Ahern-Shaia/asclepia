import { lab, SITE, twd } from "../_content";
import s from "./style.module.css";

type Item = (typeof lab.latest)[number];
const tel = `tel:${lab.company.phone.replace(/-/g, "")}`;
const price = (p: Item) => (p.priceTwd ? twd(p.priceTwd) : lab.askPrice);
const promiseTone = [`${s.lilac} ${s.pr1}`, `${s.white} ${s.pr2}`, `${s.white} ${s.pr3}`];
const catArea = ["cA", "cB", "cC", "cD", "cE", "cF"];
const [h1a, h1b] = lab.headline.split("，");
const heading = [`${h1a}，`, h1b];
const itemArea = ["pA", "pB", "pC", "pD"];

export function View() {
  return (
    <div className={s.root}>
      <header className={s.grid}>
        <a href={SITE} className={`${s.tile} ${s.ink} ${s.brandTile}`}>
          <span className={s.brand}>{lab.brand}</span>
          <span className={s.tagline}>{lab.tagline}</span>
        </a>
        <nav aria-label="主選單" className={`${s.tile} ${s.white} ${s.navTile}`}>
          {lab.nav.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <a href={tel} className={`${s.tile} ${s.tomato} ${s.phoneTile}`}>
          <span className={s.label}>電話</span>
          <span className={s.phone}>{lab.company.phone}</span>
        </a>
      </header>

      <main className={s.main}>
        <section className={`${s.grid} ${s.heroGrid}`}>
          <div className={`${s.tile} ${s.white} ${s.heroTile}`}>
            <span className={s.label}>{lab.eyebrow}</span>
            <div className={s.heroCopy}>
              <h1 className={s.h1}>
                {heading.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </h1>
              <p className={s.lead}>{lab.lead}</p>
            </div>
          </div>
          <form
            action={`${SITE}/products`}
            role="search"
            className={`${s.tile} ${s.mint} ${s.searchTile}`}
          >
            <label htmlFor="bento-q" className={s.searchLabel}>
              找設備
            </label>
            <div className={s.searchRow}>
              <input
                id="bento-q"
                name="q"
                type="search"
                aria-label={lab.searchPlaceholder}
                placeholder={lab.searchPlaceholder}
              />
              <button type="submit">{lab.searchButton}</button>
            </div>
          </form>
          <div className={`${s.tile} ${s.ink} ${s.countTile}`}>
            <span className={s.bigNum}>{lab.categories.reduce((n, c) => n + c.count, 0)}</span>
            <span>件在庫 · {lab.categories.length} 個分類</span>
          </div>
          {lab.promises.map((p, i) => (
            <div key={p.id} className={`${s.tile} ${promiseTone[i]} ${s.promise}`}>
              <h2>{p.title}</h2>
              <p>{p.body}</p>
            </div>
          ))}
        </section>

        <section className={`${s.grid} ${s.catGrid}`}>
          <h2 className={`${s.tile} ${s.ink} ${s.headTile} ${s.catHead}`}>{lab.categoriesTitle}</h2>
          {lab.categories.map((c, i) => (
            <a
              key={c.id}
              href={c.href}
              className={`${s.tile} ${s.white} ${s.cat} ${s[catArea[i]]}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
              <img src={c.image} alt="" />
              <span className={s.catName}>{c.name}</span>
              <span className={s.catCount}>
                {c.count}
                <small>件</small>
              </span>
            </a>
          ))}
        </section>

        <section className={`${s.grid} ${s.itemGrid}`}>
          <h2 className={`${s.tile} ${s.lilac} ${s.headTile} ${s.itemHead}`}>{lab.latestTitle}</h2>
          <a href={`${SITE}/products`} className={`${s.tile} ${s.ink} ${s.allTile}`}>
            {lab.viewAll} <span aria-hidden="true">→</span>
          </a>
          {lab.latest.map((p, i) => (
            <a
              key={p.id}
              href={p.href}
              className={`${s.tile} ${s.white} ${s.item} ${s[itemArea[i]]} ${p.sold ? s.sold : ""}`}
            >
              <span className={s.itemImg}>
                {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                <img src={p.image} alt="" />
                {p.sold && <span className={s.soldChip}>{lab.sold}</span>}
              </span>
              <span className={s.itemText}>
                <span className={s.model}>
                  {p.brand} · {p.model}
                </span>
                <strong className={s.itemName}>{p.nameZh}</strong>
                <span className={s.meta}>
                  {[p.year, p.condition].filter(Boolean).join(" · ")}
                  {p.warranty && ` · 保固${p.warranty}`}
                </span>
                <span className={s.price}>{p.sold ? <del>{price(p)}</del> : price(p)}</span>
              </span>
            </a>
          ))}
        </section>

        <section className={`${s.grid} ${s.stepGrid}`}>
          <h2 className={`${s.tile} ${s.tomato} ${s.headTile} ${s.stepHead}`}>{lab.stepsTitle}</h2>
          {lab.steps.map((st, i) => (
            <div key={st.title} className={`${s.tile} ${s.white} ${s.step}`}>
              <span className={s.stepNum} aria-hidden="true">
                {i + 1}
              </span>
              <h3>{st.title}</h3>
              <p>{st.body}</p>
            </div>
          ))}
        </section>

        <section id="services" className={`${s.grid} ${s.svcGrid}`}>
          <h2 className={`${s.tile} ${s.white} ${s.headTile} ${s.svcHead}`}>{lab.servicesTitle}</h2>
          {lab.services.map((sv) => (
            <div key={sv.id} className={`${s.tile} ${s.mint} ${s.svc}`}>
              <h3>{sv.title}</h3>
              <p>{sv.body}</p>
            </div>
          ))}
          <a href={tel} className={`${s.tile} ${s.tomato} ${s.callTile}`}>
            <span className={s.label}>來電</span>
            <span className={s.callNum}>{lab.company.phone}</span>
          </a>
        </section>
      </main>

      <footer id="contact" className={`${s.grid} ${s.footGrid}`}>
        <div className={`${s.tile} ${s.ink} ${s.footMain}`}>
          <strong>{lab.company.name}</strong>
          <span>{lab.company.address}</span>
          <span>{lab.company.hours}</span>
        </div>
        <div className={`${s.tile} ${s.white} ${s.footLinks}`}>
          <a href={tel}>{lab.company.phone}</a>
          <a href={`mailto:${lab.company.email}`}>{lab.company.email}</a>
          <small>{lab.copyright}</small>
        </div>
      </footer>
    </div>
  );
}
