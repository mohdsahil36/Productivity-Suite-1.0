import type { FC } from "react";
import { TaskPriority, TaskStatus } from "./dashboardData";
interface TaskRowProps {
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  onToggleTask?: () => void;
}

const PRIORITY_CLASSES: Record<TaskPriority, string> = {
  High: "bg-[var(--db-red-soft)] text-[var(--db-red)]",
  Medium: "bg-[var(--db-amber-soft)] text-[var(--db-amber)]",
  Low: "bg-[var(--db-green-soft)] text-[var(--db-text-primary)]",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  High: "High",
  Medium: "Medium",
  Low: "Low",
};

const TaskRow: FC<TaskRowProps> = ({
  title,
  status,
  priority,
  onToggleTask,
}) => {
  const isDone = status === "Done";
  const isInProgress = status === "In Progress";

  return (
    <div className="flex items-center gap-2.5 py-1.5 border-b border-[var(--db-border-default)] last:border-b-0 last:pb-0">
      <span
        aria-label={isDone ? "Mark as to do" : "Mark as done"}
        onClick={onToggleTask}
        className={[
          `relative flex-shrink-0 w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-colors duration-150`,
          isDone
            ? "bg-[var(--db-green-primary)] border-[var(--db-green-primary)]"
            : isInProgress
              ? "border-[var(--db-amber)]"
              : "border-[var(--db-border-mid)]",
        ].join(" ")}
        role="button"
      >
        {isDone && (
          <svg
            viewBox="0 0 10 10"
            className="w-2.5 h-2.5"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="1.5,5 4,8 8.5,2" />
          </svg>
        )}
        {isInProgress && (
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--db-amber)]" />
        )}
      </span>

      <span
        className={[
          "flex-1 text-xs truncate",
          isDone
            ? "line-through text-[var(--db-text-tertiary)] decoration-[var(--db-text-tertiary)]"
            : isInProgress
              ? "text-[var(--db-amber)]"
              : "text-[var(--db-text-primary)]",
        ].join(" ")}
      >
        {title}
      </span>

      <span
        className={`flex-shrink-0 text-[9px] font-medium tracking-[0.06em] uppercase px-1.5 py-0.5 rounded-sm ${PRIORITY_CLASSES[priority]}`}
      >
        {PRIORITY_LABELS[priority] ?? priority}
      </span>
    </div>
  );
};

export default TaskRow;
