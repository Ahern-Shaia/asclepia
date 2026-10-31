"use client";

import {
  CheckCircleFilled,
  CloseCircleFilled,
  DeleteOutlined,
  EyeOutlined,
  HolderOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  SnippetsOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Col,
  ConfigProvider,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Tag,
  theme,
  Typography,
  Upload,
} from "antd";
import type { UploadFile } from "antd";
import Link from "next/link";
import { useState } from "react";
import { adminCopy } from "@/copy/admin";
import { findEfficacyWords, parseSpecs } from "@/modules/catalog";
import { ProductStatusTag } from "./status";

export type EditProduct = {
  status: "DRAFT" | "PUBLISHED" | "HIDDEN" | "SOLD";
  categoryId?: string;
  brand?: string;
  model?: string;
  nameEn?: string;
  nameZh?: string;
  licenseNo?: string;
  priceTwd?: number;
  year?: number;
  condition?: string;
  warranty?: string;
  images: string[];
  highlights: string[];
  specs: { label: string; value: string }[];
  features: string[];
  updatedBy?: string;
  updatedAt?: string;
};

const e = adminCopy.edit;

export function ProductEditView({
  base,
  product,
  categories,
  isNew,
}: {
  base: string;
  product: EditProduct;
  categories: { id: string; name: string }[];
  isNew: boolean;
}) {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const values = Form.useWatch([], { form, preserve: true }) ?? {};
  const [files, setFiles] = useState<UploadFile[]>(
    product.images.map((url, i) => ({
      uid: String(i),
      name: `image-${i + 1}`,
      status: "done",
      url,
    })),
  );
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const parsed = parseSpecs(pasteText);

  const title = [values.brand, values.model, values.nameEn, values.nameZh]
    .filter(Boolean)
    .join(" ");
  const efficacy = findEfficacyWords((values.highlights ?? []).join("\n"));
  const checks = [
    { ok: files.length > 0, label: e.checks.image },
    { ok: Boolean(values.nameZh), label: e.checks.nameZh },
    { ok: Boolean(values.categoryId), label: e.checks.category },
  ];
  const canPublish = checks.every((c) => c.ok);
  const sectionStyle = { body: { padding: 20 } } as const;

  return (
    <Flex vertical gap={16}>
      <Breadcrumb
        items={[
          { title: <Link href={`${base}/products`}>{adminCopy.products.title}</Link> },
          { title: isNew ? e.titleNew : `${product.brand} ${product.model}` },
        ]}
      />
      <Typography.Title level={1} style={{ fontSize: token.fontSizeHeading3 }}>
        {isNew ? e.titleNew : e.titleEdit}
      </Typography.Title>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          ...product,
          highlights: product.highlights.length ? product.highlights : [""],
        }}
        requiredMark="optional"
      >
        <Row gutter={[24, 24]} align="top">
          <Col xs={24} lg={16}>
            <Flex vertical gap={16}>
              <Card title={e.sections.images} variant="outlined" styles={sectionStyle}>
                <Flex vertical gap={12}>
                  <Typography.Text type="secondary">{e.imagesHint}</Typography.Text>
                  <Upload
                    listType="picture-card"
                    fileList={files}
                    accept="image/jpeg,image/png,image/webp"
                    beforeUpload={() => false}
                    onChange={({ fileList }) => setFiles(fileList)}
                    itemRender={(node, file, list) => (
                      <div style={{ position: "relative", height: "100%" }}>
                        {node}
                        {list[0]?.uid === file.uid && (
                          <Tag
                            color="blue"
                            style={{
                              position: "absolute",
                              insetInlineStart: 4,
                              insetBlockStart: 4,
                              pointerEvents: "none",
                            }}
                          >
                            {e.mainImage}
                          </Tag>
                        )}
                      </div>
                    )}
                  >
                    {files.length < 20 && (
                      <Flex vertical align="center" gap={4}>
                        <PlusOutlined aria-hidden />
                        <span>{e.upload}</span>
                      </Flex>
                    )}
                  </Upload>
                </Flex>
              </Card>

              <Card title={e.sections.basic} variant="outlined" styles={sectionStyle}>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={e.category}
                      name="categoryId"
                      rules={[{ required: true, message: "請選擇分類" }]}
                    >
                      <Select
                        options={categories.map((c) => ({ value: c.id, label: c.name }))}
                        placeholder="選擇分類"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12} />
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={e.brand}
                      name="brand"
                      rules={[{ required: true, message: "請填寫品牌" }]}
                    >
                      <Input maxLength={80} placeholder="例：GE" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={e.model}
                      name="model"
                      rules={[{ required: true, message: "請填寫型號" }]}
                    >
                      <Input maxLength={80} placeholder="例：LOGIQ e" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label={e.nameEn} name="nameEn">
                      <Input maxLength={160} placeholder="例：Portable Ultrasound System" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={e.nameZh}
                      name="nameZh"
                      rules={[{ required: true, message: "請填寫中文品名" }]}
                    >
                      <Input maxLength={160} placeholder="例：攜帶式超音波掃描儀" />
                    </Form.Item>
                  </Col>
                </Row>
                <Flex
                  vertical
                  gap={4}
                  style={{
                    background: token.colorBgLayout,
                    padding: 12,
                    borderRadius: token.borderRadius,
                  }}
                >
                  <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                    {e.titlePreview}
                  </Typography.Text>
                  <Typography.Text strong>{title || "—"}</Typography.Text>
                </Flex>
              </Card>

              <Card title={e.sections.highlights} variant="outlined" styles={sectionStyle}>
                <Flex vertical gap={12}>
                  <LineList
                    name="highlights"
                    placeholder="例：主機含兩支探頭"
                    addLabel={e.addLine}
                  />
                  {efficacy.length > 0 && (
                    <Alert type="warning" showIcon title={e.efficacyWarning(efficacy.join("、"))} />
                  )}
                </Flex>
              </Card>

              <Card
                title={e.sections.specs}
                variant="outlined"
                styles={sectionStyle}
                extra={
                  <Button icon={<SnippetsOutlined />} onClick={() => setPasteOpen(true)}>
                    {e.pasteSpecs}
                  </Button>
                }
              >
                <ConfigProvider theme={{ components: { Form: { itemMarginBottom: 0 } } }}>
                  <Form.List name="specs">
                    {(fields, { add, remove }) => (
                      <Flex vertical gap={8}>
                        {fields.map((f) => (
                          <Flex key={f.key} gap={8} align="start">
                            <HolderOutlined
                              aria-hidden
                              style={{ color: token.colorTextSecondary, paddingBlockStart: 8 }}
                            />
                            <Form.Item name={[f.name, "label"]} style={{ flex: "0 0 30%" }}>
                              <Input
                                placeholder={e.specLabel}
                                aria-label={e.specLabel}
                                maxLength={80}
                              />
                            </Form.Item>
                            <Form.Item name={[f.name, "value"]} style={{ flex: 1 }}>
                              <Input
                                placeholder={e.specValue}
                                aria-label={e.specValue}
                                maxLength={500}
                              />
                            </Form.Item>
                            <Button
                              type="text"
                              icon={<DeleteOutlined />}
                              aria-label="刪除這一行"
                              onClick={() => remove(f.name)}
                            />
                          </Flex>
                        ))}
                        <Button
                          type="dashed"
                          icon={<PlusOutlined />}
                          onClick={() => add({ label: "", value: "" })}
                        >
                          {e.addLine}
                        </Button>
                      </Flex>
                    )}
                  </Form.List>
                </ConfigProvider>
              </Card>

              <Card title={e.sections.features} variant="outlined" styles={sectionStyle}>
                <LineList
                  name="features"
                  placeholder="例：DICOM 3.0 connectivity"
                  addLabel={e.addLine}
                />
              </Card>

              <Card title={e.sections.pricing} variant="outlined" styles={sectionStyle}>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item label={e.price} name="priceTwd" extra={e.priceHelp}>
                      <InputNumber
                        min={0}
                        step={1000}
                        style={{ width: "100%" }}
                        prefix="NT$"
                        formatter={(v) => (v ? Number(v).toLocaleString("zh-TW") : "")}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label={e.year} name="year">
                      <InputNumber min={1980} max={2100} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label={e.condition} name="condition">
                      <Input maxLength={80} placeholder="例：良好，外觀輕微使用痕跡" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label={e.warranty} name="warranty">
                      <Select
                        options={["無", "一個月", "三個月", "六個月"].map((v) => ({
                          value: v,
                          label: v,
                        }))}
                        placeholder="選擇保固"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card title={e.sections.license} variant="outlined" styles={sectionStyle}>
                <Form.Item label={e.licenseNo} name="licenseNo" extra={e.licenseHelp}>
                  <Input
                    maxLength={40}
                    placeholder="衛部醫器輸字第012345號"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  />
                </Form.Item>
              </Card>

              <Card
                title={
                  <Flex gap={8} align="center">
                    {e.sections.source}
                    <Tag icon={<EyeOutlined />}>{e.adminOnly}</Tag>
                  </Flex>
                }
                variant="outlined"
                styles={sectionStyle}
              >
                <Typography.Text type="secondary" style={{ display: "block", paddingBlockEnd: 16 }}>
                  {e.sourceHint}
                </Typography.Text>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item label={e.sourceName} name="sourceName">
                      <Input maxLength={80} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label={e.sourceContact} name="sourceContact">
                      <Input maxLength={40} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Flex>
          </Col>

          <Col xs={24} lg={8}>
            <div style={{ position: "sticky", top: 16 }}>
              <Card title={e.statusCard} variant="outlined" styles={sectionStyle}>
                <Flex vertical gap={16}>
                  <Flex justify="space-between" align="center">
                    <Typography.Text type="secondary">{e.current}</Typography.Text>
                    <ProductStatusTag status={product.status} />
                  </Flex>
                  <Flex vertical gap={8}>
                    <Typography.Text strong>{e.checklist}</Typography.Text>
                    <ul
                      aria-label={e.checklist}
                      style={{
                        listStyle: "none",
                        padding: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {checks.map((c) => (
                        <li key={c.label} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {c.ok ? (
                            <CheckCircleFilled
                              style={{ color: token.colorSuccess }}
                              aria-label="已完成"
                            />
                          ) : (
                            <CloseCircleFilled
                              style={{ color: token.colorError }}
                              aria-label="未完成"
                            />
                          )}
                          <Typography.Text type={c.ok ? undefined : "danger"}>
                            {c.label}
                          </Typography.Text>
                        </li>
                      ))}
                    </ul>
                  </Flex>
                  {!canPublish && (
                    <Flex
                      gap={6}
                      align="start"
                      style={{ color: token.colorTextSecondary, fontSize: token.fontSizeSM }}
                    >
                      <InfoCircleOutlined aria-hidden style={{ paddingBlockStart: 3 }} />
                      <span>{e.publishBlocked}</span>
                    </Flex>
                  )}
                  <Flex gap={8}>
                    <Button style={{ flex: 1 }}>{e.saveDraft}</Button>
                    <Button type="primary" style={{ flex: 1 }} disabled={!canPublish}>
                      {e.publish}
                    </Button>
                  </Flex>
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    style={{ paddingInline: 0, alignSelf: "flex-start" }}
                  >
                    {e.preview}
                  </Button>
                  {product.updatedBy && product.updatedAt && (
                    <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                      {e.lastEdited(product.updatedBy, product.updatedAt)}
                    </Typography.Text>
                  )}
                </Flex>
              </Card>
            </div>
          </Col>
        </Row>
      </Form>

      <Modal
        open={pasteOpen}
        title={e.pasteTitle}
        onCancel={() => setPasteOpen(false)}
        okText={e.pasteApply}
        okButtonProps={{ disabled: parsed.rows.length === 0 }}
        onOk={() => {
          form.setFieldValue("specs", [...(form.getFieldValue("specs") ?? []), ...parsed.rows]);
          setPasteText("");
          setPasteOpen(false);
        }}
        width={640}
      >
        <Flex vertical gap={12}>
          <Typography.Text type="secondary">{e.pasteHint}</Typography.Text>
          <Input.TextArea
            rows={8}
            value={pasteText}
            onChange={(ev) => setPasteText(ev.target.value)}
            aria-label={e.pasteTitle}
            placeholder={"頻寬: 25–600 MHz\n顯示器規格: 12.1 吋 TFT"}
          />
          <Typography.Text strong>{e.pastePreview(parsed.rows.length)}</Typography.Text>
          {parsed.leftovers.length > 0 && (
            <Alert
              type="info"
              showIcon
              title={`${parsed.leftovers.length} 行沒有「標籤: 值」格式，會放進補充說明`}
            />
          )}
        </Flex>
      </Modal>
    </Flex>
  );
}

function LineList({
  name,
  placeholder,
  addLabel,
}: {
  name: string;
  placeholder: string;
  addLabel: string;
}) {
  return (
    <ConfigProvider theme={{ components: { Form: { itemMarginBottom: 0 } } }}>
      <Form.List name={name}>
        {(fields, { add, remove }) => (
          <Flex vertical gap={8}>
            {fields.map((f, i) => (
              <Flex key={f.key} gap={8}>
                <Form.Item name={f.name} style={{ flex: 1 }}>
                  <Input
                    placeholder={i === 0 ? placeholder : undefined}
                    aria-label={`第 ${i + 1} 行`}
                    maxLength={200}
                  />
                </Form.Item>
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  aria-label="刪除這一行"
                  onClick={() => remove(f.name)}
                />
              </Flex>
            ))}
            <Button type="dashed" icon={<PlusOutlined />} onClick={() => add("")}>
              {addLabel}
            </Button>
          </Flex>
        )}
      </Form.List>
    </ConfigProvider>
  );
}
