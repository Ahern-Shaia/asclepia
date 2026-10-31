"use client";

import { EquipIllus, MiniMap, StepIllus } from "@/components/home-v4/equip-illus";
import { type ReactNode, useState } from "react";
import { SITE, twd, v } from "../_v-content";
import s from "./style.module.css";

const c = v.copy;
const co = v.company;
const tel = `tel:${co.phone}`;
const pad = (n: number) => String(n).padStart(2, "0");

// Decorative Code 39 barcode (font-rendered) with its human-readable line underneath.
function Barcode({ code, className }: { code: string; className?: string }) {
  return (
    <span className={`${s.barcode} ${className ?? ""}`} aria-hidden>
      <span className={s.bars}>*{code}*</span>
      <span className={s.barText}>{code}</span>
    </span>
  );
}

// A form field: printed label in the corner, typed value below.
function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <span className={`${s.field} ${wide ? s.fieldWide : ""}`}>
      <span className={s.fieldLabel}>{label}</span>
      <span className={s.fieldValue}>{children}</span>
    </span>
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
              A
            </span>
            <span className={s.brandText}>
              <strong>{v.brand.name}</strong>
              <span>{v.brand.tagline}</span>
            </span>
          </a>
          <form className={s.search} role="search" action={`${SITE}/products`}>
            <label className={s.searchCell}>
              <span>{c.hero.finder.category}</span>
              <select name="cat" defaultValue="">
                <option value="">{c.header.allCategories}</option>
                {v.categories.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={`${s.searchCell} ${s.searchQ}`}>
              <span>{c.header.search}</span>
              <input
                name="q"
                placeholder={c.header.searchPlaceholder}
                aria-label={c.header.searchPlaceholder}
              />
            </label>
            <button type="submit">{c.header.search}</button>
          </form>
          <div className={s.actions}>
            <a
              href="#inquiry-list"
              className={s.listBtn}
              aria-label={`${c.header.inquiryList} ${list.length} 件`}
            >
              <span>{c.header.inquiryList}</span>
              <span className={s.digits} key={list.length}>
                {pad(list.length)
                  .split("")
                  .map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
              </span>
            </a>
            <a href={tel} className={`${s.bookBtn} ${s.desk}`}>
              {c.header.book}
            </a>
          </div>
        </div>
        <nav className={s.catNav} aria-label="設備分類">
          <div className={`${s.wrap} ${s.catNavRow}`}>
            {v.categories.map((x) => (
              <a key={x.id} href={x.href}>
                <span className={s.tick} aria-hidden />
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
          <div className={s.wrap}>
            <div className={s.form}>
              <div className={s.formHead}>
                <span className={s.formTitle}>{v.hero.eyebrow}</span>
                <span className={s.formNo}>
                  共 <b>{v.total}</b> {c.categories.unit}
                </span>
                <Barcode code="ASCLEPIA" className={s.formBar} />
              </div>
              <div className={s.formBody}>
                <div className={s.heroText}>
                  <h1 id="hero-title">
                    {v.hero.heading.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </h1>
                  <ul className={s.checks}>
                    {c.hero.points.map((p) => (
                      <li key={p}>
                        <span className={s.checked} aria-hidden>
                          ✓
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={s.plate} aria-hidden>
                  <span className={s.plateLabel}>附圖 A</span>
                  <span className={s.plateFloor} />
                  <EquipIllus kind="monitor" className={`${s.plateItem} ${s.plateLeft}`} />
                  <EquipIllus kind="analyzer" className={`${s.plateItem} ${s.plateRight}`} />
                  <EquipIllus kind="ultrasound" className={`${s.plateItem} ${s.plateMain}`} />
                  <span className={`${s.slip} ${s.slipPrice}`}>{v.hero.scene.price}</span>
                  <span className={`${s.slip} ${s.slipVisit}`}>{v.hero.scene.visit}</span>
                </div>
              </div>
              <form className={s.finder} action={`${SITE}/products`}>
                <label className={s.finderCell}>
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
                <label className={s.finderCell}>
                  <span>{c.hero.finder.brand}</span>
                  <select name="brand" defaultValue="">
                    <option value="">{c.hero.finder.any}</option>
                    {v.brands.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </label>
                <label className={s.finderCell}>
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
          </div>
        </section>

        <section className={s.section} aria-labelledby="h-cat">
          <div className={s.wrap}>
            <h2 id="h-cat" className={s.h2}>
              <span className={s.h2No} aria-hidden>
                A
              </span>
              {c.categories.title}
            </h2>
            <ul className={s.labels}>
              {v.categories.map((x, i) => (
                <li key={x.id}>
                  <a href={x.href} className={s.label}>
                    <span className={s.labelArt}>
                      <EquipIllus kind={x.id} />
                    </span>
                    <span className={s.labelFields}>
                      <span className={s.labelCode}>CAT-{pad(i + 1)}</span>
                      <span className={s.labelName}>{x.name}</span>
                      <span className={s.labelCount}>
                        <b>{x.count}</b> {c.categories.unit}
                      </span>
                      <Barcode code={`C${pad(i + 1)}`} className={s.labelBar} />
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
                <span className={s.h2No} aria-hidden>
                  B
                </span>
                {c.latest.title}
              </h2>
              <a href={`${SITE}/products`} className={s.more}>
                {c.latest.viewAll} →
              </a>
            </div>
            <ul className={s.records}>
              {v.latest.map((p) => {
                const added = list.includes(p.id);
                return (
                  <li key={p.id} className={`${s.record} ${p.sold ? s.sold : ""}`}>
                    <a href={p.href} className={s.recordLink}>
                      <span className={s.recordHead}>
                        <span className={s.recordNo}>
                          No. <b>{p.id.toUpperCase()}</b>
                        </span>
                        {p.sold ? (
                          <span className={`${s.tag} ${s.tagSold}`}>{c.latest.sold}</span>
                        ) : (
                          p.isNew && <span className={s.tag}>{c.latest.newTag}</span>
                        )}
                        <Barcode code={p.id.toUpperCase()} className={s.recordBar} />
                      </span>
                      <span className={s.recordPhoto}>
                        <EquipIllus kind={p.kind} />
                      </span>
                      <span className={s.recordFields}>
                        <Field label={c.hero.finder.category}>{p.categoryName}</Field>
                        <Field label={c.hero.finder.year}>
                          {p.year ? c.latest.year(p.year) : "—"}
                        </Field>
                        <Field label={c.hero.finder.brand} wide>
                          <span className={s.model}>
                            {p.brand} {p.model}
                          </span>
                        </Field>
                        <Field label="品名" wide>
                          {p.nameZh}
                        </Field>
                        <Field label="狀況">{p.condition ?? "—"}</Field>
                        <Field label="保固">{p.warranty ?? "—"}</Field>
                        <Field label="價格" wide>
                          <span className={s.price}>
                            {p.priceTwd ? twd(p.priceTwd) : c.latest.askPrice}
                          </span>
                        </Field>
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
          <div className={`${s.wrap} ${s.brandRow}`}>
            <h2 id="h-brands" className={s.h2}>
              <span className={s.h2No} aria-hidden>
                C
              </span>
              {c.brands.title}
            </h2>
            <ul className={s.brands}>
              {v.brands.map((b) => (
                <li key={b}>
                  <a href={`${SITE}/products?brand=${encodeURIComponent(b)}`}>
                    <span className={s.tick} aria-hidden />
                    {b}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={s.section} aria-labelledby="h-buy">
          <div className={`${s.wrap} ${s.buyGrid}`}>
            <div>
              <h2 id="h-buy" className={s.h2}>
                <span className={s.h2No} aria-hidden>
                  D
                </span>
                {c.buy.title}
              </h2>
              <ol className={s.flow}>
                {c.buy.steps.map((st, i) => (
                  <li key={st.title}>
                    <span className={s.flowHead}>
                      <span className={s.flowNo}>STEP {i + 1}</span>
                      <span className={s.flowArt}>
                        <StepIllus step={i as 0 | 1 | 2} />
                      </span>
                    </span>
                    <strong>{st.title}</strong>
                    <span>{st.body}</span>
                  </li>
                ))}
              </ol>
            </div>
            <aside className={s.visit} aria-labelledby="h-visit">
              <h2 id="h-visit" className={s.visitTitle}>
                {c.visit.title}
              </h2>
              <MiniMap />
              <span className={s.visitFields}>
                <Field label={c.visit.address} wide>
                  {co.address}
                </Field>
                <Field label={c.visit.hours} wide>
                  {co.hours}
                </Field>
              </span>
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
              <span className={s.h2No} aria-hidden>
                E
              </span>
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
          <Barcode code="ASCLEPIA" className={s.footBar} />
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
