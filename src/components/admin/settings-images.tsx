"use client";

import { DeleteOutlined, PictureOutlined, UploadOutlined } from "@ant-design/icons";
import { App, Button, Card, Col, Flex, Modal, Row, theme, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { adminCopy } from "@/copy/admin";
import { errorCopy } from "@/copy/errors";
import { removeSiteImageAction } from "@/modules/site-config/actions";
import type { SiteImage, SiteImageKind, SiteImages } from "@/modules/site-config/images";
import { call, type Failure, FailureAlert } from "./action-result";
import styles from "./admin.module.css";

const p = adminCopy.settings.profile;
const im = adminCopy.settings.images;
const MAX_BYTES = 15 * 1024 * 1024; // same cap as the server (src/server/images/process.ts)
const TYPES = ["image/jpeg", "image/png", "image/webp"];

const SLOTS: { kind: SiteImageKind; label: string; spec: string; use: string; ratio: string }[] = [
  { kind: "LOGO", ...p.logo, use: im.logoUse, ratio: "3 / 1" },
  { kind: "HERO", ...p.hero, use: im.heroUse, ratio: "16 / 9" },
];

function Slot({
  kind,
  label,
  spec,
  use,
  ratio,
  image,
}: (typeof SLOTS)[number] & { image?: SiteImage }) {
  const { token } = theme.useToken();
  const router = useRouter();
  const { message } = App.useApp();
  const [modal, modalHolder] = Modal.useModal();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);

  async function upload(f: File) {
    setProblem(null);
    setFailure(null);
    if (!TYPES.includes(f.type)) return setProblem(errorCopy.IMAGE_UNSUPPORTED);
    if (f.size > MAX_BYTES) return setProblem(errorCopy.IMAGE_TOO_LARGE);
    setBusy(true);
    try {
      const res = await fetch(`/admin/settings/images/${kind.toLowerCase()}`, {
        method: "POST",
        headers: { "Content-Type": f.type },
        body: f,
      });
      const body = (await res.json()) as { ok: boolean; message?: string };
      if (!body.ok) setProblem(body.message ?? errorCopy.UNKNOWN);
      else {
        message.success(im.uploaded(label));
        router.refresh();
      }
    } catch {
      setProblem(errorCopy.UNKNOWN);
    } finally {
      setBusy(false);
    }
  }

  const remove = () =>
    modal.confirm({
      title: im.removeTitle(label),
      content: (
        <Flex vertical gap={4}>
          {im.removeBody(label).map((line) => (
            <Typography.Text key={line}>{line}</Typography.Text>
          ))}
        </Flex>
      ),
      okText: im.removeOk,
      okButtonProps: { danger: true },
      cancelText: adminCopy.settings.footer.cancel,
      onOk: async () => {
        const r = await call(removeSiteImageAction, { kind });
        if (!r.ok) return setFailure(r);
        message.success(im.removed(label));
        router.refresh();
      },
    });

  return (
    <Card title={label} variant="outlined" size="small" styles={{ body: { padding: 16 } }}>
      {modalHolder}
      <Flex vertical gap={12}>
        <Typography.Text type="secondary">{use}</Typography.Text>
        <div
          style={{
            aspectRatio: ratio,
            maxInlineSize: 480,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: kind === "LOGO" ? token.colorBgContainer : token.colorBgLayout,
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
          }}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP from /media
            <img
              src={image.src}
              alt={im.current(label)}
              style={{
                inlineSize: "100%",
                blockSize: "100%",
                objectFit: kind === "LOGO" ? "contain" : "cover",
              }}
            />
          ) : (
            <Flex vertical align="center" gap={4} style={{ color: token.colorTextSecondary }}>
              <PictureOutlined aria-hidden style={{ fontSize: 20 }} />
              <span>{im.none}</span>
            </Flex>
          )}
        </div>
        <Typography.Text type="secondary">{spec}</Typography.Text>
        {problem && (
          <Typography.Text type="danger" role="alert">
            {problem}
          </Typography.Text>
        )}
        {failure && <FailureAlert failure={failure} />}
        <Flex gap={12} wrap>
          <input
            ref={input}
            type="file"
            accept={TYPES.join(",")}
            hidden
            className={styles.fileInput}
            aria-label={im.pick(label)}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void upload(f);
            }}
          />
          <Button icon={<UploadOutlined />} loading={busy} onClick={() => input.current?.click()}>
            {image ? im.replace : im.upload}
          </Button>
          {image && (
            <Button danger icon={<DeleteOutlined />} onClick={remove}>
              {im.remove}
            </Button>
          )}
        </Flex>
      </Flex>
    </Card>
  );
}

// 圖片 tab (site-config.md §4.2 SiteAsset). Each image is saved the moment it is uploaded; there is
// no separate save button and no 「還原上一版」 (the previous file is deleted on replace).
export function ImagesTab({ images }: { images: SiteImages }) {
  return (
    <Flex vertical gap={16}>
      <Typography.Text type="secondary">{p.accept}</Typography.Text>
      <Row gutter={[16, 16]}>
        {SLOTS.map((s) => (
          <Col key={s.kind} xs={24} lg={12}>
            <Slot {...s} image={images[s.kind]} />
          </Col>
        ))}
      </Row>
    </Flex>
  );
}
