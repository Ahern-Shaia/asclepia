"use client";

import { Flex, Tabs, theme, Typography } from "antd";
import type { ReactNode } from "react";
import { adminCopy } from "@/copy/admin";
import { useCopyTab } from "./settings-copy";
import { useFeaturesTab } from "./settings-features";
import { useHomeTab } from "./settings-home";
import { type ProfileValues, useProfileTab } from "./settings-profile";
import { SaveBar, type SaveStamp } from "./settings-save-bar";
import { useThemeTab } from "./settings-theme";

const s = adminCopy.settings;
export type SettingsTab = keyof typeof s.tabs;
export type SaveHistory = Record<SettingsTab, { saved: SaveStamp; previous: SaveStamp }>;

// 站台設定 (docs/modules/site-config.md §4.2–4.6): one tab per SiteConfig section, each saved on its own.
export function SettingsView({
  profile,
  brands,
  history,
  user,
}: {
  profile: ProfileValues;
  brands: string[];
  history: SaveHistory;
  user: string;
}) {
  const { token } = theme.useToken();
  const tabs: Record<SettingsTab, { body: ReactNode; blocked?: string; reset: () => void }> = {
    profile: useProfileTab(profile, brands),
    theme: useThemeTab(),
    home: useHomeTab(),
    copy: useCopyTab(),
    features: useFeaturesTab(),
  };

  return (
    <Flex vertical gap={16}>
      <Typography.Title level={1} style={{ fontSize: token.fontSizeHeading3 }}>
        {s.title}
      </Typography.Title>
      <Tabs
        items={(Object.keys(tabs) as SettingsTab[]).map((key) => ({
          key,
          label: s.tabs[key],
          // Mount every tab so each form is connected and its state survives tab switches.
          forceRender: true,
          children: (
            <Flex
              vertical
              gap={24}
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadiusLG,
                padding: 16,
              }}
            >
              {tabs[key].body}
              <SaveBar
                tab={s.tabs[key]}
                {...history[key]}
                user={user}
                blocked={tabs[key].blocked}
                onRestore={tabs[key].reset}
              />
            </Flex>
          ),
        }))}
      />
    </Flex>
  );
}
