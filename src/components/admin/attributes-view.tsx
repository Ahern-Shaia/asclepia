"use client";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Drawer,
  Flex,
  Form,
  Grid,
  Input,
  message,
  Modal,
  Row,
  Select,
  Table,
  Tag,
  theme,
  Tooltip,
  Typography,
} from "antd";
import { useState } from "react";
import { formatTwd } from "@/components/catalog/format";
import {
  type AttrDef,
  type Attrs,
  type AttrType,
  type CategoryAttr,
  cardMeta,
  nameplateRows,
  titleOf,
} from "@/components/shop/attrs";
import { adminCopy } from "@/copy/admin";

const a = adminCopy.attributes;
const KEY_RE = /^[a-z][a-z0-9_]{0,31}$/;
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
const TYPES: AttrType[] = ["TEXT", "NUMBER", "YEAR", "SELECT"];
const FLAGS = ["required", "inTitle", "onCard", "inNameplate", "filterable"] as const;
type Flag = (typeof FLAGS)[number];

export type LibraryDef = AttrDef & {
  usedBy: number;
  // option value → titles of the products that use it (deleting an in-use option is blocked)
  optionUse: Record<string, string[]>;
};
export type Sample = { name: string; attrs: Attrs; priceTwd?: number };
type FlagRow = { key: string; used: boolean } & Record<Flag, boolean>;

const toRows = (config: CategoryAttr[]): FlagRow[] =>
  config.map((c) => ({
    key: c.key,
    used: true,
    required: c.required,
    inTitle: c.inTitle,
    onCard: c.onCard,
    inNameplate: c.inNameplate,
    filterable: c.filterable,
  }));
const unused = (key: string): FlagRow => ({
  key,
  used: false,
  required: false,
  inTitle: false,
  onCard: false,
  inNameplate: false,
  filterable: false,
});

export function AttributesView({
  defs: initialDefs,
  categories,
  configs,
  samples,
}: {
  defs: LibraryDef[];
  categories: { id: string; name: string }[];
  configs: Record<string, CategoryAttr[]>;
  samples: Record<string, Sample>;
}) {
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const [msg, msgHolder] = message.useMessage();
  const [modal, modalHolder] = Modal.useModal();
  const [defs, setDefs] = useState(initialDefs);
  const [rowsByCat, setRowsByCat] = useState(() =>
    Object.fromEntries(categories.map((c) => [c.id, toRows(configs[c.id] ?? [])])),
  );
  const [cat, setCat] = useState(categories[0].id);
  const [editing, setEditing] = useState<LibraryDef | "new">();
  const [form] = Form.useForm<AttrDef>();
  const [formType, setFormType] = useState<AttrType>("TEXT");
  const [session, setSession] = useState(0);

  const defOf = (key: string) => defs.find((d) => d.key === key)!;
  // Rows for the chosen category: its saved order, then library fields it doesn't use yet.
  const known = (rowsByCat[cat] ?? []).filter((r) => defs.some((d) => d.key === r.key));
  const rows = [
    ...known,
    ...defs.filter((d) => !known.some((r) => r.key === d.key)).map((d) => unused(d.key)),
  ];
  const setRows = (next: FlagRow[]) => setRowsByCat((s) => ({ ...s, [cat]: next }));
  const update = (key: string, patch: Partial<FlagRow>) =>
    setRows(
      rows.map((r) => {
        if (r.key !== key) return r;
        // Unticking 使用 clears the flags so a re-tick starts clean.
        return patch.used === false ? unused(key) : { ...r, ...patch };
      }),
    );
  const move = (i: number, d: -1 | 1) => {
    const next = [...rows];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setRows(next);
  };
  const config: CategoryAttr[] = rows
    .filter((r) => r.used)
    .map((r) => ({
      ...defOf(r.key),
      required: r.required,
      inTitle: r.inTitle,
      onCard: r.onCard,
      inNameplate: r.inNameplate,
      filterable: r.filterable,
    }));
  const catName = categories.find((c) => c.id === cat)!.name;
  const sample = samples[cat];

  // The drawer's form remounts per open (keyed), so initial values need no imperative reset.
  const openEditor = (d: LibraryDef | "new") => {
    setEditing(d);
    setSession((n) => n + 1);
    setFormType(d === "new" ? "TEXT" : d.type);
  };
  const closeEditor = () => setEditing(undefined);
  const submit = (v: AttrDef) => {
    if (editing === "new") {
      setDefs((s) => [...s, { ...v, usedBy: 0, optionUse: {} }]);
      msg.success(a.drawer.created(v.label));
    } else if (editing) {
      setDefs((s) => s.map((d) => (d.key === editing.key ? { ...d, ...v, key: d.key } : d)));
      msg.success(a.drawer.saved(v.label));
    }
    closeEditor();
  };
  const remove = (d: LibraryDef) =>
    modal.confirm({
      title: a.deleteTitle(d.label),
      content: (
        <Flex vertical gap={4}>
          {a.deleteBody.map((line) => (
            <Typography.Text key={line}>{line}</Typography.Text>
          ))}
        </Flex>
      ),
      okText: a.deleteOk,
      okButtonProps: { danger: true },
      cancelText: a.cancel,
      onOk: () => {
        setDefs((s) => s.filter((x) => x.key !== d.key));
        msg.success(a.deleted(d.label));
      },
    });

  const editingDef = editing && editing !== "new" ? editing : undefined;
  const flagCell = (r: FlagRow, flag: Flag) => {
    const def = defOf(r.key);
    const label = a.flagLabel(def.label, a.flags[flag]);
    const textFilter = flag === "filterable" && def.type === "TEXT";
    const box = (
      <Checkbox
        aria-label={label}
        checked={r[flag]}
        disabled={!r.used || textFilter}
        onChange={(e) => update(r.key, { [flag]: e.target.checked })}
      />
    );
    if (textFilter)
      return (
        <Tooltip title={a.filterTextBlocked}>
          <span>{box}</span>
        </Tooltip>
      );
    return r.used ? box : <Tooltip title={a.unusedHint}>{box}</Tooltip>;
  };

  return (
    <Flex vertical gap={24}>
      {msgHolder}
      {modalHolder}
      <Flex vertical gap={8}>
        <Typography.Title level={1} style={{ fontSize: token.fontSizeHeading3 }}>
          {a.title}
        </Typography.Title>
        <Typography.Text type="secondary">{a.intro}</Typography.Text>
      </Flex>

      <Card
        title={
          <Typography.Title level={2} style={{ fontSize: token.fontSizeHeading4 }}>
            {a.library}
          </Typography.Title>
        }
        variant="outlined"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor("new")}>
            {a.create}
          </Button>
        }
      >
        <Flex vertical gap={12}>
          <Typography.Text type="secondary">{a.libraryHelp}</Typography.Text>
          <Table<LibraryDef>
            rowKey="key"
            size="small"
            pagination={false}
            dataSource={defs}
            scroll={{ x: 880 }}
            columns={[
              { title: a.columns.label, dataIndex: "label", width: 150 },
              {
                title: (
                  <Flex vertical>
                    {a.columns.key}
                    <Typography.Text type="secondary" style={{ fontWeight: 400 }}>
                      {a.columns.keyNote}
                    </Typography.Text>
                  </Flex>
                ),
                dataIndex: "key",
                width: 150,
                render: (k: string) => <span style={{ fontFamily: MONO }}>{k}</span>,
              },
              {
                title: a.columns.type,
                dataIndex: "type",
                width: 72,
                render: (t: AttrType) => a.types[t],
              },
              {
                title: a.columns.options,
                dataIndex: "options",
                render: (opts?: string[]) =>
                  opts?.length ? (
                    <Flex gap={4} wrap>
                      {opts.slice(0, 4).map((o) => (
                        <Tag key={o}>{o}</Tag>
                      ))}
                      {opts.length > 4 && <Tag>{a.moreOptions(opts.length - 4)}</Tag>}
                    </Flex>
                  ) : (
                    "—"
                  ),
              },
              {
                title: a.columns.unit,
                dataIndex: "unit",
                width: 64,
                render: (u?: string) => u || "—",
              },
              {
                title: a.columns.usedBy,
                dataIndex: "usedBy",
                width: 96,
                align: "right",
                render: (n: number) => a.usedBy(n),
              },
              {
                title: a.columns.actions,
                key: "actions",
                width: 180,
                render: (_: unknown, d) => {
                  const del = (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      disabled={d.usedBy > 0}
                      onClick={() => remove(d)}
                      aria-label={a.deleteLabel(d.label)}
                    >
                      {a.delete}
                    </Button>
                  );
                  return (
                    <Flex gap={4}>
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => openEditor(d)}
                        aria-label={a.editLabel(d.label)}
                      >
                        {a.edit}
                      </Button>
                      {d.usedBy > 0 ? (
                        <Tooltip title={a.deleteBlocked(d.usedBy)}>
                          <span>{del}</span>
                        </Tooltip>
                      ) : (
                        del
                      )}
                    </Flex>
                  );
                },
              },
            ]}
          />
        </Flex>
      </Card>

      <Card
        title={
          <Typography.Title level={2} style={{ fontSize: token.fontSizeHeading4 }}>
            {a.perCategory}
          </Typography.Title>
        }
        variant="outlined"
      >
        <Flex vertical gap={16}>
          <Typography.Text type="secondary">{a.perCategoryHelp}</Typography.Text>
          <Flex gap={8} align="center">
            <label htmlFor="attr-category">{a.category}</label>
            <Select
              id="attr-category"
              value={cat}
              onChange={setCat}
              style={{ minInlineSize: 200 }}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Flex>
          <Row gutter={[24, 24]}>
            <Col xs={24} xl={16}>
              <Table<FlagRow>
                rowKey="key"
                size="small"
                pagination={false}
                dataSource={rows}
                scroll={{ x: 720 }}
                aria-label={`${catName} ${a.perCategory}`}
                columns={[
                  {
                    title: a.order,
                    key: "order",
                    width: 80,
                    render: (_: unknown, r, i) => {
                      const name = defOf(r.key).label;
                      return (
                        <Flex>
                          <Button
                            size="small"
                            type="text"
                            icon={<ArrowUpOutlined />}
                            aria-label={a.moveUp(name)}
                            disabled={i === 0}
                            onClick={() => move(i, -1)}
                          />
                          <Button
                            size="small"
                            type="text"
                            icon={<ArrowDownOutlined />}
                            aria-label={a.moveDown(name)}
                            disabled={i === rows.length - 1}
                            onClick={() => move(i, 1)}
                          />
                        </Flex>
                      );
                    },
                  },
                  {
                    title: a.field,
                    key: "field",
                    width: 140,
                    render: (_: unknown, r) => {
                      const d = defOf(r.key);
                      return (
                        <Flex vertical>
                          <Typography.Text strong={r.used} type={r.used ? undefined : "secondary"}>
                            {d.label}
                          </Typography.Text>
                          <Typography.Text type="secondary">{a.types[d.type]}</Typography.Text>
                        </Flex>
                      );
                    },
                  },
                  {
                    title: a.flags.used,
                    key: "used",
                    align: "center",
                    render: (_: unknown, r) => (
                      <Checkbox
                        aria-label={a.flagLabel(defOf(r.key).label, a.flags.used)}
                        checked={r.used}
                        onChange={(e) => update(r.key, { used: e.target.checked })}
                      />
                    ),
                  },
                  ...FLAGS.map((flag) => ({
                    title: a.flags[flag],
                    key: flag,
                    align: "center" as const,
                    render: (_: unknown, r: FlagRow) => flagCell(r, flag),
                  })),
                ]}
              />
            </Col>
            <Col xs={24} xl={8}>
              <Flex vertical gap={12} aria-label={a.preview} role="region">
                <Flex vertical gap={2}>
                  <Typography.Text strong>{a.preview}</Typography.Text>
                  {sample && (
                    <Typography.Text type="secondary">{a.previewHelp(sample.name)}</Typography.Text>
                  )}
                </Flex>
                {sample && <Preview config={config} sample={sample} catName={catName} />}
              </Flex>
            </Col>
          </Row>
          <Flex>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => msg.success(a.savedCategory(catName))}
            >
              {a.saveCategory(catName)}
            </Button>
          </Flex>
        </Flex>
      </Card>

      <Drawer
        open={editing !== undefined}
        onClose={closeEditor}
        size={screens.sm ? 480 : "100%"}
        title={editingDef ? a.drawer.editTitle(editingDef.label) : a.drawer.createTitle}
        footer={
          <Flex gap={8} justify="end">
            <Button onClick={closeEditor}>{a.cancel}</Button>
            <Button type="primary" onClick={() => form.submit()}>
              {editingDef ? a.drawer.submitEdit : a.drawer.submitCreate}
            </Button>
          </Flex>
        }
      >
        <Form
          key={session}
          form={form}
          layout="vertical"
          onFinish={submit}
          requiredMark="optional"
          initialValues={editingDef ?? { type: "TEXT", options: [] }}
          onValuesChange={(changed: Partial<AttrDef>) => changed.type && setFormType(changed.type)}
        >
          <Form.Item
            label={a.drawer.label}
            name="label"
            extra={a.drawer.labelHelp}
            rules={[
              { required: true, whitespace: true, message: a.drawer.required(a.drawer.label) },
            ]}
          >
            <Input maxLength={30} showCount />
          </Form.Item>
          <Form.Item
            label={a.drawer.key}
            name="key"
            extra={editingDef ? a.drawer.keyLocked : a.drawer.keyHelp}
            rules={
              editingDef
                ? []
                : [
                    { required: true, message: a.drawer.required(a.drawer.key) },
                    { pattern: KEY_RE, message: a.drawer.keyInvalid },
                    {
                      validator: (_, v: string) =>
                        defs.some((d) => d.key === v)
                          ? Promise.reject(new Error(a.drawer.keyTaken))
                          : Promise.resolve(),
                    },
                  ]
            }
          >
            <Input
              disabled={Boolean(editingDef)}
              maxLength={32}
              placeholder={a.drawer.keyPlaceholder}
              style={{ fontFamily: MONO }}
            />
          </Form.Item>
          <Form.Item
            label={a.drawer.type}
            name="type"
            extra={
              editingDef && editingDef.usedBy > 0
                ? a.drawer.typeLocked(editingDef.usedBy)
                : a.typeHelp[formType]
            }
          >
            <Select
              disabled={Boolean(editingDef && editingDef.usedBy > 0)}
              options={TYPES.map((t) => ({ value: t, label: a.types[t] }))}
            />
          </Form.Item>
          {formType === "SELECT" && (
            <Form.Item
              label={a.drawer.options}
              name="options"
              extra={a.drawer.optionsHelp}
              rules={[
                { required: true, type: "array", min: 1, message: a.drawer.optionsRequired },
                {
                  validator: (_, v: string[] = []) => {
                    const gone = Object.entries(editingDef?.optionUse ?? {}).find(
                      ([opt, names]) => names.length > 0 && !v.includes(opt),
                    );
                    return gone
                      ? Promise.reject(new Error(a.drawer.optionInUse(gone[0], gone[1].join("、"))))
                      : Promise.resolve();
                  },
                },
              ]}
            >
              <Select mode="tags" maxCount={50} />
            </Form.Item>
          )}
          {(formType === "TEXT" || formType === "NUMBER") && (
            <Form.Item label={a.drawer.unit} name="unit" extra={a.drawer.unitHelp}>
              <Input maxLength={10} style={{ maxInlineSize: 160 }} />
            </Form.Item>
          )}
        </Form>
      </Drawer>
    </Flex>
  );
}

function Preview({
  config,
  sample,
  catName,
}: {
  config: CategoryAttr[];
  sample: Sample;
  catName: string;
}) {
  const { token } = theme.useToken();
  const title = titleOf(config, sample.attrs);
  const meta = cardMeta(config, sample.attrs);
  const plate = nameplateRows(config, sample.attrs);
  return (
    <Flex vertical gap={12}>
      <Flex
        vertical
        gap={4}
        aria-label={a.previewCard}
        style={{
          border: `1px solid ${token.colorBorder}`,
          borderRadius: token.borderRadius,
          padding: 12,
          background: token.colorBgContainer,
        }}
      >
        <Typography.Text type="secondary">
          {a.previewCard} · {catName}
        </Typography.Text>
        {title && (
          <Typography.Text strong data-testid="preview-title">
            {title}
          </Typography.Text>
        )}
        <Typography.Text>{sample.name}</Typography.Text>
        <Typography.Text type="secondary" data-testid="preview-meta">
          {meta || a.previewEmpty}
        </Typography.Text>
        <Typography.Text strong>
          {sample.priceTwd ? formatTwd(sample.priceTwd) : a.askPrice}
        </Typography.Text>
      </Flex>
      <Descriptions
        title={a.previewNameplate}
        size="small"
        bordered
        column={1}
        items={
          plate.length
            ? plate.map((r) => ({ key: r.key, label: r.label, children: r.value }))
            : [{ key: "empty", label: a.previewNameplate, children: a.previewEmpty }]
        }
      />
    </Flex>
  );
}
