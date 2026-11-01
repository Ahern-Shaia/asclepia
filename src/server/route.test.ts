import { describe, expect, it } from "vitest";
import { readCapped } from "./route";

const tooLarge = () => new Error("too large");
const streamOf = (chunks: number[]) =>
  new ReadableStream<Uint8Array>({
    start(c) {
      for (const n of chunks) c.enqueue(new Uint8Array(n));
      c.close();
    },
  });
const post = (body: ReadableStream<Uint8Array>, length?: number) =>
  new Request("http://x/upload", {
    method: "POST",
    body,
    headers: length === undefined ? {} : { "content-length": String(length) },
    duplex: "half",
  } as RequestInit);

describe("readCapped (stack-rules P6-1)", () => {
  it("reads a body under the cap", async () => {
    expect((await readCapped(post(streamOf([3, 4])), 10, tooLarge)).length).toBe(7);
  });
  it("refuses a declared length over the cap before reading", async () => {
    await expect(readCapped(post(streamOf([1]), 11), 10, tooLarge)).rejects.toThrow("too large");
  });
  it("stops a stream that lies about (or omits) its length once it passes the cap", async () => {
    await expect(readCapped(post(streamOf([6, 6])), 10, tooLarge)).rejects.toThrow("too large");
    await expect(readCapped(post(streamOf([6, 6]), 5), 10, tooLarge)).rejects.toThrow("too large");
  });
});
