import { describe, expect, it } from "vitest";
import { findEfficacyWords } from "./efficacy-words";

describe("findEfficacyWords", () => {
  it("flags efficacy claims", () => {
    expect(findEfficacyWords("可有效改善循環並緩解疼痛")).toEqual(["改善", "緩解"]);
  });
  it("leaves objective descriptions alone", () => {
    expect(findEfficacyWords("含兩支探頭，開機時數約 2,100 小時")).toEqual([]);
  });
});
