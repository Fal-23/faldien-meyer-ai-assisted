import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  DemoNotice,
  EmptyState,
  Field,
  GradientButton,
  LoadingState,
  Panel,
  ToolShell,
  inputClass,
} from "@/components/tool-shell";
import { planTasks, type PlannerResult } from "@/lib/ai.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Workly AI" },
      {
        name: "description",
        content: "Rank your tasks by urgency and importance into a focused day or week schedule.",
      },
      { property: "og:title", content: "AI Task Planner — Workly AI" },
      {
        property: "og:description",
        content: "Rank your tasks by urgency and importance into a focused day or week schedule.",
      },
    ],
  }),
  component: PlannerPage,
});

const priorityClass: Record<string, string> = {
  High: "bg-destructive/15 text-destructive",
  Medium: "bg-brand/15 text-brand",
  Low: "bg-teal/15 text-teal",
};

function PlannerPage() {
  const run = useServerFn(planTasks);
  const [tasks, setTasks] = useState("");
  const [horizon, setHorizon] = useState<"day" | "week">("day");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlannerResult | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!tasks.trim()) return;
    setLoading(true);
    try {
      const res = await run({ data: { tasks, horizon } });
      setResult(res);
      if (res.error) toast.error(res.error);
    } catch {
      toast.error("Could not build a schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell
      icon={CalendarClock}
      title="AI Task Planner"
      description="Drop in your task list — with deadlines or urgency if you have them — and get a ranked, time-blocked plan."
      tint="blue"
    >
      <Panel title="Your tasks">
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Tasks">
            <textarea
              className={`${inputClass} min-h-44 resize-y`}
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              placeholder={"One task per line\ne.g. Finish Q3 report — due Friday, urgent\nReview design feedback"}
            />
          </Field>
          <Field label="Plan for">
            <select
              className={inputClass}
              value={horizon}
              onChange={(e) => setHorizon(e.target.value as typeof horizon)}
            >
              <option value="day">A focused day</option>
              <option value="week">The week ahead</option>
            </select>
          </Field>
          <GradientButton type="submit" disabled={loading || !tasks.trim()}>
            {loading ? "Planning…" : "Build my schedule"}
          </GradientButton>
        </form>
      </Panel>

      <Panel title="Schedule">
        {loading ? (
          <LoadingState label="Ranking tasks and blocking out time…" />
        ) : result ? (
          <div className="space-y-4">
            <DemoNotice show={result.demo} />
            <ol className="relative space-y-3 border-l border-border-strong pl-6">
              {result.schedule.map((item, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[1.9rem] top-3 h-2.5 w-2.5 rounded-full bg-gradient-brand ring-4 ring-background" />
                  <div className="surface-card p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {item.slot}
                      </span>
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-xs font-medium",
                          priorityClass[item.priority] ?? priorityClass["Medium"],
                        )}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium">{item.task}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <EmptyState
            icon={CalendarClock}
            message="Your prioritised schedule will appear here as a clean timeline."
          />
        )}
      </Panel>
    </ToolShell>
  );
}
