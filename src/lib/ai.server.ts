/**
 * Server-only AI helper.
 *
 * Order of precedence:
 * 1. OPENAI_API_KEY  -> direct OpenAI chat completions
 * 2. LOVABLE_API_KEY -> Lovable AI Gateway (Responses API, streamed + accumulated)
 * 3. neither         -> caller uses its polished demo fallback
 */

export class AiUnavailableError extends Error {}
export class AiRequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type AiMessage = { role: "system" | "user" | "assistant"; content: string };

async function callOpenAi(key: string, messages: AiMessage[], json: boolean): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: process.env["OPENAI_MODEL"] ?? "gpt-4o-mini",
      messages,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    throw new AiRequestError(res.status, await res.text());
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

async function callGateway(key: string, messages: AiMessage[], json: boolean): Promise<string> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      input: messages,
      stream: true,
      reasoning: { effort: "low" },
      ...(json ? { text: { format: { type: "json_object" } } } : {}),
    }),
  });

  if (!res.ok || !res.body) {
    throw new AiRequestError(res.status, await res.text().catch(() => "AI request failed"));
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      for (const line of chunk.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const event = JSON.parse(payload) as {
            type?: string;
            delta?: string;
            response?: { output_text?: string };
          };
          if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
            text += event.delta;
          } else if (event.type === "response.completed" && !text) {
            text = event.response?.output_text ?? "";
          }
        } catch {
          // ignore malformed keepalive frames
        }
      }
    }
  }

  return text.trim();
}

export async function callAi(messages: AiMessage[], options?: { json?: boolean }): Promise<string> {
  const json = options?.json ?? false;
  const openAiKey = process.env["OPENAI_API_KEY"];
  if (openAiKey) return callOpenAi(openAiKey, messages, json);

  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (lovableKey) return callGateway(lovableKey, messages, json);

  throw new AiUnavailableError("No AI key configured");
}

export function parseJson<T>(raw: string): T | null {
  const trimmed = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(trimmed.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

export function friendlyError(error: unknown): string {
  if (error instanceof AiRequestError) {
    if (error.status === 429) return "The assistant is rate limited right now. Try again in a moment.";
    if (error.status === 402) return "AI credits are exhausted for this workspace. Add credits to continue.";
    if (error.status === 401 || error.status === 403)
      return "The AI service rejected the request. Check the workspace AI configuration.";
    return "The AI service returned an error. Please try again.";
  }
  return "Something went wrong generating that. Please try again.";
}
