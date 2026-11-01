"use client";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  PictureOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Flex, Form, Input, Row, theme, Typography, Upload } from "antd";
import { useState } from "react";
import { adminCopy } from "@/copy/admin";

const p = adminCopy.settings.profile;
const ACCEPT = "image/jpeg,image/png,image/webp";

export type ProfileValues = {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  map: string;
  seo: string;
};

// Visual-only upload slot: shows where the photo goes and its spec; nothing is uploaded.
function ImageSlot({
  label,
  spec,
  ratio,
  maxWidth,
}: {
  label: string;
  spec: string;
  ratio: string;
  maxWidth: number;
}) {
  const { token } = theme.useToken();
  const [picked, setPicked] = useState<string>();
  return (
    <Flex vertical gap={6}>
      <Typography.Text strong>{label}</Typography.Text>
      <div style={{ maxInlineSize: maxWidth }}>
        <Upload.Dragger
          accept={ACCEPT}
          showUploadList={false}
          style={{ aspectRatio: ratio, blockSize: "auto" }}
          beforeUpload={(file) => {
            setPicked(file.name);
            return false;
          }}
        >
          <Flex vertical align="center" gap={4} style={{ color: token.colorTextSecondary }}>
            <PictureOutlined aria-hidden style={{ fontSize: 20 }} />
            <span>{p.upload(label)}</span>
          </Flex>
        </Upload.Dragger>
      </div>
      <Typography.Text type="secondary">{picked ? p.picked(picked) : spec}</Typography.Text>
    </Flex>
  );
}

function BrandLogos({ brands: initial }: { brands: string[] }) {
  const { token } = theme.useToken();
  const [brands, setBrands] = useState(initial);
  const move = (i: number, d: -1 | 1) =>
    setBrands((b) => {
      const next = [...b];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });
  return (
    <Flex vertical gap={8}>
      <Typography.Text strong>{p.brandLogos}</Typography.Text>
      <Typography.Text type="secondary">{p.brandLogosHelp}</Typography.Text>
      <Flex vertical gap={8} component="ol" style={{ listStyle: "none", padding: 0 }}>
        {brands.map((b, i) => (
          <Flex
            key={b}
            component="li"
            gap={8}
            align="center"
            style={{
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              padding: "6px 8px",
              maxInlineSize: 480,
            }}
          >
            <Typography.Text style={{ flex: 1 }}>{b}</Typography.Text>
            <Upload accept={ACCEPT} showUploadList={false} beforeUpload={() => false}>
              <Button size="small" icon={<PictureOutlined />}>
                {p.brandUpload}
              </Button>
            </Upload>
            <Button
              size="small"
              type="text"
              icon={<ArrowUpOutlined />}
              aria-label={p.moveUp(b)}
              disabled={i === 0}
              onClick={() => move(i, -1)}
            />
            <Button
              size="small"
              type="text"
              icon={<ArrowDownOutlined />}
              aria-label={p.moveDown(b)}
              disabled={i === brands.length - 1}
              onClick={() => move(i, 1)}
            />
          </Flex>
        ))}
      </Flex>
      <Upload accept={ACCEPT} showUploadList={false} beforeUpload={() => false}>
        <Button type="dashed" icon={<PlusOutlined />}>
          {p.brandUpload}
        </Button>
      </Upload>
    </Flex>
  );
}

export function useProfileTab(values: ProfileValues, brands: string[]) {
  const [form] = Form.useForm<ProfileValues>();
  const req = (label: string) => [{ required: true, message: p.required(label) }];
  const body = (
    <Flex vertical gap={16}>
      <Card title={p.basic} variant="outlined" size="small" styles={{ body: { padding: 16 } }}>
        <Form form={form} layout="vertical" initialValues={values} requiredMark="optional">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label={p.name} name="name" rules={req(p.name)}>
                <Input maxLength={30} showCount />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={p.tagline} name="tagline" extra={p.taglineHelp}>
                <Input maxLength={20} showCount />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={p.phone} name="phone" rules={req(p.phone)}>
                <Input type="tel" maxLength={20} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={p.email} name="email" rules={[{ type: "email" }]}>
                <Input type="email" maxLength={80} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={p.address} name="address">
                <Input maxLength={80} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={p.hours} name="hours">
                <Input maxLength={40} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label={p.map}
                name="map"
                extra={p.mapHelp}
                rules={[{ pattern: /^https:\/\/\S+$/, message: p.mapInvalid }]}
              >
                <Input type="url" placeholder={p.mapPlaceholder} maxLength={300} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label={p.seo} name="seo" extra={p.seoHelp}>
                <Input.TextArea maxLength={160} showCount autoSize={{ minRows: 2, maxRows: 4 }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
      <Card title={p.images} variant="outlined" size="small" styles={{ body: { padding: 16 } }}>
        <Flex vertical gap={24}>
          <Typography.Text type="secondary">{p.accept}</Typography.Text>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <ImageSlot {...p.hero} ratio="16 / 9" maxWidth={480} />
            </Col>
            <Col xs={24} md={12}>
              <ImageSlot {...p.visit} ratio="4 / 3" maxWidth={360} />
            </Col>
            <Col xs={24} md={12}>
              <ImageSlot {...p.logo} ratio="3 / 1" maxWidth={300} />
            </Col>
            <Col xs={24} md={12}>
              <ImageSlot {...p.favicon} ratio="1 / 1" maxWidth={140} />
            </Col>
          </Row>
          <BrandLogos brands={brands} />
        </Flex>
      </Card>
    </Flex>
  );
  return { body, reset: () => form.resetFields() };
}
