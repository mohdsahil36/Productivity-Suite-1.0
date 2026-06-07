"use client";

import Link from "next/link";
import { LayoutDashboard, ListChecks, NotebookTabs, Timer } from "lucide-react";
import { usePathname } from "next/navigation";
import { ModeToggle } from "../styles/modeToggle";

const pageLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Kanban", href: "/kanban", icon: ListChecks },
  { label: "Pomodoro", href: "/pomodoro", icon: Timer },
  { label: "Notes", href: "/notes", icon: NotebookTabs },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--border-default)] bg-[var(--bg-surface)]/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--border-default)] bg-[var(--text-primary)] text-[12px] font-semibold text-[var(--bg-surface)]">
            PS
          </span>
          <div>
            <h1 className="text-sm font-semibold leading-none tracking-[-0.01em] text-[var(--text-primary)]">
              Productivity Suite
            </h1>
            <p className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)] sm:block">
              Version 1.0
            </p>
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <ul className="hidden max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface-2)] p-1 md:flex">
            {pageLinks.map(({ label, href, icon: Icon }) => {
              const isActive =
                pathname === href ||
                pathname.startsWith(`${href}/`) ||
                (href === "/dashboard" && pathname === "/");

              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={[
                      "inline-flex h-8 items-center gap-2 rounded-md px-3 text-xs font-medium transition",
                      isActive
                        ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_var(--border-default)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]",
                    ].join(" ")}
                  >
                    <Icon className="size-3.5" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <ul className="flex items-center gap-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface-2)] p-1 md:hidden">
            {pageLinks.slice(0, 3).map(({ label, href, icon: Icon }) => {
              const isActive =
                pathname === href ||
                pathname.startsWith(`${href}/`) ||
                (href === "/dashboard" && pathname === "/");

              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-label={label}
                    className={[
                      "grid h-8 w-8 place-items-center rounded-md transition",
                      isActive
                        ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_var(--border-default)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]",
                    ].join(" ")}
                  >
                    <Icon className="size-4" />
                  </Link>
                </li>
              );
            })}
          </ul>

          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
