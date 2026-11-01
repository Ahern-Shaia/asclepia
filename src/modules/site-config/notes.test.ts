import { describe, expect, it } from "vitest";
import { noNotes, siteNotesSchema } from "./notes";

describe("site notes", () => {
  it("shows nothing by default", () => {
    expect(noNotes).toEqual({ eyebrow: "", heroPoints: [], terms: [], services: [] });
    expect(siteNotesSchema.parse({ unrelated: true })).toEqual(noNotes);
  });

  it("drops a malformed entry, keeps the rest, and caps each list", () => {
    const notes = siteNotesSchema.parse({
      eyebrow: 42,
      heroPoints: ["  可開立發票 ", "", 7, "a", "b", "c"],
      terms: "not a list",
      services: [
        { kind: "buy", title: "收購", body: "拍照估價" },
        { kind: "nope", title: "維修" },
        { title: "" },
      ],
    });
    expect(notes).toEqual({
      eyebrow: "",
      heroPoints: ["可開立發票", "a", "b"],
      terms: [],
      services: [
        { kind: "buy", title: "收購", body: "拍照估價" },
        { kind: "other", title: "維修", body: "" },
      ],
    });
  });
});
