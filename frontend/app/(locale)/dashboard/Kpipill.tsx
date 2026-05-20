import type { FC } from "react";

interface KpiPillProps {
  label: string;
  value: string | number;
  accent?: boolean;
}

const KpiPill: FC<KpiPillProps> = ({ label, value, accent = false }) => (
  <div
    className={[
      "flex flex-col items-end rounded-md border px-3 py-1.5 cursor-default transition-colors duration-150",
      accent
        ? "bg-[var(--db-green-soft)] border-[var(--db-green-mid)]"
        : "bg-[var(--db-bg-surface-2)] border-[var(--db-border-default)] hover:border-[var(--db-border-mid)]",
    ].join(" ")}
  >
    <span
      className={[
        "text-[9px] font-medium tracking-widest uppercase",
        accent
          ? "text-[var(--db-text-primary)]"
          : "text-[var(--db-text-tertiary)]",
      ].join(" ")}
    >
      {label}
    </span>
    <span
      className={[
        "font-mono-db text-sm font-medium mt-0.5",
        accent
          ? "text-[var(--db-text-primary)]"
          : "text-[var(--db-text-primary)]",
      ].join(" ")}
    >
      {value}
    </span>
  </div>
);

export default KpiPill;
