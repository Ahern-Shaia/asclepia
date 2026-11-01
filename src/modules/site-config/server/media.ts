import "server-only";
import { fileName, iconFileName } from "@/server/images/storage";

// Where a stored image key is served from, by kind: the favicon's 512 px PNG master, the 1600 px
// rendition for the photos that fill a band or a card, 400 px for logos shown small.
export const srcOf = (kind: string, key: string) =>
  `/media/${
    kind === "FAVICON"
      ? iconFileName(key, 512)
      : fileName(key, kind === "HERO" || kind === "VISIT" ? 1600 : 400)
  }`;
