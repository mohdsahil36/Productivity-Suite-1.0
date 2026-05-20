"use client";
import { useEffect, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useTaskStore } from "@/store/taskStore";

import KpiPill from "./Kpipill";
import WorkflowBar from "./Workflowbar";
import TaskRow from "./Taskrow";
import MiniCalendar from "./Minicalendar";
import FocusCell from "./Focuscell";
import SprintProgress from "./Sprintprogress";
import { TaskStatus, TaskPriority } from "./dashboardData";

import {
  VELOCITY_DATA,
  UPCOMING_EVENTS,
  CALENDAR_EVENT_DAYS,
} from "./dashboardData";
import { Button } from "@/components/ui/button";

const RECHARTS_TOOLTIP_STYLE: React.CSSProperties = {
  background: "var(--db-bg-surface)",
  border: "0.5px solid var(--db-border-mid)",
  borderRadius: "6px",
  fontSize: "11px",
  fontFamily: "var(--db-font-mono)",
  color: "var(--db-text-primary)",
  boxShadow: "none",
};
const RECHARTS_LABEL_STYLE: React.CSSProperties = {
  color: "var(--db-text-tertiary)",
};
const RECHARTS_CURSOR_STYLE: React.SVGProps<SVGElement> = {
  stroke: "var(--db-border-mid)",
  strokeWidth: 1,
};
const RECHARTS_TICK_STYLE = {
  fontSize: 10,
  fill: "var(--db-text-tertiary)",
  fontFamily: "var(--db-font-mono)",
};

const TAG_CLASSES: Record<string, string> = {
  eng: "bg-[var(--db-green-soft)] text-[var(--db-text-primary)]",
  design: "bg-[var(--db-blue-soft)] text-[var(--db-blue)]",
  mgmt: "bg-[var(--db-amber-soft)]  text-[var(--db-amber)]",
};

const CELL =
  "h-full min-h-0 bg-[var(--db-bg-surface)] border border-[var(--db-border-default)] rounded-lg p-4 overflow-hidden transition-colors duration-200 hover:border-[var(--db-border-mid)]";
const CELL_TITLE =
  "text-[13px] font-semibold tracking-[-0.01em] text-[var(--db-text-primary)] m-0";
const CELL_SUB = "text-[11px] text-[var(--db-text-tertiary)] mt-0.5";
const CELL_HDR = "flex items-start justify-between mb-2.5";
const LABEL_XS =
  "text-[10px] font-medium tracking-[0.07em] uppercase text-[var(--db-text-tertiary)]";
const MONO_XS = "font-mono-db text-[11px]";

export default function DashboardPage() {
  const rawTasks = useTaskStore((s) => s.tasks);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);
  const updateTaskStatus = useTaskStore((s) => s.updateTaskStatus);

  useEffect(() => {
    void fetchTasks("kanban");
  }, [fetchTasks]);

  const activeTasks = useMemo(() => {
    const list = Array.isArray(rawTasks) ? rawTasks : [];
    return list.length > 0 ? list : rawTasks;
  }, [rawTasks]);

  const doneTasks = useMemo(
    () => activeTasks.filter((t) => t.status === "Done").length,
    [activeTasks],
  );
  const inProgressTasks = useMemo(
    () => activeTasks.filter((t) => t.status === "In Progress").length,
    [activeTasks],
  );
  const todoTasks = useMemo(
    () => activeTasks.filter((t) => t.status === "To Do").length,
    [activeTasks],
  );
  const totalTasks = activeTasks.length;
  const completionRate =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const todayLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const calMonth = useMemo(() => new Date(), []);
  const averageVelocity = Math.round(
    VELOCITY_DATA.reduce((sum, item) => sum + item.tasks, 0) /
      VELOCITY_DATA.length,
  );
  const peakVelocity = VELOCITY_DATA.reduce((peak, item) =>
    item.tasks > peak.tasks ? item : peak,
  );

  return (
    <div className="font-ui-db bg-[var(--db-bg-main)] text-[var(--db-text-primary)]">
      <div className="bento-grid w-full max-w-[1440px] mx-auto">
        <header className={`${CELL} area-hdr !py-2.5`}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[var(--db-green-primary)] flex-shrink-0" />
              <div>
                <h1 className="text-[14px] font-semibold tracking-[-0.02em] text-[var(--db-text-primary)] m-0">
                  Productivity Workspace
                </h1>
                <p className="font-mono-db text-[11px] text-[var(--db-text-tertiary)] mt-0.5">
                  {todayLabel}
                </p>
              </div>
            </div>
            <div className="flex gap-1.5 items-center flex-wrap">
              <KpiPill label="Completion" value={`${completionRate}%`} accent />
              <KpiPill label="Total Tasks" value={totalTasks} />
              <KpiPill label="In Progress" value={inProgressTasks} />
              <KpiPill label="Streak" value="7d" />
            </div>
          </div>
        </header>

        <section
          className={`${CELL} area-chrt flex flex-col`}
          aria-label="Workflow activity"
        >
          <div className={CELL_HDR}>
            <div>
              <h2 className={CELL_TITLE}>Workflow Activity</h2>
              <p className={CELL_SUB}>Task distribution by status</p>
            </div>
            <span className="text-[11px] font-medium bg-[var(--db-green-soft)] text-[var(--db-text-primary)] border border-[var(--db-green-mid)] rounded px-2.5 py-0.5 whitespace-nowrap">
              {completionRate}% complete
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <WorkflowBar
              label="Done"
              value={doneTasks}
              total={totalTasks}
              variant="done"
            />
            <WorkflowBar
              label="In Progress"
              value={inProgressTasks}
              total={totalTasks}
              variant="progress"
            />
            <WorkflowBar
              label="To Do"
              value={todoTasks}
              total={totalTasks}
              variant="todo"
            />
          </div>

          <div className="mt-3 pt-3 border-t border-[var(--db-border-default)]">
            <span className={`${LABEL_XS} block mb-2`}>
              Daily velocity · last 7 days
            </span>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={VELOCITY_DATA}
                  margin={{ top: 4, right: 4, left: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="vel-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--db-green-primary)"
                        stopOpacity={0.18}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--db-green-primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="2 2"
                    vertical={false}
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={RECHARTS_TICK_STYLE}
                    interval={0}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={RECHARTS_TOOLTIP_STYLE}
                    labelStyle={RECHARTS_LABEL_STYLE}
                    cursor={RECHARTS_CURSOR_STYLE}
                  />
                  <Area
                    type="monotone"
                    dataKey="tasks"
                    stroke="var(--db-green-primary)"
                    strokeWidth={1.5}
                    fill="url(#vel-grad)"
                    dot={false}
                    activeDot={{
                      r: 3,
                      fill: "var(--db-green-primary)",
                      strokeWidth: 0,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-auto grid grid-cols-3 gap-2 pt-3">
            {[
              { label: "Avg / day", value: averageVelocity },
              { label: "Peak day", value: peakVelocity.day },
              {
                label: "Momentum",
                value:
                  VELOCITY_DATA.at(-1)?.tasks &&
                  VELOCITY_DATA.at(-2)?.tasks &&
                  VELOCITY_DATA.at(-1)!.tasks >= VELOCITY_DATA.at(-2)!.tasks
                    ? "Up"
                    : "Dip",
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-md border border-[var(--db-border-default)] bg-[var(--db-bg-surface-2)] px-3 py-2"
              >
                <div className="font-mono-db text-base font-medium leading-none text-[var(--db-text-primary)]">
                  {value}
                </div>
                <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--db-text-tertiary)]">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={`${CELL} area-foc`} aria-label="Focus session">
          <FocusCell todoCount={todoTasks} />
        </section>

        <section
          className={`${CELL} area-tsk flex flex-col justify-between`}
          aria-label="Task list"
        >
          <div className={CELL_HDR}>
            <div>
              <h2 className={CELL_TITLE}>Tasks</h2>
              <p className={CELL_SUB}>
                Single click to move to in progress, double click for done
              </p>
            </div>

            <span className={`${MONO_XS} text-[var(--db-text-tertiary)]`}>
              {totalTasks} total
            </span>
          </div>

          <div
            role="list"
            className="min-h-0 flex-1 space-y-1 overflow-auto pr-1"
          >
            {activeTasks.map((t) => (
              <TaskRow
                key={t._id}
                title={t.title}
                status={t.status as TaskStatus}
                priority={t.priority as TaskPriority}
                onToggleTask={() => {
                  const nextStatus =
                    t.status === "To Do"
                      ? "In Progress"
                      : t.status === "In Progress"
                        ? "Done"
                        : "To Do";

                  updateTaskStatus(t._id, nextStatus);
                }}
              />
            ))}
          </div>

          <div className="pt-2">
            <Button className="block w-full text-center bg-[var(--db-green-primary)] hover:bg-[var(--db-green-hover)] active:scale-[0.99] text-white dark:text-black rounded-md py-2 text-xs font-semibold tracking-[0.01em] transition-all duration-150">
              Add New Task
            </Button>
          </div>
        </section>

        <section
          className={`${CELL} area-cal flex flex-col !p-3`}
          aria-label="Calendar"
        >
          <div className={CELL_HDR}>
            <div>
              <h2 className={CELL_TITLE}>
                {calMonth.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <p className={CELL_SUB}>Daily activity</p>
            </div>
            <div className="flex gap-1.5">
              <button
                className="bg-transparent border border-[var(--db-border-default)] hover:border-[var(--db-border-mid)] rounded w-6 h-6 flex items-center justify-center text-xs text-[var(--db-text-tertiary)] transition-colors duration-150"
                aria-label="Previous month"
              >
                {"<"}
              </button>
              <button
                className="bg-transparent border border-[var(--db-border-default)] hover:border-[var(--db-border-mid)] rounded w-6 h-6 flex items-center justify-center text-xs text-[var(--db-text-tertiary)] transition-colors duration-150"
                aria-label="Next month"
              >
                {">"}
              </button>
            </div>
          </div>
          <MiniCalendar month={calMonth} eventDays={CALENDAR_EVENT_DAYS} />
        </section>

        <section
          className={`${CELL} area-ins flex flex-col`}
          aria-label="Insights"
        >
          <div className={CELL_HDR}>
            <div>
              <h2 className={CELL_TITLE}>Insights</h2>
              <p className={CELL_SUB}>Workflow health</p>
            </div>
            <span className="text-[11px] font-medium bg-[var(--db-green-soft)] text-[var(--db-text-primary)] border border-[var(--db-green-mid)] rounded px-2 py-0.5">
              Stable
            </span>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-2">
            {[
              { num: doneTasks, desc: "Completed", accent: true },
              { num: inProgressTasks, desc: "In Progress", accent: false },
              { num: todoTasks, desc: "To Do", accent: false },
              { num: "94%", desc: "On-time rate", accent: false },
            ].map(({ num, desc, accent }) => (
              <div
                key={desc}
                className={[
                  "rounded-md border p-3",
                  accent
                    ? "bg-[var(--db-green-soft)] border-[var(--db-green-mid)]"
                    : "bg-[var(--db-bg-surface-2)] border-[var(--db-border-default)]",
                ].join(" ")}
              >
                <div
                  className={`font-mono-db text-xl font-medium leading-none ${accent ? "text-[var(--db-text-primary)]" : "text-[var(--db-text-primary)]"}`}
                >
                  {num}
                </div>
                <div
                  className={`text-[11px] mt-1 ${accent ? "text-[var(--db-text-secondary)]" : "text-[var(--db-text-tertiary)]"}`}
                >
                  {desc}
                </div>
              </div>
            ))}
          </div>

          <SprintProgress done={doneTasks} total={totalTasks} />
        </section>

        <section className={`${CELL} area-nts flex flex-col`} aria-label="Quick notes">
          <div className={CELL_HDR}>
            <div>
              <h2 className={CELL_TITLE}>Quick Notes</h2>
              <p className={CELL_SUB}>Scratchpad · auto-saved</p>
            </div>
            <span className={LABEL_XS}>Ctrl+S to save</span>
          </div>
          <textarea
            className="w-full mt-2 min-h-0 flex-1 resize-none bg-[var(--db-bg-surface-2)] border border-[var(--db-border-default)] focus:border-[var(--db-border-strong)] outline-none rounded-md px-3 py-2 font-ui-db text-xs text-[var(--db-text-primary)] placeholder:text-[var(--db-text-tertiary)] leading-relaxed transition-colors duration-150"
            defaultValue="Auth refactor: consider moving token refresh to middleware layer.&#10;&#10;Dashboard perf: lazy-load chart component, defer calendar hydration until visible."
            aria-label="Quick notes"
          />
          <div className="flex gap-1.5 mt-2 flex-wrap items-center">
            {[
              {
                label: "architecture",
                cls: "bg-[var(--db-blue-soft)]  text-[var(--db-blue)]",
              },
              {
                label: "perf",
                cls: "bg-[var(--db-amber-soft)] text-[var(--db-amber)]",
              },
              {
                label: "shipped",
                cls: "bg-[var(--db-green-soft)] text-[var(--db-text-primary)]",
              },
            ].map(({ label, cls }) => (
              <span
                key={label}
                className={`text-[9px] font-medium tracking-[0.05em] uppercase px-1.5 py-0.5 rounded ${cls}`}
              >
                {label}
              </span>
            ))}
            <button className="bg-transparent border border-[var(--db-border-default)] hover:border-[var(--db-border-mid)] rounded text-[9px] px-2 py-0.5 text-[var(--db-text-tertiary)] font-ui-db transition-colors duration-150">
              + tag
            </button>
          </div>
        </section>

        <section className={`${CELL} area-upc flex flex-col`} aria-label="Upcoming events">
          <div className={CELL_HDR}>
            <div>
              <h2 className={CELL_TITLE}>Upcoming</h2>
              <p className={CELL_SUB}>Today&apos;s schedule</p>
            </div>
            <span className="text-[9px] font-medium tracking-[0.05em] uppercase px-1.5 py-0.5 rounded bg-[var(--db-blue-soft)] text-[var(--db-blue)]">
              {UPCOMING_EVENTS.length} events
            </span>
          </div>

          <ul className="min-h-0 flex-1 overflow-auto pr-1 flex flex-col gap-1.5" role="list">
            {UPCOMING_EVENTS.map((ev) => (
              <li
                key={ev.time}
                className="flex items-center gap-2.5 bg-[var(--db-bg-surface-2)] border border-[var(--db-border-default)] hover:border-[var(--db-border-mid)] rounded-md px-3 py-2 transition-colors duration-150"
              >
                <span className="font-mono-db text-[11px] text-[var(--db-text-tertiary)] min-w-[36px] whitespace-nowrap">
                  {ev.time}
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: ev.color }}
                  aria-hidden="true"
                />
                <span className="flex-1 text-xs text-[var(--db-text-primary)] truncate">
                  {ev.title}
                </span>
                <span
                  className={`text-[9px] font-medium tracking-[0.05em] uppercase px-1.5 py-0.5 rounded ${TAG_CLASSES[ev.tag] ?? ""}`}
                >
                  {ev.tag}
                </span>
              </li>
            ))}
          </ul>

          <div
            className="mt-2 flex items-center justify-between gap-2 bg-[var(--db-green-soft)] border border-[var(--db-green-mid)] rounded-md px-3 py-2"
            role="note"
          >
            <span className="text-[11px] font-semibold text-[var(--db-text-primary)] whitespace-nowrap">
              AI Summary
            </span>
            <span className="text-[11px] text-[var(--db-text-secondary)]">
              Heavy meeting day. Block deep work before 10:00.
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
