"use client";

import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { Flex, theme, Typography } from "antd";
import { catalogCopy } from "@/copy/catalog";
import styles from "./catalog.module.css";

export type CompanyInfo = {
  name: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
};

export function CatalogFooter({ company }: { company: CompanyInfo }) {
  const { token } = theme.useToken();
  const items = [
    { icon: <PhoneOutlined />, text: <a href={`tel:${company.phone}`}>{company.phone}</a> },
    { icon: <MailOutlined />, text: <a href={`mailto:${company.email}`}>{company.email}</a> },
    { icon: <EnvironmentOutlined />, text: company.address },
    { icon: <ClockCircleOutlined />, text: `${catalogCopy.footer.hours} ${company.hours}` },
  ];
  return (
    <footer
      id="contact"
      style={{ background: token.colorBgLayout, borderTop: `1px solid ${token.colorBorder}` }}
    >
      <Flex className={styles.container} vertical gap={12} style={{ paddingBlock: 32 }}>
        <Typography.Text strong>{company.name}</Typography.Text>
        <Flex wrap gap={24}>
          {items.map((it, i) => (
            <Flex key={i} gap={8} align="center">
              <span aria-hidden style={{ color: token.colorPrimary }}>
                {it.icon}
              </span>
              <Typography.Text>{it.text}</Typography.Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </footer>
  );
}
