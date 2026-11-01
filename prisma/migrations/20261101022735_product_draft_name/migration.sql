-- catalog.md §4.3: a draft may be saved without a name; publishing (and any later status) needs one.
-- Replaces the 1..160 check from the init migration.
ALTER TABLE "Product" DROP CONSTRAINT "Product_name_len";
ALTER TABLE "Product" ADD CONSTRAINT "Product_name_len" CHECK (char_length("name") <= 160),
  ADD CONSTRAINT "Product_name_unless_draft" CHECK ("status" = 'DRAFT' OR char_length(btrim("name")) >= 1);
