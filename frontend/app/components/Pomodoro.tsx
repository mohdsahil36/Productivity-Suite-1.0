"use client";

import { useState, type ChangeEvent } from "react";
import { useTimeStore } from "@/store/timeStore";

const timeFactors = {
  Hours: "h",
  Minutes: "m",
  Seconds: "s",
};

const timeConfig = {
  [timeFactors.Hours]: { value: "0", factor: 60 * 60 * 1000 },
  [timeFactors.Minutes]: { value: "0", factor: 60 * 1000 },
  [timeFactors.Seconds]: { value: "0", factor: 1000 },
};

const orderOfTime = [
  timeFactors.Hours,
  timeFactors.Minutes,
  timeFactors.Seconds,
];

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 282.74

export default function Pomodoro() {
  const [config, setConfig] = useState(structuredClone(timeConfig));

  const { time, startPomodoro, pause, reset } = useTimeStore();

  /* Input handler */
  function handleChange(key: string, e: ChangeEvent<HTMLInputElement>) {
    const newValue = Number(e.target.value).toString();
    const newConfig = structuredClone(config);
    newConfig[key].value = newValue;
    setConfig(newConfig);
  }

  function convertedTime() {
    let convertedTime = 0;
    orderOfTime.forEach((key) => {
      // order of time because we have to traverse through the array
      const { value, factor } = config[key];
      if (!isNaN(Number(value))) {
        convertedTime += Number(value) * factor;
      }
    });

    return convertedTime;
  }

  function pad(num: number) {
    return num.toString().padStart(2, "0");
  }

  function formatTime(time: number) {
    const sec = Math.floor((time / 1000) % 60);
    const min = Math.floor((time / (1000 * 60)) % 60);
    const hr = Math.floor((time / (1000 * 60 * 60)) % 24);
    return `${pad(hr)}:${pad(min)}:${pad(sec)}`;
  }

  // preview time from inputs
  const previewTime = orderOfTime.reduce((acc, key) => {
    const { value, factor } = config[key];
    return acc + (Number(value) || 0) * factor;
  }, 0);

  const isRunning = time > 0;
  const totalTime = previewTime || time || 1;
  const progress = isRunning ? time / totalTime : 1;
  const strokeDashoffset = (1 - progress) * CIRCUMFERENCE;

  const displayTime = isRunning ? formatTime(time) : formatTime(previewTime);

  return (
    <div className="flex min-h-[20rem] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--db-bg-surface)] border border-[var(--db-border-default)] rounded-lg p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-[var(--db-text-primary)]">
                Pomodoro
              </h2>
              <p className="text-[11px] text-[var(--db-text-tertiary)] mt-0.5">
                Focus timer
              </p>
            </div>

            <span
              className={[
                "text-[9px] font-medium tracking-[0.07em] uppercase px-2.5 py-1 rounded-full border transition-colors duration-200",
                isRunning
                  ? "bg-[var(--db-green-soft)] text-[var(--db-text-primary)] border-[var(--db-green-mid)]"
                  : "bg-[var(--db-bg-surface-2)] text-[var(--db-text-tertiary)] border-[var(--db-border-default)]",
              ].join(" ")}
            >
              {isRunning ? "Running" : "Ready"}
            </span>
          </div>

          <div className="flex items-end justify-center gap-2">
            {orderOfTime.map((key, index) => (
              <div key={key} className="flex items-end gap-2">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[9px] font-medium tracking-[0.07em] uppercase text-[var(--db-text-tertiary)]">
                    {key === "h"
                      ? "Hours"
                      : key === "m"
                        ? "Minutes"
                        : "Seconds"}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={config[key].value}
                    onChange={(e) => handleChange(key, e)}
                    disabled={isRunning}
                    className="
                      w-14 text-center text-sm font-medium font-mono
                      bg-[var(--db-bg-surface-2)]
                      border border-[var(--db-border-default)]
                      rounded-md px-2 py-1.5
                      text-[var(--db-text-primary)]
                      focus:outline-none focus:border-[var(--db-green-primary)] focus:ring-1 focus:ring-[var(--db-green-primary)]
                      disabled:opacity-40 disabled:cursor-not-allowed
                      transition-colors duration-150
                      [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                    "
                  />
                </div>
                {index < orderOfTime.length - 1 && (
                  <span className="mb-2 text-base font-semibold text-[var(--db-text-tertiary)]">
                    :
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center py-2">
            <div className="relative flex h-44 w-44 items-center justify-center">
              <svg
                className="absolute inset-0 h-44 w-44 -rotate-90"
                viewBox="0 0 100 100"
                aria-label={`Timer: ${displayTime}`}
              >
                {/* Background track */}
                <circle
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  stroke="var(--db-border-default)"
                  strokeWidth="4"
                  fill="none"
                />
                {/* Progress arc */}
                <circle
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  stroke="var(--db-green-primary)"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>

              {/* Centre */}
              <div className="flex h-36 w-36 flex-col items-center justify-center gap-0.5 rounded-full bg-[var(--db-bg-surface-2)] border border-[var(--db-border-default)]">
                <span className="font-mono text-2xl font-semibold tracking-tight text-[var(--db-text-primary)]">
                  {displayTime}
                </span>
                <span className="text-[10px] text-[var(--db-text-tertiary)] tracking-wide">
                  {isRunning ? "Remaining" : "Start"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            <button
              onClick={() => startPomodoro(convertedTime())}
              className="
                px-5 py-2 text-xs font-semibold rounded-md
                bg-[var(--db-green-primary)] text-white
                dark:text-black
                hover:bg-[var(--db-green-hover)]
                active:scale-[0.98]
                transition-all duration-150 cursor-pointer
              "
            >
              Start
            </button>

            <button
              onClick={pause}
              className="
                px-5 py-2 text-xs font-semibold rounded-md
                bg-[var(--db-bg-surface-2)] text-[var(--db-text-primary)]
                border border-[var(--db-border-default)]
                hover:border-[var(--db-border-mid)]
                active:scale-[0.98]
                transition-all duration-150 cursor-pointer
              "
            >
              Pause
            </button>

            <button
              onClick={() => {
                reset();
                setConfig(structuredClone(timeConfig));
              }}
              className="
                px-5 py-2 text-xs font-semibold rounded-md
                bg-[var(--db-bg-surface-2)] text-[var(--db-text-primary)]
                border border-[var(--db-border-default)]
                hover:border-[var(--db-border-mid)]
                active:scale-[0.98]
                transition-all duration-150 cursor-pointer
              "
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
