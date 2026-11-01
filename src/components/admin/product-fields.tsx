"use client";

import {
  DeleteOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  SnippetsOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  ConfigProvider,
  Flex,
  Form,
  type FormInstance,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Tag,
  theme,
  Typography,
} from "antd";
import { type ReactNode, useState } from "react";
import { titleOf } from "@/components/shop/attrs";
import { adminCopy } from "@/copy/admin";
import { TEXT_MAX_DEFAULT } from "@/modules/catalog/attribute-schema";
import { PRICE_MAX } from "@/modules/catalog/product-input";
import { parseSpecs } from "@/modules/catalog/spec-parse";
import type { FormAttr } from "./catalog-data";

const e = adminCopy.edit;
const card = { body: { padding: 20 } } as const;

export type FormValues = {
  categoryId?: string;
  name?: string;
  attributes?: Record<string, string | number | null | undefined>;
  priceTwd?: number | null;
  highlights?: string[];
  features?: string[];
  specs?: { label?: string; value?: string }[];
  specNote?: string;
  sourceName?: string;
  sourceContact?: string;
};

export const filled = (v: unknown): v is string | number =>
  (typeof v === "string" && v.trim() !== "") || (typeof v === "number" && !Number.isNaN(v));

// Attribute values the current category knows; anything else would be rejected by the server.
export const attrsFor = (config: FormAttr[], values: FormValues["attributes"] = {}) =>
  Object.fromEntries(
    config.flatMap((a) =>
      filled(values[a.key]) ? [[a.key, values[a.key] as string | number]] : [],
    ),
  );

const sectionTitle = (text: string, extra?: ReactNode) =>
  extra ? (
    <Flex gap={8} align="center">
      {text}
      {extra}
    </Flex>
  ) : (
    text
  );

// Kept no taller than the label line so tagged and untagged fields stay aligned side by side.
const publishTag = <Tag style={{ lineHeight: "16px" }}>{e.publishRequired}</Tag>;

// Form.Item injects id / value / onChange into its direct child; pass them through.
type Injected = { id?: string; value?: unknown; onChange?: (v: unknown) => void };

function AttrInput({ a, ...field }: { a: FormAttr } & Injected) {
  const bound = field as Record<string, never>;
  switch (a.type) {
    case "TEXT":
      return <Input {...bound} maxLength={a.maxLength ?? TEXT_MAX_DEFAULT} suffix={a.unit} />;
    case "NUMBER":
      return <InputNumber {...bound} min={0} style={{ width: "100%" }} suffix={a.unit} />;
    case "YEAR":
      return (
        <InputNumber {...bound} precision={0} style={{ width: "100%" }} placeholder="例：2019" />
      );
    case "SELECT":
      return (
        <Select
          {...bound}
          allowClear
          placeholder="請選擇"
          options={(a.options ?? []).map((o) => ({ value: o, label: o }))}
        />
      );
  }
}

export function ProductFields({
  form,
  values,
  config,
  labelOf,
  categories,
  imageCount,
  onEdit,
}: {
  form: FormInstance<FormValues>;
  values: FormValues;
  config: FormAttr[] | undefined;
  labelOf: (key: string) => string;
  categories: { id: string; name: string }[];
  imageCount: number;
  onEdit: () => void; // programmatic changes (paste) don't fire the form's onValuesChange
}) {
  const { token } = theme.useToken();
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const parsed = parseSpecs(pasteText);

  const attrs = attrsFor(config ?? [], values.attributes);
  const dropped = Object.entries(values.attributes ?? {})
    .filter(([k, v]) => filled(v) && !(config ?? []).some((a) => a.key === k))
    .map(([k]) => labelOf(k));
  const title = titleOf(config ?? [], attrs);

  const applyPaste = () => {
    form.setFieldValue("specs", [...(form.getFieldValue("specs") ?? []), ...parsed.rows]);
    if (parsed.leftovers.length) {
      const note: string = form.getFieldValue("specNote") ?? "";
      form.setFieldValue("specNote", [note, ...parsed.leftovers].filter(Boolean).join("\n"));
    }
    onEdit();
    setPasteText("");
    setPasteOpen(false);
  };

  return (
    <Flex vertical gap={16}>
      <Card title={e.categoryCard} variant="outlined" styles={card}>
        <Form.Item label={e.category} name="categoryId" style={{ maxWidth: 360 }}>
          <Select
            showSearch={{ optionFilterProp: "label" }}
            placeholder={e.categoryPlaceholder}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
        </Form.Item>
      </Card>

      <Card title={e.sections.images} variant="outlined" styles={card}>
        <Flex vertical gap={8}>
          <Typography.Text>{e.imageCount(imageCount)}</Typography.Text>
          <Flex gap={6} align="start" style={{ color: token.colorTextSecondary }}>
            <InfoCircleOutlined aria-hidden style={{ paddingBlockStart: 5 }} />
            <span>{e.imagePending}</span>
          </Flex>
        </Flex>
      </Card>

      <Card title={e.basicCard} variant="outlined" styles={card}>
        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item label={sectionTitle(e.name, publishTag)} name="name">
              <Input maxLength={160} placeholder={e.namePlaceholder} />
            </Form.Item>
          </Col>
          {config?.map((a) => (
            <Col xs={24} md={12} key={a.key}>
              <Form.Item
                label={sectionTitle(a.label, a.required && publishTag)}
                name={["attributes", a.key]}
              >
                <AttrInput a={a} />
              </Form.Item>
            </Col>
          ))}
        </Row>
        <Flex vertical gap={12}>
          {!config && <Typography.Text type="secondary">{e.pickCategoryFirst}</Typography.Text>}
          {config?.length === 0 && (
            <Typography.Text type="secondary">{e.noAttributes}</Typography.Text>
          )}
          {dropped.length > 0 && (
            <Alert type="warning" showIcon title={e.droppedAttrs(dropped.join("、"))} />
          )}
          <Flex
            vertical
            gap={4}
            role="region"
            aria-label={e.titlePreview}
            style={{
              background: token.colorBgLayout,
              padding: 12,
              borderRadius: token.borderRadius,
            }}
          >
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {e.titlePreview}
            </Typography.Text>
            <Typography.Text strong data-testid="title-preview">
              {title || "—"}
            </Typography.Text>
            <Typography.Text>{values.name?.trim() || "—"}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {e.titleHelp}
            </Typography.Text>
          </Flex>
        </Flex>
      </Card>

      <Card title={e.sections.highlights} variant="outlined" styles={card}>
        <Flex vertical gap={12}>
          <Typography.Text type="secondary">{e.highlightsHelp}</Typography.Text>
          <LineList
            name="highlights"
            section={e.sections.highlights}
            placeholder="例：主機含兩支探頭"
          />
        </Flex>
      </Card>

      <Card
        title={e.sections.specs}
        variant="outlined"
        styles={card}
        extra={
          <Button icon={<SnippetsOutlined />} onClick={() => setPasteOpen(true)}>
            {e.pasteSpecs}
          </Button>
        }
      >
        <Flex vertical gap={16}>
          <SpecList />
          <Form.Item label={e.specNote} name="specNote" extra={e.specNoteHelp}>
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 10 }} maxLength={5000} />
          </Form.Item>
        </Flex>
      </Card>

      <Card title={e.featuresCard} variant="outlined" styles={card}>
        <Flex vertical gap={12}>
          <Typography.Text type="secondary">{e.featuresHelp}</Typography.Text>
          <LineList
            name="features"
            section={e.featuresCard}
            placeholder="例：DICOM 3.0 connectivity"
          />
        </Flex>
      </Card>

      <Card title={e.pricingCard} variant="outlined" styles={card}>
        <Form.Item
          label={e.price}
          name="priceTwd"
          extra={filled(values.priceTwd) ? e.priceHelp : e.priceAsk}
          style={{ maxWidth: 360 }}
        >
          <InputNumber<number>
            min={0}
            max={PRICE_MAX}
            precision={0}
            step={1000}
            style={{ width: "100%" }}
            prefix="NT$"
            // thousands separators; the default parser strips them again
            formatter={(v) => `${v ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          />
        </Form.Item>
      </Card>

      <Card
        title={sectionTitle(e.sections.source, <Tag icon={<EyeOutlined />}>{e.adminOnly}</Tag>)}
        variant="outlined"
        styles={card}
      >
        <Flex vertical gap={16}>
          <Typography.Text type="secondary">{e.sourceHint}</Typography.Text>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label={e.sourceName} name="sourceName">
                <Input maxLength={100} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={e.sourceContact} name="sourceContact">
                <Input maxLength={200} />
              </Form.Item>
            </Col>
          </Row>
        </Flex>
      </Card>

      <Modal
        open={pasteOpen}
        title={e.pasteTitle}
        onCancel={() => setPasteOpen(false)}
        okText={e.pasteApply}
        cancelText={e.cancel}
        okButtonProps={{ disabled: parsed.rows.length === 0 && parsed.leftovers.length === 0 }}
        onOk={applyPaste}
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
            <Alert type="info" showIcon title={e.pasteLeftovers(parsed.leftovers.length)} />
          )}
        </Flex>
      </Modal>
    </Flex>
  );
}

const tight = { components: { Form: { itemMarginBottom: 0 } } };

function LineList({
  name,
  section,
  placeholder,
}: {
  name: "highlights" | "features";
  section: string;
  placeholder: string;
}) {
  return (
    <ConfigProvider theme={tight}>
      <Form.List name={name}>
        {(fields, { add, remove }) => (
          <Flex vertical gap={8}>
            {fields.map((f, i) => (
              <Flex key={f.key} gap={8} align="start">
                <Form.Item name={f.name} style={{ flex: 1 }}>
                  <Input
                    placeholder={i === 0 ? placeholder : undefined}
                    aria-label={e.lineLabel(section, i + 1)}
                    maxLength={200}
                  />
                </Form.Item>
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  aria-label={`${e.removeLine}（${e.lineLabel(section, i + 1)}）`}
                  onClick={() => remove(f.name)}
                />
              </Flex>
            ))}
            <Button type="dashed" icon={<PlusOutlined />} onClick={() => add("")}>
              {e.addLine}
            </Button>
          </Flex>
        )}
      </Form.List>
    </ConfigProvider>
  );
}

function SpecList() {
  return (
    <ConfigProvider theme={tight}>
      <Form.List name="specs">
        {(fields, { add, remove }) => (
          <Flex vertical gap={8}>
            {fields.map((f, i) => (
              <Flex key={f.key} gap={8} align="start">
                <Form.Item name={[f.name, "label"]} style={{ flex: "0 0 32%" }}>
                  <Input
                    placeholder={e.specLabel}
                    aria-label={`${e.specLabel}（第 ${i + 1} 行）`}
                    maxLength={80}
                  />
                </Form.Item>
                <Form.Item name={[f.name, "value"]} style={{ flex: 1, minWidth: 0 }}>
                  <Input
                    placeholder={e.specValue}
                    aria-label={`${e.specValue}（第 ${i + 1} 行）`}
                    maxLength={500}
                  />
                </Form.Item>
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  aria-label={`${e.removeLine}（規格第 ${i + 1} 行）`}
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
  );
}
