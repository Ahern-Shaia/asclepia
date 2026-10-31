"use client";

import { PhoneOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useState } from "react";
import { EquipIllus, MiniMap, StepIllus } from "@/components/home-v4/equip-illus";
import { SITE, twd, v } from "../_v-content";
import s from "./style.module.css";

const c = v.copy;
const tel = `tel:${v.company.phone}`;
const sub = "abcdef";
// manuscript line numbers down the left margin (background art)
const lineNos = Array.from({ length: 40 }, (_, i) => (i + 1) * 5);

export function View() {
  const [list, setList] = useState<string[]>([]);
  const toggle = (id: string) =>
    setList((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  return (
    <div className={s.page}>
      <div className={s.util}>
        <div className={`${s.wrap} ${s.utilRow}`}>
          <span>{c.util.hours(v.company.hours)}</span>
          <span className={s.deskOnly}>{c.util.visit}</span>
          <a href={tel} className={s.utilPhone}>
            <PhoneOutlined aria-hidden /> {v.company.phone}
          </a>
        </div>
      </div>

      <header className={s.header}>
        <div className={`${s.wrap} ${s.headerRow}`}>
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
              type="search"
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
              <span className={s.deskOnly}>{c.header.inquiryList}</span>
              <span className={s.mobOnly}>清單</span>
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
              <Link key={x.id} href={x.href}>
                {x.name}
              </Link>
            ))}
            <Link href={`${SITE}/products`} className={s.catNavAll}>
              {c.categories.all}
            </Link>
          </div>
        </nav>
      </header>

      <main className={s.main}>
        <div className={s.lineNos} aria-hidden>
          {lineNos.map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>

        <div className={`${s.wrap} ${s.runHead}`} aria-hidden>
          <span>{v.brand.name} 設備型錄</span>
          <span>第 1 頁</span>
        </div>

        <section className={`${s.wrap} ${s.hero}`} aria-labelledby="hero-title">
          <p className={s.eyebrow}>{v.hero.eyebrow}</p>
          <h1 id="hero-title">
            {v.hero.heading.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p className={s.byline}>
            {v.brand.name}・{v.brand.tagline}
            <a href="#contact" className={s.fnRef} aria-label="聯絡資訊，見頁尾註 1">
              1
            </a>
          </p>
          <div className={s.heroCols}>
            <div className={s.abstract}>
              <p className={s.absLabel}>摘要</p>
              <ul>
                {c.hero.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <form className={s.finder} action={`${SITE}/products`}>
                <p className={s.absLabel}>{c.hero.finder.title}</p>
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
            <figure className={s.fig1}>
              <div className={s.plate} aria-hidden>
                <EquipIllus kind="monitor" className={`${s.item} ${s.itemL}`} />
                <EquipIllus kind="analyzer" className={`${s.item} ${s.itemR}`} />
                <EquipIllus kind="ultrasound" className={`${s.item} ${s.itemM}`} />
                <span className={`${s.plateLabel} ${s.labelA}`}>(a)</span>
                <span className={`${s.plateLabel} ${s.labelB}`}>(b)</span>
                <span className={`${s.plateLabel} ${s.labelC}`}>(c)</span>
              </div>
              <figcaption>
                <b>圖 1</b>　設備示意（插圖）：(a) {v.categories[1].name}、(b){" "}
                {v.categories[0].name}、(c) {v.categories[2].name}。{v.hero.scene.visit}；標價例{" "}
                {v.hero.scene.price}。
              </figcaption>
            </figure>
          </div>
        </section>

        <section className={`${s.wrap} ${s.section}`} aria-labelledby="h-cat">
          <h2 id="h-cat" className={s.h2}>
            <span className={s.secNo}>1</span>
            {c.categories.title}
          </h2>
          <figure className={s.fig2}>
            <ul className={s.subs}>
              {v.categories.map((x, i) => (
                <li key={x.id}>
                  <Link href={x.href} className={s.subLink}>
                    <span className={s.subArt}>
                      <EquipIllus kind={x.id} />
                    </span>
                    <span className={s.subCap}>
                      <i>({sub[i]})</i> {x.name}
                      <span className={s.subCount}>
                        {x.count} {c.categories.unit}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <figcaption>
              <b>圖 2</b>　各分類現有件數，合計 {v.total} {c.categories.unit}。
            </figcaption>
          </figure>
        </section>

        <section className={`${s.wrap} ${s.section}`} aria-labelledby="h-latest">
          <h2 id="h-latest" className={s.h2}>
            <span className={s.secNo}>2</span>
            {c.latest.title}
          </h2>
          <table className={s.table}>
            <caption>
              <b>表 1</b>　最近上架的 {v.latest.length} 件設備
            </caption>
            <thead>
              <tr>
                <th scope="col">
                  <span className={s.srOnly}>示意圖</span>
                </th>
                <th scope="col">品項</th>
                <th scope="col">年份・狀況・保固</th>
                <th scope="col" className={s.num}>
                  價格
                </th>
                <th scope="col">
                  <span className={s.srOnly}>詢價</span>
                </th>
              </tr>
            </thead>
            <tbody>
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
                  <tr key={p.id} className={p.sold ? s.sold : undefined}>
                    <td className={s.thumb}>
                      <EquipIllus kind={p.kind} />
                    </td>
                    <td className={s.item1}>
                      <span className={s.rowCat}>{p.categoryName}</span>
                      <Link href={p.href} className={s.rowTitle}>
                        {p.brand} {p.model}
                      </Link>
                      {p.sold ? (
                        <span className={`${s.tag} ${s.tagSold}`}>{c.latest.sold}</span>
                      ) : (
                        p.isNew && <span className={s.tag}>{c.latest.newTag}</span>
                      )}
                      <span className={s.rowName}>{p.nameZh}</span>
                    </td>
                    <td className={s.meta}>{meta}</td>
                    <td className={`${s.num} ${s.price}`}>
                      {p.priceTwd ? twd(p.priceTwd) : c.latest.askPrice}
                    </td>
                    <td className={s.addCell}>
                      {!p.sold && (
                        <button
                          type="button"
                          className={`${s.add} ${added ? s.addOn : ""}`}
                          aria-pressed={added}
                          onClick={() => toggle(p.id)}
                        >
                          {added ? `✓ ${c.latest.added}` : c.latest.add}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Link href={`${SITE}/products`} className={s.more}>
            {c.latest.viewAll} →
          </Link>
        </section>

        <section className={`${s.wrap} ${s.section}`} aria-labelledby="h-brands">
          <h2 id="h-brands" className={s.h2}>
            <span className={s.secNo}>3</span>
            {c.brands.title}
          </h2>
          <ol className={s.refs}>
            {v.brands.map((b, i) => (
              <li key={b}>
                <span className={s.refNo} aria-hidden>
                  [{i + 1}]
                </span>
                <Link href={`${SITE}/products?brand=${encodeURIComponent(b)}`}>{b}</Link>
              </li>
            ))}
          </ol>
        </section>

        <section className={`${s.wrap} ${s.section}`} aria-labelledby="h-buy">
          <h2 id="h-buy" className={s.h2}>
            <span className={s.secNo}>4</span>
            {c.buy.title}
          </h2>
          <div className={s.buyRow}>
            <ol className={s.steps}>
              {c.buy.steps.map((st, i) => (
                <li key={st.title}>
                  <span className={s.stepArt}>
                    <StepIllus step={i as 0 | 1 | 2} />
                  </span>
                  <p>
                    <b>
                      4.{i + 1}　{st.title}。
                    </b>
                    {st.body}
                  </p>
                </li>
              ))}
            </ol>
            <aside className={s.box} aria-labelledby="h-visit">
              <p className={s.boxLabel}>專欄 1</p>
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
                <PhoneOutlined aria-hidden /> {c.visit.call} {v.company.phone}
              </a>
            </aside>
          </div>
        </section>

        <section id="services" className={`${s.wrap} ${s.section}`} aria-labelledby="h-services">
          <h2 id="h-services" className={s.h2}>
            <span className={s.secNo}>5</span>
            {c.services.title}
          </h2>
          <ul className={s.services}>
            {c.services.items.map((sv) => (
              <li key={sv.id}>
                <b>{sv.title}。</b>
                {sv.body}
              </li>
            ))}
          </ul>
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
          <div className={s.footBrand}>
            <strong>{v.company.name}</strong>
            <span>{v.brand.tagline}</span>
          </div>
          <p className={s.footnote}>
            <sup>1</sup> 聯絡：電話 <a href={tel}>{v.company.phone}</a>；Email{" "}
            <a href={`mailto:${v.company.email}`}>{v.company.email}</a>；地址 {v.company.address}
            ；營業時間 {v.company.hours}。
          </p>
        </div>
        <div className={`${s.wrap} ${s.colophon}`}>
          <span>{v.copyright}</span>
          <span>第 1 頁</span>
        </div>
      </footer>

      <div className={s.mobileBar}>
        <a href={tel}>
          <PhoneOutlined aria-hidden /> {c.mobileBar.call}
        </a>
        <a href="#inquiry-list" className={s.mobileBarMain}>
          {c.mobileBar.inquiry}（{list.length}）
        </a>
      </div>
    </div>
  );
}
