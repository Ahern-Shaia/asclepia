"use client";

import type { PointerEvent } from "react";
import { lab, SITE, twd } from "../_content";
import s from "./style.module.css";

const tel = `tel:${lab.company.phone.replace(/-/g, "")}`;
const [headA, headB] = lab.headline.split(/(?<=，)/);

// One listener for the whole page: the pane under the pointer gets a specular highlight
// positioned where the light would catch the glass.
function catchLight(e: PointerEvent<HTMLDivElement>) {
  const pane = (e.target as HTMLElement).closest<HTMLElement>("[data-glass]");
  if (!pane) return;
  const r = pane.getBoundingClientRect();
  pane.style.setProperty("--mx", `${e.clientX - r.left}px`);
  pane.style.setProperty("--my", `${e.clientY - r.top}px`);
}

export function View() {
  const { company } = lab;
  return (
    <div className={s.page} onPointerMove={catchLight}>
      <div className={s.field} aria-hidden="true">
        <span className={s.blobA} />
        <span className={s.blobB} />
        <span className={s.blobC} />
      </div>

      <header className={`${s.glass} ${s.header}`} data-glass>
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

      <main id="top" className={s.main}>
        <section className={`${s.glass} ${s.hero}`} data-glass>
          <p className={s.eyebrow}>{lab.eyebrow}</p>
          <h1 className={s.h1}>
            <span className={s.h1a}>{headA}</span>
            <span className={s.h1b}>{headB}</span>
          </h1>
          <p className={s.lead}>{lab.lead}</p>
          <form className={s.search} action={`${SITE}/products`} role="search">
            <input
              name="q"
              type="search"
              aria-label={lab.searchPlaceholder}
              placeholder={lab.searchPlaceholder}
            />
            <button type="submit">{lab.searchButton}</button>
          </form>
          <ul className={s.promises}>
            {lab.promises.map((p) => (
              <li key={p.id}>
                <strong>{p.title}</strong>
                <span>{p.body}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.section} aria-labelledby="cat-title">
          <h2 id="cat-title" className={s.h2}>
            {lab.categoriesTitle}
          </h2>
          <ul className={s.cats}>
            {lab.categories.map((c) => (
              <li key={c.id}>
                <a href={c.href} className={`${s.glass} ${s.cat}`} data-glass>
                  {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                  <img src={c.image} alt="" width={480} height={360} />
                  <span className={s.catName}>{c.name}</span>
                  <span className={s.catCount}>
                    {c.count}
                    <small> 件</small>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.section} aria-labelledby="new-title">
          <div className={s.headRow}>
            <h2 id="new-title" className={s.h2}>
              {lab.latestTitle}
            </h2>
            <a href={`${SITE}/products`} className={s.more}>
              {lab.viewAll} →
            </a>
          </div>
          <ul className={s.products}>
            {lab.latest.map((p) => (
              <li key={p.id}>
                <a
                  href={p.href}
                  className={`${s.glass} ${s.slide} ${p.sold ? s.sold : ""}`}
                  data-glass
                >
                  <span className={s.label}>
                    {p.brand} · {p.model}
                  </span>
                  <span className={s.shot}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img src={p.image} alt="" width={480} height={360} />
                    {p.sold && <span className={s.soldTag}>{lab.sold}</span>}
                  </span>
                  <span className={s.pName}>{p.nameZh}</span>
                  <span className={s.pSub}>
                    {p.year} · {p.condition}
                    {p.warranty ? ` · 保固${p.warranty}` : ""}
                  </span>
                  <span className={s.pPrice}>
                    {p.sold ? (
                      <s>{p.priceTwd ? twd(p.priceTwd) : lab.askPrice}</s>
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

        <section className={s.section} aria-labelledby="steps-title">
          <h2 id="steps-title" className={s.h2}>
            {lab.stepsTitle}
          </h2>
          <ol className={s.steps}>
            {lab.steps.map((st, i) => (
              <li key={st.title} className={`${s.glass} ${s.step}`} data-glass>
                <span className={s.stepNo} aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{st.title}</h3>
                <p>{st.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="services"
          className={`${s.glass} ${s.services}`}
          data-glass
          aria-labelledby="svc-title"
        >
          <h2 id="svc-title" className={s.h2}>
            {lab.servicesTitle}
          </h2>
          <ul className={s.svcList}>
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

      <footer id="contact" className={`${s.glass} ${s.footer}`} data-glass>
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
