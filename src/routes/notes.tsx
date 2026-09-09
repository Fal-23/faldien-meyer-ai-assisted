import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock, CheckCircle2, FileText, ListChecks } from "lucide-react";
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
import { summarizeNotes, type NotesResult } from "@/lib/ai.functions";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Workly AI" },
      {
        name: "description",
        content: "Turn raw meeting notes into a summary, action items, decisions and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — Workly AI" },
      {
        property: "og:description",
        content: "Turn raw meeting notes into a summary, action items, decisions and deadlines.",
      },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const run = useServerFn(summarizeNotes);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NotesResult | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!notes.trim()) return;
    setLoading(true);
    try {
      const res = await run({ data: { notes } });
      setResult(res);
      if (res.error) toast.error(res.error);
    } catch {
      toast.error("Could not summarise those notes. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell
      icon={FileText}
      title="Meeting Notes Summarizer"
      description="Paste raw notes or a transcript and get back the summary, who owns what, what was decided and what's due."
      tint="teal"
    >
      <Panel title="Raw notes">
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Notes or transcript">
            <textarea
              className={`${inputClass} min-h-56 resize-y`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste your meeting notes or transcript here…"
            />
          </Field>
          <GradientButton type="submit" disabled={loading || !notes.trim()}>
            {loading ? "Summarising…" : "Summarise notes"}
          </GradientButton>
        </form>
      </Panel>

      <Panel title="Results">
        {loading ? (
          <LoadingState label="Reading through your notes…" />
        ) : result ? (
          <div className="space-y-6">
            <DemoNotice show={result.demo} />

            <div>
              <SectionTitle icon={FileText} label="Summary" />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
            </div>

            <div>
              <SectionTitle icon={ListChecks} label="Action items" />
              <ul className="mt-2 space-y-2">
                {result.actionItems.length === 0 ? (
                  <li className="text-sm text-muted-foreground">None captured.</li>
                ) : (
                  result.actionItems.map((item, i) => (
                    <li
                      key={i}
                      className="flex flex-wrap items-center gap-2 rounded-xl border border-border-strong bg-secondary/30 px-3.5 py-2.5 text-sm"
                    >
                      <span className="flex-1">{item.task}</span>
                      {item.owner ? (
                        <span className="rounded-md bg-brand/15 px-2 py-0.5 text-xs font-medium text-brand">
                          {item.owner}
                        </span>
                      ) : null}
                      {item.due ? (
                        <span className="rounded-md bg-teal/15 px-2 py-0.5 text-xs font-medium text-teal">
                          {item.due}
                        </span>
                      ) : null}
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div>
              <SectionTitle icon={CheckCircle2} label="Key decisions" />
              <BulletList items={result.decisions} />
            </div>

            <div>
              <SectionTitle icon={CalendarClock} label="Deadlines" />
              <BulletList items={result.deadlines} />
            </div>
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            message="Your summary, action items, decisions and deadlines will appear here."
          />
        )}
      </Panel>
    </ToolShell>
  );
}

function SectionTitle({ icon: Icon, label }: { icon: typeof FileText; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-teal" />
      <h3 className="text-sm font-semibold">{label}</h3>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="mt-2 text-sm text-muted-foreground">None captured.</p>;
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-brand" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
