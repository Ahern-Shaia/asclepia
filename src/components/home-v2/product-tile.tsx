import Link from "next/link";
import { formatTwd } from "@/components/catalog/format";
import { catalogCopy } from "@/copy/catalog";
import { homeCopy } from "@/copy/home";
import s from "./home-v2.module.css";

export type TileProduct = {
  id: string;
  brand: string;
  model: string;
  nameZh: string;
  priceTwd?: number;
  year?: number;
  condition?: string;
  warranty?: string;
  sold: boolean;
  image: string;
};

// The inspection tag carries real data (the item's warranty); items without one get no tag.
export function ProductTile({ product: p, href }: { product: TileProduct; href: string }) {
  const meta = [p.year && homeCopy.card.year(p.year), p.condition].filter(Boolean).join(" · ");
  return (
    <Link href={href} className={`${s.tile} ${p.sold ? s.tileSold : ""}`}>
      <span className={s.tileMedia}>
        {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
        <img src={p.image} alt="" className={s.tileImg} />
        {p.sold ? (
          <span className={`${s.flag} ${s.flagSold}`}>{catalogCopy.card.sold}</span>
        ) : (
          p.warranty && <span className={s.flag}>{homeCopy.card.warranty(p.warranty)}</span>
        )}
      </span>
      <span className={s.tileBody}>
        <span className={s.tileModel}>
          {p.brand} · {p.model}
        </span>
        <span className={s.tileName}>{p.nameZh}</span>
        {meta && <span className={s.tileMeta}>{meta}</span>}
        <span className={s.tilePrice}>
          {p.priceTwd ? formatTwd(p.priceTwd) : catalogCopy.card.askPrice}
        </span>
      </span>
    </Link>
  );
}
