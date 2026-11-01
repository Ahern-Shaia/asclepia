"use client";

import { SaveOutlined, UndoOutlined } from "@ant-design/icons";
import { Alert, Button, Flex, message, Modal, theme, Typography } from "antd";
import { useState } from "react";
import { adminCopy } from "@/copy/admin";

const f = adminCopy.settings.footer;

export type SaveStamp = { when: string; who: string };

// Footer of every settings tab (site-config.md OQ-CFG-6: save takes effect immediately, one-click
// restore of the previous version). `blocked` disables save and says why in plain words.
export function SaveBar({
  tab,
  saved,
  previous,
  user,
  blocked,
  onRestore,
}: {
  tab: string;
  saved: SaveStamp;
  previous: SaveStamp;
  user: string;
  blocked?: string;
  onRestore?: () => void;
}) {
  const { token } = theme.useToken();
  const [msg, msgHolder] = message.useMessage();
  const [modal, modalHolder] = Modal.useModal();
  const [stamp, setStamp] = useState(saved);

  const restore = () =>
    modal.confirm({
      title: f.restoreTitle,
      content: (
        <Flex vertical gap={4}>
          {f.restoreBody(tab, previous.when, previous.who).map((line) => (
            <Typography.Text key={line}>{line}</Typography.Text>
          ))}
        </Flex>
      ),
      okText: f.restoreOk,
      cancelText: f.cancel,
      onOk: () => {
        onRestore?.();
        setStamp({ when: f.justNow, who: user });
        msg.success(f.restored);
      },
    });

  return (
    <Flex
      vertical
      gap={12}
      style={{ borderBlockStart: `1px solid ${token.colorBorder}`, paddingBlockStart: 16 }}
    >
      {msgHolder}
      {modalHolder}
      {blocked && <Alert type="error" showIcon title={blocked} role="alert" />}
      <Flex gap={12} align="center" wrap>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          disabled={Boolean(blocked)}
          onClick={() => {
            setStamp({ when: f.justNow, who: user });
            msg.success(f.saved);
          }}
        >
          {f.save}
        </Button>
        <Button icon={<UndoOutlined />} onClick={restore}>
          {f.restore}
        </Button>
        <Typography.Text type="secondary">{f.lastSaved(stamp.when, stamp.who)}</Typography.Text>
      </Flex>
    </Flex>
  );
}
