"use client";

import { useTimeStore } from "@/store/timeStore";

export default function StopWatch() {
  const { time, startStopwatch, pause, reset } = useTimeStore();

  function pad(num: number) {
    return num.toString().padStart(2, "0");
  }

  function formatTime() {
    const ms = Math.floor((time % 1000) / 10);
    const sec = Math.floor((time / 1000) % 60);
    const min = Math.floor((time / (1000 * 60)) % 60);
    const hr = Math.floor((time / (1000 * 60 * 60)) % 24);

    return `${pad(hr)}:${pad(min)}:${pad(sec)}.${pad(ms)}`;
  }

  // function onBlur() {
  //   // remember if it was running
  //   needToResumeRef.current = intervalRef.current !== null;

  //   if (intervalRef.current) {
  //     clearInterval(intervalRef.current);
  //     intervalRef.current = null;
  //   }
  // }

  // function onFocus() {
  //   if (needToResumeRef.current) {
  //     startStopwatch();
  //     needToResumeRef.current = false;
  //   }
  // }

  // useEffect(() => {
  //   window.addEventListener("blur", onBlur);
  //   window.addEventListener("focus", onFocus);

  //   return () => {
  //     window.removeEventListener("blur", onBlur);
  //     window.removeEventListener("focus", onFocus);

  //     // cleanup interval on unmount
  //     if (intervalRef.current) {
  //       clearInterval(intervalRef.current);
  //     }
  //   };
  // });

  return (
    <div className="mx-auto max-w-md space-y-5 text-[var(--text-primary)]">
      {/* Timer Display */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-4">
        <h1 className="text-center text-lg font-semibold tracking-tight">
          {formatTime()}
        </h1>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {/* Start */}
        <button
          onClick={startStopwatch}
          className="
            px-4 py-2 text-xs font-medium rounded-md
            bg-[var(--green-primary)] text-white dark:text-black
            hover:bg-[var(--green-hover)]
            active:bg-[var(--green-active)]
            transition
          "
        >
          Start
        </button>

        {/* Pause */}
        <button
          onClick={pause}
          className="
            px-4 py-2 text-xs font-medium rounded-md
            bg-[var(--bg-surface-2)] text-[var(--text-primary)]
            border border-[var(--border-default)]
            hover:border-[var(--border-strong)]
            transition
          "
        >
          Pause
        </button>

        {/* Reset */}
        <button
          onClick={reset}
          className="
            px-4 py-2 text-xs font-medium rounded-md
            bg-[var(--bg-surface-2)] text-[var(--text-primary)]
            border border-[var(--border-default)]
            hover:border-[var(--border-strong)]
            transition
          "
        >
          Reset
        </button>
      </div>
    </div>
  );
}
