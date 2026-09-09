import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { MessagesSquare, SendHorizonal, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { ToolShell, inputClass } from "@/components/tool-shell";
import { chat } from "@/lib/ai.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat — Workly AI" },
      {
        name: "description",
        content: "Ask Workly AI anything about your work — open-ended answers in a simple chat thread.",
      },
      { property: "og:title", content: "AI Chat — Workly AI" },
      {
        property: "og:description",
        content: "Ask Workly AI anything about your work — open-ended answers in a simple chat thread.",
      },
    ],
  }),
  component: ChatPage,
});

type Message = { role: "user" | "assistant"; content: string };

const suggestions = [
  "Draft a polite nudge for an overdue invoice",
  "Explain OKRs to a new team member",
  "Give me an agenda for a 30-minute retro",
];

function ChatPage() {
  const run = useServerFn(chat);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await run({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: res.reply }]);
      if (res.error) toast.error(res.error);
    } catch {
      toast.error("Could not reach the assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell
      icon={MessagesSquare}
      title="AI Chat"
      description="Open-ended help for anything work related — drafting, explaining, brainstorming or planning."
      tint="blue"
    >
      <div className="surface-card flex h-[65vh] min-h-[520px] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
          {messages.length === 0 && !loading ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand">
                <Sparkles className="h-5 w-5 text-brand-foreground" />
              </span>
              <p className="max-w-sm text-sm text-muted-foreground">
                Ask Workly AI anything. Here are a few ways to start.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-border-strong bg-secondary/40 px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((message, i) => (
            <div
              key={i}
              className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-gradient-brand text-brand-foreground"
                    : "border border-border-strong bg-secondary/40 text-foreground",
                )}
              >
                {message.content}
              </div>
            </div>
          ))}

          {loading ? (
            <div className="flex justify-start">
              <div className="flex gap-1.5 rounded-2xl border border-border-strong bg-secondary/40 px-4 py-3.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex items-center gap-2 border-t border-border-strong p-4"
        >
          <input
            className={inputClass}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Workly AI anything…"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <SendHorizonal className="h-4 w-4" />
          </button>
        </form>
      </div>
    </ToolShell>
  );
}
