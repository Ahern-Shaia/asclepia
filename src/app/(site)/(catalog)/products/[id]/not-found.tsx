import Link from "next/link";
import s from "@/components/home-v5/home-v5.module.css";
import l from "@/components/shop/shop.module.css";
import { shopCopy } from "@/copy/shop";

const c = shopCopy.detail;

// Same answer for drafts, hidden items and ids that never existed (inquiry.md §7-bis.1).
export default function ProductNotFound() {
  return (
    <main className={`${s.container} ${l.detailPage}`}>
      <div className={`${l.empty} ${l.notFound}`}>
        <h1>{c.notFoundTitle}</h1>
        <p>{c.notFoundBody}</p>
        <Link href="/products" className={l.primaryBtn}>
          {c.notFoundCta}
        </Link>
      </div>
    </main>
  );
}
