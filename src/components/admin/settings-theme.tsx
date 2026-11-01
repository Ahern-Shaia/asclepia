"use client";

import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  ColorPicker,
  ConfigProvider,
  Flex,
  Input,
  Radio,
  Row,
  Segmented,
  Tag,
  theme,
  Typography,
} from "antd";
import { useState } from "react";
import { adminCopy } from "@/copy/admin";
import { checkTheme, deriveTheme, isHex, type RadiusStep } from "@/theme/derive";
import { palette, themePresets } from "@/theme/tokens";

const t = adminCopy.settings.theme;
const CUSTOM = "custom";
type Choice = { mode: string; primary: string; accent: string; radius: RadiusStep };
const initial: Choice = {
  mode: themePresets[0].id,
  primary: themePresets[0].primary,
  accent: themePresets[0].accent,
  radius: "medium",
};

function Swatch({ color, size = 20 }: { color: string; size?: number }) {
  const { token } = theme.useToken();
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        inlineSize: size,
        blockSize: size,
        background: color,
        borderRadius: 4,
        border: `1px solid ${token.colorBorder}`,
        flex: "none",
      }}
    />
  );
}

function ColorField({
  label,
  help,
  value,
  onChange,
}: {
  label: string;
  help: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const [text, setText] = useState(value);
  const [shown, setShown] = useState(value);
  // Follow outside changes (preset picked) without an effect: reset the draft when `value` moves.
  if (shown !== value) {
    setShown(value);
    setText(value);
  }
  const invalid = !isHex(text);
  const id = `color-${label}`;
  return (
    <Flex vertical gap={4}>
      <label htmlFor={id}>
        <Typography.Text strong>{label}</Typography.Text>
        <Typography.Text type="secondary">　{help}</Typography.Text>
      </label>
      <Flex gap={8} align="center">
        <ColorPicker
          value={value}
          disabledAlpha
          format="hex"
          aria-label={label}
          onChange={(c) => onChange(c.toHexString().toUpperCase())}
        />
        <Input
          id={id}
          value={text}
          maxLength={7}
          status={invalid ? "error" : undefined}
          style={{ maxInlineSize: 140, fontFamily: "ui-monospace, SFMono-Regular, monospace" }}
          onChange={(e) => {
            const v = e.target.value.trim();
            setText(v);
            if (isHex(v)) onChange(v.toUpperCase());
          }}
        />
      </Flex>
      {invalid && (
        <Typography.Text type="danger" role="alert">
          {t.hexInvalid}
        </Typography.Text>
      )}
    </Flex>
  );
}

function Preview({ c }: { c: Choice }) {
  const { token } = theme.useToken();
  const d = deriveTheme(c);
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: d.primary,
          colorLink: d.link,
          borderRadius: d.radius,
          borderRadiusSM: d.radiusSM,
        },
      }}
    >
      <Flex
        vertical
        style={{
          border: `1px solid ${token.colorBorder}`,
          borderRadius: d.radius,
          overflow: "hidden",
        }}
        aria-label={t.preview}
      >
        <Flex
          justify="space-between"
          align="center"
          gap={8}
          wrap
          style={{ background: d.primary, color: palette.bg, padding: "10px 16px" }}
        >
          <Typography.Text strong style={{ color: palette.bg }}>
            {t.previewStore}
          </Typography.Text>
          <Button
            size="small"
            style={{ background: d.accent, borderColor: d.accent, color: palette.bg }}
          >
            {t.previewBook}
          </Button>
        </Flex>
        <Flex vertical gap={12} style={{ padding: 16, background: palette.bgSection }}>
          <Flex
            vertical
            gap={4}
            style={{
              background: palette.bg,
              border: `1px solid ${token.colorBorder}`,
              borderRadius: d.radius,
              padding: 12,
              maxInlineSize: 320,
            }}
          >
            <Flex gap={8} align="center">
              <Typography.Text type="secondary">{t.previewCategory}</Typography.Text>
              <Tag style={{ background: d.accentBg, color: d.accent, borderColor: d.accentBg }}>
                {t.previewNew}
              </Tag>
            </Flex>
            <Typography.Text strong>{t.previewTitle}</Typography.Text>
            <Typography.Text>{t.previewName}</Typography.Text>
            <Typography.Text type="secondary">{t.previewMeta}</Typography.Text>
            <Typography.Text strong style={{ color: d.accent, fontSize: token.fontSizeLG }}>
              {t.previewPrice}
            </Typography.Text>
            <Flex gap={12} align="center" wrap>
              <Button type="primary">{t.previewInquiry}</Button>
              <Typography.Link>{t.previewLink}</Typography.Link>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </ConfigProvider>
  );
}

// Returns the tab body and the reason save is blocked (undefined = can save).
export function useThemeTab() {
  const { token } = theme.useToken();
  const [c, setC] = useState<Choice>(initial);
  const valid = isHex(c.primary) && isHex(c.accent);
  const checks = valid ? checkTheme(c) : [];
  const failing = checks.find((x) => !x.pass);
  const blocked = !valid
    ? t.blockedHex
    : failing && t.blocked(t.pairs[failing.id], t.ratio(failing.ratio));
  const pick = (mode: string) => {
    const p = themePresets.find((x) => x.id === mode);
    setC((prev) =>
      p ? { ...prev, mode, primary: p.primary, accent: p.accent } : { ...prev, mode },
    );
  };

  const body = (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={12}>
        <Flex vertical gap={24}>
          <Flex vertical gap={8}>
            <Typography.Title level={2} style={{ fontSize: token.fontSizeHeading4 }}>
              {t.presets}
            </Typography.Title>
            <Typography.Text type="secondary">{t.presetsHelp}</Typography.Text>
            <Radio.Group value={c.mode} onChange={(e) => pick(e.target.value)}>
              <Flex vertical gap={8}>
                {themePresets.map((p) => (
                  <Radio key={p.id} value={p.id}>
                    <Flex gap={8} align="center">
                      <Swatch color={p.primary} />
                      <Swatch color={p.accent} />
                      {adminCopy.themePresets[p.id]}
                    </Flex>
                  </Radio>
                ))}
                <Radio value={CUSTOM}>{t.custom}</Radio>
              </Flex>
            </Radio.Group>
          </Flex>
          <Flex vertical gap={16}>
            <ColorField
              label={t.primary}
              help={t.primaryHelp}
              value={c.primary}
              onChange={(primary) => setC((prev) => ({ ...prev, mode: CUSTOM, primary }))}
            />
            <ColorField
              label={t.accent}
              help={t.accentHelp}
              value={c.accent}
              onChange={(accent) => setC((prev) => ({ ...prev, mode: CUSTOM, accent }))}
            />
          </Flex>
          <Flex vertical gap={8}>
            <Typography.Text strong>{t.radius}</Typography.Text>
            <Segmented<RadiusStep>
              value={c.radius}
              onChange={(radius) => setC((prev) => ({ ...prev, radius }))}
              options={(["small", "medium", "large"] as const).map((v) => ({
                value: v,
                label: t.radiusOptions[v],
              }))}
            />
            <Typography.Text type="secondary">{t.derivedNote}</Typography.Text>
          </Flex>
        </Flex>
      </Col>
      <Col xs={24} lg={12}>
        <Flex vertical gap={24}>
          <Flex vertical gap={8}>
            <Typography.Title level={2} style={{ fontSize: token.fontSizeHeading4 }}>
              {t.preview}
            </Typography.Title>
            {valid && <Preview c={c} />}
          </Flex>
          <Card
            title={t.contrast}
            variant="outlined"
            size="small"
            styles={{ body: { padding: 16 } }}
          >
            <Flex vertical gap={12}>
              <Typography.Text type="secondary">{t.contrastHelp}</Typography.Text>
              <Flex vertical gap={8} component="ul" style={{ listStyle: "none", padding: 0 }}>
                {checks.map((x) => (
                  <Flex key={x.id} component="li" gap={8} align="center">
                    {x.pass ? (
                      <CheckCircleFilled aria-hidden style={{ color: token.colorSuccess }} />
                    ) : (
                      <CloseCircleFilled aria-hidden style={{ color: token.colorError }} />
                    )}
                    <span
                      aria-hidden
                      style={{
                        background: x.bg,
                        color: x.fg,
                        border: `1px solid ${token.colorBorder}`,
                        borderRadius: 4,
                        paddingInline: 6,
                        fontWeight: 600,
                      }}
                    >
                      Aa
                    </span>
                    <Typography.Text style={{ flex: 1, minInlineSize: 0 }}>
                      {t.pairs[x.id]}
                    </Typography.Text>
                    <Flex gap={8} style={{ whiteSpace: "nowrap" }}>
                      <Typography.Text style={{ fontVariantNumeric: "tabular-nums" }}>
                        {t.ratio(x.ratio)}
                      </Typography.Text>
                      <Typography.Text type={x.pass ? "success" : "danger"} strong>
                        {x.pass ? t.pass : t.fail}
                      </Typography.Text>
                    </Flex>
                  </Flex>
                ))}
              </Flex>
            </Flex>
          </Card>
        </Flex>
      </Col>
    </Row>
  );
  return { body, blocked, reset: () => setC(initial) };
}
