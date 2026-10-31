"use client";

import Link from "next/link";
import { useState } from "react";
import { EquipIllus, MiniMap, StepIllus } from "@/components/home-v4/equip-illus";
import { SITE, twd, v } from "../_v-content";
import { Rosette, WaveBand } from "./guilloche";
import s from "./style.module.css";

const c = v.copy;
const tel = `tel:${v.company.phone}`;
const NUM = ["一", "二", "三", "四", "五", "六"];
const SEC = ["壹", "貳", "參", "肆", "伍"];

// The company's own square seal: the tagline set in two columns, read right to left.
function Seal({ className }: { className?: string }) {
  return (
    <span className={`${s.seal} ${className ?? ""}`} aria-hidden>
      {[...v.brand.tagline].map((ch, i) => (
        <i key={i}>{ch}</i>
      ))}
    </span>
  );
}

function Head({ id, no, title }: { id: string; no: number; title: string }) {
  return (
    <div className={s.head}>
      <h2 id={id}>
        <span aria-hidden>{SEC[no]}、</span>
        {title}
      </h2>
    </div>
  );
}

export function View() {
  const [list, setList] = useState<string[]>([]);
  const toggle = (id: string) =>
    setList((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  return (
    <div className={s.page}>
      <div className={s.util}>
        <div className={s.wrap}>
          <span>{c.util.hours(v.company.hours)}</span>
          <span className={s.deskOnly}>{c.util.visit}</span>
          <a href={tel}>電話 {v.company.phone}</a>
        </div>
      </div>

      <div className={s.doc}>
        <header className={s.header}>
          <div className={s.headerRow}>
            <Link href={SITE} className={s.brand} aria-label={`${v.brand.name} 首頁`}>
              <strong>{v.brand.name}</strong>
              <span>{v.brand.tagline}</span>
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
                {c.header.inquiryList}
                <span className={s.count} key={list.length} data-on={list.length > 0}>
                  {list.length}
                </span>
              </a>
              <a href={tel} className={s.bookBtn}>
                {c.header.book}
              </a>
            </div>
          </div>
          <WaveBand className={s.band} id="r05-band-top" />
          <nav className={s.catNav} aria-label="設備分類">
            {v.categories.map((x) => (
              <Link key={x.id} href={x.href}>
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
            <Rosette className={s.rosette} />
            <div className={s.heroBody}>
              <p className={s.eyebrow}>{v.hero.eyebrow}</p>
              <div className={s.field}>
                <span className={s.fieldLabel} aria-hidden>
                  主旨：
                </span>
                <h1 id="hero-title">
                  {v.hero.heading.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </h1>
              </div>
              <div className={s.field}>
                <span className={s.fieldLabel} aria-hidden>
                  說明：
                </span>
                <ol className={s.points}>
                  {c.hero.points.map((p, i) => (
                    <li key={p}>
                      <span aria-hidden>{NUM[i]}、</span>
                      {p}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <figure className={s.plate}>
              <div className={s.scene} aria-hidden>
                <EquipIllus kind="monitor" className={s.sL} />
                <EquipIllus kind="ultrasound" className={s.sM} />
                <EquipIllus kind="analyzer" className={s.sR} />
              </div>
              <figcaption>
                <span>附圖</span>
                <span className={s.capPrice}>{v.hero.scene.price}</span>
                <span>{v.hero.scene.visit}</span>
              </figcaption>
              <Seal className={s.heroSeal} />
            </figure>
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
            <Head id="h-cat" no={0} title={c.categories.title} />
            <div className={s.catTable}>
              <ul className={s.catLabels} aria-hidden>
                <li>項次</li>
                <li>圖示</li>
                <li>品類</li>
                <li>件數</li>
              </ul>
              <ul className={s.cats}>
                {v.categories.map((x, i) => (
                  <li key={x.id}>
                    <Link href={x.href} className={s.cat}>
                      <span className={s.catNo} aria-hidden>
                        {NUM[i]}
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
            </div>
          </section>

          <section className={s.section} aria-labelledby="h-latest">
            <div className={s.headRow}>
              <Head id="h-latest" no={1} title={c.latest.title} />
              <Link href={`${SITE}/products`} className={s.more}>
                {c.latest.viewAll} ▸
              </Link>
            </div>
            <ul className={s.cards}>
              {v.latest.map((p, i) => {
                const added = list.includes(p.id);
                const meta = [
                  p.year && c.latest.year(p.year),
                  p.condition,
                  p.warranty && c.latest.warranty(p.warranty),
                ]
                  .filter(Boolean)
                  .join("，");
                return (
                  <li key={p.id} className={`${s.card} ${p.sold ? s.sold : ""}`}>
                    <Link href={p.href} className={s.cardLink}>
                      <span className={s.cardHead}>
                        <span>附表{NUM[i]}</span>
                        <span>{p.categoryName}</span>
                      </span>
                      <span className={s.photo}>
                        <EquipIllus kind={p.kind} />
                        {p.sold ? (
                          <span className={s.soldStamp}>{c.latest.sold}</span>
                        ) : (
                          p.isNew && <span className={s.newStamp}>{c.latest.newTag}</span>
                        )}
                        {added && (
                          <span className={s.addedStamp} aria-hidden>
                            {c.latest.added}
                          </span>
                        )}
                      </span>
                      <span className={s.rec}>
                        <span className={s.recTitle}>
                          {p.brand} {p.model}
                        </span>
                        <span className={s.recName}>{p.nameZh}</span>
                        <span className={s.recMeta}>{meta}</span>
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
          </section>

          <section className={s.section} aria-labelledby="h-brands">
            <Head id="h-brands" no={2} title={c.brands.title} />
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
              <Head id="h-buy" no={3} title={c.buy.title} />
              <ol className={s.steps}>
                {c.buy.steps.map((st, i) => (
                  <li key={st.title}>
                    <span className={s.stepNo} aria-hidden>
                      {NUM[i]}
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
            </div>
            <aside className={s.visit} aria-labelledby="h-visit">
              <h2 id="h-visit">{c.visit.title}</h2>
              <MiniMap />
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
            <Head id="h-services" no={4} title={c.services.title} />
            <ul className={s.services}>
              {c.services.items.map((sv) => (
                <li key={sv.id}>
                  <strong>{sv.title}</strong>
                  <span>{sv.body}</span>
                </li>
              ))}
            </ul>
          </section>
        </main>

        <footer id="contact" className={s.footer}>
          <WaveBand className={s.band} id="r05-band-foot" />
          <div className={s.shelf} aria-hidden>
            {(
              ["microscope", "monitor", "ultrasound", "analyzer", "centrifuge", "dental"] as const
            ).map((k) => (
              <EquipIllus key={k} kind={k} outline />
            ))}
          </div>
          <div className={s.sign}>
            <ul className={s.fContact}>
              <li>
                <span>電話</span>
                <a href={tel}>{v.company.phone}</a>
              </li>
              <li>
                <span>信箱</span>
                <a href={`mailto:${v.company.email}`}>{v.company.email}</a>
              </li>
              <li>
                <span>{c.visit.address}</span>
                {v.company.address}
              </li>
              <li>
                <span>{c.visit.hours}</span>
                {v.company.hours}
              </li>
            </ul>
            <div className={s.fBrand}>
              <strong>{v.company.name}</strong>
              <Seal className={s.footSeal} />
            </div>
          </div>
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
