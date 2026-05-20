"use client";

import Link from "next/link";
import { ModeToggle } from "../styles/modeToggle";

const pageLinks = ["dashboard", "kanban", "pomodoro", "notes"];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--border-default)] bg-[var(--bg-surface)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:px-5">
        <h1 className="text-sm font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
          DevFlow
        </h1>

        <div className="flex items-center gap-2">
          <ul className="flex items-center gap-1 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface-2)] p-1">
            {pageLinks.map((item) => (
              <li key={item}>
                <Link
                  href={`/${item}`}
                  className="
                  block rounded px-2.5 py-1.5 text-xs font-medium capitalize
                  text-[var(--text-secondary)]
                  hover:text-[var(--text-primary)]
                  hover:bg-[var(--bg-surface)]
                  transition
                "
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
