"use client";

import { UploadOutlined } from "@ant-design/icons";
import { App, Button, Flex, Select, theme, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { EquipIllus, GenericEquipIllus, isEquipKind } from "@/components/home-v4/equip-illus";
import { shopVars } from "@/components/shop/shop-shell";
import { adminCopy } from "@/copy/admin";
import { errorCopy } from "@/copy/errors";
import { setCategoryIconAction } from "@/modules/catalog/actions";
import { CATEGORY_ICON_KEYS } from "@/modules/catalog/admin-input";
import { DEFAULT_THEME, deriveTheme } from "@/theme/derive";
import { call } from "./action-result";
import styles from "./admin.module.css";

const c = adminCopy.categories;
const MAX_BYTES = 15 * 1024 * 1024; // same cap as the server (src/server/images/process.ts)
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const UPLOADED = "__uploaded";
// The drawings colour themselves from the storefront's CSS variables, which the back office
// doesn't set: without these the preview was a black square.
const PREVIEW_VARS = shopVars(deriveTheme(DEFAULT_THEME));
const NONE = "__none";

// One category's icon on the storefront home (site-config.md C4): a built-in drawing, an uploaded
// image, or none (the generic drawing). Changes are saved at once.
export function CategoryIcon({
  id,
  name,
  iconKey,
  iconSrc,
}: {
  id: string;
  name: string;
  iconKey: string | null;
  iconSrc: string | null;
}) {
  const { token } = theme.useToken();
  const router = useRouter();
  const { message } = App.useApp();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const value = iconSrc ? UPLOADED : isEquipKind(iconKey) ? iconKey : NONE;

  const done = (ok: boolean, why?: string) => {
    setBusy(false);
    if (!ok) return setProblem(why ?? errorCopy.UNKNOWN);
    setProblem(null);
    message.success(c.iconSaved(name));
    router.refresh();
  };

  const pick = async (v: string) => {
    if (v === UPLOADED) return input.current?.click();
    setBusy(true);
    const r = await call(setCategoryIconAction, { id, iconKey: v === NONE ? null : (v as never) });
    done(r.ok, r.ok ? undefined : r.message);
  };

  const upload = async (f: File) => {
    if (!TYPES.includes(f.type)) return setProblem(errorCopy.IMAGE_UNSUPPORTED);
    if (f.size > MAX_BYTES) return setProblem(errorCopy.IMAGE_TOO_LARGE);
    setBusy(true);
    try {
      const res = await fetch(`/admin/categories/${id}/icon`, {
        method: "POST",
        headers: { "Content-Type": f.type },
        body: f,
      });
      const body = (await res.json()) as { ok: boolean; message?: string };
      done(body.ok, body.message);
    } catch {
      done(false);
    }
  };

  return (
    <Flex vertical gap={4}>
      <Flex gap={8} align="center" wrap>
        <span
          aria-hidden
          style={{
            inlineSize: 36,
            blockSize: 36,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            background: token.colorFillTertiary,
            overflow: "hidden",
            flex: "none",
            ...PREVIEW_VARS,
          }}
        >
          {iconSrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP from /media
            <img
              src={iconSrc}
              alt=""
              style={{ inlineSize: 26, blockSize: 26, objectFit: "contain" }}
            />
          ) : isEquipKind(iconKey) ? (
            <EquipIllus kind={iconKey} />
          ) : (
            <GenericEquipIllus />
          )}
        </span>
        <Select
          aria-label={c.iconLabel(name)}
          value={value}
          loading={busy}
          disabled={busy}
          onChange={pick}
          style={{ minInlineSize: 150 }}
          options={[
            { value: NONE, label: c.iconNone },
            ...CATEGORY_ICON_KEYS.map((k) => ({ value: k, label: c.iconKinds[k] })),
            { value: UPLOADED, label: iconSrc ? c.iconUploadedReplace : c.iconUpload },
          ]}
        />
        {iconSrc && (
          <Button
            size="small"
            icon={<UploadOutlined />}
            onClick={() => input.current?.click()}
            aria-label={c.iconReplaceLabel(name)}
          >
            {c.iconReplace}
          </Button>
        )}
        <input
          ref={input}
          type="file"
          accept={TYPES.join(",")}
          hidden
          className={styles.fileInput}
          aria-label={c.iconFileLabel(name)}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void upload(f);
          }}
        />
      </Flex>
      {problem && (
        <Typography.Text type="danger" role="alert">
          {problem}
        </Typography.Text>
      )}
    </Flex>
  );
}
