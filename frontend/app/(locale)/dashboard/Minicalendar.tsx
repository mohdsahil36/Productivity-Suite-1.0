"use client";

import type { FC } from "react";

interface MiniCalendarProps {
  month?: Date;
  eventDays?: Set<number>;
}

const DAY_NAMES = ["S", "M", "T", "W", "T", "F", "S"] as const;

const MiniCalendar: FC<MiniCalendarProps> = ({
  month = new Date(),
  eventDays = new Set<number>(),
}) => {
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === month.getFullYear() &&
    today.getMonth() === month.getMonth();

  const y = month.getFullYear();
  const m = month.getMonth();
  const todayDate = isCurrentMonth ? today.getDate() : -1;
  const firstDow = new Date(y, m, 1).getDay();
  const blanks = (firstDow + 7) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  return (
    <div
      className="grid gap-0.5 mt-3"
      style={{ gridTemplateColumns: "repeat(7, 1fr)" }}
      role="grid"
      aria-label="Monthly calendar"
    >
      {/* Day name headers */}
      {DAY_NAMES.map((n, i) => (
        <div
          key={i}
          role="columnheader"
          className="text-[9px] font-medium text-center text-[var(--db-text-tertiary)] tracking-[0.05em] uppercase pb-1.5"
        >
          {n}
        </div>
      ))}

      {/* Leading blank cells */}
      {Array.from({ length: blanks }, (_, i) => (
        <div key={`blank-${i}`} aria-hidden="true" />
      ))}

      {/* Day cells */}
      {Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const isToday = day === todayDate;
        const hasEvent = eventDays.has(day);

        return (
          <div
            key={day}
            role="gridcell"
            aria-label={`${day}${hasEvent ? ", event" : ""}${isToday ? ", today" : ""}`}
            aria-current={isToday ? "date" : undefined}
            className={[
              "relative aspect-square flex items-center justify-center font-mono-db text-[11px] rounded-md cursor-pointer transition-colors duration-100",
              isToday
                ? "bg-[var(--db-green-primary)] text-white dark:text-black font-medium"
                : "text-[var(--db-text-secondary)] hover:bg-[var(--db-bg-surface-3)]",
            ].join(" ")}
          >
            {day}
            {hasEvent && (
              <span
                aria-hidden="true"
                className={[
                  "absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                  isToday ? "bg-white" : "bg-[var(--db-green-primary)]",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MiniCalendar;
