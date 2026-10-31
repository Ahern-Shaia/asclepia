"use client";

import { theme, Typography } from "antd";
import type { ReactNode } from "react";
import styles from "./catalog.module.css";

// Signature element (profile §B0, kept from spec-catalog): an equipment rating plate. Real devices carry one
// with maker, model and year — here it puts the facts a used-equipment buyer checks first.
export type NameplateRow = { label: string; value?: ReactNode; mono?: boolean; wide?: boolean };

export function Nameplate({ rows, ariaLabel }: { rows: NameplateRow[]; ariaLabel: string }) {
  const { token } = theme.useToken();
  const line = `1px solid ${token.colorBorder}`;
  const screw = { background: token.colorBorder };
  return (
    <section
      aria-label={ariaLabel}
      className={styles.nameplate}
      style={{ border: line, borderRadius: token.borderRadius, background: token.colorBgLayout }}
    >
      {[
        { top: 6, left: 6 },
        { top: 6, right: 6 },
        { bottom: 6, left: 6 },
        { bottom: 6, right: 6 },
      ].map((pos, i) => (
        <span key={i} aria-hidden className={styles.screw} style={{ ...pos, ...screw }} />
      ))}
      {rows.map((r, i) => (
        <div
          key={r.label}
          className={`${styles.nameplateCell} ${r.wide ? styles.nameplateWide : ""}`}
          style={{
            borderTop: i >= (rows[0]?.wide ? 1 : 2) ? line : undefined,
            borderInlineStart: !r.wide && i % 2 === (rows[0]?.wide ? 0 : 1) ? line : undefined,
          }}
        >
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM, letterSpacing: "0.04em" }}
          >
            {r.label}
          </Typography.Text>
          <Typography.Text strong className={r.mono ? styles.mono : undefined}>
            {r.value ?? "—"}
          </Typography.Text>
        </div>
      ))}
    </section>
  );
}
