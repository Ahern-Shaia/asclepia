import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { storageEnv } from "@/server/env";

// Local disk for development (catalog.md §4.2: ./.uploads/). Keys are random, never the upload's
// file name, so nothing user-supplied reaches a path (no traversal).
export const KEY = /^img_[0-9a-f]{32}$/;
// photos: <key>-1600.webp / -400.webp · icons (favicon): <key>-512.png / -180.png / -32.png
export const FILE = /^img_[0-9a-f]{32}-(?:(?:1600|400)\.webp|(?:512|180|32)\.png)$/;
const WEBP_SIZES = [1600, 400] as const;
const PNG_SIZES = [512, 180, 32] as const;

export const newKey = () => `img_${randomBytes(16).toString("hex")}`;
const root = () => resolve(storageEnv().UPLOAD_DIR);
const pathOf = (file: string) => {
  if (!FILE.test(file)) throw new Error("bad media file name");
  return join(root(), file);
};
export const fileName = (key: string, size: 1600 | 400) => `${key}-${size}.webp`;
export const iconFileName = (key: string, size: 512 | 180 | 32) => `${key}-${size}.png`;

export async function putImage(key: string, files: Record<1600 | 400, Buffer>) {
  await mkdir(root(), { recursive: true });
  for (const size of [1600, 400] as const)
    await writeFile(pathOf(fileName(key, size)), files[size]);
}

export async function putIcon(key: string, files: Record<512 | 180 | 32, Buffer>) {
  await mkdir(root(), { recursive: true });
  for (const size of PNG_SIZES) await writeFile(pathOf(iconFileName(key, size)), files[size]);
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
  // every rendition either kind of upload may have written
  for (const size of WEBP_SIZES) await rm(pathOf(fileName(key, size)), { force: true });
  for (const size of PNG_SIZES) await rm(pathOf(iconFileName(key, size)), { force: true });
}
