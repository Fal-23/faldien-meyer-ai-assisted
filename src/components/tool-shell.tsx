import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ToolShell({
  icon: Icon,
  title,
  description,
  tint = "blue",
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tint?: "blue" | "teal";
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
            tint === "blue"
              ? "border-brand/40 bg-brand/12 text-brand"
              : "border-teal/40 bg-teal/12 text-teal",
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-8 space-y-6">{children}</div>
    </div>
  );
}

export function Panel({
  title,
  children,
  className,
  action,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn("surface-card p-5 sm:p-6", className)}>
      {title ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-border-strong bg-background/60 px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/30";

export function GradientButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-[var(--shadow-glow)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-3 animate-pulse rounded-full bg-secondary"
          style={{ width: `${100 - i * 18}%` }}
        />
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong px-6 py-12 text-center">
      <Icon className="h-6 w-6 text-muted-foreground" />
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function DemoNotice({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <p className="rounded-lg border border-border-strong bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
      Showing a demo response — connect an AI key to generate live results.
    </p>
  );
}
