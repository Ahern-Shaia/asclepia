"use client";

import { DeleteOutlined } from "@ant-design/icons";
import {
  Alert,
  App,
  Breadcrumb,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Form,
  Modal,
  Row,
  theme,
  Typography,
} from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { adminCopy } from "@/copy/admin";
import {
  changeStatusAction,
  deleteDraftAction,
  saveProductAction,
} from "@/modules/catalog/actions";
import { call, type Failure, FailureAlert, fieldErrorsFor } from "./action-result";
import type { AttrValues, FormAttr, ProductStatus } from "./catalog-data";
import { LinkButton } from "./link-button";
import { attrsFor, type FormValues, ProductFields } from "./product-fields";
import { ProductStatusTag } from "./status";

const e = adminCopy.edit;

export type EditProduct = {
  id?: string;
  status: ProductStatus;
  categoryId?: string;
  name: string;
  attributes: AttrValues;
  priceTwd: number | null;
  highlights: string[];
  features: string[];
  specs: { label: string; value: string }[];
  specNote: string;
  sourceName: string;
  sourceContact: string;
  imageCount: number;
  updatedAt?: string; // ISO, the optimistic-lock version
  updatedAtText?: string;
};

type Props = {
  product: EditProduct;
  transitions: ProductStatus[];
  categories: { id: string; name: string }[];
  configs: Record<string, FormAttr[]>;
};

// `at` ties a conflict to the version it was raised against: once a reload brings a newer
// version, the conflict no longer applies and disappears on its own.
type Notice = { failure?: Failure; extra?: string[]; warnings?: string[]; at?: string };

// A notice that must survive the navigation from /new to /<id> after the first save.
const FLASH = "asclepia.admin.product-flash";
function putFlash(id: string, notice: Notice) {
  try {
    sessionStorage.setItem(FLASH, JSON.stringify({ id, notice }));
  } catch {}
}
function takeFlash(id: string): Notice | undefined {
  try {
    const raw = sessionStorage.getItem(FLASH);
    if (!raw) return undefined;
    sessionStorage.removeItem(FLASH);
    const f = JSON.parse(raw) as { id: string; notice: Notice };
    return f.id === id ? f.notice : undefined;
  } catch {
    return undefined;
  }
}

export function ProductMissing() {
  return (
    <Empty description={e.notFound}>
      <LinkButton href="/admin/products">{e.backToList}</LinkButton>
    </Empty>
  );
}

export function ProductEditor(props: Props) {
  const { token } = theme.useToken();
  const { product, categories } = props;
  const [notice, setNotice] = useState<Notice>({});
  useEffect(() => {
    const flash = product.id ? takeFlash(product.id) : undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage exists only after mount
    if (flash) setNotice(flash);
  }, [product.id]);

  const heading = product.id ? e.titleEdit : e.titleNew;
  return (
    <Flex vertical gap={16}>
      <Breadcrumb
        items={[
          { title: <Link href="/admin/products">{adminCopy.products.title}</Link> },
          { title: heading },
        ]}
      />
      <Typography.Title level={1} style={{ fontSize: token.fontSizeHeading3 }}>
        {heading}
      </Typography.Title>
      {categories.length === 0 ? (
        <Empty description={e.needCategory}>
          <LinkButton href="/admin/categories" type="primary">
            {adminCopy.products.goCategories}
          </LinkButton>
        </Empty>
      ) : (
        // Remounts with fresh values whenever the server hands over a newer version (after a save,
        // a status change or 重新載入), so the form always starts from what is stored.
        <ProductForm
          key={product.updatedAt ?? "new"}
          {...props}
          notice={notice}
          setNotice={setNotice}
        />
      )}
    </Flex>
  );
}

function ProductForm({
  product,
  transitions,
  categories,
  configs,
  notice,
  setNotice,
}: Props & { notice: Notice; setNotice: (n: Notice) => void }) {
  const { token } = theme.useToken();
  const router = useRouter();
  const { message } = App.useApp();
  const [modal, modalHolder] = Modal.useModal();
  const [form] = Form.useForm<FormValues>();
  const values: FormValues = Form.useWatch([], { form, preserve: true }) ?? {};
  const [busy, setBusy] = useState<string>();
  const [dirty, setDirty] = useState(false);
  const [version, setVersion] = useState(product.updatedAt);
  const isNew = !product.id;
  const draft = product.status === "DRAFT";

  const categoryId = values.categoryId ?? product.categoryId;
  const config = categoryId ? (configs[categoryId] ?? []) : undefined;
  const labelOf = (key: string) =>
    Object.values(configs)
      .flat()
      .find((a) => a.key === key)?.label ?? key;

  const known = (name: (string | number)[]) => {
    const [top, sub] = name;
    if (top === "attributes") return !!config?.some((a) => a.key === sub);
    if (top === "highlights" || top === "features" || top === "specs")
      return typeof sub === "number" && sub < (form.getFieldValue(top)?.length ?? 0);
    return ["categoryId", "name", "priceTwd", "specNote", "sourceName", "sourceContact"].includes(
      String(top),
    );
  };

  const fail = (failure: Failure) => {
    const { fields, rest } = fieldErrorsFor(failure.fieldErrors, known);
    if (fields.length) {
      form.setFields(fields as Parameters<typeof form.setFields>[0]);
      form.scrollToField(fields[0].name, { block: "center" });
    }
    setNotice({ failure, extra: rest, at: product.updatedAt });
  };

  const inputOf = (v: FormValues) => ({
    categoryId: v.categoryId ?? "",
    name: v.name ?? "",
    attributes: attrsFor(config ?? [], v.attributes),
    priceTwd: v.priceTwd ?? null,
    highlights: v.highlights ?? [],
    features: v.features ?? [],
    specs: (v.specs ?? []).map((s) => ({ label: s?.label ?? "", value: s?.value ?? "" })),
    specNote: v.specNote ?? "",
    sourceName: v.sourceName ?? "",
    sourceContact: v.sourceContact ?? "",
  });

  // Returns the saved product's id and version, or null after showing why it failed.
  const save = async () => {
    const r = await call(saveProductAction, {
      id: product.id,
      expectedUpdatedAt: product.id ? version : undefined,
      input: inputOf(form.getFieldsValue(true)),
    });
    if (!r.ok) {
      fail(r);
      return null;
    }
    setVersion(r.data.updatedAt);
    setDirty(false);
    return { ...r.data, warnings: r.warnings ?? [] };
  };

  const run = async (label: string, work: () => Promise<void>) => {
    setBusy(label);
    setNotice({});
    try {
      await work();
    } finally {
      setBusy(undefined);
    }
  };

  const onSave = () =>
    run("save", async () => {
      const r = await save();
      if (!r) return;
      if (isNew) {
        putFlash(r.id, { warnings: r.warnings });
        message.success(e.created);
        router.replace(`/admin/products/${r.id}`);
        return;
      }
      setNotice({ warnings: r.warnings });
      message.success(e.saved);
      router.refresh();
    });

  const onTransition = (to: ProductStatus) =>
    run(to, async () => {
      // Publishing a draft always saves first: what goes live is what is on screen. Other changes
      // save first only when the form has edits, so a status change never drops them.
      let id = product.id;
      let at = version;
      let warnings: string[] = [];
      if (isNew || dirty || to === "PUBLISHED") {
        const r = await save();
        if (!r) return;
        ({ id, updatedAt: at, warnings } = r);
      }
      const s = await call(changeStatusAction, { id, to, expectedUpdatedAt: at });
      if (isNew && id) {
        putFlash(id, s.ok ? { warnings } : { failure: s, warnings });
        if (s.ok) message.success(e.statusChanged(adminCopy.status[to]));
        router.replace(`/admin/products/${id}`);
        return;
      }
      if (!s.ok) {
        setNotice({ failure: s, warnings, at: product.updatedAt });
        router.refresh(); // a save may have succeeded before the status change failed
        return;
      }
      setNotice({ warnings });
      message.success(e.statusChanged(adminCopy.status[to]));
      router.refresh();
    });

  const onDelete = () =>
    modal.confirm({
      title: e.deleteTitle,
      content: (
        <Flex vertical gap={4}>
          {e.deleteBody.map((line) => (
            <Typography.Text key={line}>{line}</Typography.Text>
          ))}
        </Flex>
      ),
      okText: e.deleteOk,
      okButtonProps: { danger: true },
      cancelText: e.cancel,
      onOk: async () => {
        const r = await call(deleteDraftAction, { id: product.id });
        if (!r.ok) return setNotice({ failure: r, at: product.updatedAt });
        message.success(e.deleted);
        router.replace("/admin/products");
      },
    });

  const showFailure =
    notice.failure && (notice.failure.code !== "CONFLICT" || notice.at === product.updatedAt);
  const transitionLabel = (to: ProductStatus) =>
    to === "PUBLISHED" && !draft ? e.republish : e.transitions[to as keyof typeof e.transitions];

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark={false}
      onValuesChange={() => setDirty(true)}
      initialValues={{
        ...product,
        highlights: product.highlights.length ? product.highlights : [""],
        features: product.features.length ? product.features : [""],
      }}
    >
      {modalHolder}
      <Row gutter={[24, 24]} align="top">
        <Col xs={24} lg={16}>
          <ProductFields
            form={form}
            values={values}
            config={config}
            labelOf={labelOf}
            categories={categories}
            imageCount={product.imageCount}
            onEdit={() => setDirty(true)}
          />
        </Col>
        <Col xs={24} lg={8}>
          <div style={{ position: "sticky", top: 16 }}>
            <Card title={e.statusCard} variant="outlined" styles={{ body: { padding: 20 } }}>
              <Flex vertical gap={16}>
                <Flex justify="space-between" align="center">
                  <Typography.Text type="secondary">{e.current}</Typography.Text>
                  <ProductStatusTag status={product.status} />
                </Flex>
                <Typography.Text type="secondary">
                  {draft ? e.publishNeeds : e.liveNote}
                </Typography.Text>
                {showFailure && notice.failure && (
                  <FailureAlert failure={notice.failure} extra={notice.extra} />
                )}
                {notice.warnings?.map((w) => (
                  <Alert key={w} type="warning" showIcon title={w} />
                ))}
                <Flex gap={8} wrap>
                  <Button
                    type={draft ? "default" : "primary"}
                    loading={busy === "save"}
                    disabled={!!busy && busy !== "save"}
                    onClick={onSave}
                    style={{ flex: 1 }}
                  >
                    {draft ? e.saveDraft : e.save}
                  </Button>
                  {transitions.map((to) => (
                    <Button
                      key={to}
                      type={draft && to === "PUBLISHED" ? "primary" : "default"}
                      loading={busy === to}
                      disabled={!!busy && busy !== to}
                      onClick={() => onTransition(to)}
                      style={{ flex: 1 }}
                    >
                      {transitionLabel(to)}
                    </Button>
                  ))}
                </Flex>
                {dirty && !draft && (
                  <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                    {e.unsavedFirst}
                  </Typography.Text>
                )}
                {draft && product.id && (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={onDelete}
                    disabled={!!busy}
                    style={{ alignSelf: "flex-start" }}
                  >
                    {e.deleteDraft}
                  </Button>
                )}
                {product.updatedAtText && (
                  <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                    {e.lastUpdated(product.updatedAtText)}
                  </Typography.Text>
                )}
              </Flex>
            </Card>
          </div>
        </Col>
      </Row>
    </Form>
  );
}
