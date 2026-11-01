-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN', 'SOLD');

-- CreateEnum
CREATE TYPE "AttributeType" AS ENUM ('TEXT', 'NUMBER', 'YEAR', 'SELECT');

-- CreateEnum
CREATE TYPE "ConfigSection" AS ENUM ('PROFILE', 'THEME', 'HOME', 'COPY', 'FEATURES');

-- CreateEnum
CREATE TYPE "AssetKind" AS ENUM ('LOGO', 'FAVICON', 'HERO', 'VISIT', 'BRAND_LOGO', 'CATEGORY_ICON');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED_WON', 'CLOSED_LOST');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "iconKey" TEXT,
    "iconAssetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "name" TEXT NOT NULL,
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "priceTwd" DECIMAL(12,0),
    "highlights" TEXT[],
    "features" TEXT[],
    "specNote" TEXT,
    "sourceName" TEXT,
    "sourceContact" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSpec" (
    "productId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ProductSpec_pkey" PRIMARY KEY ("productId","sortOrder")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "alt" TEXT,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttributeDef" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "AttributeType" NOT NULL,
    "options" TEXT[],
    "unit" TEXT,
    "maxLength" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttributeDef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryAttribute" (
    "categoryId" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "inTitle" BOOLEAN NOT NULL DEFAULT false,
    "onCard" BOOLEAN NOT NULL DEFAULT false,
    "inNameplate" BOOLEAN NOT NULL DEFAULT true,
    "filterable" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CategoryAttribute_pkey" PRIMARY KEY ("categoryId","attributeId")
);

-- CreateTable
CREATE TABLE "SiteConfig" (
    "section" "ConfigSection" NOT NULL,
    "value" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "SiteConfig_pkey" PRIMARY KEY ("section")
);

-- CreateTable
CREATE TABLE "SiteAsset" (
    "id" TEXT NOT NULL,
    "kind" "AssetKind" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "org" TEXT,
    "message" TEXT,
    "consentText" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purgeAfter" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InquiryItem" (
    "inquiryId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "titleSnap" TEXT NOT NULL,
    "priceSnap" DECIMAL(12,0),

    CONSTRAINT "InquiryItem_pkey" PRIMARY KEY ("inquiryId","productId")
);

-- CreateTable
CREATE TABLE "RateLimitHit" (
    "key" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "RateLimitHit_pkey" PRIMARY KEY ("key","windowStart")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" BIGSERIAL NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "diff" JSONB,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Product_status_categoryId_publishedAt_idx" ON "Product"("status", "categoryId", "publishedAt");

-- CreateIndex
CREATE INDEX "Product_attributes_idx" ON "Product" USING GIN ("attributes" jsonb_path_ops);

-- CreateIndex
CREATE UNIQUE INDEX "ProductImage_storageKey_key" ON "ProductImage"("storageKey");

-- CreateIndex
CREATE INDEX "ProductImage_productId_sortOrder_idx" ON "ProductImage"("productId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeDef_key_key" ON "AttributeDef"("key");

-- CreateIndex
CREATE INDEX "CategoryAttribute_attributeId_idx" ON "CategoryAttribute"("attributeId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteAsset_storageKey_key" ON "SiteAsset"("storageKey");

-- CreateIndex
CREATE INDEX "SiteAsset_kind_sortOrder_idx" ON "SiteAsset"("kind", "sortOrder");

-- CreateIndex
CREATE INDEX "Inquiry_status_createdAt_idx" ON "Inquiry"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Inquiry_purgeAfter_idx" ON "Inquiry"("purgeAfter");

-- CreateIndex
CREATE INDEX "InquiryItem_productId_idx" ON "InquiryItem"("productId");

-- CreateIndex
CREATE INDEX "RateLimitHit_windowStart_idx" ON "RateLimitHit"("windowStart");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_at_idx" ON "AuditLog"("targetType", "targetId", "at");

-- CreateIndex
CREATE INDEX "AuditLog_at_idx" ON "AuditLog"("at");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_iconAssetId_fkey" FOREIGN KEY ("iconAssetId") REFERENCES "SiteAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSpec" ADD CONSTRAINT "ProductSpec_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryAttribute" ADD CONSTRAINT "CategoryAttribute_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryAttribute" ADD CONSTRAINT "CategoryAttribute_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "AttributeDef"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InquiryItem" ADD CONSTRAINT "InquiryItem_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InquiryItem" ADD CONSTRAINT "InquiryItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ════════════════════════════════════════════════════════════════════════════
-- Hand-written (Prisma does not model these). Keep in sync with schema comments.
-- ════════════════════════════════════════════════════════════════════════════

-- Value checks the app also validates (zod); the database is the last line (security-baseline).
ALTER TABLE "Category" ADD CONSTRAINT "Category_name_len" CHECK (char_length("name") BETWEEN 1 AND 30),
  ADD CONSTRAINT "Category_sortOrder_nonneg" CHECK ("sortOrder" >= 0);

ALTER TABLE "Product" ADD CONSTRAINT "Product_name_len" CHECK (char_length("name") BETWEEN 1 AND 160),
  ADD CONSTRAINT "Product_price_nonneg" CHECK ("priceTwd" IS NULL OR "priceTwd" >= 0),
  ADD CONSTRAINT "Product_attributes_object" CHECK (jsonb_typeof("attributes") = 'object'),
  ADD CONSTRAINT "Product_highlights_max" CHECK (cardinality("highlights") <= 30),
  ADD CONSTRAINT "Product_features_max" CHECK (cardinality("features") <= 50),
  ADD CONSTRAINT "Product_specNote_len" CHECK ("specNote" IS NULL OR char_length("specNote") <= 5000);

ALTER TABLE "ProductSpec" ADD CONSTRAINT "ProductSpec_sortOrder_nonneg" CHECK ("sortOrder" >= 0),
  ADD CONSTRAINT "ProductSpec_label_len" CHECK (char_length("label") BETWEEN 1 AND 80),
  ADD CONSTRAINT "ProductSpec_value_len" CHECK (char_length("value") <= 500);

ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_sortOrder_nonneg" CHECK ("sortOrder" >= 0),
  ADD CONSTRAINT "ProductImage_size_pos" CHECK ("width" > 0 AND "height" > 0);

-- Keys are stored in Product.attributes; renaming one would orphan every value (site-config.md §4.1).
ALTER TABLE "AttributeDef" ADD CONSTRAINT "AttributeDef_key_format" CHECK ("key" ~ '^[a-z][a-z0-9_]{0,31}$'),
  ADD CONSTRAINT "AttributeDef_label_len" CHECK (char_length("label") BETWEEN 1 AND 30),
  ADD CONSTRAINT "AttributeDef_options_max" CHECK (cardinality("options") <= 50);

CREATE FUNCTION attribute_key_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."key" IS DISTINCT FROM OLD."key" THEN
    RAISE EXCEPTION 'AttributeDef.key cannot change' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "AttributeDef_key_immutable" BEFORE UPDATE ON "AttributeDef"
  FOR EACH ROW EXECUTE FUNCTION attribute_key_immutable();

ALTER TABLE "CategoryAttribute" ADD CONSTRAINT "CategoryAttribute_sortOrder_nonneg" CHECK ("sortOrder" >= 0);

ALTER TABLE "SiteConfig" ADD CONSTRAINT "SiteConfig_value_object" CHECK (jsonb_typeof("value") = 'object'),
  ADD CONSTRAINT "SiteConfig_version_pos" CHECK ("version" >= 1);

ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_name_len" CHECK (char_length("name") BETWEEN 1 AND 50),
  ADD CONSTRAINT "Inquiry_phone_len" CHECK (char_length("phone") BETWEEN 1 AND 30),
  ADD CONSTRAINT "Inquiry_email_len" CHECK ("email" IS NULL OR char_length("email") <= 254),
  ADD CONSTRAINT "Inquiry_org_len" CHECK ("org" IS NULL OR char_length("org") <= 100),
  ADD CONSTRAINT "Inquiry_message_len" CHECK ("message" IS NULL OR char_length("message") <= 2000),
  ADD CONSTRAINT "Inquiry_note_len" CHECK ("note" IS NULL OR char_length("note") <= 2000),
  ADD CONSTRAINT "Inquiry_purge_after_created" CHECK ("purgeAfter" > "createdAt");

ALTER TABLE "InquiryItem" ADD CONSTRAINT "InquiryItem_sortOrder_nonneg" CHECK ("sortOrder" >= 0),
  ADD CONSTRAINT "InquiryItem_priceSnap_nonneg" CHECK ("priceSnap" IS NULL OR "priceSnap" >= 0);

ALTER TABLE "RateLimitHit" ADD CONSTRAINT "RateLimitHit_count_pos" CHECK ("count" >= 1);

ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_result_enum" CHECK ("result" IN ('ok', 'denied', 'error', 'warn'));

-- Audit is append-only for every role, owner included (R5, security-baseline "audit 不可變").
CREATE FUNCTION audit_log_append_only() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog is append-only' USING ERRCODE = 'insufficient_privilege';
END $$;
CREATE TRIGGER "AuditLog_no_update_delete" BEFORE UPDATE OR DELETE ON "AuditLog"
  FOR EACH ROW EXECUTE FUNCTION audit_log_append_only();
CREATE TRIGGER "AuditLog_no_truncate" BEFORE TRUNCATE ON "AuditLog"
  FOR EACH STATEMENT EXECUTE FUNCTION audit_log_append_only();

-- The app role (prisma/sql/roles.sql) may only INSERT and SELECT audit rows.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'asclepia_app') THEN
    REVOKE UPDATE, DELETE, TRUNCATE ON TABLE "AuditLog" FROM asclepia_app;
  END IF;
END $$;
