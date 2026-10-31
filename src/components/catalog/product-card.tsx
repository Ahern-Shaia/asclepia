"use client";

import { Card, Flex, Tag, theme, Typography } from "antd";
import Link from "next/link";
import { catalogCopy } from "@/copy/catalog";
import styles from "./catalog.module.css";
import { formatTwd } from "./format";

export type CardProduct = {
  id: string;
  brand: string;
  model: string;
  nameZh: string;
  year?: number;
  condition?: string;
  priceTwd?: number;
  sold: boolean;
  image: string;
};

export function ProductCard({ product, href }: { product: CardProduct; href: string }) {
  const { token } = theme.useToken();
  const title = `${product.brand} ${product.model} ${product.nameZh}`;
  const meta = [product.year && catalogCopy.card.year(product.year), product.condition]
    .filter(Boolean)
    .join(" · ");
  return (
    <Link href={href} aria-label={title} style={{ color: "inherit" }}>
      <Card
        hoverable
        variant="outlined"
        styles={{ body: { padding: 12 } }}
        cover={
          <div
            className={styles.cover}
            style={{
              background: token.colorBgContainer,
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
            <img
              src={product.image}
              alt=""
              className={styles.coverImg}
              style={product.sold ? { filter: "grayscale(1)", opacity: 0.6 } : undefined}
            />
          </div>
        }
      >
        <Flex vertical gap={6}>
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {product.brand} · {product.model}
          </Typography.Text>
          <Typography.Text strong className={styles.clamp2}>
            {product.nameZh}
          </Typography.Text>
          {meta && (
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {meta}
            </Typography.Text>
          )}
          <Flex justify="space-between" align="center" gap={8}>
            <Typography.Text
              strong
              style={{
                color: product.sold ? token.colorTextSecondary : token.colorPrimary,
                whiteSpace: "nowrap",
              }}
            >
              {product.priceTwd ? formatTwd(product.priceTwd) : catalogCopy.card.askPrice}
            </Typography.Text>
            {product.sold && <Tag variant="filled">{catalogCopy.card.sold}</Tag>}
          </Flex>
        </Flex>
      </Card>
    </Link>
  );
}
