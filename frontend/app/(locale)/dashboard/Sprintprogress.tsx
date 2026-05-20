import type { FC } from "react";

interface SprintProgressProps {
  done: number;
  total: number;
  currentDay?: number;
  totalDays?: number;
}

const SprintProgress: FC<SprintProgressProps> = ({
  done,
  total,
  currentDay = 8,
  totalDays = 14,
}) => {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const daysLeft = totalDays - currentDay;

  return (
    <div className="mt-2.5">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] font-medium tracking-[0.07em] uppercase text-[var(--db-text-tertiary)]">
          Sprint progress
        </span>
        <span className="font-mono-db text-[11px] text-[var(--db-text-primary)]">
          {pct}%
        </span>
      </div>

      <div
        className="h-1.5 rounded-full bg-[var(--db-bg-surface-3)] overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-[var(--db-green-primary)] transition-[width] duration-700 ease-in-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-[10px] font-medium tracking-[0.07em] uppercase text-[var(--db-text-tertiary)]">
          Day {currentDay} of {totalDays}
        </span>
        <span className="text-[10px] font-medium tracking-[0.07em] uppercase text-[var(--db-text-tertiary)]">
          {daysLeft} days left
        </span>
      </div>
    </div>
  );
};

export default SprintProgress;
