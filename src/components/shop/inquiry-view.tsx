"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { formatTwd } from "@/components/catalog/format";
import s from "@/components/home-v5/home-v5.module.css";
import { PhotoSlot } from "@/components/home-v5/photo-slot";
import { shopCopy } from "@/copy/shop";
import { type CategoryAttr, titleOf } from "./attrs";
import { InquiryForm } from "./inquiry-form";
import { INQUIRY_MAX, useInquiryList, useStorageAvailable } from "./inquiry-store";
import type { ShopCardProduct } from "./product-card";
import l from "./shop.module.css";

const c = shopCopy.inquiry;

type Item = ShopCardProduct & { categoryId: string };

// Review states without touching the visitor's real list (docs/mockups): ?demo=empty|sold|success.
const DEMO: Record<string, string[]> = { sold: ["p1", "p3", "p4"], success: ["p1", "p3"] };

export function ShopInquiryView({
  base,
  products,
  configs,
}: {
  base: string;
  products: Item[];
  configs: Record<string, CategoryAttr[]>;
}) {
  const params = useSearchParams();
  const demo = params.get("demo") ?? "";
  const list = useInquiryList();
  const [sentNames, setSentNames] = useState<string[] | null>(null);
  const storageOk = useStorageAvailable();

  const ids = demo === "empty" ? [] : (DEMO[demo] ?? list.ids);
  const items = ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Item => !!p);
  const fullName = (p: Item) =>
    [titleOf(configs[p.categoryId] ?? [], p.attrs), p.name].filter(Boolean).join(" ");
  const sold = items.filter((p) => p.sold);
  const remove = (id: string) => (DEMO[demo] ? undefined : list.remove(id));
  const done = sentNames ?? (demo === "success" ? items.map(fullName) : null);

  if (done)
    return (
      <main className={`${s.container} ${l.inquiryPage}`}>
        <div className={l.inquiryHead}>
          <h1>{c.title}</h1>
        </div>
        <section className={l.success} role="status" aria-labelledby="sent-title">
          <h2 id="sent-title">{c.successTitle(done.length)}</h2>
          <ul>
            {done.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <p>{c.successBody}</p>
          <div className={l.actions}>
            <Link href={`${base}/products`} className={l.secondaryBtn}>
              {c.successBack}
            </Link>
          </div>
        </section>
      </main>
    );

  return (
    <main className={`${s.container} ${l.inquiryPage}`}>
      <nav aria-label="麵包屑" className={l.crumbs}>
        <Link href={base}>{shopCopy.crumbs.home}</Link>
        <span aria-hidden>/</span>
        <span aria-current="page">{c.title}</span>
      </nav>
      <div className={l.inquiryHead}>
        <h1>{c.title}</h1>
        <p>{items.length ? `${c.lead} ${c.count(items.length, INQUIRY_MAX)}` : null}</p>
      </div>

      {!storageOk && (
        <p className={l.alert} role="note">
          {c.storageNote}
        </p>
      )}

      {items.length === 0 ? (
        <div className={l.empty} role="status">
          <h2>{c.emptyTitle}</h2>
          <p>{c.emptyBody}</p>
          <Link href={`${base}/products`} className={l.primaryBtn}>
            {c.emptyCta}
          </Link>
        </div>
      ) : (
        <div className={l.inquiryBody}>
          <ul className={l.items} aria-label={c.title}>
            {items.map((p) => (
              <li key={p.id} className={`${l.item} ${p.sold ? l.itemSold : ""}`}>
                <PhotoSlot className={l.itemPhoto} label="" spec="" />
                <span className={l.itemText}>
                  <Link href={`${base}/products/${p.id}`}>{fullName(p)}</Link>
                  <span>{p.categoryName}</span>
                  {p.sold ? (
                    <span className={l.itemWarn}>{c.soldRow}</span>
                  ) : (
                    <span className={l.itemPrice}>
                      {p.priceTwd ? formatTwd(p.priceTwd) : shopCopy.card.askPrice}
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  className={l.removeBtn}
                  onClick={() => remove(p.id)}
                  aria-label={`${c.remove} ${fullName(p)}`}
                >
                  {c.remove}
                </button>
              </li>
            ))}
          </ul>
          <InquiryForm
            count={items.length - sold.length}
            blockedReason={sold.length ? c.blocked(sold.map(fullName).join("、")) : undefined}
            onSent={() => {
              setSentNames(items.map(fullName));
              if (!DEMO[demo]) list.clear();
            }}
          />
        </div>
      )}
    </main>
  );
}
