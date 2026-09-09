import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, Mail } from "lucide-react";
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
import { generateEmail, type EmailResult } from "@/lib/ai.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Workly AI" },
      {
        name: "description",
        content: "Turn a few key points into a polished, on-tone email draft in seconds.",
      },
      { property: "og:title", content: "Smart Email Generator — Workly AI" },
      {
        property: "og:description",
        content: "Turn a few key points into a polished, on-tone email draft in seconds.",
      },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const run = useServerFn(generateEmail);
  const [context, setContext] = useState("");
  const [points, setPoints] = useState("");
  const [tone, setTone] = useState<"formal" | "friendly" | "persuasive">("formal");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailResult | null>(null);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!context.trim()) return;
    setLoading(true);
    try {
      const res = await run({ data: { context, points, tone } });
      setResult(res);
      setDraft(res.draft);
      if (res.error) toast.error(res.error);
    } catch {
      toast.error("Could not generate the email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    toast.success("Draft copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ToolShell
      icon={Mail}
      title="Smart Email Generator"
      description="Describe who you're writing to and what matters. Workly AI writes the draft — you keep the final word."
      tint="blue"
    >
      <Panel title="Email brief">
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Recipient & context">
            <input
              className={inputClass}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. Client at Acme, following up after yesterday's kickoff call"
            />
          </Field>
          <Field label="Key points">
            <textarea
              className={`${inputClass} min-h-32 resize-y`}
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder={"One point per line\ne.g. Confirm the launch date\nAsk for the brand assets"}
            />
          </Field>
          <Field label="Tone">
            <select
              className={inputClass}
              value={tone}
              onChange={(e) => setTone(e.target.value as typeof tone)}
            >
              <option value="formal">Formal</option>
              <option value="friendly">Friendly</option>
              <option value="persuasive">Persuasive</option>
            </select>
          </Field>
          <GradientButton type="submit" disabled={loading || !context.trim()}>
            {loading ? "Writing draft…" : "Generate email"}
          </GradientButton>
        </form>
      </Panel>

      <Panel
        title="Draft"
        action={
          draft ? (
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          ) : null
        }
      >
        {loading ? (
          <LoadingState label="Drafting your email…" />
        ) : draft ? (
          <div className="space-y-3">
            <DemoNotice show={Boolean(result?.demo)} />
            <textarea
              className={`${inputClass} min-h-96 resize-y font-normal leading-relaxed`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </div>
        ) : (
          <EmptyState icon={Mail} message="Your generated draft will appear here, ready to edit and copy." />
        )}
      </Panel>
    </ToolShell>
  );
}
