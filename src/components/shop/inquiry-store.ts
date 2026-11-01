"use client";

import { useSyncExternalStore } from "react";

// Inquiry list lives in the browser only (docs/modules/inquiry.md OQ-INQ-1): product ids, no
// personal data. Storage may be unavailable (private mode, blocked site data): the list then lives
// in memory for this page view and "詢價這件" still works.
const KEY = "asclepia.inquiry-list";
export const INQUIRY_MAX = 10; // OQ-INQ-4

const EMPTY: string[] = [];
const listeners = new Set<() => void>();
let cache: string[] | null = null;

function read(): string[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v)
      ? [...new Set(v.filter((x): x is string => typeof x === "string"))].slice(0, INQUIRY_MAX)
      : [];
  } catch {
    return [];
  }
}

function snapshot() {
  cache ??= read();
  return cache;
}

function write(next: string[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // keep the in-memory list
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    cache = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useInquiryList() {
  const ids = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  const full = ids.length >= INQUIRY_MAX;
  return {
    ids,
    full,
    has: (id: string) => ids.includes(id),
    toggle: (id: string) =>
      write(ids.includes(id) ? ids.filter((x) => x !== id) : full ? ids : [...ids, id]),
    remove: (id: string) => write(ids.filter((x) => x !== id)),
    replace: (next: string[]) => write(next.slice(0, INQUIRY_MAX)),
    clear: () => write([]),
  };
}

function storageAvailable(): boolean {
  try {
    const probe = `${KEY}.probe`;
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

const noop = () => () => {};
export const useStorageAvailable = () => useSyncExternalStore(noop, storageAvailable, () => true);
