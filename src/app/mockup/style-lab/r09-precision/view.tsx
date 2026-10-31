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
import { type CSSProperties, type ReactNode, useState } from "react";
import { EquipIllus, MiniMap, StepIllus } from "@/components/home-v4/equip-illus";
import { SITE, twd, v } from "../_v-content";
import { Caliper, Protractor, Screw } from "./caliper";
import s from "./style.module.css";

const c = v.copy;
const tel = `tel:${v.company.phone}`;
const maxCount = Math.max(...v.categories.map((x) => x.count));
const pad = (n: number, w = 2) => String(n).padStart(w, "0");
const serviceIcon = { buy: <SwapOutlined />, repair: <ToolOutlined />, rent: <CalendarOutlined /> };

function Head({ title, id, note }: { title: string; id: string; note?: string }) {
  return (
    <div className={s.head}>
      <div className={s.headRow}>
        <h2 id={id}>{title}</h2>
        {note && <span className={s.headNote}>{note}</span>}
      </div>
      <span className={s.scale} aria-hidden>
        <i>0</i>
      </span>
    </div>
  );
}

function Plate({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`${s.plate} ${className ?? ""}`}>
      <Screw className={`${s.screw} ${s.sTl}`} />
      <Screw className={`${s.screw} ${s.sTr}`} />
      <Screw className={`${s.screw} ${s.sBl}`} />
      <Screw className={`${s.screw} ${s.sBr}`} />
      {children}
    </div>
  );
}

export function View() {
  const [list, setList] = useState<string[]>([]);
  const toggle = (id: string) =>
    setList((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  return (
    <div className={s.page}>
      <span className={`${s.rail} ${s.railL}`} aria-hidden />
      <span className={`${s.rail} ${s.railR}`} aria-hidden />

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
            {v.categories.map((x) => (
              <Link key={x.id} href={x.href}>
                {x.name}
                <span className={s.mono}>{pad(x.count)}</span>
              </Link>
            ))}
            <Link href={`${SITE}/products`} className={s.catNavAll}>
              {c.categories.all}
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className={s.hero} aria-labelledby="hero-title">
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
            <div className={s.scene} aria-hidden>
              <Protractor />
              <EquipIllus kind="monitor" className={`${s.item} ${s.itemL}`} />
              <EquipIllus kind="analyzer" className={`${s.item} ${s.itemR}`} />
              <EquipIllus kind="ultrasound" className={`${s.item} ${s.itemM}`} />
              <Caliper />
              <span className={s.priceTag}>{v.hero.scene.price}</span>
              <span className={s.visitTag}>{v.hero.scene.visit}</span>
            </div>
          </div>
          <div className={s.wrap}>
            <Plate className={s.finderPlate}>
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
            </Plate>
          </div>
        </section>

        <section className={s.section} aria-labelledby="h-cat">
          <div className={s.wrap}>
            <Head
              title={c.categories.title}
              id="h-cat"
              note={`${v.categories.length} 類 · ${v.total} ${c.categories.unit}`}
            />
            <ul className={s.cats}>
              {v.categories.map((x) => (
                <li key={x.id}>
                  <Link
                    href={x.href}
                    className={s.cat}
                    style={{ "--fill": `${(x.count / maxCount) * 100}%` } as CSSProperties}
                  >
                    <span className={s.catArt}>
                      <EquipIllus kind={x.id} />
                    </span>
                    <span className={s.catName}>{x.name}</span>
                    <span className={s.catCount}>
                      <b>{pad(x.count)}</b> {c.categories.unit}
                    </span>
                    <span className={s.gauge} aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={s.section} aria-labelledby="h-latest">
          <div className={s.wrap}>
            <Head
              title={c.latest.title}
              id="h-latest"
              note={`${v.latest.length} ${c.categories.unit}`}
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
                      <span className={s.photo}>
                        <span className={s.idx}>#{pad(i + 1, 3)}</span>
                        {p.sold ? (
                          <span className={`${s.tag} ${s.tagSold}`}>{c.latest.sold}</span>
                        ) : (
                          p.isNew && (
                            <span className={`${s.tag} ${s.tagNew}`}>{c.latest.newTag}</span>
                          )
                        )}
                        <EquipIllus kind={p.kind} className={s.photoArt} />
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
            <Head title={c.brands.title} id="h-brands" note={`${v.brands.length} 個品牌`} />
            <ul className={s.brands}>
              {v.brands.map((b) => (
                <li key={b}>
                  <Link href={`${SITE}/products?brand=${encodeURIComponent(b)}`}>{b}</Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`${s.section} ${s.bench}`} aria-labelledby="h-buy">
          <div className={`${s.wrap} ${s.buyRow}`}>
            <div>
              <Head title={c.buy.title} id="h-buy" />
              <ol className={s.steps}>
                {c.buy.steps.map((st, i) => (
                  <li key={st.title}>
                    <span className={s.stepMark} aria-hidden>
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
            <Plate className={s.visit}>
              <aside aria-labelledby="h-visit">
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
            </Plate>
          </div>
        </section>

        <section id="services" className={s.section} aria-labelledby="h-services">
          <div className={s.wrap}>
            <Head title={c.services.title} id="h-services" />
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
        <div className={s.footScale} aria-hidden />
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
          <p className={s.copy}>{v.copyright}</p>
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
