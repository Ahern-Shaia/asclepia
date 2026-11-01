"use client";

import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  StarOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Alert, Button, Flex, Popconfirm, Tag, theme, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { adminCopy } from "@/copy/admin";
import { errorCopy } from "@/copy/errors";
import { deleteImageAction, reorderImagesAction } from "@/modules/catalog/actions";
import { call, type Failure, FailureAlert } from "./action-result";
import styles from "./admin.module.css";

const c = adminCopy.edit.images;
const MAX = 20;
const MAX_BYTES = 15 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

export type AdminImage = { id: string; storageKey: string };

// Upload is a plain POST of the file bytes to the Route Handler (one image per request; the server
// re-checks everything). Order is changed with buttons, which also work by keyboard and on phones.
export function ProductImages({ productId, images }: { productId?: string; images: AdminImage[] }) {
  const { token } = theme.useToken();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [list, setList] = useState(images);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [synced, setSynced] = useState(images);
  if (synced !== images) {
    setSynced(images);
    setList(images);
  }

  if (!productId) return <Typography.Text type="secondary">{c.saveFirst}</Typography.Text>;

  async function upload(files: File[]) {
    setErrors([]);
    setFailure(null);
    const problems: string[] = [];
    let room = MAX - list.length;
    setProgress({ done: 0, total: files.length });
    for (const [i, f] of files.entries()) {
      let why: string | null = null;
      if (!TYPES.includes(f.type)) why = errorCopy.IMAGE_UNSUPPORTED;
      else if (f.size > MAX_BYTES) why = errorCopy.IMAGE_TOO_LARGE;
      else if (room <= 0) why = errorCopy.IMAGE_LIMIT;
      if (!why) {
        try {
          const res = await fetch(`/admin/products/${productId}/images`, {
            method: "POST",
            headers: { "Content-Type": f.type },
            body: f,
          });
          const body = (await res.json()) as { ok: boolean; message?: string; data?: AdminImage };
          if (body.ok && body.data) {
            const added = body.data;
            setList((l) => [...l, added]);
            room -= 1;
          } else why = body.message ?? errorCopy.UNKNOWN;
        } catch {
          why = errorCopy.UNKNOWN;
        }
      }
      if (why) problems.push(c.failed(f.name, why));
      setProgress({ done: i + 1, total: files.length });
    }
    setProgress(null);
    setErrors(problems);
    router.refresh(); // the status card's publish check reads the server's count
  }

  async function reorder(next: AdminImage[]) {
    const before = list;
    setList(next);
    const r = await call(reorderImagesAction, {
      productId: productId!,
      ids: next.map((x) => x.id),
    });
    if (!r.ok) {
      setList(before);
      setFailure(r);
    } else router.refresh();
  }
  const move = (i: number, to: number) => {
    const next = [...list];
    const [x] = next.splice(i, 1);
    next.splice(to, 0, x);
    return reorder(next);
  };
  async function remove(id: string) {
    setFailure(null);
    const r = await call(deleteImageAction, { id });
    if (r.ok) {
      setList((l) => l.filter((x) => x.id !== id));
      router.refresh();
    } else setFailure(r);
  }

  return (
    <Flex vertical gap={12}>
      <Typography.Text type="secondary">{c.hint}</Typography.Text>
      {failure && <FailureAlert failure={failure} />}
      {errors.length > 0 && (
        <Alert
          type="error"
          showIcon
          title={errors.length === 1 ? errors[0] : undefined}
          description={
            errors.length > 1 ? (
              <ul className={styles.plainList}>
                {errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            ) : undefined
          }
        />
      )}
      {list.length > 0 && (
        <ul className={styles.imageGrid} aria-label={adminCopy.edit.sections.images}>
          {list.map((img, i) => (
            <li
              key={img.id}
              className={styles.imageItem}
              style={{ borderColor: token.colorBorder }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP from /media */}
              <img
                src={`/media/${img.storageKey}-400.webp`}
                alt={c.alt(i + 1)}
                className={styles.imageThumb}
                style={{ background: token.colorBgLayout }}
              />
              <Flex justify="space-between" align="center" gap={4} wrap>
                {i === 0 ? (
                  <Tag color="blue">{c.main}</Tag>
                ) : (
                  <Button
                    size="small"
                    type="text"
                    icon={<StarOutlined />}
                    onClick={() => move(i, 0)}
                  >
                    {c.setMain}
                  </Button>
                )}
                <Flex gap={2}>
                  <Button
                    size="small"
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    aria-label={`${c.earlier}（${c.alt(i + 1)}）`}
                    disabled={i === 0}
                    onClick={() => move(i, i - 1)}
                  />
                  <Button
                    size="small"
                    type="text"
                    icon={<ArrowRightOutlined />}
                    aria-label={`${c.later}（${c.alt(i + 1)}）`}
                    disabled={i === list.length - 1}
                    onClick={() => move(i, i + 1)}
                  />
                  <Popconfirm
                    title={c.removeConfirm}
                    description={c.removeBody}
                    okText={c.remove}
                    okButtonProps={{ danger: true }}
                    onConfirm={() => remove(img.id)}
                  >
                    <Button
                      size="small"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      aria-label={`${c.remove}（${c.alt(i + 1)}）`}
                    />
                  </Popconfirm>
                </Flex>
              </Flex>
            </li>
          ))}
        </ul>
      )}
      <Flex align="center" gap={12} wrap>
        <input
          ref={input}
          type="file"
          accept={TYPES.join(",")}
          multiple
          hidden
          className={styles.fileInput}
          onChange={(e) => {
            const files = [...(e.target.files ?? [])];
            e.target.value = "";
            if (files.length) void upload(files);
          }}
        />
        <Button
          icon={<UploadOutlined />}
          loading={!!progress}
          disabled={list.length >= MAX}
          onClick={() => input.current?.click()}
        >
          {progress ? c.uploading(progress.done, progress.total) : c.pick}
        </Button>
        <Typography.Text type="secondary">{c.count(list.length, MAX)}</Typography.Text>
      </Flex>
    </Flex>
  );
}
