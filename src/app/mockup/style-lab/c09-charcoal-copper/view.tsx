"use client";

import { ProfileOutlined } from "@ant-design/icons";
import { EquipIllus, MiniMap, StepIllus } from "@/components/home-v4/equip-illus";
import { useState } from "react";
import { SITE, twd, v } from "../_v-content";
import s from "./style.module.css";

const c = v.copy;
const co = v.company;
const tel = `tel:${co.phone}`;

// Architectural section drawing behind the hero: portal-frame columns, a triangulated roof truss
// and a floor grid in perspective — the warehouse where the machines actually wait.
function Truss() {
  const panels = 16;
  const w = 1440 / panels;
  const top = (x: number) => 150 - 110 * (1 - Math.abs(x - 720) / 720);
  return (
    <svg
      className={s.truss}
      viewBox="0 0 1440 640"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden
    >
      <g className={s.trussCopper}>
        <path d={`M0 150 L720 40 L1440 150`} />
        <path d="M0 170 H1440" />
        {Array.from({ length: panels }, (_, i) => {
          const x0 = i * w;
          const x1 = x0 + w;
          const xm = x0 + w / 2;
          return (
            <path key={i} d={`M${x0} 170 L${xm} ${top(xm)} L${x1} 170 M${xm} ${top(xm)} V170`} />
          );
        })}
      </g>
      <g className={s.trussGrey}>
        {[60, 420, 1020, 1380].map((x) => (
          <path key={x} d={`M${x - 9} 170 V560 M${x + 9} 170 V560 M${x - 22} 560 H${x + 22}`} />
        ))}
        <path d="M0 560 H1440" />
        {Array.from({ length: 13 }, (_, i) => (
          <path key={i} d={`M${720 + (i - 6) * 70} 560 L${720 + (i - 6) * 260} 640`} />
        ))}
        <path d="M0 600 H1440" />
      </g>
      <g className={s.dim}>
        <path d="M60 22 H1380 M60 14 V30 M420 14 V30 M1020 14 V30 M1380 14 V30" />
      </g>
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
            {co.phone}
          </a>
        </div>
      </div>

      <header className={s.header}>
        <div className={`${s.wrap} ${s.headRow}`}>
          <a href={SITE} className={s.brand} aria-label={`${v.brand.name} 首頁`}>
            <span className={s.mark} aria-hidden>
              <span>A</span>
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
              <ProfileOutlined aria-hidden />
              <span className={s.desk}>{c.header.inquiryList}</span>
              <span className={s.count} key={list.length}>
                {list.length}
              </span>
            </a>
            <a href={tel} className={s.bookBtn}>
              {c.header.book}
            </a>
          </div>
        </div>
        <nav className={s.catNav} aria-label="設備分類">
          <div className={`${s.wrap} ${s.catNavRow}`}>
            {v.categories.map((x) => (
              <a key={x.id} href={x.href}>
                {x.name}
              </a>
            ))}
            <a href={`${SITE}/products`} className={s.catAll}>
              {c.categories.all} →
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section className={s.hero} aria-labelledby="hero-title">
          <Truss />
          <div className={`${s.wrap} ${s.heroRow}`}>
            <div className={s.heroText}>
              <span className={s.eyebrow}>{v.hero.eyebrow}</span>
              <h1 id="hero-title">
                {v.hero.heading.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h1>
              <ul className={s.points}>
                {c.hero.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            <div className={s.bay} aria-hidden>
              <span className={s.door} />
              <span className={s.bayFloor} />
              <EquipIllus kind="monitor" className={`${s.bayItem} ${s.bayLeft}`} />
              <EquipIllus kind="analyzer" className={`${s.bayItem} ${s.bayRight}`} />
              <EquipIllus kind="ultrasound" className={`${s.bayItem} ${s.bayMain}`} />
              <span className={`${s.tagChip} ${s.chipPrice}`}>{v.hero.scene.price}</span>
              <span className={`${s.tagChip} ${s.chipVisit}`}>{v.hero.scene.visit}</span>
            </div>
          </div>
          <div className={s.wrap}>
            <form className={s.finder} action={`${SITE}/products`}>
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
              <button type="submit">{c.hero.finder.submit(v.total)}</button>
            </form>
          </div>
        </section>

        <section className={s.section} aria-labelledby="h-cat">
          <div className={s.wrap}>
            <h2 id="h-cat" className={s.h2}>
              {c.categories.title}
            </h2>
            <ul className={s.cats}>
              {v.categories.map((x) => (
                <li key={x.id}>
                  <a href={x.href} className={s.cat}>
                    <span className={s.catArt}>
                      <EquipIllus kind={x.id} />
                    </span>
                    <span className={s.catName}>{x.name}</span>
                    <span className={s.catCount}>
                      <b>{x.count}</b> {c.categories.unit}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={s.section} aria-labelledby="h-latest">
          <div className={s.wrap}>
            <div className={s.headRow2}>
              <h2 id="h-latest" className={s.h2}>
                {c.latest.title}
              </h2>
              <a href={`${SITE}/products`} className={s.more}>
                {c.latest.viewAll} →
              </a>
            </div>
            <ul className={s.cards}>
              {v.latest.map((p) => {
                const added = list.includes(p.id);
                const meta = [
                  p.year && c.latest.year(p.year),
                  p.condition,
                  p.warranty && c.latest.warranty(p.warranty),
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <li key={p.id} className={`${s.card} ${p.sold ? s.sold : ""}`}>
                    <a href={p.href} className={s.cardLink}>
                      <span className={s.photo}>
                        <EquipIllus kind={p.kind} />
                        {p.sold ? (
                          <span className={`${s.tag} ${s.tagSold}`}>{c.latest.sold}</span>
                        ) : (
                          p.isNew && <span className={s.tag}>{c.latest.newTag}</span>
                        )}
                      </span>
                      <span className={s.cardBody}>
                        <span className={s.cardCat}>{p.categoryName}</span>
                        <span className={s.cardTitle}>
                          {p.brand} {p.model}
                        </span>
                        <span className={s.cardName}>{p.nameZh}</span>
                        <span className={s.cardMeta}>{meta}</span>
                        <span className={s.price}>
                          {p.priceTwd ? twd(p.priceTwd) : c.latest.askPrice}
                        </span>
                      </span>
                    </a>
                    {!p.sold && (
                      <button
                        type="button"
                        className={`${s.add} ${added ? s.addOn : ""}`}
                        aria-pressed={added}
                        onClick={() => toggle(p.id)}
                      >
                        {added ? `✓ ${c.latest.added}` : `＋ ${c.latest.add}`}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className={`${s.section} ${s.brandSec}`} aria-labelledby="h-brands">
          <div className={`${s.wrap} ${s.brandRow}`}>
            <h2 id="h-brands" className={s.h2}>
              {c.brands.title}
            </h2>
            <ul className={s.brands}>
              {v.brands.map((b) => (
                <li key={b}>
                  <a href={`${SITE}/products?brand=${encodeURIComponent(b)}`}>{b}</a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`${s.section} ${s.buySec}`} aria-labelledby="h-buy">
          <div className={`${s.wrap} ${s.buyRow}`}>
            <div>
              <h2 id="h-buy" className={s.h2}>
                {c.buy.title}
              </h2>
              <ol className={s.steps}>
                {c.buy.steps.map((st, i) => (
                  <li key={st.title}>
                    <span className={s.stepNo} aria-hidden>
                      {i + 1}
                    </span>
                    <span className={s.stepArt}>
                      <StepIllus step={i as 0 | 1 | 2} />
                    </span>
                    <strong>{st.title}</strong>
                    <span>{st.body}</span>
                  </li>
                ))}
              </ol>
            </div>
            <aside className={s.visit} aria-labelledby="h-visit">
              <MiniMap />
              <h2 id="h-visit">{c.visit.title}</h2>
              <dl>
                <div>
                  <dt>{c.visit.address}</dt>
                  <dd>{co.address}</dd>
                </div>
                <div>
                  <dt>{c.visit.hours}</dt>
                  <dd>{co.hours}</dd>
                </div>
              </dl>
              <p>{c.visit.note}</p>
              <a href={tel} className={s.visitBtn}>
                {c.visit.call} {co.phone}
              </a>
            </aside>
          </div>
        </section>

        <section id="services" className={s.section} aria-labelledby="h-services">
          <div className={s.wrap}>
            <h2 id="h-services" className={s.h2}>
              {c.services.title}
            </h2>
            <ul className={s.services}>
              {c.services.items.map((sv) => (
                <li key={sv.id}>
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
        <div className={`${s.wrap} ${s.footRow}`}>
          <div className={s.brand}>
            <span className={s.mark} aria-hidden>
              <span>A</span>
            </span>
            <span className={s.brandText}>
              <strong>{co.name}</strong>
              <span>{v.brand.tagline}</span>
            </span>
          </div>
          <ul className={s.footList}>
            <li>
              <a href={tel}>{co.phone}</a>
            </li>
            <li>
              <a href={`mailto:${co.email}`}>{co.email}</a>
            </li>
            <li>{co.address}</li>
            <li>{co.hours}</li>
          </ul>
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
