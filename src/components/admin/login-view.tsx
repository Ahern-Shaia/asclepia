"use client";

import { GoogleOutlined } from "@ant-design/icons";
import { Alert, Button, Card, ConfigProvider, Flex, theme, Typography } from "antd";
import { MockBanner } from "@/components/catalog/mock-banner";
import { adminCopy } from "@/copy/admin";
import { siteCopy } from "@/copy/site";
import { adminTheme } from "@/theme/tokens";

const l = adminCopy.login;

export function LoginView({ denied, mock }: { denied: boolean; mock?: boolean }) {
  return (
    <ConfigProvider theme={adminTheme}>
      <Inner denied={denied} mock={mock} />
    </ConfigProvider>
  );
}

function Inner({ denied, mock }: { denied: boolean; mock?: boolean }) {
  const { token } = theme.useToken();
  return (
    <Flex vertical style={{ minHeight: "100vh", background: token.colorBgLayout }}>
      {mock && <MockBanner />}
      <Flex flex={1} align="center" justify="center" style={{ padding: 16 }}>
        <Card variant="outlined" style={{ width: "100%", maxWidth: 400 }}>
          <Flex vertical gap={20}>
            <Flex vertical gap={4}>
              <Typography.Text
                style={{ color: token.colorPrimary, fontWeight: 700, fontSize: token.fontSizeLG }}
              >
                {siteCopy.name}
              </Typography.Text>
              <Typography.Title level={1} style={{ fontSize: token.fontSizeHeading3 }}>
                {l.title}
              </Typography.Title>
            </Flex>
            {denied && <Alert type="error" showIcon title={l.denied} />}
            <Button type="primary" size="large" icon={<GoogleOutlined />} block>
              {l.google}
            </Button>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {l.note}
            </Typography.Text>
          </Flex>
        </Card>
      </Flex>
    </Flex>
  );
}
