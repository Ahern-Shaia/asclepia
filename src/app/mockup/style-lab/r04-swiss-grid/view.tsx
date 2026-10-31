"use client";

import Link from "next/link";
import { useState } from "react";
import { EquipIllus, MiniMap, StepIllus } from "@/components/home-v4/equip-illus";
import { SITE, twd, v } from "../_v-content";
import s from "./style.module.css";

const c = v.copy;
const tel = `tel:${v.company.phone}`;
const pad = (n: number) => String(n).padStart(2, "0");

function Head({ id, no, title }: { id: string; no: number; title: string }) {
  return (
    <div className={s.head}>
      <span className={s.headNo} aria-hidden>
        {pad(no)}
      </span>
      <h2 id={id}>{title}</h2>
    </div>
  );
}

export function View() {
  const [list, setList] = useState<string[]>([]);
  const toggle = (id: string) =>
    setList((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  return (
    <div className={s.page}>
      <div className={s.banner}></div>
      {/* background art: the 12-column grid, drawn behind everything, with a column ruler on top */}
      <div className={s.gridBg} aria-hidden>
        <div className={`${s.wrap} ${s.cols}`}>
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
      </div>
      <ol className={`${s.wrap} ${s.ruler}`} aria-hidden>
        {Array.from({ length: 12 }, (_, i) => (
          <li key={i}>{pad(i + 1)}</li>
        ))}
      </ol>

      <div className={s.util}>
        <div className={`${s.wrap} ${s.g12}`}>
          <span className={s.uHours}>{c.util.hours(v.company.hours)}</span>
          <span className={s.uVisit}>{c.util.visit}</span>
          <a href={tel} className={s.uPhone}>
            {v.company.phone}
          </a>
        </div>
      </div>

      <header className={s.header}>
        <div className={`${s.wrap} ${s.g12} ${s.headerRow}`}>
          <Link href={SITE} className={s.brand} aria-label={`${v.brand.name} 首頁`}>
            <span className={s.mark} aria-hidden />
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
              <span>{c.header.inquiryList}</span>
              <span className={s.count} data-on={list.length > 0}>
                <span key={list.length}>{list.length}</span>
              </span>
            </a>
            <a href={tel} className={s.bookBtn}>
              {c.header.book}
            </a>
          </div>
        </div>
        <nav className={s.catNav} aria-label="設備分類">
          <div className={`${s.wrap} ${s.g12}`}>
            {v.categories.map((x, i) => (
              <Link key={x.id} href={x.href}>
                <span aria-hidden>{pad(i + 1)}</span>
                {x.name}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <main className={s.main}>
        <section className={s.hero} aria-labelledby="hero-title">
          <div className={`${s.wrap} ${s.g12}`}>
            <p className={s.eyebrow}>{v.hero.eyebrow}</p>
            <h1 id="hero-title" className={s.h1}>
              {v.hero.heading.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <div className={s.red} aria-hidden>
              <EquipIllus kind="monitor" className={s.redBack} />
              <EquipIllus kind="ultrasound" className={s.redMain} />
              <span className={s.chipPrice}>{v.hero.scene.price}</span>
              <span className={s.chipVisit}>{v.hero.scene.visit}</span>
            </div>
            <ol className={s.points}>
              {c.hero.points.map((p, i) => (
                <li key={p}>
                  <span aria-hidden>{i + 1}</span>
                  {p}
                </li>
              ))}
            </ol>
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
              <button type="submit">{c.hero.finder.submit(v.total)} →</button>
            </form>
          </div>
        </section>

        <section className={s.section} aria-labelledby="h-cat">
          <div className={`${s.wrap} ${s.g12}`}>
            <Head id="h-cat" no={1} title={c.categories.title} />
            <ul className={s.cats}>
              {v.categories.map((x, i) => (
                <li key={x.id}>
                  <Link href={x.href} className={s.cat}>
                    <span className={s.catIdx} aria-hidden>
                      {pad(i + 1)}
                    </span>
                    <span className={s.catName}>{x.name}</span>
                    <span className={s.catCount}>
                      {x.count}
                      <small>{c.categories.unit}</small>
                    </span>
                    <span className={s.catArt}>
                      <EquipIllus kind={x.id} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`${s.section} ${s.sLatest}`} aria-labelledby="h-latest">
          <div className={`${s.wrap} ${s.g12}`}>
            <Head id="h-latest" no={2} title={c.latest.title} />
            <Link href={`${SITE}/products`} className={s.more}>
              {c.latest.viewAll} →
            </Link>
            <ul className={s.cards}>
              {v.latest.map((p) => {
                const added = list.includes(p.id);
                const meta = [
                  p.year && c.latest.year(p.year),
                  p.condition,
                  p.warranty && c.latest.warranty(p.warranty),
                ]
                  .filter(Boolean)
                  .join(" / ");
                return (
                  <li key={p.id} className={`${s.card} ${p.sold ? s.sold : ""}`}>
                    <Link href={p.href} className={s.cardLink}>
                      <span className={s.cardTop}>
                        <span className={s.cardCat}>{p.categoryName}</span>
                        {p.sold ? (
                          <span className={`${s.tag} ${s.tagSold}`}>{c.latest.sold}</span>
                        ) : (
                          p.isNew && (
                            <span className={`${s.tag} ${s.tagNew}`}>{c.latest.newTag}</span>
                          )
                        )}
                      </span>
                      <span className={s.photo}>
                        <EquipIllus kind={p.kind} />
                      </span>
                      <span className={s.cardTitle}>
                        {p.brand} {p.model}
                      </span>
                      <span className={s.cardName}>{p.nameZh}</span>
                      <span className={s.cardMeta}>{meta}</span>
                      <span className={s.price}>
                        {p.priceTwd ? twd(p.priceTwd) : c.latest.askPrice}
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
          </div>
        </section>

        <section className={s.section} aria-labelledby="h-brands">
          <div className={`${s.wrap} ${s.g12}`}>
            <Head id="h-brands" no={3} title={c.brands.title} />
            <ul className={s.brands}>
              {v.brands.map((b) => (
                <li key={b}>
                  <Link href={`${SITE}/products?brand=${encodeURIComponent(b)}`}>{b}</Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={s.section} aria-labelledby="h-buy">
          <div className={`${s.wrap} ${s.g12}`}>
            <Head id="h-buy" no={4} title={c.buy.title} />
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
                {c.visit.call} {v.company.phone} →
              </a>
            </aside>
          </div>
        </section>

        <section id="services" className={s.section} aria-labelledby="h-services">
          <div className={`${s.wrap} ${s.g12}`}>
            <Head id="h-services" no={5} title={c.services.title} />
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
        <div className={`${s.wrap} ${s.g12}`}>
          <div className={s.shelf} aria-hidden>
            {(
              ["microscope", "monitor", "ultrasound", "analyzer", "centrifuge", "dental"] as const
            ).map((k) => (
              <EquipIllus key={k} kind={k} outline />
            ))}
          </div>
          <div className={s.fBrand}>
            <strong>{v.company.name}</strong>
            <span>{v.brand.tagline}</span>
          </div>
          <ul className={s.fContact}>
            <li>
              <a href={tel}>{v.company.phone}</a>
            </li>
            <li>
              <a href={`mailto:${v.company.email}`}>{v.company.email}</a>
            </li>
            <li>{v.company.address}</li>
            <li>{v.company.hours}</li>
          </ul>
          <p className={s.copy}>{v.copyright}</p>
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
