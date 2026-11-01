"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { CategoryAttr } from "./attrs";
import type { SendInquiry } from "./inquiry-send";
import { useInquiryList } from "./inquiry-store";
import { type InquiryItem, ShopInquiryView } from "./inquiry-view";

type Lookup = { items: InquiryItem[]; configs: Record<string, CategoryAttr[]> };

const noop = () => () => {};
// false during SSR and hydration: the browser list isn't known yet, so it is "loading", not "empty".
const useHydrated = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

// Real /inquiry: ids from this browser's list, current state of each item from the server
// (src/app/(site)/(catalog)/inquiry/items/route.ts). Ids that no longer resolve (hidden items, stale ids)
// are taken off the list and counted, so the buyer is told rather than left guessing.
export function LiveInquiryView({ phone, send }: { phone: string; send: SendInquiry }) {
  const hydrated = useHydrated();
  const list = useInquiryList();
  const [found, setFound] = useState<Lookup>({ items: [], configs: {} });
  const [asked, setAsked] = useState<string[]>([]); // ids already looked up (found or not)
  const [failed, setFailed] = useState(false);
  const [dropped, setDropped] = useState(0);
  const [attempt, setAttempt] = useState(0);

  const pending = list.ids.filter((id) => !asked.includes(id));
  const key = pending.join(",");

  useEffect(() => {
    if (!hydrated || !key) return;
    const ctrl = new AbortController();
    fetch(`/inquiry/items?ids=${encodeURIComponent(list.ids.join(","))}`, {
      signal: ctrl.signal,
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const body = (await res.json()) as { ok: true; data: Lookup };
        const ids = list.ids;
        const back = new Set(body.data.items.map((p) => p.id));
        setFound(body.data);
        setAsked(ids);
        setFailed(false);
        const gone = ids.filter((id) => !back.has(id));
        if (gone.length) {
          setDropped((n) => n + gone.length);
          list.replace(ids.filter((id) => back.has(id)));
        }
      })
      .catch((e: unknown) => {
        if ((e as { name?: string })?.name !== "AbortError") setFailed(true);
      });
    return () => ctrl.abort();
    // list.ids is read through `key` (what still needs looking up) and `attempt` (retry)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, key, attempt]);

  const retry = useCallback(() => {
    setFailed(false);
    setAttempt((n) => n + 1);
  }, []);

  const items =
    !hydrated || (pending.length && !failed)
      ? null
      : list.ids
          .map((id) => found.items.find((p) => p.id === id))
          .filter((p): p is InquiryItem => !!p);

  return (
    <ShopInquiryView
      base=""
      phone={phone}
      items={items}
      loadFailed={failed}
      onRetry={retry}
      dropped={dropped}
      configs={found.configs}
      onRemove={list.remove}
      onSent={list.clear}
      send={send}
    />
  );
}
