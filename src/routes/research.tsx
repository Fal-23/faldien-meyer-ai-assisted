import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Lightbulb, Telescope, Wand2 } from "lucide-react";
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
import { researchTopic, type ResearchResult } from "@/lib/ai.functions";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Workly AI" },
      {
        name: "description",
        content: "Condense any topic or pasted article into a summary, key insights and recommendations.",
      },
      { property: "og:title", content: "AI Research Assistant — Workly AI" },
      {
        property: "og:description",
        content: "Condense any topic or pasted article into a summary, key insights and recommendations.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const run = useServerFn(researchTopic);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await run({ data: { topic } });
      setResult(res);
      if (res.error) toast.error(res.error);
    } catch {
      toast.error("Could not research that. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell
      icon={Telescope}
      title="AI Research Assistant"
      description="Give it a topic or paste an article. You get the gist, the insights that matter and what to do next."
      tint="teal"
    >
      <Panel title="Topic or text">
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="What should I look into?">
            <textarea
              className={`${inputClass} min-h-44 resize-y`}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. How are mid-size companies adopting AI in customer support? — or paste an article here"
            />
          </Field>
          <GradientButton type="submit" disabled={loading || !topic.trim()}>
            {loading ? "Researching…" : "Run research"}
          </GradientButton>
        </form>
      </Panel>

      <Panel title="Findings">
        {loading ? (
          <LoadingState label="Reading, condensing and pulling out the insights…" />
        ) : result ? (
          <div className="space-y-6">
            <DemoNotice show={result.demo} />

            <div>
              <h3 className="text-sm font-semibold">Summary</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Lightbulb className="h-4 w-4 text-teal" /> Key insights
              </h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {result.insights.map((insight, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-border-strong bg-secondary/30 px-3.5 py-3 text-sm text-muted-foreground"
                  >
                    {insight}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Wand2 className="h-4 w-4 text-brand" /> Recommendations
              </h3>
              <ol className="mt-3 space-y-2">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand/15 text-xs font-semibold text-brand">
                      {i + 1}
                    </span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Telescope}
            message="Your summary, insights and recommendations will appear here."
          />
        )}
      </Panel>
    </ToolShell>
  );
}
