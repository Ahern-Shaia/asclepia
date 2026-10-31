"use client";

import {
  CalendarOutlined,
  CheckOutlined,
  PhoneOutlined,
  PlusOutlined,
  ProfileOutlined,
  SwapOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useState } from "react";
import { EquipIllus, MiniMap, StepIllus } from "@/components/home-v4/equip-illus";
import { SITE, twd, v } from "../_v-content";
import { Halftone, RegMark } from "./halftone";
import s from "./style.module.css";

const c = v.copy;
const tel = `tel:${v.company.phone}`;
const tab = [s.t0, s.t1, s.t2, s.t3, s.t4, s.t5];
const tabOf = Object.fromEntries(v.categories.map((x, i) => [x.id, tab[i]]));
const partNo = (id: string) => `AS-${id.replace(/\D/g, "").padStart(4, "0")}`;
const serviceIcon = { buy: <SwapOutlined />, repair: <ToolOutlined />, rent: <CalendarOutlined /> };

function Folio({ page, title, id }: { page: number; title: string; id: string }) {
  return (
    <div className={s.head}>
      <h2 id={id}>{title}</h2>
      <span className={s.folio} aria-hidden>
        P.{String(page).padStart(2, "0")}
      </span>
    </div>
  );
}

export function View() {
  const [list, setList] = useState<string[]>([]);
  const toggle = (id: string) =>
    setList((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  return (
    <div className={s.page}>
      <div className={s.colorBar} aria-hidden>
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

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
              <ProfileOutlined aria-hidden />
              <span className={s.deskOnly}>{c.header.inquiryList}</span>
              <span className={s.count} key={list.length}>
                {list.length}
              </span>
            </a>
            <a href={tel} className={s.bookBtn}>
              {c.header.book}
            </a>
          </div>
        </div>
        <nav className={s.tabs} aria-label="設備分類">
          {v.categories.map((x, i) => (
            <Link key={x.id} href={x.href} className={`${s.tab} ${tab[i]}`}>
              <span className={s.tabName}>{x.name}</span>
              <span className={s.tabNo}>{String.fromCharCode(65 + i)}</span>
            </Link>
          ))}
          <Link href={`${SITE}/products`} className={`${s.tab} ${s.tabAll}`}>
            <span className={s.tabName}>{c.categories.all}</span>
          </Link>
        </nav>
      </header>

      <main>
        <section className={s.hero} aria-labelledby="hero-title">
          <div className={`${s.wrap} ${s.sheet}`}>
            <span className={`${s.crop} ${s.cropTl}`} aria-hidden />
            <span className={`${s.crop} ${s.cropTr}`} aria-hidden />
            <span className={`${s.crop} ${s.cropBl}`} aria-hidden />
            <span className={`${s.crop} ${s.cropBr}`} aria-hidden />
            <div className={s.heroRow}>
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
              <div className={s.scene} aria-hidden>
                <Halftone className={`${s.ht} ${s.htCyan}`} />
                <Halftone className={`${s.ht} ${s.htMagenta}`} />
                <EquipIllus kind="monitor" className={`${s.item} ${s.itemL}`} />
                <EquipIllus kind="analyzer" className={`${s.item} ${s.itemR}`} />
                <EquipIllus kind="ultrasound" className={`${s.item} ${s.itemM}`} />
                <span className={`${s.callout} ${s.calloutL}`}>
                  <b>B</b> {v.categories[1].name}
                </span>
                <span className={`${s.callout} ${s.calloutM}`}>
                  <b>A</b> {v.categories[0].name}
                </span>
                <span className={`${s.callout} ${s.calloutR}`}>
                  <b>C</b> {v.categories[2].name}
                </span>
                <span className={s.priceFlag}>{v.hero.scene.price}</span>
                <span className={s.visitFlag}>{v.hero.scene.visit}</span>
              </div>
            </div>
            <form className={s.finder} action={`${SITE}/products`}>
              <p className={s.finderTitle}>{c.hero.finder.title}</p>
              <div className={s.finderRow}>
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
              </div>
            </form>
            <div className={s.heroFolio} aria-hidden>
              <RegMark className={s.reg} />
              <span>P.01</span>
            </div>
          </div>
        </section>

        <section className={s.section} aria-labelledby="h-cat">
          <div className={s.wrap}>
            <Folio page={2} title={c.categories.title} id="h-cat" />
            <ul className={s.cats}>
              {v.categories.map((x, i) => (
                <li key={x.id}>
                  <Link href={x.href} className={`${s.cat} ${tab[i]}`}>
                    <span className={s.catLetter} aria-hidden>
                      {String.fromCharCode(65 + i)}
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
          <div className={s.wrap}>
            <Folio page={3} title={c.latest.title} id="h-latest" />
            <ul className={s.cards}>
              {v.latest.map((p) => {
                const added = list.includes(p.id);
                const meta = [
                  p.year && c.latest.year(p.year),
                  p.condition,
                  p.warranty && c.latest.warranty(p.warranty),
                ].filter(Boolean);
                return (
                  <li key={p.id} className={`${s.card} ${p.sold ? s.sold : ""}`}>
                    <Link href={p.href} className={s.cardLink}>
                      <span className={s.photo}>
                        <span className={s.part}>{partNo(p.id)}</span>
                        <EquipIllus kind={p.kind} className={s.photoArt} />
                        {p.sold ? (
                          <span className={`${s.tag} ${s.tagSold}`}>{c.latest.sold}</span>
                        ) : (
                          p.isNew && (
                            <span className={`${s.tag} ${s.tagNew}`}>{c.latest.newTag}</span>
                          )
                        )}
                      </span>
                      <span className={s.cardBody}>
                        <span className={`${s.cardCat} ${tabOf[p.kind]}`}>{p.categoryName}</span>
                        <span className={s.cardTitle}>
                          {p.brand} {p.model}
                        </span>
                        <span className={s.cardName}>{p.nameZh}</span>
                        <span className={s.cardMeta}>
                          {meta.map((m) => (
                            <span key={String(m)}>{m}</span>
                          ))}
                        </span>
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
                        {added ? <CheckOutlined aria-hidden /> : <PlusOutlined aria-hidden />}
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
          </div>
        </section>

        <section className={s.section} aria-labelledby="h-brands">
          <div className={s.wrap}>
            <Folio page={4} title={c.brands.title} id="h-brands" />
            <ul className={s.brands}>
              {v.brands.map((b) => (
                <li key={b}>
                  <Link href={`${SITE}/products?brand=${encodeURIComponent(b)}`}>
                    <span>{b}</span>
                    <span className={s.leader} aria-hidden />
                    <span aria-hidden>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`${s.section} ${s.tint}`} aria-labelledby="h-buy">
          <div className={s.wrap}>
            <Folio page={5} title={c.buy.title} id="h-buy" />
            <div className={s.buyRow}>
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
                    <PhoneOutlined aria-hidden /> {c.visit.call} {v.company.phone}
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section id="services" className={s.section} aria-labelledby="h-services">
          <div className={s.wrap}>
            <Folio page={6} title={c.services.title} id="h-services" />
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
          <ul className={s.footerContact}>
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
        <div className={`${s.wrap} ${s.colophon}`}>
          <span>{v.copyright}</span>
          <span className={s.swatches} aria-hidden>
            <i />
            <i />
            <i />
            <i />
            <RegMark className={s.reg} />
          </span>
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
