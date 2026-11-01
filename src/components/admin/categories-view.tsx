"use client";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Empty,
  Flex,
  Form,
  Input,
  Modal,
  Table,
  theme,
  Tooltip,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminCopy } from "@/copy/admin";
import { validationCopy as v } from "@/copy/validation";
import {
  deleteCategoryAction,
  reorderCategoriesAction,
  saveCategoryAction,
} from "@/modules/catalog/actions";
import { call, type Failure, FailureAlert } from "./action-result";

const c = adminCopy.categories;

type Row = { id: string; name: string; products: number };

// The name error for a failed save: field-level when the server says which field, otherwise the
// sentence itself (DUPLICATE is about the name too).
const nameError = (f: Failure) =>
  f.fieldErrors?.name ?? (f.code === "DUPLICATE" || f.code === "INVALID" ? f.message : undefined);

// Back-office categories (catalog.md OQ-CAT-9: add, rename, reorder, delete; the initial list comes
// from the company).
export function CategoriesView({ categories }: { categories: Row[] }) {
  const { token } = theme.useToken();
  const router = useRouter();
  const { message } = App.useApp();
  const [modal, modalHolder] = Modal.useModal();
  const [rows, setRows] = useState(categories);
  const [seen, setSeen] = useState(categories);
  if (seen !== categories) {
    setSeen(categories);
    setRows(categories);
  }
  const [failure, setFailure] = useState<Failure>();
  const [busy, setBusy] = useState(false);
  const [addForm] = Form.useForm<{ name: string }>();
  const [editing, setEditing] = useState<{ id: string; name: string; error?: string }>();

  const add = async ({ name }: { name: string }) => {
    setFailure(undefined);
    setBusy(true);
    const r = await call(saveCategoryAction, { name });
    setBusy(false);
    if (!r.ok) {
      const err = nameError(r);
      if (err) addForm.setFields([{ name: "name", errors: [err] }]);
      else setFailure(r);
      return;
    }
    addForm.resetFields();
    message.success(c.created(name.trim()));
    router.refresh();
  };

  const rename = async () => {
    if (!editing) return;
    setFailure(undefined);
    setBusy(true);
    const r = await call(saveCategoryAction, { id: editing.id, name: editing.name });
    setBusy(false);
    if (!r.ok) {
      const err = nameError(r);
      if (err) setEditing({ ...editing, error: err });
      else setFailure(r);
      return;
    }
    setEditing(undefined);
    message.success(c.renamed(editing.name.trim()));
    router.refresh();
  };

  const move = async (i: number, d: -1 | 1) => {
    const next = [...rows];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    const before = rows;
    setRows(next);
    setFailure(undefined);
    const r = await call(reorderCategoriesAction, { ids: next.map((x) => x.id) });
    if (!r.ok) {
      setRows(before);
      setFailure(r);
      return;
    }
    message.success(c.moved);
    router.refresh();
  };

  const remove = (row: Row) =>
    modal.confirm({
      title: c.deleteTitle(row.name),
      content: (
        <Flex vertical gap={4}>
          {c.deleteBody.map((line) => (
            <Typography.Text key={line}>{line}</Typography.Text>
          ))}
        </Flex>
      ),
      okText: c.deleteOk,
      okButtonProps: { danger: true },
      cancelText: c.cancel,
      onOk: async () => {
        setFailure(undefined);
        const r = await call(deleteCategoryAction, { id: row.id });
        if (!r.ok) return setFailure(r);
        message.success(c.deleted(row.name));
        router.refresh();
      },
    });

  return (
    <Flex vertical gap={16}>
      {modalHolder}
      <Flex vertical gap={8}>
        <Typography.Title level={1} style={{ fontSize: token.fontSizeHeading3 }}>
          {c.title}
        </Typography.Title>
        <Typography.Text type="secondary">{c.intro}</Typography.Text>
      </Flex>
      <Card variant="outlined" styles={{ body: { padding: 16 } }}>
        <Flex vertical gap={16}>
          <Form form={addForm} layout="inline" onFinish={add} requiredMark={false}>
            <Flex gap={8} wrap align="start" style={{ width: "100%" }}>
              <Form.Item
                name="name"
                style={{ flex: "1 1 240px", maxWidth: 360 }}
                rules={[{ required: true, whitespace: true, message: v.required(c.nameLabel) }]}
              >
                <Input aria-label={c.nameLabel} placeholder={c.namePlaceholder} maxLength={30} />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<PlusOutlined />}
                loading={busy && !editing}
              >
                {c.add}
              </Button>
            </Flex>
          </Form>
          {failure && <FailureAlert failure={failure} />}
          <Table<Row>
            rowKey="id"
            dataSource={rows}
            pagination={false}
            scroll={{ x: 560 }}
            locale={{
              emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={c.empty} />,
            }}
            columns={[
              {
                title: c.columns.order,
                key: "order",
                width: 88,
                render: (_, r, i) => (
                  <Flex>
                    <Button
                      size="small"
                      type="text"
                      icon={<ArrowUpOutlined />}
                      aria-label={c.moveUp(r.name)}
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                    />
                    <Button
                      size="small"
                      type="text"
                      icon={<ArrowDownOutlined />}
                      aria-label={c.moveDown(r.name)}
                      disabled={i === rows.length - 1}
                      onClick={() => move(i, 1)}
                    />
                  </Flex>
                ),
              },
              {
                title: c.columns.name,
                key: "name",
                render: (_, r) =>
                  editing?.id === r.id ? (
                    <Flex vertical gap={4}>
                      <Flex gap={8} wrap>
                        <Input
                          autoFocus
                          aria-label={c.renameLabel(r.name)}
                          value={editing.name}
                          maxLength={30}
                          status={editing.error ? "error" : undefined}
                          onChange={(ev) => setEditing({ id: r.id, name: ev.target.value })}
                          onPressEnter={rename}
                          onKeyDown={(ev) => ev.key === "Escape" && setEditing(undefined)}
                          style={{ maxWidth: 240 }}
                        />
                        <Button type="primary" onClick={rename} loading={busy}>
                          {c.save}
                        </Button>
                        <Button onClick={() => setEditing(undefined)}>{c.cancel}</Button>
                      </Flex>
                      {editing.error && (
                        <Typography.Text type="danger" role="alert">
                          {editing.error}
                        </Typography.Text>
                      )}
                    </Flex>
                  ) : (
                    r.name
                  ),
              },
              {
                title: c.columns.products,
                dataIndex: "products",
                width: 96,
                align: "right",
                render: (n: number) => c.productCount(n),
              },
              {
                title: c.columns.actions,
                key: "actions",
                width: 180,
                render: (_, r) => {
                  const del = (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      disabled={r.products > 0}
                      aria-label={
                        r.products > 0
                          ? `${c.deleteLabel(r.name)}：${c.deleteBlocked(r.products)}`
                          : c.deleteLabel(r.name)
                      }
                      onClick={() => remove(r)}
                    >
                      {c.delete}
                    </Button>
                  );
                  return (
                    <Flex gap={4}>
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        aria-label={c.renameLabel(r.name)}
                        onClick={() => setEditing({ id: r.id, name: r.name })}
                      >
                        {c.rename}
                      </Button>
                      {r.products > 0 ? (
                        <Tooltip title={c.deleteBlocked(r.products)}>
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
    </Flex>
  );
}
