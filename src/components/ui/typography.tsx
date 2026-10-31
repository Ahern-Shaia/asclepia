"use client";

// antd compound components (Typography.Title, Layout.Header, Form.Item, …) are properties of a
// client module. Server Components only see a client reference, so `Typography.Title` there is
// undefined (React #130). Server Components import the named parts from here instead.
import { Typography } from "antd";

export const Title = Typography.Title;
export const Paragraph = Typography.Paragraph;
export const Text = Typography.Text;
