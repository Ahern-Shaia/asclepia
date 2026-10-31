"use client";

import {
  ArrowRightOutlined,
  CalendarOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  PlusOutlined,
  ProfileOutlined,
  SearchOutlined,
  SwapOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { EquipIllus, MiniMap, StepIllus } from "@/components/home-v4/equip-illus";
import { SITE, twd, v } from "../_v-content";
import { CycleRing, Leaf } from "./art";
import s from "./style.module.css";

const c = v.copy;
const tel = `tel:${v.company.phone}`;
const serviceIcon = { buy: <SwapOutlined />, repair: <ToolOutlined />, rent: <CalendarOutlined /> };
const heroLeaves = [
  { left: "4%", top: "12%", width: 46, transform: "rotate(-30deg)" },
  { left: "44%", top: "6%", width: 30, transform: "rotate(40deg)" },
  { left: "90%", top: "18%", width: 54, transform: "rotate(18deg)" },
  { left: "52%", top: "78%", width: 38, transform: "rotate(-60deg)" },
  { left: "95%", top: "70%", width: 28, transform: "rotate(-10deg)" },
];

export function View() {
  const [list, setList] = useState<string[]>([]);
  const toggle = (id: string) =>
    setList((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  return (
    <div className={s.page}>
      <div className={s.util}>
        <div className={`${s.wrap} ${s.utilRow}`}>
          <span>
            <ClockCircleOutlined aria-hidden /> {c.util.hours(v.company.hours)}
          </span>
          <span className={s.desk}>{c.util.visit}</span>
          <a href={tel} className={s.utilPhone}>
            <PhoneOutlined aria-hidden /> {v.company.phone}
          </a>
        </div>
      </div>

      <header className={s.header}>
        <div className={`${s.wrap} ${s.headerRow}`}>
          <a href={SITE} className={s.brand} aria-label={`${v.brand.name} 首頁`}>
            <span className={s.mark} aria-hidden>
              <Leaf className={s.markLeaf} />
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
            <button type="submit" aria-label={c.header.search}>
              <SearchOutlined aria-hidden />
            </button>
          </form>
          <div className={s.actions}>
            <a
              href="#inquiry-list"
              className={s.listBtn}
              aria-label={`${c.header.inquiryList} ${list.length} 件`}
            >
              <ProfileOutlined aria-hidden />
              <span className={s.desk}>{c.header.inquiryList}</span>
              <span className={`${s.badge} ${list.length ? s.badgeOn : ""}`} key={list.length}>
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
            <a href={`${SITE}/products`} className={s.catNavAll}>
              {c.categories.all}
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section className={s.hero} aria-labelledby="hero-title">
          {heroLeaves.map((l) => (
            <Leaf key={l.left} className={s.heroLeaf} style={l} />
          ))}
          <div className={`${s.wrap} ${s.heroRow}`}>
            <div className={s.scene} aria-hidden>
              <CycleRing className={s.ring} tones={[s.tLeaf, s.tMint, s.tSun, s.tFaint]} />
              <span className={s.disc} />
              <EquipIllus kind="monitor" className={`${s.item} ${s.itemL}`} />
              <EquipIllus kind="analyzer" className={`${s.item} ${s.itemR}`} />
              <EquipIllus kind="ultrasound" className={`${s.item} ${s.itemM}`} />
              <span className={`${s.chip} ${s.chipPrice}`}>{v.hero.scene.price}</span>
              <span className={`${s.chip} ${s.chipVisit}`}>
                <EnvironmentOutlined /> {v.hero.scene.visit}
              </span>
            </div>
            <div className={s.heroText}>
              <span className={s.eyebrow}>{v.hero.eyebrow}</span>
              <h1 id="hero-title">
                {v.hero.heading.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h1>
              <ul className={s.points}>
                {c.hero.points.map((p) => (
                  <li key={p}>
                    <span className={s.tick} aria-hidden>
                      <CheckOutlined />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
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
              <button type="submit" className={s.finderBtn}>
                <SearchOutlined aria-hidden /> {c.hero.finder.submit(v.total)}
              </button>
            </form>
          </div>
        </section>

        <section className={`${s.section} ${s.catSection}`} aria-labelledby="h-cat">
          <Leaf className={`${s.bgLeaf} ${s.bgLeafA}`} />
          <div className={s.wrap}>
            <div className={s.head}>
              <h2 id="h-cat">{c.categories.title}</h2>
            </div>
            <ul className={s.cats}>
              {v.categories.map((x) => (
                <li key={x.id}>
                  <a href={x.href} className={s.cat}>
                    <span className={s.catCount}>
                      {x.count}
                      <small>{c.categories.unit}</small>
                    </span>
                    <span className={s.catArt}>
                      <EquipIllus kind={x.id} />
                    </span>
                    <span className={s.catName}>{x.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`${s.section} ${s.top0}`} aria-labelledby="h-latest">
          <div className={s.wrap}>
            <div className={s.head}>
              <h2 id="h-latest">{c.latest.title}</h2>
              <a href={`${SITE}/products`} className={s.more}>
                {c.latest.viewAll} <ArrowRightOutlined aria-hidden />
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
                const price = p.priceTwd ? twd(p.priceTwd) : c.latest.askPrice;
                return (
                  <li
                    key={p.id}
                    className={`${s.card} ${i === 0 ? s.feature : ""} ${p.sold ? s.sold : ""}`}
                  >
                    <a href={p.href} className={s.cardLink}>
                      <span className={s.photo}>
                        <EquipIllus kind={p.kind} className={s.photoArt} />
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
                        <span className={s.price}>{p.sold ? <s>{price}</s> : price}</span>
                      </span>
                    </a>
                    {!p.sold && (
                      <button
                        type="button"
                        className={s.addBtn}
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
          </div>
        </section>

        <section className={`${s.section} ${s.top0}`} aria-labelledby="h-brands">
          <div className={s.wrap}>
            <div className={s.brandBox}>
              <h2 id="h-brands">{c.brands.title}</h2>
              <ul className={s.brands}>
                {v.brands.map((b) => (
                  <li key={b}>
                    <a href={`${SITE}/products?brand=${encodeURIComponent(b)}`}>{b}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className={`${s.section} ${s.mintBand}`} aria-labelledby="h-buy">
          <CycleRing className={s.bgRing} tones={[s.tSage, s.tSage, s.tSage, s.tSage]} />
          <div className={`${s.wrap} ${s.buyRow}`}>
            <div>
              <div className={s.head}>
                <h2 id="h-buy">{c.buy.title}</h2>
              </div>
              <ol className={s.steps}>
                {c.buy.steps.map((st, i) => (
                  <li key={st.title}>
                    <span className={s.stepArt}>
                      <StepIllus step={i as 0 | 1 | 2} />
                      <span className={s.stepNo} aria-hidden>
                        {i + 1}
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
                  <dt>
                    <EnvironmentOutlined aria-hidden /> {c.visit.address}
                  </dt>
                  <dd>{v.company.address}</dd>
                </div>
                <div>
                  <dt>
                    <ClockCircleOutlined aria-hidden /> {c.visit.hours}
                  </dt>
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
          <Leaf className={`${s.bgLeaf} ${s.bgLeafB}`} />
          <div className={s.wrap}>
            <div className={s.head}>
              <h2 id="h-services">{c.services.title}</h2>
            </div>
            <ul className={s.services}>
              {c.services.items.map((sv) => (
                <li key={sv.id}>
                  <span className={s.serviceIcon} aria-hidden>
                    {serviceIcon[sv.id]}
                  </span>
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
        <div className={`${s.wrap} ${s.shelf}`} aria-hidden>
          {(
            ["microscope", "monitor", "ultrasound", "analyzer", "centrifuge", "dental"] as const
          ).map((k) => (
            <EquipIllus key={k} kind={k} outline />
          ))}
        </div>
        <div className={`${s.wrap} ${s.footRow}`}>
          <div className={s.brand}>
            <span className={`${s.mark} ${s.markInv}`} aria-hidden>
              <Leaf className={s.markLeaf} />
            </span>
            <span className={s.brandText}>
              <strong>{v.company.name}</strong>
              <span>{v.brand.tagline}</span>
            </span>
          </div>
          <ul className={s.footContact}>
            <li>
              <PhoneOutlined aria-hidden /> <a href={tel}>{v.company.phone}</a>
            </li>
            <li>
              <a href={`mailto:${v.company.email}`}>{v.company.email}</a>
            </li>
            <li>{v.company.address}</li>
            <li>{v.company.hours}</li>
          </ul>
          <p className={s.copyright}>{v.copyright}</p>
        </div>
      </footer>

      <div className={s.mobileBar}>
        <a href={tel}>
          <PhoneOutlined aria-hidden /> {c.mobileBar.call}
        </a>
        <a href="#inquiry-list" className={s.mobileBarMain}>
          <ProfileOutlined aria-hidden /> {c.mobileBar.inquiry}（{list.length}）
        </a>
      </div>
    </div>
  );
}
