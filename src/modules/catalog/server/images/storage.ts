import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { storageEnv } from "@/server/env";

// Local disk for development (catalog.md §4.2: ./.uploads/). Keys are random, never the upload's
// file name, so nothing user-supplied reaches a path (no traversal).
export const KEY = /^img_[0-9a-f]{32}$/;
export const FILE = /^(img_[0-9a-f]{32})-(1600|400)\.webp$/;

export const newKey = () => `img_${randomBytes(16).toString("hex")}`;
const root = () => resolve(storageEnv().UPLOAD_DIR);
const pathOf = (file: string) => {
  if (!FILE.test(file)) throw new Error("bad media file name");
  return join(root(), file);
};
export const fileName = (key: string, size: 1600 | 400) => `${key}-${size}.webp`;

export async function putImage(key: string, files: Record<1600 | 400, Buffer>) {
  await mkdir(root(), { recursive: true });
  for (const size of [1600, 400] as const)
    await writeFile(pathOf(fileName(key, size)), files[size]);
}

export async function readMedia(file: string): Promise<Buffer | null> {
  try {
    return await readFile(pathOf(file));
  } catch {
    return null;
  }
}

export async function removeImage(key: string) {
  if (!KEY.test(key)) return;
  for (const size of [1600, 400] as const) await rm(pathOf(fileName(key, size)), { force: true });
}
