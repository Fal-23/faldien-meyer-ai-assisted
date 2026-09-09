import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";

import { ThemeToggle } from "./theme-toggle";
import { navItems } from "@/lib/tools";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border-strong bg-background/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand shadow-[var(--shadow-glow)]">
            <Sparkles className="h-4 w-4 text-brand-foreground" />
          </span>
          <span className="text-base font-semibold tracking-tight">Workly AI</span>
        </Link>

        <ul className="hidden flex-1 items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.to;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <span className={cn(active && "text-gradient")}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-strong bg-secondary/60 text-muted-foreground lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-border-strong bg-background lg:hidden">
          <ul className="mx-auto max-w-7xl space-y-1 px-4 py-3 sm:px-6">
            {navItems.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
