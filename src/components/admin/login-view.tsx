"use client";

import { GoogleOutlined } from "@ant-design/icons";
import { Alert, Button, Card, ConfigProvider, Flex, theme, Typography } from "antd";
import { signIn } from "next-auth/react";
import { MockBanner } from "@/components/catalog/mock-banner";
import { adminCopy } from "@/copy/admin";
import { siteCopy } from "@/copy/site";
import { adminTheme } from "@/theme/tokens";

const l = adminCopy.login;

export function LoginView({
  denied,
  mock,
  callbackUrl = "/admin",
}: {
  denied: boolean;
  mock?: boolean;
  callbackUrl?: string;
}) {
  return (
    <ConfigProvider theme={adminTheme}>
      <Inner denied={denied} mock={mock} callbackUrl={callbackUrl} />
    </ConfigProvider>
  );
}

function Inner({
  denied,
  mock,
  callbackUrl,
}: {
  denied: boolean;
  mock?: boolean;
  callbackUrl: string;
}) {
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
            <Button
              type="primary"
              size="large"
              icon={<GoogleOutlined />}
              block
              onClick={mock ? undefined : () => void signIn("google", { callbackUrl })}
            >
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
