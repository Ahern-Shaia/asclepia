"use client";

import { CheckOutlined, PlusOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import Link from "next/link";
import { formatTwd } from "@/components/catalog/format";
import s from "@/components/home-v5/home-v5.module.css";
import { PhotoSlot } from "@/components/home-v5/photo-slot";
import { homeV5Copy as c5 } from "@/copy/home-v5";
import { shopCopy } from "@/copy/shop";
import { type Attrs, type CategoryAttr, cardMeta, titleOf } from "./attrs";
import { INQUIRY_MAX, useInquiryList } from "./inquiry-store";
import { MediaImg } from "./media-img";
import { useShopMock } from "./shop-shell";
import l from "./shop.module.css";

const c = shopCopy.card;

export type ShopCardProduct = {
  id: string;
  categoryName: string;
  name: string;
  attrs: Attrs;
  priceTwd?: number;
  sold: boolean;
  isNew: boolean;
  image?: string | null; // storage key of the main photo
};

// Fixed field order (§B0 商品卡): photo → category → title attributes → name → card attributes →
// price → inquiry action. Which attributes fill each slot is the category's admin config.
export function ShopCard({
  base,
  product: p,
  config,
}: {
  base: string;
  product: ShopCardProduct;
  config: CategoryAttr[];
}) {
  const list = useInquiryList();
  const mock = useShopMock();
  const added = list.has(p.id);
  const title = titleOf(config, p.attrs);
  const blocked = !added && list.full;
  const addBtn = (
    <button
      type="button"
      className={`${s.addBtn} ${added ? s.addBtnOn : ""} ${blocked ? l.addFull : ""}`}
      aria-pressed={added}
      disabled={blocked}
      onClick={() => list.toggle(p.id)}
    >
      {added ? <CheckOutlined aria-hidden /> : <PlusOutlined aria-hidden />}
      {added ? c.added : c.add}
    </button>
  );
  return (
    <li className={`${s.card} ${p.sold ? s.cardSold : ""}`}>
      <Link href={`${base}/products/${p.id}`} className={s.cardLink}>
        <span className={s.photo}>
          {p.image ? (
            <MediaImg
              storageKey={p.image}
              size={400}
              alt={[title, p.name].filter(Boolean).join(" ")}
              className={`${l.photoImg} ${p.sold ? l.imgSold : ""}`}
            />
          ) : (
            mock && (
              <PhotoSlot
                className={s.photoSlot}
                label={c5.photo.card.label}
                spec={c5.photo.card.spec}
              />
            )
          )}
          {p.sold ? (
            <span className={`${s.tag} ${s.tagSold}`}>{c.sold}</span>
          ) : (
            p.isNew && <span className={`${s.tag} ${s.tagNew}`}>{c.newTag}</span>
          )}
        </span>
        <span className={s.cardBody}>
          <span className={s.cardCat}>{p.categoryName}</span>
          {title && <span className={s.cardTitle}>{title}</span>}
          <span className={s.cardName}>{p.name}</span>
          <span className={s.cardMeta}>{cardMeta(config, p.attrs)}</span>
          <span className={s.price}>
            {p.priceTwd ? formatTwd(p.priceTwd) : p.sold ? null : c.askPrice}
          </span>
        </span>
      </Link>
      {!p.sold && (blocked ? <Tooltip title={c.full(INQUIRY_MAX)}>{addBtn}</Tooltip> : addBtn)}
    </li>
  );
}
