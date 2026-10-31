"use client";

import { CheckCircleOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Input, theme, Typography } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { catalogCopy } from "@/copy/catalog";
import styles from "./catalog.module.css";
import { Section } from "@/components/ui/section";
import { type CardProduct, ProductCard } from "./product-card";

export type HomeCategory = { id: string; name: string; count: number; image: string };

export function HomeView({
  base,
  categories,
  latest,
}: {
  base: string;
  categories: HomeCategory[];
  latest: CardProduct[];
}) {
  const { token } = theme.useToken();
  const router = useRouter();
  return (
    <>
      <section
        style={{ background: token.colorBgLayout, borderBottom: `1px solid ${token.colorBorder}` }}
      >
        <Flex className={styles.container} vertical gap={16} style={{ paddingBlock: 40 }}>
          <Typography.Title level={1}>{catalogCopy.hero.heading}</Typography.Title>
          <div style={{ maxWidth: 640 }}>
            <Input.Search
              size="large"
              placeholder={catalogCopy.search.placeholder}
              aria-label={catalogCopy.search.placeholder}
              enterButton={catalogCopy.search.button}
              onSearch={(q) =>
                router.push(`${base}/products${q ? `?q=${encodeURIComponent(q)}` : ""}`)
              }
            />
          </div>
          <Flex wrap gap={24}>
            {catalogCopy.hero.trust.map((t) => (
              <Flex key={t} gap={8} align="center">
                <CheckCircleOutlined aria-hidden style={{ color: token.colorSuccess }} />
                <Typography.Text>{t}</Typography.Text>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </section>

      <Flex className={styles.container} vertical gap={40} style={{ paddingBlock: 40 }}>
        <Section id="h-categories" title={catalogCopy.sections.categories}>
          <div className={styles.categoryGrid}>
            {categories.map((c) => (
              <Link key={c.id} href={`${base}/products?cat=${c.id}`} style={{ color: "inherit" }}>
                <Card hoverable variant="outlined" styles={{ body: { padding: 12 } }}>
                  <Flex vertical gap={8} align="center">
                    {/* eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs */}
                    <img
                      src={c.image}
                      alt=""
                      width={96}
                      height={72}
                      style={{ objectFit: "contain" }}
                    />
                    <Typography.Text strong>{c.name}</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                      {c.count} 件
                    </Typography.Text>
                  </Flex>
                </Card>
              </Link>
            ))}
          </div>
        </Section>

        <Section
          id="h-latest"
          title={catalogCopy.sections.latest}
          extra={
            <Link href={`${base}/products`}>
              {catalogCopy.sections.viewAll} <RightOutlined aria-hidden />
            </Link>
          }
        >
          <div className={styles.grid}>
            {latest.map((p) => (
              <ProductCard key={p.id} product={p} href={`${base}/products/${p.id}`} />
            ))}
          </div>
        </Section>

        <section
          id="services"
          aria-labelledby="h-services"
          style={{
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            padding: 24,
          }}
        >
          <Flex justify="space-between" align="center" wrap gap={16}>
            <Flex vertical gap={4}>
              <Typography.Title level={3} id="h-services">
                {catalogCopy.nav.services}
              </Typography.Title>
              <Typography.Text type="secondary">設備收購、維修、租賃，請來電洽詢。</Typography.Text>
            </Flex>
            <Button size="large" href="#contact">
              {catalogCopy.nav.contact}
            </Button>
          </Flex>
        </section>
      </Flex>
    </>
  );
}
