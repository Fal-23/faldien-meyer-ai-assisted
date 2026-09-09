import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  AiUnavailableError,
  callAi,
  friendlyError,
  parseJson,
  type AiMessage,
} from "./ai.server";

export type EmailResult = { draft: string; demo: boolean; error?: string };
export type NotesResult = {
  summary: string;
  actionItems: Array<{ task: string; owner?: string; due?: string }>;
  decisions: string[];
  deadlines: string[];
  demo: boolean;
  error?: string;
};
export type PlannerResult = {
  schedule: Array<{ slot: string; task: string; priority: "High" | "Medium" | "Low"; reason: string }>;
  demo: boolean;
  error?: string;
};
export type ResearchResult = {
  summary: string;
  insights: string[];
  recommendations: string[];
  demo: boolean;
  error?: string;
};
export type ChatResult = { reply: string; demo: boolean; error?: string };

async function run<T>(
  messages: AiMessage[],
  json: boolean,
  parse: (raw: string) => T | null,
  demo: () => T,
): Promise<T & { demo: boolean; error?: string }> {
  try {
    const raw = await callAi(messages, { json });
    const parsed = parse(raw);
    if (!parsed) return { ...demo(), demo: true };
    return { ...parsed, demo: false };
  } catch (error) {
    if (error instanceof AiUnavailableError) return { ...demo(), demo: true };
    return { ...demo(), demo: true, error: friendlyError(error) };
  }
}

/* ---------------------------------- Email --------------------------------- */

const EmailInput = z.object({
  context: z.string().min(1),
  points: z.string().default(""),
  tone: z.enum(["formal", "friendly", "persuasive"]).default("formal"),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }): Promise<EmailResult> =>
    run<{ draft: string }>(
      [
        {
          role: "system",
          content:
            "You are a workplace email writing assistant. Write a polished, ready-to-send email. Reply with json in the shape {\"draft\": string}. The draft must include a Subject: line, greeting, body and sign-off placeholder.",
        },
        {
          role: "user",
          content: `Recipient / context: ${data.context}\nKey points: ${data.points}\nTone: ${data.tone}`,
        },
      ],
      true,
      (raw) => {
        const parsed = parseJson<{ draft?: string }>(raw);
        if (parsed?.draft) return { draft: parsed.draft };
        return raw.trim() ? { draft: raw.trim() } : null;
      },
      () => ({
        draft: `Subject: Quick follow-up on ${data.context || "our conversation"}

Hi there,

Thanks for your time earlier. I wanted to follow up with a short recap and the next steps on our side.

${(data.points || "• Aligning on scope and timeline\n• Confirming owners for each workstream\n• Agreeing on a check-in cadence")
  .split("\n")
  .filter(Boolean)
  .map((line) => (line.trim().startsWith("•") ? line : `• ${line.trim()}`))
  .join("\n")}

If that all looks right, I'll get things moving on my end. Happy to jump on a quick call if anything needs clarifying.

Best regards,
[Your name]`,
      }),
    ),
  );

/* ---------------------------------- Notes --------------------------------- */

const NotesInput = z.object({ notes: z.string().min(1) });

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => NotesInput.parse(input))
  .handler(async ({ data }): Promise<NotesResult> =>
    run<Omit<NotesResult, "demo" | "error">>(
      [
        {
          role: "system",
          content:
            'You summarize meeting notes. Reply with json in the shape {"summary": string, "actionItems": [{"task": string, "owner": string, "due": string}], "decisions": [string], "deadlines": [string]}. Use empty strings when an owner or due date is not mentioned.',
        },
        { role: "user", content: data.notes },
      ],
      true,
      (raw) => {
        const parsed = parseJson<Partial<NotesResult>>(raw);
        if (!parsed?.summary) return null;
        return {
          summary: parsed.summary,
          actionItems: parsed.actionItems ?? [],
          decisions: parsed.decisions ?? [],
          deadlines: parsed.deadlines ?? [],
        };
      },
      () => ({
        summary:
          "The team reviewed progress on the current release, agreed the scope is on track, and focused the remaining time on unblocking the onboarding flow before the next customer review.",
        actionItems: [
          { task: "Finalise the onboarding copy and share for review", owner: "Sarah", due: "Friday" },
          { task: "Fix the failing checkout tests", owner: "Dev team", due: "Wednesday" },
          { task: "Book the customer review session", owner: "Marcus", due: "" },
        ],
        decisions: [
          "Ship the onboarding flow behind a feature flag first",
          "Delay the reporting redesign to next cycle",
        ],
        deadlines: ["Customer review: next Thursday", "Release cut-off: end of month"],
      }),
    ),
  );

/* --------------------------------- Planner -------------------------------- */

const PlannerInput = z.object({
  tasks: z.string().min(1),
  horizon: z.enum(["day", "week"]).default("day"),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlannerInput.parse(input))
  .handler(async ({ data }): Promise<PlannerResult> =>
    run<Omit<PlannerResult, "demo" | "error">>(
      [
        {
          role: "system",
          content:
            'You are a scheduling assistant. Rank tasks by urgency and importance and lay them out across the requested horizon. Reply with json in the shape {"schedule": [{"slot": string, "task": string, "priority": "High"|"Medium"|"Low", "reason": string}]}. Slot is a time block for a day plan or a weekday for a week plan.',
        },
        { role: "user", content: `Horizon: ${data.horizon}\nTasks:\n${data.tasks}` },
      ],
      true,
      (raw) => {
        const parsed = parseJson<Partial<PlannerResult>>(raw);
        if (!parsed?.schedule?.length) return null;
        return { schedule: parsed.schedule };
      },
      () =>
        data.horizon === "week"
          ? {
              schedule: [
                { slot: "Monday", task: "Ship the highest-urgency deliverable", priority: "High", reason: "Hard deadline earliest in the week" },
                { slot: "Tuesday", task: "Deep work on the main project", priority: "High", reason: "Highest impact, needs uninterrupted focus" },
                { slot: "Wednesday", task: "Stakeholder reviews and feedback loops", priority: "Medium", reason: "Unblocks others mid-week" },
                { slot: "Thursday", task: "Follow-ups and admin batch", priority: "Medium", reason: "Low effort, easy to batch" },
                { slot: "Friday", task: "Plan next week and clear the backlog", priority: "Low", reason: "Best done once the week has settled" },
              ],
            }
          : {
              schedule: [
                { slot: "09:00 – 10:30", task: "Most urgent deadline-driven task", priority: "High", reason: "Time-critical and best tackled with fresh focus" },
                { slot: "10:45 – 12:00", task: "Deep work block on the key project", priority: "High", reason: "Highest long-term impact" },
                { slot: "13:00 – 14:00", task: "Meetings and collaboration", priority: "Medium", reason: "Aligns with other people's availability" },
                { slot: "14:15 – 15:30", task: "Reviews, replies and follow-ups", priority: "Medium", reason: "Keeps others unblocked" },
                { slot: "15:45 – 16:30", task: "Admin, planning and wrap-up", priority: "Low", reason: "Low cognitive load for the end of the day" },
              ],
            },
    ),
  );

/* -------------------------------- Research -------------------------------- */

const ResearchInput = z.object({ topic: z.string().min(1) });

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResearchInput.parse(input))
  .handler(async ({ data }): Promise<ResearchResult> =>
    run<Omit<ResearchResult, "demo" | "error">>(
      [
        {
          role: "system",
          content:
            'You are a research assistant for busy professionals. Given a topic or pasted text, reply with json in the shape {"summary": string, "insights": [string], "recommendations": [string]}. Keep the summary to one tight paragraph.',
        },
        { role: "user", content: data.topic },
      ],
      true,
      (raw) => {
        const parsed = parseJson<Partial<ResearchResult>>(raw);
        if (!parsed?.summary) return null;
        return {
          summary: parsed.summary,
          insights: parsed.insights ?? [],
          recommendations: parsed.recommendations ?? [],
        };
      },
      () => ({
        summary:
          "This is a demo response. Once an AI key is configured, this section returns a tight, sourced-style overview of the topic you paste in — the core context, why it matters right now, and where the debate or uncertainty sits.",
        insights: [
          "The topic splits into a short-term operational angle and a longer-term strategic one",
          "Most published material agrees on the direction but not the timeline",
          "Adoption is usually limited by process and skills, not by the technology itself",
        ],
        recommendations: [
          "Start with one narrow, measurable pilot rather than a broad rollout",
          "Define success metrics before you begin so results are comparable",
          "Review again in a quarter — the landscape moves quickly",
        ],
      }),
    ),
  );

/* ---------------------------------- Chat ---------------------------------- */

const ChatInput = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .min(1),
});

export const chat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }): Promise<ChatResult> => {
    const last = data.messages[data.messages.length - 1]?.content ?? "";
    return run<{ reply: string }>(
      [
        {
          role: "system",
          content:
            "You are Workly AI, a helpful, concise assistant for workplace tasks. Answer clearly in plain prose or short bullet lists.",
        },
        ...data.messages.map((m) => ({ role: m.role, content: m.content }) as AiMessage),
      ],
      false,
      (raw) => (raw.trim() ? { reply: raw.trim() } : null),
      () => ({
        reply: `You asked: "${last}"\n\nThis is a demo reply — no AI key is configured yet, so Workly AI is answering from a local placeholder. Add an OpenAI key (or enable workspace AI) and this thread will return real answers to any open-ended question, from drafting a message to explaining a process.`,
      }),
    );
  });
