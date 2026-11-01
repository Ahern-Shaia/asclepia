"use client";

import { Button, type ButtonProps } from "antd";
import { useRouter } from "next/navigation";

// A link that looks like a button: one <a href> (not a button inside a link), client-side
// navigation on a plain click, and the browser's own behaviour for new-tab clicks.
export function LinkButton({ href, ...props }: Omit<ButtonProps, "href"> & { href: string }) {
  const router = useRouter();
  return (
    <Button
      {...props}
      href={href}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        router.push(href);
      }}
    />
  );
}
