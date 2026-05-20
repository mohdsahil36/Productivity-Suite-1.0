"use client";

import Link from "next/link";
import { useState } from "react";

interface FocusCellProps {
  todoCount: number;
}

const OPTIONS = [
  { mins: 15, pct: 33 },
  { mins: 25, pct: 72 },
  { mins: 50, pct: 100 },
] as const;

type Minutes = (typeof OPTIONS)[number]["mins"];

export default function FocusCell({ todoCount }: FocusCellProps) {
  const suggested: Minutes = todoCount > 8 ? 50 : todoCount > 4 ? 25 : 15;
  const [selected, setSelected] = useState<Minutes>(suggested);

  const pct = OPTIONS.find((o) => o.mins === selected)?.pct ?? 72;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-3.5">
        <div>
          <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-[var(--db-text-primary)]">
            Focus Session
          </h2>
          <p className="text-[11px] text-[var(--db-text-tertiary)] mt-0.5">
            Recommended by queue
          </p>
        </div>
      </div>

      <div
        className="focus-ring relative flex items-center justify-center w-36 h-36 rounded-full mx-auto my-4 flex-shrink-0"
        style={{ "--focus-pct": `${pct}%` } as React.CSSProperties}
        aria-label={`${selected} minute focus session, ${pct}% of max`}
      >
        <div className="absolute inset-2.5 bg-[var(--db-bg-surface)] rounded-full flex flex-col items-center justify-center gap-0.5">
          <span className="font-mono-db text-[28px] font-medium text-[var(--db-text-primary)] leading-none">
            {selected}
          </span>
          <span className="text-[11px] text-[var(--db-text-tertiary)]">
            min
          </span>
        </div>
      </div>

      {/* Duration toggles */}
      <div
        className="flex gap-1.5 mb-3"
        role="group"
        aria-label="Session duration"
      >
        {OPTIONS.map(({ mins }) => (
          <button
            key={mins}
            onClick={() => setSelected(mins)}
            aria-pressed={selected === mins}
            className={[
              "flex-1 py-2 rounded-md border text-xs font-medium font-ui-db transition-colors duration-150",
              selected === mins
                ? "bg-[var(--db-green-soft)] text-[var(--db-text-primary)] border-[var(--db-green-mid)]"
                : "bg-[var(--db-bg-surface-3)] text-[var(--db-text-secondary)] border-[var(--db-border-default)] hover:border-[var(--db-border-mid)]",
            ].join(" ")}
          >
            {mins}m
          </button>
        ))}
      </div>
      <Link
        href="/pomodoro"
        className="mt-auto block w-full text-center bg-[var(--db-green-primary)] hover:bg-[var(--db-green-hover)] active:scale-[0.99] text-white dark:text-black rounded-md py-2.5 text-xs font-semibold tracking-[0.01em] transition-colors duration-150"
      >
        Open pomodoro
      </Link>
    </div>
  );
}
