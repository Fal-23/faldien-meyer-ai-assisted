import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";

import { tools } from "@/lib/tools";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Workly AI Dashboard — Your AI Workplace Assistant" },
      {
        name: "description",
        content:
          "One dashboard for AI email drafting, meeting summaries, task planning, research and chat.",
      },
      { property: "og:title", content: "Workly AI Dashboard — Your AI Workplace Assistant" },
      {
        property: "og:description",
        content:
          "One dashboard for AI email drafting, meeting summaries, task planning, research and chat.",
      },
    ],
  }),
  component: Dashboard,
});

const stats = [
  { value: "6.5 hrs", label: "Saved per person each week", note: "Across drafting and summarising" },
  { value: "3× faster", label: "Response time on internal email", note: "From first draft to sent" },
  { value: "100%", label: "Editable and private by default", note: "Nothing leaves your workspace" },
];

function Dashboard() {
  return (
    <main>
      <section className="hero-glow">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-teal" />
            AI-powered workplace assistant
          </span>

          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Your <span className="text-gradient">AI workplace</span> assistant
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Workly AI automates the busywork around your day — writing emails, summarising meetings,
            planning your tasks and digging through research — so your team can spend its time on
            work that actually needs a human.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/email"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-3 text-sm font-semibold text-brand-foreground shadow-[var(--shadow-glow)] transition-opacity hover:opacity-90"
            >
              Start with Email <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-secondary/50 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Open AI Chat
            </Link>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="surface-card p-5">
                <p className="text-2xl font-semibold tracking-tight text-gradient">{stat.value}</p>
                <p className="mt-2 text-sm font-medium">{stat.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold tracking-tight">Productivity tools</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Five focused assistants, each built for one part of your working day.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.to}
                to={tool.to}
                className={cn(
                  "surface-card stripe-top group flex flex-col p-6 pt-7 transition-transform hover:-translate-y-0.5",
                  tool.tint === "teal" && "stripe-top-teal",
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border",
                    tool.tint === "blue"
                      ? "border-brand/40 bg-brand/12 text-brand"
                      : "border-teal/40 bg-teal/12 text-teal",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{tool.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {tool.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-gradient">
                  Open tool
                  <ArrowRight className="h-4 w-4 text-brand transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
