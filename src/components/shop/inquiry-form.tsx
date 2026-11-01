"use client";

import { type FormEvent, useState } from "react";
import { shopCopy } from "@/copy/shop";
import l from "./shop.module.css";

const c = shopCopy.inquiry;
const PHONE = /^[0-9 +\-()#]{6,30}$/; // inquiry.md §7-bis.1

type Errors = Partial<Record<"name" | "phone" | "consent", string>>;

// Mockup only: validates like the real endpoint will (inquiry.md §4.2 step 1) and pretends to send.
export function InquiryForm({
  count,
  blockedReason,
  onSent,
}: {
  count: number;
  blockedReason?: string;
  onSent: () => void;
}) {
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (blockedReason) return;
    const f = new FormData(e.currentTarget);
    const name = f.get("name")?.toString().trim() ?? "";
    const phone = f.get("phone")?.toString().trim() ?? "";
    const next: Errors = {};
    if (!name) next.name = c.required.name;
    if (!phone) next.phone = c.required.phone;
    else if (!PHONE.test(phone)) next.phone = c.required.phoneFormat;
    if (!f.get("consent")) next.consent = c.required.consent;
    setErrors(next);
    if (Object.keys(next).length) {
      const first = e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`);
      first?.focus();
      return;
    }
    setSending(true);
    setTimeout(onSent, 500);
  };

  const field = (
    name: string,
    label: string,
    props: { type?: string; autoComplete?: string; required?: boolean } = {},
  ) => {
    const err = errors[name as keyof Errors];
    return (
      <label className={`${l.field} ${err ? l.fieldError : ""}`}>
        <span>{label}</span>
        <input
          name={name}
          type={props.type ?? "text"}
          autoComplete={props.autoComplete}
          aria-required={props.required}
          aria-invalid={!!err}
          aria-describedby={err ? `${name}-err` : undefined}
        />
        {err && (
          <span id={`${name}-err`} className={l.error}>
            {err}
          </span>
        )}
      </label>
    );
  };

  return (
    <form className={l.form} onSubmit={submit} noValidate aria-labelledby="inquiry-form-title">
      <h2 id="inquiry-form-title">{c.formTitle}</h2>
      {blockedReason && (
        <p className={l.alert} role="alert">
          {blockedReason}
        </p>
      )}
      {field("name", c.name, { autoComplete: "name", required: true })}
      {field("phone", c.phone, { type: "tel", autoComplete: "tel", required: true })}
      {field("email", c.email, { type: "email", autoComplete: "email" })}
      {field("org", c.org, { autoComplete: "organization" })}
      <label className={l.field}>
        <span>{c.message}</span>
        <textarea name="message" maxLength={2000} placeholder={c.messagePlaceholder} />
      </label>
      <label className={`${l.consent} ${errors.consent ? l.fieldError : ""}`}>
        <input
          type="checkbox"
          name="consent"
          aria-invalid={!!errors.consent}
          aria-describedby={errors.consent ? "consent-err" : undefined}
        />
        <span>{c.consent}</span>
      </label>
      {errors.consent && (
        <span id="consent-err" className={l.error}>
          {errors.consent}
        </span>
      )}
      <button type="submit" className={l.primaryBtn} disabled={!!blockedReason || sending}>
        {sending ? c.submitting : c.submit(count)}
      </button>
    </form>
  );
}
