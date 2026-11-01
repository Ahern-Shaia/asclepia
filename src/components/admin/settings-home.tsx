"use client";

import { ArrowDownOutlined, ArrowUpOutlined, LockOutlined } from "@ant-design/icons";
import { Button, Flex, Switch, Tag, theme, Typography } from "antd";
import { useState } from "react";
import { adminCopy } from "@/copy/admin";

const h = adminCopy.settings.home;
type SectionId = keyof typeof h.sections;
type Row = { id: SectionId; on: boolean };

// Hero is always first and footer always last (site-config.md §4.4); the rest toggle and reorder.
const initial: Row[] = (
  ["hero", "categories", "latest", "brands", "buy", "services", "footer"] as const
).map((id) => ({ id, on: true }));
const isLocked = (id: SectionId) => id === "hero" || id === "footer";

export function useHomeTab() {
  const { token } = theme.useToken();
  const [rows, setRows] = useState(initial);
  const last = rows.length - 2; // index of the last movable section
  const move = (i: number, d: -1 | 1) =>
    setRows((r) => {
      const next = [...r];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });
  const toggle = (i: number, on: boolean) =>
    setRows((r) => r.map((x, j) => (j === i ? { ...x, on } : x)));

  const body = (
    <Flex vertical gap={12}>
      <Typography.Text type="secondary">{h.intro}</Typography.Text>
      <Flex vertical gap={8} component="ol" style={{ listStyle: "none", padding: 0 }}>
        {rows.map((r, i) => {
          const s = h.sections[r.id];
          const locked = isLocked(r.id);
          const nameId = `home-section-${r.id}`;
          return (
            <Flex
              key={r.id}
              component="li"
              gap={12}
              align="center"
              wrap
              style={{
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                background: r.on ? token.colorBgContainer : token.colorBgLayout,
                padding: "10px 12px",
              }}
            >
              <Typography.Text
                type="secondary"
                style={{ inlineSize: 20, fontVariantNumeric: "tabular-nums" }}
              >
                {i + 1}
              </Typography.Text>
              <Flex vertical gap={2} style={{ flex: 1, minInlineSize: 180 }}>
                <Flex gap={8} align="center" wrap>
                  <Typography.Text strong id={nameId}>
                    {s.name}
                  </Typography.Text>
                  {locked && <Tag icon={<LockOutlined />}>{h.locked}</Tag>}
                </Flex>
                <Typography.Text type="secondary">{"lock" in s ? s.lock : s.desc}</Typography.Text>
              </Flex>
              <Flex gap={4} align="center">
                <Switch
                  checked={r.on}
                  disabled={locked}
                  aria-labelledby={nameId}
                  checkedChildren={h.on}
                  onChange={(on) => toggle(i, on)}
                />
                <Button
                  type="text"
                  icon={<ArrowUpOutlined />}
                  aria-label={h.moveUp(s.name)}
                  disabled={locked || i <= 1}
                  onClick={() => move(i, -1)}
                />
                <Button
                  type="text"
                  icon={<ArrowDownOutlined />}
                  aria-label={h.moveDown(s.name)}
                  disabled={locked || i >= last}
                  onClick={() => move(i, 1)}
                />
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
  return { body, reset: () => setRows(initial) };
}
