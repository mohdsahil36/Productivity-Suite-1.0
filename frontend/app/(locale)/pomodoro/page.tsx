"use client";

import StopWatch from "@/app/components/Stopwatch";
import Pomodoro from "@/app/components/Pomodoro";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PomodoroPage() {
  return (
    <div className="min-h-[30rem] bg-[var(--bg-main)]">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Tabs */}
        <Tabs defaultValue="pomodoro" className="w-full">
          {/* Tabs Header */}
          <TabsList className="flex gap-2 bg-transparent p-0 justify-center">
            {["pomodoro", "stopwatch"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="
                  px-3 py-1.5 text-xs font-medium rounded-md transition
                  text-[var(--text-secondary)]
                  hover:text-[var(--text-primary)]
                  hover:bg-[var(--bg-surface)]
                  data-[state=active]:bg-[var(--green-soft)]
                  data-[state=active]:text-[var(--text-primary)]
                "
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Pomodoro */}
          <TabsContent value="pomodoro">
            <div
              className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-4 mt-4 space-y-4
"
            >
              <div>
                <h2 className="text-sm font-medium text-[var(--text-primary)]">
                  Pomodoro
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Focus timer for deep work sessions
                </p>
              </div>

              <Pomodoro />
            </div>
          </TabsContent>

          {/* Stopwatch */}
          <TabsContent value="stopwatch">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-4 mt-4 space-y-4">
              <div>
                <h2 className="text-sm font-medium text-[var(--text-primary)]">
                  Stopwatch
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Track time manually with precision
                </p>
              </div>

              <StopWatch />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
