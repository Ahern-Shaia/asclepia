import { describe, expect, it } from "vitest";
import { CATEGORY_ICON_KEYS } from "@/modules/catalog/admin-input";
import { EQUIP_KINDS } from "./equip-illus";

// The back office offers CATEGORY_ICON_KEYS; the storefront draws EQUIP_KINDS. A key with no
// drawing would silently show the generic one.
describe("category icon keys", () => {
  it("match the built-in drawings exactly", () => {
    expect([...CATEGORY_ICON_KEYS].sort()).toEqual([...EQUIP_KINDS].sort());
  });
});
