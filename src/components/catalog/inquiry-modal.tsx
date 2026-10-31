"use client";

import { Button, Checkbox, Form, Input, Modal, Result } from "antd";
import { useState } from "react";
import { catalogCopy } from "@/copy/catalog";

const c = catalogCopy.inquiry;

export function InquiryModal({
  open,
  onClose,
  productTitle,
}: {
  open: boolean;
  onClose: () => void;
  productTitle: string;
}) {
  const [done, setDone] = useState(false);
  const close = () => {
    onClose();
    setDone(false);
  };
  return (
    <Modal
      open={open}
      onCancel={close}
      footer={null}
      title={done ? undefined : c.title}
      destroyOnHidden
      width={560}
    >
      {done ? (
        <Result
          status="success"
          title={c.successTitle}
          subTitle={c.successBody}
          extra={<Button onClick={close}>關閉</Button>}
        />
      ) : (
        <Form
          layout="vertical"
          requiredMark="optional"
          onFinish={() => setDone(true)}
          initialValues={{ product: productTitle }}
        >
          <Form.Item label={c.product} name="product">
            <Input readOnly variant="filled" />
          </Form.Item>
          <Form.Item
            label={c.name}
            name="name"
            rules={[{ required: true, message: c.required.name }]}
          >
            <Input autoComplete="name" />
          </Form.Item>
          <Form.Item
            label={c.phone}
            name="phone"
            rules={[{ required: true, message: c.required.phone }]}
          >
            <Input autoComplete="tel" inputMode="tel" />
          </Form.Item>
          <Form.Item label={c.email} name="email">
            <Input autoComplete="email" inputMode="email" />
          </Form.Item>
          <Form.Item label={c.org} name="org">
            <Input autoComplete="organization" />
          </Form.Item>
          <Form.Item label={c.message} name="message">
            <Input.TextArea
              rows={3}
              placeholder={c.messagePlaceholder}
              maxLength={1000}
              showCount
            />
          </Form.Item>
          <Form.Item
            name="consent"
            valuePropName="checked"
            rules={[
              {
                validator: (_, v) =>
                  v ? Promise.resolve() : Promise.reject(new Error(c.required.consent)),
              },
            ]}
          >
            <Checkbox>{c.consent}</Checkbox>
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block>
            {c.submit}
          </Button>
        </Form>
      )}
    </Modal>
  );
}
