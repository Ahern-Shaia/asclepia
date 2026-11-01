"use client";

import { Flex, Input, Switch, theme, Typography } from "antd";
import { useState } from "react";
import { adminCopy } from "@/copy/admin";

const f = adminCopy.settings.features;
type FeatureId = keyof typeof f.items;
const ids = Object.keys(f.items) as FeatureId[];
const initial = Object.fromEntries(ids.map((id) => [id, true])) as Record<FeatureId, boolean>;
const DEFAULT_VISIT_WORD = f.visitWordDefault;

export function useFeaturesTab() {
  const { token } = theme.useToken();
  const [on, setOn] = useState(initial);
  const [visitWord, setVisitWord] = useState<string>(DEFAULT_VISIT_WORD);
  const servicesOff = !on.buyback && !on.repair && !on.rent;

  const body = (
    <Flex vertical gap={12}>
      <Typography.Text type="secondary">{f.intro}</Typography.Text>
      <Flex vertical gap={8} component="ul" style={{ listStyle: "none", padding: 0 }}>
        {ids.map((id) => {
          const item = f.items[id];
          const nameId = `feature-${id}`;
          return (
            <Flex
              key={id}
              component="li"
              vertical
              gap={8}
              style={{
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                padding: "10px 12px",
              }}
            >
              <Flex gap={12} align="start">
                <Switch
                  checked={on[id]}
                  aria-labelledby={nameId}
                  onChange={(v) => setOn((s) => ({ ...s, [id]: v }))}
                />
                <Flex vertical gap={2}>
                  <Typography.Text strong id={nameId}>
                    {item.name}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    {f.off}
                    {item.off}
                  </Typography.Text>
                </Flex>
              </Flex>
              {id === "visit" && on.visit && (
                <Flex vertical gap={4} style={{ paddingInlineStart: 56 }}>
                  <label htmlFor="visit-word">
                    <Typography.Text>{f.visitLabel}</Typography.Text>
                  </label>
                  <Input
                    id="visit-word"
                    value={visitWord}
                    maxLength={4}
                    placeholder={DEFAULT_VISIT_WORD}
                    style={{ maxInlineSize: 160 }}
                    onChange={(e) => setVisitWord(e.target.value)}
                  />
                  <Typography.Text type="secondary">
                    {f.visitLabelHelp}　
                    {f.visitLabelPreview(visitWord.trim() || DEFAULT_VISIT_WORD)}
                  </Typography.Text>
                </Flex>
              )}
            </Flex>
          );
        })}
      </Flex>
      {servicesOff && <Typography.Text type="warning">{f.servicesAllOff}</Typography.Text>}
    </Flex>
  );
  return {
    body,
    reset: () => {
      setOn(initial);
      setVisitWord(DEFAULT_VISIT_WORD);
    },
  };
}
