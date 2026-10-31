"use client";

import Link from "next/link";
import { type ReactNode, useState } from "react";
import { EquipIllus, MiniMap, StepIllus } from "@/components/home-v4/equip-illus";
import { SITE, twd, v } from "../_v-content";
import s from "./style.module.css";

const c = v.copy;
const tel = `tel:${v.company.phone}`;
const pad = (n: number) => String(n).padStart(2, "0");
const ZONES = ["A", "B", "C", "D", "E", "F"];

// Section heading drawn as a drafting detail callout: number over sheet.
function Head({
  id,
  no,
  title,
  aside,
}: {
  id: string;
  no: number;
  title: string;
  aside?: ReactNode;
}) {
  return (
    <div className={s.head}>
      <span className={s.callout} aria-hidden>
        <b>{no}</b>
        <i>{pad(no + 1)}</i>
      </span>
      <h2 id={id}>{title}</h2>
      <span className={s.headRule} aria-hidden />
      {aside}
    </div>
  );
}

function Scene() {
  return (
    <div className={s.scene} aria-hidden>
      <svg className={s.sceneLines} viewBox="0 0 600 400">
        <circle className={s.construct} cx="304" cy="236" r="168" />
        <path className={s.centre} d="M304 52 V392 M120 236 H488" />
        <path className={s.ground} d="M16 362 H584" />
        <path
          className={s.hatch}
          d="M16 362 l-10 12 M46 362 l-10 12 M76 362 l-10 12 M106 362 l-10 12 M136 362 l-10 12 M166 362 l-10 12 M196 362 l-10 12 M226 362 l-10 12 M256 362 l-10 12 M286 362 l-10 12 M316 362 l-10 12 M346 362 l-10 12 M376 362 l-10 12 M406 362 l-10 12 M436 362 l-10 12 M466 362 l-10 12 M496 362 l-10 12 M526 362 l-10 12 M556 362 l-10 12 M586 362 l-10 12"
        />
        {/* dimension: overall width of the main unit (value lives in the spec sheet) */}
        <path
          className={`${s.dim} ${s.draw}`}
          pathLength={1}
          d="M239 172 V104 M371 172 V104 M239 114 H371"
        />
        <path className={s.arrow} d="M239 114 l10 -4 v8 Z M371 114 l-10 -4 v8 Z" />
        {/* vertical dimension on the analyzer */}
        <path
          className={`${s.dim} ${s.draw}`}
          pathLength={1}
          d="M548 250 H584 M548 362 H584 M574 250 V362"
        />
        <path className={s.arrow} d="M574 250 l-4 10 h8 Z M574 362 l-4 -10 h8 Z" />
        {/* leaders to balloons */}
        <path className={`${s.leader} ${s.draw}`} pathLength={1} d="M100 240 V208" />
        <path className={`${s.leader} ${s.draw}`} pathLength={1} d="M262 205 L232 150 H222" />
        <path className={`${s.leader} ${s.draw}`} pathLength={1} d="M486 258 V212" />
        <path className={`${s.redline} ${s.draw}`} pathLength={1} d="M352 222 L420 160 H440" />
        <circle className={s.dot} cx="100" cy="240" r="3" />
        <circle className={s.dot} cx="262" cy="205" r="3" />
        <circle className={s.dot} cx="486" cy="258" r="3" />
        <circle className={s.redDot} cx="352" cy="222" r="3" />
      </svg>
      <EquipIllus kind="monitor" className={`${s.item} ${s.itemL}`} />
      <EquipIllus kind="ultrasound" className={`${s.item} ${s.itemM}`} />
      <EquipIllus kind="analyzer" className={`${s.item} ${s.itemR}`} />
      <span className={`${s.label} ${s.dimLabel}`}>詳規格表</span>
      <span className={`${s.balloon} ${s.b1}`}>
        <b>1</b>
        <em>{v.categories[1].name}</em>
      </span>
      <span className={`${s.balloon} ${s.b2}`}>
        <b>2</b>
        <em>{v.categories[0].name}</em>
      </span>
      <span className={`${s.balloon} ${s.b3}`}>
        <b>3</b>
        <em>{v.categories[2].name}</em>
      </span>
      <span className={`${s.note} ${s.notePrice}`}>{v.hero.scene.price}</span>
      <span className={`${s.note} ${s.noteVisit}`}>{v.hero.scene.visit}</span>
    </div>
  );
}

export function View() {
  const [list, setList] = useState<string[]>([]);
  const toggle = (id: string) =>
    setList((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  return (
    <div className={s.page}>
      <div className={s.sheet}>
        <ol className={s.zonesTop} aria-hidden>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ol>

        <div className={s.util}>
          <span>{c.util.hours(v.company.hours)}</span>
          <span className={s.deskOnly}>{c.util.visit}</span>
          <a href={tel} className={s.utilPhone}>
            TEL {v.company.phone}
          </a>
        </div>

        <header className={s.header}>
          <div className={s.headerRow}>
            <Link href={SITE} className={s.brand} aria-label={`${v.brand.name} 首頁`}>
              <span className={s.mark} aria-hidden>
                A
              </span>
              <span className={s.brandText}>
                <strong>{v.brand.name}</strong>
                <span>{v.brand.tagline}</span>
              </span>
            </Link>
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
                <span className={s.count} key={list.length} data-on={list.length > 0}>
                  {pad(list.length)}
                </span>
              </a>
              <a href={tel} className={s.bookBtn}>
                {c.header.book}
              </a>
            </div>
          </div>
          <nav className={s.catNav} aria-label="設備分類">
            {v.categories.map((x, i) => (
              <Link key={x.id} href={x.href}>
                <span aria-hidden>{ZONES[i]}</span>
                {x.name}
              </Link>
            ))}
            <Link href={`${SITE}/products`} className={s.catAll}>
              {c.categories.all}
            </Link>
          </nav>
        </header>

        <main>
          <section className={s.hero} aria-labelledby="hero-title">
            <div className={s.heroText}>
              <p className={s.eyebrow}>
                <span>NOTE</span>
                {v.hero.eyebrow}
              </p>
              <h1 id="hero-title">
                {v.hero.heading.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h1>
              <ol className={s.points}>
                {c.hero.points.map((p, i) => (
                  <li key={p}>
                    <span aria-hidden>{i + 1}.</span>
                    {p}
                  </li>
                ))}
              </ol>
              <dl className={s.titleBlock}>
                <div className={s.tbWide}>
                  <dt>圖名</dt>
                  <dd>{v.brand.tagline}</dd>
                </div>
                <div>
                  <dt>圖號</dt>
                  <dd>AS-HOME-001</dd>
                </div>
                <div>
                  <dt>比例</dt>
                  <dd>NTS</dd>
                </div>
                <div>
                  <dt>張次</dt>
                  <dd>01 / 06</dd>
                </div>
                <div className={s.tbWide}>
                  <dt>單位</dt>
                  <dd>{v.company.name}</dd>
                </div>
              </dl>
            </div>
            <div className={s.drawing}>
              <Scene />
            </div>
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
          </section>

          <section className={s.section} aria-labelledby="h-cat">
            <Head id="h-cat" no={1} title={c.categories.title} />
            <ul className={s.cats}>
              {v.categories.map((x, i) => (
                <li key={x.id}>
                  <Link href={x.href} className={s.cat}>
                    <span className={s.zone} aria-hidden>
                      {ZONES[i]}-{pad(i + 1)}
                    </span>
                    <span className={s.catArt}>
                      <EquipIllus kind={x.id} />
                    </span>
                    <span className={s.catName}>{x.name}</span>
                    <span className={s.catCount}>
                      {x.count} {c.categories.unit}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className={s.section} aria-labelledby="h-latest">
            <Head
              id="h-latest"
              no={2}
              title={c.latest.title}
              aside={
                <Link href={`${SITE}/products`} className={s.more}>
                  {c.latest.viewAll} →
                </Link>
              }
            />
            <ul className={s.cards}>
              {v.latest.map((p, i) => {
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
                    <Link href={p.href} className={s.cardLink}>
                      <span className={s.detail} aria-hidden>
                        詳圖 {ZONES[i]}
                      </span>
                      <span className={s.photo}>
                        <EquipIllus kind={p.kind} />
                        {p.sold ? (
                          <span className={`${s.tag} ${s.tagSold}`}>{c.latest.sold}</span>
                        ) : (
                          p.isNew && (
                            <span className={`${s.tag} ${s.tagNew}`}>{c.latest.newTag}</span>
                          )
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
                    </Link>
                    {!p.sold && (
                      <button
                        type="button"
                        className={s.addBtn}
                        aria-pressed={added}
                        onClick={() => toggle(p.id)}
                      >
                        <span aria-hidden>{added ? "✓" : "+"}</span>
                        {added ? c.latest.added : c.latest.add}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className={s.section} aria-labelledby="h-brands">
            <Head id="h-brands" no={3} title={c.brands.title} />
            <ul className={s.brands}>
              {v.brands.map((b) => (
                <li key={b}>
                  <Link href={`${SITE}/products?brand=${encodeURIComponent(b)}`}>{b}</Link>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${s.section} ${s.buyRow}`} aria-labelledby="h-buy">
            <div>
              <Head id="h-buy" no={4} title={c.buy.title} />
              <ol className={s.steps}>
                {c.buy.steps.map((st, i) => (
                  <li key={st.title}>
                    <span className={s.stepNo} aria-hidden>
                      {pad(i + 1)}
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
              <div className={s.mapWrap}>
                <MiniMap />
                <span className={s.north} aria-hidden>
                  N
                </span>
              </div>
              <h2 id="h-visit">{c.visit.title}</h2>
              <dl>
                <div>
                  <dt>{c.visit.address}</dt>
                  <dd>{v.company.address}</dd>
                </div>
                <div>
                  <dt>{c.visit.hours}</dt>
                  <dd>{v.company.hours}</dd>
                </div>
              </dl>
              <p>{c.visit.note}</p>
              <a href={tel} className={s.visitBtn}>
                {c.visit.call} {v.company.phone}
              </a>
            </aside>
          </section>

          <section id="services" className={s.section} aria-labelledby="h-services">
            <Head id="h-services" no={5} title={c.services.title} />
            <ul className={s.services}>
              {c.services.items.map((sv, i) => (
                <li key={sv.id}>
                  <span className={s.svNo} aria-hidden>
                    S-{pad(i + 1)}
                  </span>
                  <strong>{sv.title}</strong>
                  <span>{sv.body}</span>
                </li>
              ))}
            </ul>
          </section>
        </main>

        <footer id="contact" className={s.footer}>
          <div className={s.shelf} aria-hidden>
            {(
              ["microscope", "monitor", "ultrasound", "analyzer", "centrifuge", "dental"] as const
            ).map((k) => (
              <EquipIllus key={k} kind={k} outline />
            ))}
          </div>
          <dl className={s.footBlock}>
            <div className={s.footBrand}>
              <dt>單位</dt>
              <dd>
                <strong>{v.company.name}</strong>
                <span>{v.brand.tagline}</span>
              </dd>
            </div>
            <div>
              <dt>電話</dt>
              <dd>
                <a href={tel}>{v.company.phone}</a>
              </dd>
            </div>
            <div>
              <dt>信箱</dt>
              <dd>
                <a href={`mailto:${v.company.email}`}>{v.company.email}</a>
              </dd>
            </div>
            <div>
              <dt>{c.visit.address}</dt>
              <dd>{v.company.address}</dd>
            </div>
            <div>
              <dt>{c.visit.hours}</dt>
              <dd>{v.company.hours}</dd>
            </div>
            <div>
              <dt>張次</dt>
              <dd>06 / 06</dd>
            </div>
          </dl>
          <p className={s.copy}>{v.copyright}</p>
        </footer>
      </div>

      <div className={s.mobileBar}>
        <a href={tel}>{c.mobileBar.call}</a>
        <a href="#inquiry-list" className={s.mobileMain}>
          {c.mobileBar.inquiry}（{list.length}）
        </a>
      </div>
    </div>
  );
}
