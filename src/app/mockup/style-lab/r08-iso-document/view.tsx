"use client";

import { CalendarOutlined, PhoneOutlined, SwapOutlined, ToolOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useState } from "react";
import { EquipIllus, MiniMap, StepIllus } from "@/components/home-v4/equip-illus";
import { SITE, twd, v } from "../_v-content";
import s from "./style.module.css";

const c = v.copy;
const tel = `tel:${v.company.phone}`;
const DOC = "AS-CAT-0001";
const recNo = (id: string) => `AS-${id.replace(/\D/g, "").padStart(4, "0")}`;
const pad = (n: number) => String(n).padStart(2, "0");
const serviceIcon = { buy: <SwapOutlined />, repair: <ToolOutlined />, rent: <CalendarOutlined /> };

function Clause({ no, title, id }: { no: number; title: string; id: string }) {
  return (
    <div className={s.clause}>
      <span className={s.clauseNo} aria-hidden>
        {no}
      </span>
      <h2 id={id}>{title}</h2>
      <span className={s.clauseRef} aria-hidden>
        {DOC} §{no}
      </span>
    </div>
  );
}

function Box({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={`${s.box} ${on ? s.boxOn : ""}`} aria-hidden>
      <rect x="1.5" y="1.5" width="17" height="17" />
      <path d="M5 10.5 L8.5 14 L15 6.5" />
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
                {pad(list.length)}
              </span>
            </a>
            <a href={tel} className={s.bookBtn}>
              {c.header.book}
            </a>
          </div>
        </div>
        <nav className={s.catNav} aria-label="設備分類">
          <div className={`${s.wrap} ${s.catNavRow}`}>
            {v.categories.map((x, i) => (
              <Link key={x.id} href={x.href}>
                <span className={s.mono} aria-hidden>
                  {pad(i + 1)}
                </span>
                {x.name}
              </Link>
            ))}
            <Link href={`${SITE}/products`} className={s.catNavAll}>
              {c.categories.all}
            </Link>
          </div>
        </nav>
      </header>

      <main className={`${s.wrap} ${s.sheet}`}>
        <div className={s.docHead} aria-label="文件資訊" role="group">
          <div className={s.docTitle}>
            <span>文件名稱</span>
            <strong>{v.brand.name} 設備型錄・首頁</strong>
          </div>
          <div>
            <span>文件編號</span>
            <strong className={s.mono}>{DOC}</strong>
          </div>
          <div>
            <span>版次</span>
            <strong className={s.mono}>A</strong>
          </div>
          <div>
            <span>頁次</span>
            <strong className={s.mono}>1 / 1</strong>
          </div>
          <div>
            <span>日期</span>
            <strong className={s.mono}>2026-10-31</strong>
          </div>
          <div className={s.docStatus}>
            <span>狀態</span>
            <strong className={s.stamp}>現行版</strong>
          </div>
        </div>

        <section className={s.hero} aria-labelledby="hero-title">
          <div className={s.heroText}>
            <span className={s.eyebrow}>
              <span className={s.clauseNo} aria-hidden>
                1
              </span>
              {v.hero.eyebrow}
            </span>
            <h1 id="hero-title">
              {v.hero.heading.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <ul className={s.points}>
              {c.hero.points.map((p, i) => (
                <li key={p}>
                  <span className={s.mono} aria-hidden>
                    1.{i + 1}
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <figure className={s.fig} aria-hidden>
            <figcaption>
              <span>附圖 A</span>
              <span className={s.mono}>{DOC}-A</span>
            </figcaption>
            <div className={s.figArea}>
              <EquipIllus kind="monitor" className={`${s.item} ${s.itemL}`} />
              <EquipIllus kind="analyzer" className={`${s.item} ${s.itemR}`} />
              <EquipIllus kind="ultrasound" className={`${s.item} ${s.itemM}`} />
              <span className={s.figPrice}>{v.hero.scene.price}</span>
              <span className={s.figVisit}>{v.hero.scene.visit}</span>
            </div>
          </figure>
        </section>

        <form className={s.finder} action={`${SITE}/products`}>
          <p className={s.finderTitle}>{c.hero.finder.title}</p>
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

        <section className={s.section} aria-labelledby="h-cat">
          <Clause no={2} title={c.categories.title} id="h-cat" />
          <div className={s.catTable}>
            <div className={s.thead} aria-hidden>
              <span>項次</span>
              <span>示意</span>
              <span>分類</span>
              <span>件數</span>
            </div>
            <div className={`${s.thead} ${s.theadSecond}`} aria-hidden>
              <span>項次</span>
              <span>示意</span>
              <span>分類</span>
              <span>件數</span>
            </div>
            <ul className={s.catRows}>
              {v.categories.map((x, i) => (
                <li key={x.id}>
                  <Link href={x.href} className={s.catRow}>
                    <span className={s.mono}>2.{i + 1}</span>
                    <span className={s.catArt}>
                      <EquipIllus kind={x.id} />
                    </span>
                    <span className={s.catName}>{x.name}</span>
                    <span className={s.catCount}>
                      <b className={s.mono}>{pad(x.count)}</b> {c.categories.unit}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={s.section} aria-labelledby="h-latest">
          <Clause no={3} title={c.latest.title} id="h-latest" />
          <ul className={s.records}>
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
                <li key={p.id} className={`${s.record} ${p.sold ? s.sold : ""}`}>
                  <Link href={p.href} className={s.recLink}>
                    <span className={s.recHead}>
                      <span className={s.mono}>記錄 {recNo(p.id)}</span>
                      {p.isNew && !p.sold && <span className={s.newTag}>{c.latest.newTag}</span>}
                    </span>
                    <span className={s.recArt}>
                      <EquipIllus kind={p.kind} className={s.recIllus} />
                      {p.sold && <span className={s.soldStamp}>{c.latest.sold}</span>}
                    </span>
                    <span className={s.fields}>
                      <span className={s.fl}>分類</span>
                      <span>{p.categoryName}</span>
                      <span className={s.fl}>型號</span>
                      <span className={s.recTitle}>
                        {p.brand} {p.model}
                      </span>
                      <span className={s.fl}>品名</span>
                      <span>{p.nameZh}</span>
                      <span className={s.fl}>規格</span>
                      <span className={s.recMeta}>{meta}</span>
                      <span className={s.fl}>價格</span>
                      <span className={s.price}>
                        {p.priceTwd ? twd(p.priceTwd) : c.latest.askPrice}
                      </span>
                    </span>
                  </Link>
                  {!p.sold && (
                    <button
                      type="button"
                      className={`${s.add} ${added ? s.addOn : ""}`}
                      aria-pressed={added}
                      onClick={() => toggle(p.id)}
                    >
                      <Box on={added} />
                      {added ? c.latest.added : c.latest.add}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <Link href={`${SITE}/products`} className={s.more}>
            {c.latest.viewAll} →
          </Link>
        </section>

        <section className={s.section} aria-labelledby="h-brands">
          <Clause no={4} title={c.brands.title} id="h-brands" />
          <ul className={s.brands}>
            {v.brands.map((b, i) => (
              <li key={b}>
                <Link href={`${SITE}/products?brand=${encodeURIComponent(b)}`}>
                  <span className={s.mono} aria-hidden>
                    4.{i + 1}
                  </span>
                  {b}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.section} aria-labelledby="h-buy">
          <Clause no={5} title={c.buy.title} id="h-buy" />
          <div className={s.buyRow}>
            <ol className={s.steps}>
              {c.buy.steps.map((st, i) => (
                <li key={st.title}>
                  <span className={s.stepNo} aria-hidden>
                    5.{i + 1}
                  </span>
                  <span className={s.stepText}>
                    <strong>{st.title}</strong>
                    <span>{st.body}</span>
                  </span>
                  <span className={s.stepArt}>
                    <StepIllus step={i as 0 | 1 | 2} />
                  </span>
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
                <PhoneOutlined aria-hidden /> {c.visit.call} {v.company.phone}
              </a>
            </aside>
          </div>
        </section>

        <section id="services" className={s.section} aria-labelledby="h-services">
          <Clause no={6} title={c.services.title} id="h-services" />
          <ul className={s.services}>
            {c.services.items.map((sv) => (
              <li key={sv.id}>
                <span className={s.serviceIcon} aria-hidden>
                  {serviceIcon[sv.id]}
                </span>
                <strong>{sv.title}</strong>
                <span>{sv.body}</span>
              </li>
            ))}
          </ul>
        </section>

        <table className={s.rev}>
          <caption>修訂紀錄</caption>
          <thead>
            <tr>
              <th scope="col">版次</th>
              <th scope="col">日期</th>
              <th scope="col">說明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>A</td>
              <td>2026-10-31</td>
              <td>首頁初版</td>
            </tr>
          </tbody>
        </table>
      </main>

      <footer id="contact" className={s.footer}>
        <div className={`${s.wrap} ${s.shelf}`} aria-hidden>
          {(
            ["microscope", "monitor", "ultrasound", "analyzer", "centrifuge", "dental"] as const
          ).map((k) => (
            <EquipIllus key={k} kind={k} outline />
          ))}
        </div>
        <div className={`${s.wrap} ${s.footerRow}`}>
          <div className={s.brand}>
            <span className={`${s.mark} ${s.markInv}`} aria-hidden>
              A
            </span>
            <span className={s.brandText}>
              <strong>{v.company.name}</strong>
              <span>{v.brand.tagline}</span>
            </span>
          </div>
          <dl className={s.footerContact}>
            <div>
              <dt>電話</dt>
              <dd>
                <a href={tel}>{v.company.phone}</a>
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${v.company.email}`}>{v.company.email}</a>
              </dd>
            </div>
            <div>
              <dt>地址</dt>
              <dd>{v.company.address}</dd>
            </div>
            <div>
              <dt>營業時間</dt>
              <dd>{v.company.hours}</dd>
            </div>
          </dl>
        </div>
        <div className={`${s.wrap} ${s.docFoot}`}>
          <span>{v.copyright}</span>
          <span className={s.mono}>{DOC} · 版次 A · 第 1 頁，共 1 頁</span>
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
