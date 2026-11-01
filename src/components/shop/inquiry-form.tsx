"use client";

import { type FormEvent, useState } from "react";
import { shopCopy } from "@/copy/shop";
import { failed, type FormOutcome, type InquiryValues } from "./inquiry-send";
import l from "./shop.module.css";

const c = shopCopy.inquiry;
const PHONE = /^[0-9 +\-()#]{1,30}$/; // same rule as the endpoint (inquiry.md §7-bis.1)
const FIELDS = ["name", "phone", "email", "org", "message", "consent"] as const;
type Field = (typeof FIELDS)[number];
type Errors = Partial<Record<Field, string>>;

// Checks the obvious mistakes before sending (the endpoint stays the authority) and shows what the
// endpoint answered: field errors at their fields, anything else as one sentence at the top.
// `onSubmit` resolves once the send is settled; on success the caller replaces this form.
export function InquiryForm({
  count,
  blockedReason,
  phone,
  onSubmit,
}: {
  count: number;
  blockedReason?: string;
  phone: string;
  onSubmit: (values: InquiryValues) => Promise<FormOutcome>;
}) {
  const [errors, setErrors] = useState<Errors>({});
  const [alert, setAlert] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (blockedReason || sending) return;
    const form = e.currentTarget;
    const f = new FormData(form);
    const text = (k: string) => f.get(k)?.toString().trim() ?? "";
    const values: InquiryValues = {
      name: text("name"),
      phone: text("phone"),
      email: text("email"),
      org: text("org"),
      message: text("message"),
      consent: f.get("consent") !== null,
    };
    const next: Errors = {};
    if (!values.name) next.name = c.required.name;
    if (!values.phone) next.phone = c.required.phone;
    else if (!PHONE.test(values.phone)) next.phone = c.required.phoneFormat;
    if (!values.consent) next.consent = c.required.consent;
    const focusFirst = (errs: Errors) =>
      form.querySelector<HTMLElement>(`[name="${FIELDS.find((k) => errs[k])}"]`)?.focus();
    setErrors(next);
    setAlert("");
    if (Object.keys(next).length) return focusFirst(next);

    setSending(true);
    let out: FormOutcome;
    try {
      out = await onSubmit(values);
    } catch {
      out = failed(phone); // network down, server unreachable
    }
    if (out.ok) return;
    setSending(false);
    const fieldErrors: Errors = {};
    const other: string[] = [];
    for (const [k, v] of Object.entries(out.fieldErrors ?? {}))
      if ((FIELDS as readonly string[]).includes(k)) fieldErrors[k as Field] = v;
      else other.push(v);
    setErrors(fieldErrors);
    setAlert([out.message, ...other].join(" "));
    focusFirst(fieldErrors);
  };

  const field = (
    name: Field,
    label: string,
    props: { type?: string; autoComplete?: string; required?: boolean } = {},
  ) => {
    const err = errors[name];
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
      {(blockedReason || alert) && (
        <p className={l.alert} role="alert">
          {blockedReason || alert}
        </p>
      )}
      {field("name", c.name, { autoComplete: "name", required: true })}
      {field("phone", c.phone, { type: "tel", autoComplete: "tel", required: true })}
      {field("email", c.email, { type: "email", autoComplete: "email" })}
      {field("org", c.org, { autoComplete: "organization" })}
      <label className={`${l.field} ${errors.message ? l.fieldError : ""}`}>
        <span>{c.message}</span>
        <textarea
          name="message"
          maxLength={2000}
          placeholder={c.messagePlaceholder}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-err" : undefined}
        />
        {errors.message && (
          <span id="message-err" className={l.error}>
            {errors.message}
          </span>
        )}
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
