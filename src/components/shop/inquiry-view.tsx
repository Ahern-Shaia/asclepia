"use client";

import Link from "next/link";
import { useState } from "react";
import { formatTwd } from "@/components/catalog/format";
import s from "@/components/home-v5/home-v5.module.css";
import { PhotoSlot } from "@/components/home-v5/photo-slot";
import { shopCopy } from "@/copy/shop";
import { type CategoryAttr, titleOf } from "./attrs";
import { InquiryForm } from "./inquiry-form";
import { refusal, type SendInquiry } from "./inquiry-send";
import { INQUIRY_MAX, useStorageAvailable } from "./inquiry-store";
import { MediaImg } from "./media-img";
import type { ShopCardProduct } from "./product-card";
import { homeOf, useShopMock } from "./shop-shell";
import l from "./shop.module.css";

const c = shopCopy.inquiry;

export type InquiryItem = ShopCardProduct & { categoryId: string };

// The inquiry list page (inquiry.md §4.3). Where the items come from is the caller's business
// (the browser list + a lookup on the real site, sample data on the mockup). Four states are kept
// apart: loading, failed to load, empty, and the list; "loading" never looks like "empty".
export function ShopInquiryView({
  base,
  phone,
  items,
  loadFailed = false,
  onRetry,
  dropped = 0,
  configs,
  onRemove,
  onSent,
  send,
  initialSent = null,
}: {
  base: string;
  phone: string;
  items: InquiryItem[] | null; // null while loading
  loadFailed?: boolean;
  onRetry?: () => void;
  dropped?: number; // ids that no longer resolve (hidden items) and were taken off the list
  configs: Record<string, CategoryAttr[]>;
  onRemove: (id: string) => void;
  onSent: () => void;
  send: SendInquiry;
  initialSent?: string[] | null;
}) {
  const mock = useShopMock();
  const storageOk = useStorageAvailable();
  const [sentNames, setSentNames] = useState<string[] | null>(initialSent);
  const [refused, setRefused] = useState<string[]>([]); // ids the endpoint said can't be asked about

  const fullName = (p: InquiryItem) =>
    [titleOf(configs[p.categoryId] ?? [], p.attrs), p.name].filter(Boolean).join(" ");

  if (sentNames)
    return (
      <main className={`${s.container} ${l.inquiryPage}`}>
        <div className={l.inquiryHead}>
          <h1>{c.title}</h1>
        </div>
        <section className={l.success} role="status" aria-labelledby="sent-title">
          <h2 id="sent-title">{c.successTitle(sentNames.length)}</h2>
          <ul>
            {sentNames.map((n) => (
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

  const list = items ?? [];
  const blocked = list.filter((p) => p.sold || refused.includes(p.id));
  const blockedReason = blocked.length
    ? (blocked.every((p) => p.sold) ? c.blocked : c.blockedAny)(blocked.map(fullName).join("、"))
    : undefined;

  return (
    <main className={`${s.container} ${l.inquiryPage}`}>
      <nav aria-label="麵包屑" className={l.crumbs}>
        <Link href={homeOf(base)}>{shopCopy.crumbs.home}</Link>
        <span aria-hidden>/</span>
        <span aria-current="page">{c.title}</span>
      </nav>
      <div className={l.inquiryHead}>
        <h1>{c.title}</h1>
        <p>{list.length ? `${c.lead} ${c.count(list.length, INQUIRY_MAX)}` : null}</p>
      </div>

      {!storageOk && (
        <p className={l.alert} role="note">
          {c.storageNote}
        </p>
      )}
      {dropped > 0 && (
        <p className={l.alert} role="status">
          {c.dropped(dropped)}
        </p>
      )}

      {loadFailed ? (
        <div className={l.empty} role="alert">
          <p>{c.loadFailed}</p>
          {onRetry && (
            <button type="button" className={l.secondaryBtn} onClick={onRetry}>
              {c.retry}
            </button>
          )}
        </div>
      ) : items === null ? (
        <div className={l.empty} role="status" aria-busy="true">
          <p>{c.loading}</p>
        </div>
      ) : list.length === 0 ? (
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
            {list.map((p) => {
              const off = p.sold || refused.includes(p.id);
              return (
                <li key={p.id} className={`${l.item} ${off ? l.itemSold : ""}`}>
                  {p.image ? (
                    <span className={l.itemFrame}>
                      <MediaImg storageKey={p.image} size={400} alt="" className={l.mainImg} />
                    </span>
                  ) : mock ? (
                    <PhotoSlot className={l.itemPhoto} label="" spec="" />
                  ) : (
                    <span className={l.itemFrame} />
                  )}
                  <span className={l.itemText}>
                    <Link href={`${base}/products/${p.id}`}>{fullName(p)}</Link>
                    <span>{p.categoryName}</span>
                    {off ? (
                      <span className={l.itemWarn}>{p.sold ? c.soldRow : c.unavailableRow}</span>
                    ) : (
                      <span className={l.itemPrice}>
                        {p.priceTwd ? formatTwd(p.priceTwd) : shopCopy.card.askPrice}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    className={l.removeBtn}
                    onClick={() => onRemove(p.id)}
                    aria-label={`${c.remove} ${fullName(p)}`}
                  >
                    {c.remove}
                  </button>
                </li>
              );
            })}
          </ul>
          <InquiryForm
            count={list.length - blocked.length}
            blockedReason={blockedReason}
            phone={phone}
            onSubmit={async (values) => {
              const r = await send({ ...values, productIds: list.map((p) => p.id) });
              if (r.ok) {
                setSentNames(r.data.titles);
                onSent();
                return { ok: true };
              }
              const ids = r.code === "INQUIRY_UNAVAILABLE" ? (r.detail ?? []) : [];
              if (list.some((p) => ids.includes(p.id))) {
                setRefused(ids); // the rows say which; blockedReason names them
                return { ok: false, message: "" };
              }
              if (r.code === "INQUIRY_UNAVAILABLE") return { ok: false, message: r.message };
              return refusal(r, phone);
            }}
          />
        </div>
      )}
    </main>
  );
}
