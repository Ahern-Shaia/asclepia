"use client";

import { CheckOutlined, PhoneOutlined, PlusOutlined, ProfileOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import Link from "next/link";
import { useState } from "react";
import { formatTwd } from "@/components/catalog/format";
import s from "@/components/home-v5/home-v5.module.css";
import { PhotoSlot } from "@/components/home-v5/photo-slot";
import { catalogCopy } from "@/copy/catalog";
import { shopCopy } from "@/copy/shop";
import { type Attrs, type CategoryAttr, nameplateRows, titleOf } from "./attrs";
import { InquiryForm } from "./inquiry-form";
import { useInquiryList } from "./inquiry-store";
import { ShopCard, type ShopCardProduct } from "./product-card";
import l from "./shop.module.css";

const c = shopCopy.detail;

export type DetailProduct = ShopCardProduct & {
  categoryId: string;
  attrs: Attrs;
  highlights: string[];
  specs: { label: string; value: string }[];
  features: string[];
};

export function ShopDetailView({
  base,
  phone,
  product: p,
  config,
  related,
  configs,
}: {
  base: string;
  phone: string;
  product: DetailProduct;
  config: CategoryAttr[];
  related: (ShopCardProduct & { categoryId: string })[];
  configs: Record<string, CategoryAttr[]>;
}) {
  const list = useInquiryList();
  const [asking, setAsking] = useState(false);
  const [sent, setSent] = useState(false);
  const added = list.has(p.id);
  const title = titleOf(config, p.attrs);
  const plate = nameplateRows(config, p.attrs);
  const fullName = [title, p.name].filter(Boolean).join(" ");

  return (
    <main className={`${s.container} ${l.detailPage}`}>
      <nav aria-label="麵包屑" className={l.crumbs}>
        <Link href={base}>{shopCopy.crumbs.home}</Link>
        <span aria-hidden>/</span>
        <Link href={`${base}/products`}>{shopCopy.crumbs.products}</Link>
        <span aria-hidden>/</span>
        <Link href={`${base}/products?cat=${p.categoryId}`}>{p.categoryName}</Link>
      </nav>

      <div className={l.detailTop}>
        <div className={l.gallery}>
          <PhotoSlot className={l.mainPhoto} label={c.photoMain} spec={c.photoSpec} />
          <ul className={l.thumbs} aria-label="細節照">
            {[1, 2, 3, 4].map((i) => (
              <li key={i}>
                <PhotoSlot label={c.photoMore(i)} spec="" />
              </li>
            ))}
          </ul>
        </div>

        <div className={l.summary}>
          <span className={l.summaryCat}>{p.categoryName}</span>
          <h1>
            {title && <span>{title}</span>}
            <small>{p.name}</small>
          </h1>
          <div className={l.priceRow}>
            {p.sold && <span className={l.soldTag}>{shopCopy.card.sold}</span>}
            <span className={`${l.bigPrice} ${p.sold ? l.priceSold : ""}`}>
              {p.priceTwd ? formatTwd(p.priceTwd) : shopCopy.card.askPrice}
            </span>
          </div>

          {plate.length > 0 && (
            <section className={l.nameplate} aria-labelledby="plate-title">
              <h2 id="plate-title">{c.nameplate}</h2>
              <dl>
                {plate.map((r) => (
                  <div key={r.key}>
                    <dt>{r.label}</dt>
                    <dd>{r.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {p.sold ? (
            <>
              <p className={l.soldBox}>{c.soldNote}</p>
              <div className={l.actions}>
                <a href={`tel:${phone}`} className={l.callBtn}>
                  <PhoneOutlined aria-hidden /> {catalogCopy.detail.call(phone)}
                </a>
              </div>
            </>
          ) : (
            <>
              <div className={l.actions}>
                <button type="button" className={l.primaryBtn} onClick={() => setAsking(true)}>
                  {c.askOne}
                </button>
                <button
                  type="button"
                  className={`${l.secondaryBtn} ${added ? l.secondaryOn : ""}`}
                  aria-pressed={added}
                  disabled={!added && list.full}
                  onClick={() => list.toggle(p.id)}
                >
                  {added ? <CheckOutlined aria-hidden /> : <PlusOutlined aria-hidden />}
                  {added ? c.added : c.add}
                </button>
                <a href={`tel:${phone}`} className={l.callBtn}>
                  <PhoneOutlined aria-hidden /> {c.book}
                </a>
              </div>
              {added && (
                <Link href={`${base}/inquiry`} className={l.note}>
                  <ProfileOutlined aria-hidden /> {c.viewList}（{list.ids.length}）
                </Link>
              )}
              <p className={l.note}>
                {c.bookNote}。{c.dealNote}
              </p>
            </>
          )}
        </div>
      </div>

      <div className={l.detailSections}>
        <div>
          {p.highlights.length > 0 && (
            <section className={l.block} aria-labelledby="h-highlights">
              <h2 id="h-highlights">{c.highlights}</h2>
              <ul className={l.bullets}>
                {p.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </section>
          )}
          {p.specs.length > 0 && (
            <section className={l.block} aria-labelledby="h-specs">
              <h2 id="h-specs">{c.specs}</h2>
              <dl className={l.specTable}>
                {p.specs.map((sp) => (
                  <div key={sp.label}>
                    <dt>{sp.label}</dt>
                    <dd>{sp.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
          {p.features.length > 0 && (
            <section className={l.block} aria-labelledby="h-features">
              <h2 id="h-features">{c.features}</h2>
              <ul className={l.bullets}>
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <section className={l.block} aria-labelledby="h-terms">
          <h2 id="h-terms">{c.terms}</h2>
          <ul className={`${l.bullets} ${l.terms}`}>
            {catalogCopy.detail.termsBody.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      </div>

      {related.length > 0 && (
        <section className={l.block} aria-labelledby="h-related">
          <h2 id="h-related">{c.related}</h2>
          <ul className={s.cards}>
            {related.map((r) => (
              <ShopCard key={r.id} base={base} product={r} config={configs[r.categoryId] ?? []} />
            ))}
          </ul>
        </section>
      )}

      <Modal
        open={asking}
        onCancel={() => {
          setAsking(false);
          setSent(false);
        }}
        title={c.askOne}
        footer={null}
        destroyOnHidden
      >
        {sent ? (
          <div className={l.success} role="status">
            <h2>{shopCopy.inquiry.successTitle(1)}</h2>
            <ul>
              <li>{fullName}</li>
            </ul>
            <p>{shopCopy.inquiry.successBody}</p>
          </div>
        ) : (
          <div className={l.summary}>
            <p className={l.note}>{fullName}</p>
            <InquiryForm count={1} onSent={() => setSent(true)} />
          </div>
        )}
      </Modal>
    </main>
  );
}
