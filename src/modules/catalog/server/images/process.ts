import "server-only";
import sharp from "sharp";
import { DomainError } from "@/server/errors";
import { sniffFormat } from "./formats";

// The only place sharp runs (stack-rules S2-3, P3-4, P4-2). libvips parses untrusted binaries, so:
// format sniffed first, pixel count capped, 30 s timeout, at most 2 images at once per instance.
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // catalog.md §4.2
export const MAX_INPUT_PIXELS = 50_000_000;
export const SIZES = [1600, 400] as const;
const CONCURRENCY = 2;

let running = 0;
const waiting: (() => void)[] = [];
async function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (running >= CONCURRENCY) await new Promise<void>((resolve) => waiting.push(resolve));
  running += 1;
  try {
    return await fn();
  } finally {
    running -= 1;
    waiting.shift()?.();
  }
}
export const _slotsInUse = () => running;

export type Processed = {
  width: number;
  height: number;
  files: Record<(typeof SIZES)[number], Buffer>;
};

// Re-encoding is the sanitiser: output is fresh WebP pixels; no EXIF/GPS/ICC text survives
// (sharp drops metadata unless asked to keep it). The original bytes are never stored.
export async function processImage(input: Buffer): Promise<Processed> {
  if (input.length > MAX_UPLOAD_BYTES) throw new DomainError("IMAGE_TOO_LARGE");
  const format = sniffFormat(input);
  if (!format) throw new DomainError("IMAGE_UNSUPPORTED");
  return withSlot(async () => {
    try {
      const base = sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, failOn: "error" })
        .timeout({ seconds: 30 })
        .rotate(); // apply EXIF orientation, then drop it
      const meta = await base.metadata();
      if (meta.format !== format) throw new DomainError("IMAGE_UNSUPPORTED");
      const out = {} as Processed["files"];
      let width = 0;
      let height = 0;
      for (const size of SIZES) {
        const r = await base
          .clone()
          .resize({ width: size, height: size, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer({ resolveWithObject: true });
        out[size] = r.data;
        if (size === SIZES[0]) ({ width, height } = r.info);
      }
      return { width, height, files: out };
    } catch (e) {
      if (e instanceof DomainError) throw e;
      throw new DomainError("IMAGE_UNREADABLE"); // never sharp's own message (catalog.md §4.2)
    }
  });
}
