"use client";

import { Alert, Card, Col, Flex, Form, Input, Row, Typography } from "antd";
import { adminCopy } from "@/copy/admin";
import { homeV3Copy } from "@/copy/home-v3";
import { homeV4Copy } from "@/copy/home-v4";
import { siteCopy } from "@/copy/site";
import { findEfficacyWords } from "@/modules/catalog";

const c = adminCopy.settings.copy;
const services = homeV3Copy.services.items;

// Length caps follow the layout (site-config.md §4.5); over the cap blocks the save.
// Each group is a list of rows; `md` is the column span on desktop.
type Field = { name: string; label: string; placeholder: string; max: number; md: number };
const groups: { title: string; rows: Field[][] }[] = [
  {
    title: c.hero,
    rows: [
      [{ name: "eyebrow", label: c.eyebrow, placeholder: homeV4Copy.eyebrow, max: 20, md: 12 }],
      homeV4Copy.heading.map((line, i) => ({
        name: `heading${i + 1}`,
        label: c.heading(i + 1),
        placeholder: line,
        max: 16,
        md: 12,
      })),
      homeV3Copy.hero.points.map((pt, i) => ({
        name: `point${i + 1}`,
        label: c.point(i + 1),
        placeholder: pt,
        max: 16,
        md: 8,
      })),
    ],
  },
  {
    title: c.buy,
    rows: homeV3Copy.buy.steps.map((s, i) => [
      { name: `step${i + 1}Title`, label: c.stepTitle(i + 1), placeholder: s.title, max: 8, md: 6 },
      { name: `step${i + 1}Body`, label: c.stepBody(i + 1), placeholder: s.body, max: 40, md: 18 },
    ]),
  },
  {
    title: c.services,
    rows: services.map((s) => [
      {
        name: `service_${s.id}`,
        label: c.serviceBody(s.title),
        placeholder: s.body,
        max: 30,
        md: 24,
      },
    ]),
  },
  {
    title: c.footer,
    rows: [
      [
        {
          name: "footerLine",
          label: c.footerLine,
          placeholder: siteCopy.description,
          max: 40,
          md: 24,
        },
      ],
    ],
  },
];
const allFields = groups.flatMap((g) => g.rows.flat());

export function useCopyTab() {
  const [form] = Form.useForm<Record<string, string>>();
  const values: Record<string, string | undefined> =
    Form.useWatch([], { form, preserve: true }) ?? {};
  const tooLong = allFields.find((f) => [...(values[f.name] ?? "")].length > f.max);
  const efficacy = findEfficacyWords(Object.values(values).filter(Boolean).join("\n"));

  const body = (
    <Flex vertical gap={16}>
      <Typography.Text type="secondary">{c.intro}</Typography.Text>
      <Form form={form} layout="vertical">
        <Flex vertical gap={16}>
          {groups.map((g) => (
            <Card
              key={g.title}
              title={g.title}
              variant="outlined"
              size="small"
              styles={{ body: { padding: 16 } }}
            >
              {g.rows.map((row) => (
                <Row key={row[0].name} gutter={16}>
                  {row.map((f) => (
                    <Col key={f.name} xs={24} md={f.md}>
                      <Form.Item label={f.label} name={f.name}>
                        <Input placeholder={f.placeholder} count={{ show: true, max: f.max }} />
                      </Form.Item>
                    </Col>
                  ))}
                </Row>
              ))}
            </Card>
          ))}
        </Flex>
      </Form>
      {efficacy.length > 0 && (
        <Alert type="warning" showIcon title={c.efficacyWarning(efficacy.join("、"))} />
      )}
    </Flex>
  );
  return {
    body,
    blocked: tooLong && c.tooLong(tooLong.label, tooLong.max),
    reset: () => form.resetFields(),
  };
}
