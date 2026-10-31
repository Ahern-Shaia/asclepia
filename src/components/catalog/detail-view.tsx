"use client";

import { PhoneOutlined } from "@ant-design/icons";
import { Alert, Breadcrumb, Button, Descriptions, Flex, Image, theme, Typography } from "antd";
import Link from "next/link";
import { useState } from "react";
import { catalogCopy } from "@/copy/catalog";
import styles from "./catalog.module.css";
import { formatTwd } from "./format";
import { InquiryModal } from "./inquiry-modal";
import { Nameplate } from "./nameplate";
import { Section } from "@/components/ui/section";
import { type CardProduct, ProductCard } from "./product-card";

export type DetailProduct = {
  id: string;
  brand: string;
  model: string;
  nameEn?: string;
  nameZh: string;
  licenseNo?: string;
  priceTwd?: number;
  year?: number;
  condition?: string;
  warranty?: string;
  sold: boolean;
  images: string[];
  highlights: string[];
  specs: { label: string; value: string }[];
  features: string[];
  categoryName: string;
  categoryHref: string;
};

const d = catalogCopy.detail;

export function DetailView({
  base,
  product: p,
  related,
  phone,
}: {
  base: string;
  product: DetailProduct;
  related: CardProduct[];
  phone: string;
}) {
  const { token } = theme.useToken();
  const [active, setActive] = useState(0);
  const [asking, setAsking] = useState(false);
  const title = [p.brand, p.model, p.nameEn, p.nameZh].filter(Boolean).join(" ");

  return (
    <Flex className={styles.container} vertical gap={32} style={{ paddingBlock: 24 }}>
      <Breadcrumb
        items={[
          { title: <Link href={base}>首頁</Link> },
          { title: <Link href={`${base}/products`}>{catalogCopy.nav.products}</Link> },
          { title: <Link href={p.categoryHref}>{p.categoryName}</Link> },
          { title: `${p.brand} ${p.model}` },
        ]}
      />

      <div className={styles.detailTop}>
        <Flex vertical gap={8}>
          <Image.PreviewGroup items={p.images}>
            <div
              className={styles.cover}
              style={{
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                background: token.colorBgContainer,
              }}
            >
              <Image
                src={p.images[active]}
                alt={`${title}（第 ${active + 1} 張）`}
                width="100%"
                height="100%"
                style={{ objectFit: "contain", filter: p.sold ? "grayscale(1)" : undefined }}
              />
            </div>
          </Image.PreviewGroup>
          <div className={styles.thumbs} role="list" aria-label="商品圖片">
            {p.images.map((src, i) => (
              <button
                key={src}
                type="button"
                role="listitem"
                aria-label={`顯示第 ${i + 1} 張圖片`}
                aria-current={i === active}
                className={styles.thumbButton}
                onClick={() => setActive(i)}
                style={{
                  border: `2px solid ${i === active ? token.colorPrimary : token.colorBorder}`,
                  borderRadius: token.borderRadius,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                <img src={src} alt="" className={styles.coverImg} />
              </button>
            ))}
          </div>
        </Flex>

        <Flex vertical gap={16} className={styles.sticky}>
          <Typography.Text type="secondary">{p.categoryName}</Typography.Text>
          <Typography.Title level={1} style={{ fontSize: token.fontSizeHeading2 }}>
            {title}
          </Typography.Title>
          <Nameplate
            ariaLabel="設備銘牌"
            rows={[
              { label: d.nameplate.brand, value: p.brand },
              { label: d.nameplate.model, value: p.model, mono: true },
              { label: d.nameplate.year, value: p.year },
              { label: d.nameplate.warranty, value: p.warranty },
              { label: d.nameplate.condition, value: p.condition, wide: true },
              ...(p.licenseNo
                ? [{ label: d.nameplate.license, value: p.licenseNo, mono: true, wide: true }]
                : []),
            ]}
          />
          <Typography.Text
            strong
            style={{
              fontSize: token.fontSizeHeading2,
              color: p.sold ? token.colorTextSecondary : token.colorPrimary,
            }}
          >
            {p.priceTwd ? formatTwd(p.priceTwd) : catalogCopy.card.askPrice}
          </Typography.Text>
          {p.sold ? <Alert type="info" showIcon title={d.soldNote} /> : null}
          <Flex gap={8} wrap>
            <Button
              type="primary"
              size="large"
              onClick={() => setAsking(true)}
              style={{ flex: 1, minWidth: 180 }}
            >
              {d.ask}
            </Button>
            <Button
              size="large"
              icon={<PhoneOutlined />}
              href={`tel:${phone}`}
              style={{ flex: 1, minWidth: 180 }}
            >
              {d.call(phone)}
            </Button>
          </Flex>
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {d.dealNote}
          </Typography.Text>
        </Flex>
      </div>

      {p.highlights.length > 0 && (
        <Section id="h-highlights" title={d.highlights}>
          <ul style={{ paddingInlineStart: 20, lineHeight: 1.8 }}>
            {p.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </Section>
      )}
      {p.specs.length > 0 && (
        <Section id="h-specs" title={d.specs}>
          <Descriptions
            bordered
            size="small"
            column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
            items={p.specs.map((s, i) => ({ key: i, label: s.label, children: s.value }))}
          />
        </Section>
      )}
      {p.features.length > 0 && (
        <Section id="h-features" title={d.features}>
          <ul lang="en" style={{ paddingInlineStart: 20, lineHeight: 1.8 }}>
            {p.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </Section>
      )}
      <Section
        id="h-terms"
        level={3}
        title={d.terms}
        style={{ background: token.colorBgLayout, borderRadius: token.borderRadius, padding: 20 }}
      >
        <ul style={{ paddingInlineStart: 20, lineHeight: 1.8 }}>
          {d.termsBody.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Section>
      {related.length > 0 && (
        <Section id="h-related" title={d.related}>
          <div className={styles.grid}>
            {related.map((r) => (
              <ProductCard key={r.id} product={r} href={`${base}/products/${r.id}`} />
            ))}
          </div>
        </Section>
      )}
      <InquiryModal open={asking} onClose={() => setAsking(false)} productTitle={title} />
    </Flex>
  );
}
