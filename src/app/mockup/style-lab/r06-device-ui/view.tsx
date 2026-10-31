"use client";

import Link from "next/link";
import { type CSSProperties, type ReactNode, useState } from "react";
import { EquipIllus, MiniMap, StepIllus } from "@/components/home-v4/equip-illus";
import { SITE, twd, v } from "../_v-content";
import s from "./style.module.css";

const c = v.copy;
const tel = `tel:${v.company.phone}`;
const pad = (n: number) => String(n).padStart(2, "0");
// Patient monitors colour-code each channel; the category tiles borrow that convention.
const CHANNEL = ["#5be37d", "#3fd4f0", "#f5d547", "#e8eef0", "#f28ad9", "#35e0c2"];

// Decorative traces (shape only, no values): ECG-like beats, a pleth hump and a slow sine.
const beats = (w: number, y: number) =>
  Array.from({ length: Math.ceil(w / 150) }, (_, i) => {
    const x = i * 150;
    return `L${x + 30} ${y} q6 -8 12 0 L${x + 58} ${y} l4 6 l6 -44 l6 54 l5 -16 L${x + 96} ${y} q12 -16 24 0 L${x + 150} ${y}`;
  }).join(" ");
const humps = (n: number) =>
  Array.from({ length: n }, () => "c20 -36 40 -36 56 -10 q8 -8 16 0 c20 14 50 10 78 10").join(" ");
const ECG = `M0 40 ${beats(1200, 40)}`;
const PLETH = `M0 50 ${humps(8)}`;
const RESP = `M0 30 ${Array.from({ length: 4 }, () => "c75 -26 75 -26 150 0 s75 26 150 0").join(" ")}`;

function Trace({ d, color, className }: { d: string; color: string; className?: string }) {
  return (
    <span className={`${s.trace} ${className ?? ""}`} style={{ "--ch": color } as CSSProperties}>
      <svg viewBox="0 0 1200 70" preserveAspectRatio="none">
        <path d={d} />
      </svg>
      <i className={s.sweep} />
    </span>
  );
}

function PanelBar({ id, title, aside }: { id: string; title: string; aside?: ReactNode }) {
  return (
    <div className={s.bar}>
      <span className={s.led} aria-hidden />
      <h2 id={id}>{title}</h2>
      {aside}
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
          <span className={s.status}>
            <i aria-hidden />
            {c.util.hours(v.company.hours)}
          </span>
          <span className={s.deskOnly}>{c.util.visit}</span>
          <a href={tel} className={s.utilPhone}>
            TEL {v.company.phone}
          </a>
        </div>
      </div>

      <header className={s.header}>
        <div className={`${s.wrap} ${s.headerRow}`}>
          <Link href={SITE} className={s.brand} aria-label={`${v.brand.name} 首頁`}>
            <span className={s.mark} aria-hidden />
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
              <span className={s.listLabel}>{c.header.inquiryList}</span>
              <span className={s.readout} data-on={list.length > 0} key={list.length}>
                {pad(list.length)}
              </span>
            </a>
            <a href={tel} className={s.bookBtn}>
              {c.header.book}
            </a>
          </div>
        </div>
        <nav className={s.catNav} aria-label="設備分類">
          <div className={s.wrap}>
            {v.categories.map((x, i) => (
              <Link key={x.id} href={x.href} style={{ "--ch": CHANNEL[i] } as CSSProperties}>
                {x.name}
              </Link>
            ))}
            <Link href={`${SITE}/products`} className={s.catAll}>
              {c.categories.all}
            </Link>
          </div>
        </nav>
      </header>

      <main className={s.main}>
        <section className={s.wrap} aria-labelledby="hero-title">
          <div className={s.hero}>
            <div className={s.heroText}>
              <p className={s.eyebrow}>
                <i aria-hidden />
                {v.hero.eyebrow}
              </p>
              <h1 id="hero-title">
                {v.hero.heading.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h1>
              <ul className={s.points}>
                {c.hero.points.map((p, i) => (
                  <li key={p} style={{ "--ch": CHANNEL[i] } as CSSProperties}>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className={s.screen} aria-hidden>
              <div className={s.traces}>
                <Trace d={ECG} color={CHANNEL[0]} />
                <Trace d={PLETH} color={CHANNEL[1]} className={s.t2} />
                <Trace d={RESP} color={CHANNEL[2]} className={s.t3} />
              </div>
              <div className={s.stage}>
                <EquipIllus kind="monitor" className={s.stL} />
                <EquipIllus kind="ultrasound" className={s.stM} />
                <EquipIllus kind="analyzer" className={s.stR} />
              </div>
              <span className={s.chipPrice}>{v.hero.scene.price}</span>
              <span className={s.chipVisit}>{v.hero.scene.visit}</span>
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
          </div>
        </section>

        <section className={`${s.wrap} ${s.section}`} aria-labelledby="h-cat">
          <PanelBar id="h-cat" title={c.categories.title} />
          <ul className={s.cats}>
            {v.categories.map((x, i) => (
              <li key={x.id}>
                <Link
                  href={x.href}
                  className={s.cat}
                  style={{ "--ch": CHANNEL[i] } as CSSProperties}
                >
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
        </section>

        <section className={`${s.wrap} ${s.section}`} aria-labelledby="h-latest">
          <PanelBar
            id="h-latest"
            title={c.latest.title}
            aside={
              <Link href={`${SITE}/products`} className={s.more}>
                {c.latest.viewAll} ›
              </Link>
            }
          />
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
                  <Link href={p.href} className={s.cardLink}>
                    <span className={s.cardHead}>
                      <span>{p.categoryName}</span>
                      {p.sold ? (
                        <span className={`${s.tag} ${s.tagSold}`}>{c.latest.sold}</span>
                      ) : (
                        p.isNew && <span className={`${s.tag} ${s.tagNew}`}>{c.latest.newTag}</span>
                      )}
                    </span>
                    <span className={s.photo}>
                      <EquipIllus kind={p.kind} />
                    </span>
                    <span className={s.cardBody}>
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

        <section className={`${s.wrap} ${s.section}`} aria-labelledby="h-brands">
          <PanelBar id="h-brands" title={c.brands.title} />
          <ul className={s.brands}>
            {v.brands.map((b) => (
              <li key={b}>
                <Link href={`${SITE}/products?brand=${encodeURIComponent(b)}`}>{b}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${s.wrap} ${s.section} ${s.buyRow}`} aria-labelledby="h-buy">
          <div className={s.panel}>
            <PanelBar id="h-buy" title={c.buy.title} />
            <ol className={s.steps}>
              {c.buy.steps.map((st, i) => (
                <li key={st.title}>
                  <span className={s.node} aria-hidden>
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
          <aside className={`${s.panel} ${s.visit}`} aria-labelledby="h-visit">
            <PanelBar id="h-visit" title={c.visit.title} />
            <div className={s.visitBody}>
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
            </div>
          </aside>
        </section>

        <section id="services" className={`${s.wrap} ${s.section}`} aria-labelledby="h-services">
          <PanelBar id="h-services" title={c.services.title} />
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
        <div className={s.wrap}>
          <div className={s.shelf} aria-hidden>
            {(
              ["microscope", "monitor", "ultrasound", "analyzer", "centrifuge", "dental"] as const
            ).map((k) => (
              <EquipIllus key={k} kind={k} outline />
            ))}
          </div>
          <div className={s.footRow}>
            <div className={s.brand}>
              <span className={s.mark} aria-hidden />
              <span className={s.brandText}>
                <strong>{v.company.name}</strong>
                <span>{v.brand.tagline}</span>
              </span>
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
          </div>
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
