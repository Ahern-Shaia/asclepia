"use client";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PictureOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { App, Button, Card, Col, Flex, Modal, Row, theme, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { adminCopy } from "@/copy/admin";
import { errorCopy } from "@/copy/errors";
import {
  removeBrandLogoAction,
  removeSiteImageAction,
  reorderBrandLogosAction,
} from "@/modules/site-config/actions";
import type { BrandLogo, SiteImage, SiteImageKind, SiteImages } from "@/modules/site-config/images";
import type { Result } from "@/server/action";
import { call, type Failure, FailureAlert } from "./action-result";
import styles from "./admin.module.css";

const p = adminCopy.settings.profile;
const im = adminCopy.settings.images;
const MAX_BYTES = 15 * 1024 * 1024; // same cap as the server (src/server/images/process.ts)
const TYPES = ["image/jpeg", "image/png", "image/webp"];

const SLOTS: { kind: SiteImageKind; label: string; spec: string; use: string; ratio: string }[] = [
  { kind: "LOGO", ...p.logo, use: im.logoUse, ratio: "3 / 1" },
  { kind: "HERO", ...p.hero, use: im.heroUse, ratio: "16 / 9" },
  { kind: "VISIT", ...p.visit, use: im.visitUse, ratio: "4 / 3" },
  { kind: "FAVICON", ...p.favicon, use: im.faviconUse, ratio: "1 / 1" },
];

function Slot({
  kind,
  label,
  spec,
  use,
  ratio,
  image,
  uploadUrl = `/admin/settings/images/${kind.toLowerCase()}`,
  onRemove,
}: Omit<(typeof SLOTS)[number], "kind"> & {
  kind: SiteImageKind | "BRAND";
  image?: SiteImage;
  uploadUrl?: string;
  onRemove?: () => Promise<Result<unknown>>;
}) {
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
      const res = await fetch(uploadUrl, {
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
        const r = onRemove
          ? await call(onRemove, undefined)
          : await call(removeSiteImageAction, { kind: kind as SiteImageKind });
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
            background:
              kind === "HERO" || kind === "VISIT" ? token.colorBgLayout : token.colorBgContainer,
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
                objectFit: kind === "HERO" || kind === "VISIT" ? "cover" : "contain",
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

// Brand logos (home 「依品牌找」): every brand on the catalog, each with its own upload; the ones
// with a logo can be moved up and down (saved at once).
function BrandLogos({ brands, logos }: { brands: string[]; logos: BrandLogo[] }) {
  const router = useRouter();
  const { message } = App.useApp();
  const [failure, setFailure] = useState<Failure | null>(null);
  const withLogo = logos.map((l) => l.brand);
  const without = brands.filter((b) => !withLogo.includes(b));
  const move = async (i: number, d: -1 | 1) => {
    const next = [...withLogo];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    const r = await call(reorderBrandLogosAction, { brands: next });
    if (!r.ok) return setFailure(r);
    setFailure(null);
    message.success(im.reordered);
    router.refresh();
  };
  return (
    <Card title={im.brands} variant="outlined" size="small" styles={{ body: { padding: 16 } }}>
      <Flex vertical gap={12}>
        <Typography.Text type="secondary">{im.brandsHelp}</Typography.Text>
        {failure && <FailureAlert failure={failure} />}
        {brands.length === 0 && logos.length === 0 ? (
          <Typography.Text type="secondary">{im.brandsEmpty}</Typography.Text>
        ) : (
          <Row gutter={[16, 16]}>
            {[
              ...logos.map((l) => ({ brand: l.brand, src: l.src })),
              ...without.map((b) => ({ brand: b, src: "" })),
            ].map((b, i) => (
              <Col key={b.brand} xs={24} md={12} xl={8}>
                <Flex vertical gap={8}>
                  <Slot
                    kind="BRAND"
                    label={b.brand}
                    spec={p.logo.spec}
                    use={b.src ? im.brandUse(b.brand) : im.noLogo}
                    ratio="3 / 1"
                    image={b.src ? { src: b.src, width: 0, height: 0 } : undefined}
                    uploadUrl={`/admin/settings/images/brand?name=${encodeURIComponent(b.brand)}`}
                    onRemove={() => removeBrandLogoAction({ brand: b.brand })}
                  />
                  {b.src && (
                    <Flex gap={8}>
                      <Button
                        size="small"
                        icon={<ArrowUpOutlined />}
                        aria-label={im.moveUp(b.brand)}
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                      />
                      <Button
                        size="small"
                        icon={<ArrowDownOutlined />}
                        aria-label={im.moveDown(b.brand)}
                        disabled={i === logos.length - 1}
                        onClick={() => move(i, 1)}
                      />
                    </Flex>
                  )}
                </Flex>
              </Col>
            ))}
          </Row>
        )}
      </Flex>
    </Card>
  );
}

// 圖片 tab (site-config.md §4.2 SiteAsset). Each image is saved the moment it is uploaded; there is
// no separate save button and no 「還原上一版」 (the previous file is deleted on replace).
export function ImagesTab({ images, brands }: { images: SiteImages; brands: string[] }) {
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
      <BrandLogos brands={brands} logos={images.brands ?? []} />
    </Flex>
  );
}
