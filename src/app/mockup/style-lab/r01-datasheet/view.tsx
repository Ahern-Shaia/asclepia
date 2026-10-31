"use client";

import { EquipIllus, MiniMap, StepIllus } from "@/components/home-v4/equip-illus";
import { type ReactNode, useState } from "react";
import { SITE, twd, v } from "../_v-content";
import s from "./style.module.css";

const c = v.copy;
const co = v.company;
const tel = `tel:${co.phone}`;
const pad = (n: number) => String(n).padStart(2, "0");
const maxCount = Math.max(...v.categories.map((x) => x.count));
const SECTIONS = 5;

function Head({
  no,
  id,
  title,
  aside,
}: {
  no: number;
  id: string;
  title: string;
  aside?: ReactNode;
}) {
  return (
    <div className={s.secHead}>
      <span className={s.secNo} aria-hidden>
        §{no}
      </span>
      <h2 id={id}>{title}</h2>
      <span className={s.secRule} aria-hidden />
      {aside}
      <span className={s.sheet} aria-hidden>
        {no}/{SECTIONS}
      </span>
    </div>
  );
}

// Dimension lines drawn over figure 1 (no values: a drawing convention, not a spec claim).
function Dims() {
  return (
    <svg className={s.dims} viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden>
      <defs>
        <marker
          id="r01-arrow"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 1 L9 5 L0 9 Z" />
        </marker>
      </defs>
      <path
        className={s.dimLine}
        d="M240 390 H360"
        markerStart="url(#r01-arrow)"
        markerEnd="url(#r01-arrow)"
      />
      <path className={s.dimExt} d="M240 364 V396 M360 364 V396" />
      <path
        className={s.dimLine}
        d="M214 212 V378"
        markerStart="url(#r01-arrow)"
        markerEnd="url(#r01-arrow)"
      />
      <path className={s.dimExt} d="M204 212 H266 M204 378 H236" />
      <path className={s.center} d="M300 40 V392 M150 210 H450" />
    </svg>
  );
}

export function View() {
  const [list, setList] = useState<string[]>([]);
  const toggle = (id: string) =>
    setList((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  return (
    <div className={s.page}>
      <div className={s.util}>
        <div className={`${s.wrap} ${s.utilRow}`}>
          <span>{c.util.hours(co.hours)}</span>
          <span className={s.desk}>{c.util.visit}</span>
          <a href={tel} className={s.utilPhone}>
            TEL {co.phone}
          </a>
        </div>
      </div>

      <header className={s.header}>
        <div className={`${s.wrap} ${s.headRow}`}>
          <a href={SITE} className={s.brand} aria-label={`${v.brand.name} 首頁`}>
            <span className={s.mark} aria-hidden>
              A
            </span>
            <span className={s.brandText}>
              <strong>{v.brand.name}</strong>
              <span>{v.brand.tagline}</span>
            </span>
          </a>
          <form className={s.search} role="search" action={`${SITE}/products`}>
            <select name="cat" aria-label={c.header.allCategories} defaultValue="">
              <option value="">{c.header.allCategories}</option>
              {v.categories.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
            <input
              name="q"
              placeholder={c.header.searchPlaceholder}
              aria-label={c.header.searchPlaceholder}
            />
            <button type="submit">{c.header.search}</button>
          </form>
          <div className={s.actions}>
            <a
              href="#inquiry-list"
              className={s.listBtn}
              aria-label={`${c.header.inquiryList} ${list.length} 件`}
            >
              <span>{c.header.inquiryList}</span>
              <span className={s.count} key={list.length}>
                [{pad(list.length)}]
              </span>
            </a>
            <a href={tel} className={`${s.bookBtn} ${s.desk}`}>
              {c.header.book}
            </a>
          </div>
        </div>
        <nav className={s.catNav} aria-label="設備分類">
          <div className={`${s.wrap} ${s.catNavRow}`}>
            {v.categories.map((x, i) => (
              <a key={x.id} href={x.href}>
                <span className={s.mono}>{pad(i + 1)}</span>
                {x.name}
              </a>
            ))}
            <a href={`${SITE}/products`} className={s.catAll}>
              {c.categories.all}
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section className={s.hero} aria-labelledby="hero-title">
          <div className={`${s.wrap} ${s.heroGrid}`}>
            <div className={s.titleBlock}>
              <span className={s.eyebrow}>{v.hero.eyebrow}</span>
              <h1 id="hero-title">
                {v.hero.heading.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h1>
              <dl className={s.summary}>
                {(
                  [
                    [c.hero.finder.category, pad(v.categories.length)],
                    [`${c.categories.unit}數`, String(v.total)],
                    [c.hero.finder.brand, pad(v.brands.length)],
                  ] as const
                ).map(([k, val]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{val}</dd>
                  </div>
                ))}
              </dl>
              <ol className={s.points}>
                {c.hero.points.map((p, i) => (
                  <li key={p}>
                    <span className={s.mono}>0.{i + 1}</span>
                    {p}
                  </li>
                ))}
              </ol>
            </div>
            <figure className={s.fig}>
              <div className={s.figBox} aria-hidden>
                <span className={`${s.crop} ${s.cropTL}`} />
                <span className={`${s.crop} ${s.cropTR}`} />
                <span className={`${s.crop} ${s.cropBL}`} />
                <span className={`${s.crop} ${s.cropBR}`} />
                <Dims />
                <EquipIllus kind="monitor" className={`${s.figItem} ${s.figLeft}`} />
                <EquipIllus kind="analyzer" className={`${s.figItem} ${s.figRight}`} />
                <EquipIllus kind="ultrasound" className={`${s.figItem} ${s.figMain}`} />
                <span className={`${s.callout} ${s.calloutPrice}`}>{v.hero.scene.price}</span>
                <span className={`${s.callout} ${s.calloutVisit}`}>{v.hero.scene.visit}</span>
              </div>
              <figcaption>
                <span className={s.mono}>圖 1</span>
                {v.categories
                  .slice(0, 3)
                  .map((x) => x.name)
                  .join("／")}
                （示意）
              </figcaption>
            </figure>
          </div>
          <div className={s.wrap}>
            <form className={s.finder} action={`${SITE}/products`}>
              <span className={s.finderCap} aria-hidden>
                {c.hero.finder.title}
              </span>
              <label>
                <span>{c.hero.finder.category}</span>
                <select name="cat" defaultValue="">
                  <option value="">{c.hero.finder.any}</option>
                  {v.categories.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}（{x.count}）
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>{c.hero.finder.brand}</span>
                <select name="brand" defaultValue="">
                  <option value="">{c.hero.finder.any}</option>
                  {v.brands.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>{c.hero.finder.year}</span>
                <select name="year" defaultValue="">
                  <option value="">{c.hero.finder.any}</option>
                  {c.hero.finder.yearOptions.map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </label>
              <button type="submit">{c.hero.finder.submit(v.total)} →</button>
            </form>
          </div>
        </section>

        <section className={s.section} aria-labelledby="h-cat">
          <div className={s.wrap}>
            <Head no={1} id="h-cat" title={c.categories.title} />
            <table className={s.catTable}>
              <thead>
                <tr>
                  <th scope="col">項次</th>
                  <th scope="col" className={s.colFig}>
                    圖
                  </th>
                  <th scope="col">{c.hero.finder.category}</th>
                  <th scope="col" className={s.num}>
                    {c.categories.unit}
                  </th>
                  <th scope="col" className={s.colBar}>
                    <span className={s.srOnly}>件數比例</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {v.categories.map((x, i) => (
                  <tr key={x.id}>
                    <td className={s.mono}>{pad(i + 1)}</td>
                    <td className={s.colFig}>
                      <span className={s.thumb}>
                        <EquipIllus kind={x.id} />
                      </span>
                    </td>
                    <td>
                      <a href={x.href} className={s.rowLink}>
                        {x.name}
                      </a>
                    </td>
                    <td className={`${s.num} ${s.mono}`}>{pad(x.count)}</td>
                    <td className={s.colBar} aria-hidden>
                      <span className={s.bar}>
                        <span style={{ width: `${(x.count / maxCount) * 100}%` }} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>{c.categories.all}</td>
                  <td className={`${s.num} ${s.mono}`}>{v.total}</td>
                  <td className={s.colBar} />
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section className={s.section} aria-labelledby="h-latest">
          <div className={s.wrap}>
            <Head
              no={2}
              id="h-latest"
              title={c.latest.title}
              aside={
                <a href={`${SITE}/products`} className={s.more}>
                  {c.latest.viewAll} →
                </a>
              }
            />
            <ul className={s.sheets}>
              {v.latest.map((p) => {
                const added = list.includes(p.id);
                const rows: [string, ReactNode][] = [
                  [c.hero.finder.category, p.categoryName],
                  [c.hero.finder.year, p.year ? c.latest.year(p.year) : "—"],
                  ["狀況", p.condition ?? "—"],
                  ["保固", p.warranty ?? "—"],
                ];
                return (
                  <li key={p.id} className={`${s.sheetCard} ${p.sold ? s.sold : ""}`}>
                    <a href={p.href} className={s.sheetLink}>
                      <span className={s.sheetHead}>
                        <span className={s.mono}>ITEM {p.id.toUpperCase()}</span>
                        {p.sold ? (
                          <span className={`${s.tag} ${s.tagSold}`}>{c.latest.sold}</span>
                        ) : (
                          p.isNew && <span className={s.tag}>{c.latest.newTag}</span>
                        )}
                      </span>
                      <span className={s.sheetFig}>
                        <EquipIllus kind={p.kind} />
                      </span>
                      <span className={s.sheetTitle}>
                        <strong>
                          {p.brand} {p.model}
                        </strong>
                        <span>{p.nameZh}</span>
                      </span>
                      <span className={s.kv}>
                        {rows.map(([k, val]) => (
                          <span key={k} className={s.kvRow}>
                            <span>{k}</span>
                            <span>{val}</span>
                          </span>
                        ))}
                      </span>
                      <span className={s.price}>
                        {p.priceTwd ? twd(p.priceTwd) : c.latest.askPrice}
                      </span>
                    </a>
                    {!p.sold && (
                      <button
                        type="button"
                        className={`${s.add} ${added ? s.addOn : ""}`}
                        aria-pressed={added}
                        onClick={() => toggle(p.id)}
                      >
                        <span className={s.box} aria-hidden>
                          {added ? "✓" : ""}
                        </span>
                        {added ? c.latest.added : c.latest.add}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className={s.section} aria-labelledby="h-brands">
          <div className={s.wrap}>
            <Head no={3} id="h-brands" title={c.brands.title} />
            <ul className={s.brands}>
              {v.brands.map((b, i) => (
                <li key={b}>
                  <a href={`${SITE}/products?brand=${encodeURIComponent(b)}`}>
                    <span className={s.mono}>3.{i + 1}</span>
                    {b}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={s.section} aria-labelledby="h-buy">
          <div className={s.wrap}>
            <Head no={4} id="h-buy" title={c.buy.title} />
            <div className={s.buyGrid}>
              <ol className={s.steps}>
                {c.buy.steps.map((st, i) => (
                  <li key={st.title}>
                    <span className={s.stepNo} aria-hidden>
                      4.{i + 1}
                    </span>
                    <span className={s.stepArt}>
                      <StepIllus step={i as 0 | 1 | 2} />
                    </span>
                    <span className={s.stepText}>
                      <strong>{st.title}</strong>
                      <span>{st.body}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <aside className={s.visit} aria-labelledby="h-visit">
                <div className={s.visitHead}>
                  <h2 id="h-visit">{c.visit.title}</h2>
                  <span className={s.mono}>圖 2</span>
                </div>
                <MiniMap />
                <dl>
                  <div>
                    <dt>{c.visit.address}</dt>
                    <dd>{co.address}</dd>
                  </div>
                  <div>
                    <dt>{c.visit.hours}</dt>
                    <dd>{co.hours}</dd>
                  </div>
                  <div>
                    <dt>備註</dt>
                    <dd>{c.visit.note}</dd>
                  </div>
                </dl>
                <a href={tel} className={s.visitBtn}>
                  {c.visit.call} {co.phone}
                </a>
              </aside>
            </div>
          </div>
        </section>

        <section id="services" className={s.section} aria-labelledby="h-services">
          <div className={s.wrap}>
            <Head no={5} id="h-services" title={c.services.title} />
            <ul className={s.services}>
              {c.services.items.map((sv, i) => (
                <li key={sv.id}>
                  <span className={s.mono}>5.{i + 1}</span>
                  <strong>{sv.title}</strong>
                  <span>{sv.body}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer id="contact" className={s.footer}>
        <div className={`${s.wrap} ${s.shelf}`} aria-hidden>
          {(
            ["microscope", "monitor", "ultrasound", "analyzer", "centrifuge", "dental"] as const
          ).map((k) => (
            <EquipIllus key={k} kind={k} outline />
          ))}
        </div>
        <div className={`${s.wrap} ${s.footGrid}`}>
          <div className={s.brand}>
            <span className={`${s.mark} ${s.markInv}`} aria-hidden>
              A
            </span>
            <span className={s.brandText}>
              <strong>{co.name}</strong>
              <span>{v.brand.tagline}</span>
            </span>
          </div>
          <dl className={s.footList}>
            <div>
              <dt>TEL</dt>
              <dd>
                <a href={tel}>{co.phone}</a>
              </dd>
            </div>
            <div>
              <dt>MAIL</dt>
              <dd>
                <a href={`mailto:${co.email}`}>{co.email}</a>
              </dd>
            </div>
            <div>
              <dt>{c.visit.address}</dt>
              <dd>{co.address}</dd>
            </div>
            <div>
              <dt>{c.visit.hours}</dt>
              <dd>{co.hours}</dd>
            </div>
          </dl>
          <p className={s.copyright}>{v.copyright}</p>
        </div>
      </footer>

      <div className={s.mobileBar}>
        <a href={tel}>{c.mobileBar.call}</a>
        <a href="#inquiry-list" className={s.mobileMain}>
          {c.mobileBar.inquiry}（{list.length}）
        </a>
      </div>
    </div>
  );
}
