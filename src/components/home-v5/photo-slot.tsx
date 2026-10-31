import { CameraOutlined } from "@ant-design/icons";
import s from "./home-v5.module.css";

// Placeholder for a real photo uploaded from the back office (art-direction rule A1/A2).
// It states what goes here, so reviewers judge layout without mistaking it for final art.
export function PhotoSlot({
  label,
  spec,
  tone = "light",
  corner = false,
  className,
}: {
  label: string;
  spec: string;
  tone?: "light" | "dark";
  corner?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`${s.slot} ${tone === "dark" ? s.slotDark : ""} ${corner ? s.slotCorner : ""} ${className ?? ""}`}
      role="img"
      aria-label={`${label}（照片位置，待上傳）`}
    >
      <span className={s.slotInner}>
        <CameraOutlined aria-hidden className={s.slotIcon} />
        <strong>{label}</strong>
        <span>{spec}</span>
      </span>
    </div>
  );
}
