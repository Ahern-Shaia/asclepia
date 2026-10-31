"use client";

import { EquipIllus, MiniMap, StepIllus } from "@/components/home-v4/equip-illus";
import { useState } from "react";
import { SITE, twd, v } from "../_v-content";
import s from "./style.module.css";

const c = v.copy;
const co = v.company;
const tel = `tel:${co.phone}`;

// One geometric shape per category: the brand system's alphabet, reused behind every drawing.
const shapes = [
  <circle key="c" cx="50" cy="50" r="46" />,
  <rect key="s" x="14" y="14" width="72" height="72" rx="14" transform="rotate(12 50 50)" />,
  <path key="a" d="M8 94 V50 A42 42 0 0 1 92 50 V94 Z" />,
  <path key="q" d="M6 94 V6 A88 88 0 0 1 94 94 Z" />,
  <rect key="p" x="4" y="24" width="92" height="52" rx="26" transform="rotate(-18 50 50)" />,
  <path key="t" d="M50 4 L96 92 H4 Z" />,
];
const tints = [s.fOrange, s.fLilac, s.fPeach];

function Shape({ i, className }: { i: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${s.shape} ${tints[i % 3]} ${className ?? ""}`}
      aria-hidden
    >
      {shapes[i % shapes.length]}
    </svg>
  );
}

// Hero background: big orange disc, cobalt quarter, ink half-disc, a striped pill and a dot field.
function HeroArt() {
  return (
    <svg className={s.heroArt} viewBox="0 0 640 560" aria-hidden>
      <defs>
        <pattern
          id="c10-stripe"
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="7" height="14" className={s.inkFill} />
        </pattern>
        <pattern id="c10-dot" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="2.4" className={s.orangeFill} />
        </pattern>
      </defs>
      <rect x="0" y="330" width="170" height="200" fill="url(#c10-dot)" />
      <circle cx="566" cy="86" r="66" className={s.cobaltFill} />
      <circle cx="330" cy="290" r="225" className={s.orangeFill} />
      <path d="M450 560 A90 90 0 0 1 630 560 Z" className={s.inkFill} />
      <rect
        x="40"
        y="70"
        width="190"
        height="64"
        rx="32"
        fill="url(#c10-stripe)"
        transform="rotate(-24 135 102)"
      />
      <circle cx="560" cy="380" r="34" className={s.sunFill} />
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
              <span className={s.markDot} />A
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
              <span>{c.header.inquiryList}</span>
              <span className={`${s.count} ${list.length ? s.countOn : ""}`} key={list.length}>
                {list.length}
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
              <HeroArt />
              <span className={s.stage} />
              <EquipIllus kind="monitor" className={`${s.item} ${s.itemLeft}`} />
              <EquipIllus kind="analyzer" className={`${s.item} ${s.itemRight}`} />
              <EquipIllus kind="ultrasound" className={`${s.item} ${s.itemMain}`} />
              <span className={`${s.chip} ${s.chipPrice}`}>{v.hero.scene.price}</span>
              <span className={`${s.chip} ${s.chipVisit}`}>{v.hero.scene.visit}</span>
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
              {v.categories.map((x, i) => (
                <li key={x.id}>
                  <a href={x.href} className={s.cat}>
                    <span className={s.catArt}>
                      <Shape i={i} />
                      <EquipIllus kind={x.id} className={s.catIllus} />
                    </span>
                    <span className={s.catText}>
                      <span className={s.catName}>{x.name}</span>
                      <span className={s.catCount}>
                        <b>{x.count}</b> {c.categories.unit}
                      </span>
                    </span>
                    <span className={s.catGo} aria-hidden>
                      →
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
                    <a href={p.href} className={s.cardLink}>
                      <span className={s.photo}>
                        <Shape i={i + 2} className={s.photoShape} />
                        <EquipIllus kind={p.kind} className={s.photoIllus} />
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

        <section className={s.brandBand} aria-labelledby="h-brands">
          <span className={s.bandDisc} aria-hidden />
          <span className={s.bandQuarter} aria-hidden />
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
                    <span className={s.stepTop}>
                      <span className={s.stepNo} aria-hidden>
                        {i + 1}
                      </span>
                      <span className={s.stepArt}>
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
              {c.services.items.map((sv, i) => (
                <li key={sv.id}>
                  <Shape i={i * 2 + 1} className={s.svShape} />
                  <span>
                    <strong>{sv.title}</strong>
                    <span>{sv.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer id="contact" className={s.footer}>
        <span className={s.footDisc} aria-hidden />
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
              <span className={s.markDot} />A
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
