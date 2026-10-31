import type { ThemeConfig } from "antd";

// Single source of truth for visual tokens (frontend-design-principles.md §B0 `spec-catalog`).
// Components must not hard-code colours; read from here or from antd's theme.useToken().
export const palette = {
  primary: "#1D4E89",
  primaryBg: "#E6EDF6",
  text: "#1F2937",
  textSecondary: "#4B5563",
  bg: "#FFFFFF",
  bgSection: "#F4F6FA",
  border: "#D9DEE7",
  success: "#2F7D32",
  warning: "#9A5B00",
  error: "#B42318",
} as const;

// Text/background pairs that must meet WCAG AA (4.5:1); enforced by tokens.test.ts.
export const contrastPairs: ReadonlyArray<readonly [fg: string, bg: string, label: string]> = [
  [palette.text, palette.bg, "body text on page"],
  [palette.text, palette.bgSection, "body text on section"],
  [palette.textSecondary, palette.bg, "secondary text on page"],
  [palette.textSecondary, palette.bgSection, "secondary text on section"],
  [palette.bg, palette.primary, "primary button label"],
  [palette.primary, palette.bg, "link on page"],
  [palette.primary, palette.primaryBg, "selected menu item"],
  [palette.success, palette.bg, "success text"],
  [palette.warning, palette.bg, "warning text"],
  [palette.error, palette.bg, "error text"],
];

export const theme: ThemeConfig = {
  token: {
    colorPrimary: palette.primary,
    colorLink: palette.primary,
    colorText: palette.text,
    colorTextSecondary: palette.textSecondary,
    colorBgContainer: palette.bg,
    colorBgLayout: palette.bgSection,
    colorBorder: palette.border,
    colorBorderSecondary: palette.border,
    colorSuccess: palette.success,
    colorWarning: palette.warning,
    colorError: palette.error,
    borderRadius: 4,
    borderRadiusSM: 2,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif',
    boxShadow: "0 1px 4px rgba(31, 41, 55, 0.08)",
    // type scale whitelist (profile B0): 12/14/16/20/24/30; body text ≥ 16px on the public site (§A3)
    fontSize: 16,
    fontSizeSM: 14,
    fontSizeLG: 16,
    fontSizeHeading1: 30,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,
  },
  components: {
    // headings carry no margin; layout spacing comes from Flex gap (R13)
    Typography: { titleMarginTop: 0, titleMarginBottom: 0 },
    Menu: { itemSelectedBg: palette.primaryBg, itemSelectedColor: palette.primary },
    Form: { itemMarginBottom: 20 },
    Layout: {
      bodyBg: palette.bg,
      headerBg: palette.bg,
      headerPadding: "0 16px",
      footerBg: palette.bgSection,
      footerPadding: "24px 16px",
    },
  },
};

// Back office is a dense data tool: 14px base, same palette and shapes.
export const adminTheme: ThemeConfig = {
  token: { fontSize: 14, fontSizeLG: 16 },
  components: { Layout: { siderBg: palette.bg, headerBg: palette.bg, bodyBg: palette.bgSection } },
};
