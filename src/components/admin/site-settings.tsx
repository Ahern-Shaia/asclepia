"use client";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Flex,
  Form,
  type FormInstance,
  Input,
  Modal,
  Row,
  Select,
  Tabs,
  theme,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { adminCopy } from "@/copy/admin";
import {
  restoreSettingsAction,
  saveNotesAction,
  saveProfileAction,
} from "@/modules/site-config/actions";
import type { NotesInput, ProfileInput, SettingsSection } from "@/modules/site-config/admin-input";
import { NOTE_LIMITS as N, SERVICE_KINDS, type SiteNotes } from "@/modules/site-config/notes";
import { PROFILE_LIMITS as P } from "@/modules/site-config/profile";
import type { Result } from "@/server/action";
import { call, type Failure, FailureAlert, fieldErrorsFor } from "./action-result";
import styles from "./admin.module.css";

const s = adminCopy.settings;
const live = s.live;
const n = s.notes;
const pf = s.profile;

type Meta = {
  version: number;
  savedAt: string | null;
  savedBy: string | null;
  canRestore: boolean;
};
export type SettingsData = {
  profile: Meta & { value: ProfileInput };
  notes: Meta & { value: SiteNotes };
};

// 站台設定 (site-config.md §4.2, §4.5-bis): one tab per SiteConfig section, each saved on its own
// and live as soon as it is saved. Theme, home sections and images come later (shown in the intro).
export function SiteSettings({ data }: { data: SettingsData }) {
  const { token } = theme.useToken();
  const [warnings, setWarnings] = useState<string[]>([]);
  const tabs: { key: string; label: string; body: ReactNode }[] = [
    {
      key: "profile",
      label: live.tabs.profile,
      body: <ProfileTab key={data.profile.version} meta={data.profile} onSaved={setWarnings} />,
    },
    {
      key: "notes",
      label: live.tabs.notes,
      body: <NotesTab key={data.notes.version} meta={data.notes} onSaved={setWarnings} />,
    },
  ];
  return (
    <Flex vertical gap={16}>
      <Typography.Title level={1} style={{ fontSize: token.fontSizeHeading3 }}>
        {s.title}
      </Typography.Title>
      <Typography.Text type="secondary">{live.intro}</Typography.Text>
      {warnings.length > 0 && (
        <Alert
          type="warning"
          showIcon
          closable={{ onClose: () => setWarnings([]) }}
          title={warnings.join(" ")}
        />
      )}
      <Tabs
        onChange={() => setWarnings([])}
        items={tabs.map((t) => ({
          key: t.key,
          label: t.label,
          children: (
            <Flex
              vertical
              gap={24}
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadiusLG,
                padding: 16,
              }}
            >
              {t.body}
            </Flex>
          ),
        }))}
      />
    </Flex>
  );
}

// Save + restore for one section. `save` returns the action's Result; field errors go back onto the
// form, everything else is one sentence above the buttons.
function useSection<V>(
  section: SettingsSection,
  tab: string,
  meta: Meta,
  form: FormInstance,
  onSaved: (warnings: string[]) => void,
) {
  const { token } = theme.useToken();
  const router = useRouter();
  const { message } = App.useApp();
  const [modal, modalHolder] = Modal.useModal();
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);

  const done = (r: Result<unknown>, okText: string) => {
    if (!r.ok) {
      const { fields, rest } = fieldErrorsFor(
        r.fieldErrors,
        (name) => form.getFieldInstance(name) != null,
        "value.",
      );
      form.setFields(fields);
      setFailure(
        fields.length && !rest.length ? null : { ...r, detail: [...(r.detail ?? []), ...rest] },
      );
      return;
    }
    setFailure(null);
    onSaved(r.warnings ?? []);
    message.success(okText);
    router.refresh();
  };

  const save = async (
    value: V,
    action: (input: { value: V; expectedVersion: number }) => Promise<Result<unknown>>,
  ) => {
    setBusy(true);
    const r = await call(action, { value, expectedVersion: meta.version });
    setBusy(false);
    done(r, s.footer.saved);
  };

  const restore = () =>
    modal.confirm({
      title: s.footer.restoreTitle,
      content: (
        <Flex vertical gap={4}>
          {live.restoreBody(tab).map((line) => (
            <Typography.Text key={line}>{line}</Typography.Text>
          ))}
        </Flex>
      ),
      okText: s.footer.restoreOk,
      cancelText: s.footer.cancel,
      onOk: async () => {
        const r = await call(restoreSettingsAction, { section, expectedVersion: meta.version });
        done(r, s.footer.restored);
      },
    });

  const bar = (
    <Flex
      vertical
      gap={12}
      style={{ borderBlockStart: `1px solid ${token.colorBorder}`, paddingBlockStart: 16 }}
    >
      {modalHolder}
      {failure && <FailureAlert failure={failure} />}
      <Flex gap={12} align="center" wrap>
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={busy}>
          {s.footer.save}
        </Button>
        {meta.canRestore && (
          <Button icon={<UndoOutlined />} onClick={restore}>
            {s.footer.restore}
          </Button>
        )}
        <Typography.Text type="secondary">
          {dirty
            ? live.unsaved
            : meta.savedAt
              ? s.footer.lastSaved(meta.savedAt, meta.savedBy ?? "")
              : live.neverSaved}
        </Typography.Text>
      </Flex>
    </Flex>
  );
  return { save, bar, markDirty: () => setDirty(true) };
}

function ProfileTab({
  meta,
  onSaved,
}: {
  meta: SettingsData["profile"];
  onSaved: (w: string[]) => void;
}) {
  const [form] = Form.useForm<ProfileInput>();
  const { save, bar, markDirty } = useSection<ProfileInput>(
    "PROFILE",
    live.tabs.profile,
    meta,
    form,
    onSaved,
  );
  const req = (label: string) => [
    { required: true, whitespace: true, message: pf.required(label) },
  ];
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={meta.value}
      requiredMark="optional"
      onValuesChange={markDirty}
      onFinish={(v) => save(v, saveProfileAction)}
    >
      <Flex vertical gap={8}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label={pf.name} name="name" rules={req(pf.name)}>
              <Input maxLength={P.name} showCount />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={pf.tagline} name="tagline" extra={pf.taglineHelp}>
              <Input maxLength={P.tagline} showCount />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={pf.phone} name="phone" extra={live.phoneHelp}>
              <Input type="tel" maxLength={P.phone} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={pf.email}
              name="email"
              rules={[{ type: "email", message: s.invalid.email }]}
            >
              <Input type="email" maxLength={P.email} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={pf.address} name="address" extra={live.addressHelp}>
              <Input maxLength={P.address} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={pf.hours} name="hours">
              <Input maxLength={P.hours} />
            </Form.Item>
          </Col>
        </Row>
        {bar}
      </Flex>
    </Form>
  );
}

// One editable list (Form.List): rows with move/remove, an add button that stops at the limit.
function ListEditor({
  name,
  label,
  help,
  max,
  blank,
  row,
}: {
  name: string;
  label: string;
  help: string;
  max: number;
  blank: unknown;
  row: (field: { name: number }, itemLabel: string) => ReactNode;
}) {
  return (
    <Card title={label} variant="outlined" size="small" styles={{ body: { padding: 16 } }}>
      <Flex vertical gap={12}>
        <Typography.Text type="secondary">{help}</Typography.Text>
        <Form.List name={name}>
          {(fields, { add, remove, move }) => (
            <Flex vertical gap={16}>
              {fields.map((field, i) => {
                const itemLabel = n.item(label, i + 1);
                return (
                  // narrow screens: the three buttons wrap under the field so it keeps the full width
                  <Flex key={field.key} gap={8} align="start" wrap>
                    <div className={styles.listField}>{row(field, itemLabel)}</div>
                    <Flex gap={8}>
                      <Button
                        type="text"
                        icon={<ArrowUpOutlined />}
                        aria-label={n.moveUp(itemLabel)}
                        disabled={i === 0}
                        onClick={() => move(i, i - 1)}
                      />
                      <Button
                        type="text"
                        icon={<ArrowDownOutlined />}
                        aria-label={n.moveDown(itemLabel)}
                        disabled={i === fields.length - 1}
                        onClick={() => move(i, i + 1)}
                      />
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        aria-label={n.remove(itemLabel)}
                        onClick={() => remove(i)}
                      />
                    </Flex>
                  </Flex>
                );
              })}
              <Flex gap={12} align="center" wrap>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  disabled={fields.length >= max}
                  onClick={() => add(blank)}
                  aria-label={`${label}：${n.add}`}
                >
                  {n.add}
                </Button>
                {fields.length >= max && (
                  <Typography.Text type="secondary">{n.full(max)}</Typography.Text>
                )}
              </Flex>
            </Flex>
          )}
        </Form.List>
      </Flex>
    </Card>
  );
}

function NotesTab({
  meta,
  onSaved,
}: {
  meta: SettingsData["notes"];
  onSaved: (w: string[]) => void;
}) {
  const [form] = Form.useForm<NotesInput>();
  const { save, bar, markDirty } = useSection<NotesInput>(
    "COPY",
    live.tabs.notes,
    meta,
    form,
    onSaved,
  );
  const lineRule = (label: string) => [
    { required: true, whitespace: true, message: s.invalid.required(label) },
  ];
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={meta.value}
      onValuesChange={markDirty}
      onFinish={(v) =>
        save(
          {
            eyebrow: v.eyebrow ?? "",
            heroPoints: v.heroPoints ?? [],
            terms: v.terms ?? [],
            services: (v.services ?? []).map((x) => ({ ...x, body: x.body ?? "" })),
          },
          saveNotesAction,
        )
      }
    >
      <Flex vertical gap={16}>
        <Typography.Text type="secondary">{n.intro}</Typography.Text>
        <Form.Item label={n.eyebrow} name="eyebrow" extra={n.eyebrowHelp}>
          <Input maxLength={N.eyebrow} showCount style={{ maxInlineSize: 480 }} />
        </Form.Item>
        <ListEditor
          name="heroPoints"
          label={n.heroPoints}
          help={n.heroPointsHelp}
          max={N.heroPoints.count}
          blank=""
          row={(field, itemLabel) => (
            <Form.Item name={field.name} rules={lineRule(itemLabel)}>
              <Input aria-label={itemLabel} maxLength={N.heroPoints.length} showCount />
            </Form.Item>
          )}
        />
        <ListEditor
          name="terms"
          label={n.terms}
          help={n.termsHelp}
          max={N.terms.count}
          blank=""
          row={(field, itemLabel) => (
            <Form.Item name={field.name} rules={lineRule(itemLabel)}>
              <Input.TextArea
                aria-label={itemLabel}
                maxLength={N.terms.length}
                showCount
                autoSize={{ minRows: 1, maxRows: 4 }}
              />
            </Form.Item>
          )}
        />
        <ListEditor
          name="services"
          label={n.services}
          help={n.servicesHelp}
          max={N.services.count}
          blank={{ kind: "other", title: "", body: "" }}
          row={(field, itemLabel) => (
            <Flex gap={8} wrap>
              <Form.Item name={[field.name, "kind"]} label={n.kind} style={{ inlineSize: 110 }}>
                <Select
                  aria-label={`${itemLabel}${n.kind}`}
                  options={SERVICE_KINDS.map((k) => ({ value: k, label: n.kinds[k] }))}
                />
              </Form.Item>
              <Form.Item
                name={[field.name, "title"]}
                label={n.title}
                rules={lineRule(`${itemLabel}${n.title}`)}
                style={{ flex: "1 1 140px" }}
              >
                <Input aria-label={`${itemLabel}${n.title}`} maxLength={N.services.title} />
              </Form.Item>
              <Form.Item name={[field.name, "body"]} label={n.body} style={{ flex: "2 1 220px" }}>
                <Input aria-label={`${itemLabel}${n.body}`} maxLength={N.services.body} />
              </Form.Item>
            </Flex>
          )}
        />
        {bar}
      </Flex>
    </Form>
  );
}
