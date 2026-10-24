import { MODEL_RE, type ProviderId } from "@/lib/providers";

export type UpstreamMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatRequest = {
  provider: ProviderId;
  model: string;
  apiKey: string;
  messages: UpstreamMessage[];
};

const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 12_000;
const MAX_OUTPUT_TOKENS = 2048;

export function parseChatRequest(input: unknown): { ok: true; data: ChatRequest } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "That request was empty." };
  const body = input as Record<string, unknown>;
  const provider = body.provider === "grok" ? "grok" : body.provider === "gemini" ? "gemini" : null;
  if (!provider) return { ok: false, error: "Choose Gemini or Grok." };

  const model = typeof body.model === "string" ? body.model.trim() : "";
  if (!MODEL_RE.test(model)) return { ok: false, error: "That model id is not valid." };

  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  if (apiKey.length < 8 || apiKey.length > 400 || /[\r\n]/.test(apiKey)) {
    return { ok: false, error: "Paste a full API key first." };
  }

  if (!Array.isArray(body.messages)) return { ok: false, error: "Write a message first." };
  const messages: UpstreamMessage[] = [];
  for (const item of body.messages) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const role = row.role === "assistant" ? "assistant" : row.role === "user" ? "user" : null;
    const content = typeof row.content === "string" ? row.content.trim() : "";
    if (!role || !content) continue;
    if (content.length > MAX_MESSAGE_CHARS) {
      return { ok: false, error: "One of those messages is too long." };
    }
    const last = messages[messages.length - 1];
    if (last && last.role === role) last.content += `\n\n${content}`;
    else messages.push({ role, content });
  }
  while (messages[0]?.role === "assistant") messages.shift();
  while (messages.length && messages[messages.length - 1]?.role !== "user") messages.pop();
  const trimmed = messages.slice(-MAX_MESSAGES);
  if (!trimmed.length) return { ok: false, error: "Write a message first." };
  return { ok: true, data: { provider, model, apiKey, messages: trimmed } };
}

function redact(text: string, apiKey: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!apiKey) return clean.slice(0, 320);
  return clean.split(apiKey).join("••••").slice(0, 320);
}

function explain(status: number, raw: string, apiKey: string): string {
  let detail = raw.slice(0, 500);
  try {
    const json = JSON.parse(raw) as {
      error?: { message?: string; status?: string } | string;
      message?: string;
    };
    if (typeof json.error === "string") detail = json.error;
    else if (json.error?.message) detail = json.error.message;
    else if (json.message) detail = json.message;
    else if (json.error?.status) detail = json.error.status;
  } catch {
    /* Keep the raw snippet. */
  }
  const note = redact(detail, apiKey);
  if (status === 400) return `The provider rejected the request. ${note}`;
  if (status === 401 || status === 403) return `That key was rejected. ${note}`;
  if (status === 404) return `That model was not found. ${note}`;
  if (status === 429) return `The provider is rate limiting this key. ${note}`;
  return `Provider error ${status}. ${note}`;
}

function geminiContents(messages: UpstreamMessage[]) {
  return messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));
}

function textFromParts(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const record = value as {
    candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[];
    choices?: { delta?: { content?: unknown }; message?: { content?: unknown } }[];
  };
  if (Array.isArray(record.candidates)) {
    let out = "";
    for (const candidate of record.candidates) {
      for (const part of candidate.content?.parts ?? []) {
        if (part.thought) continue;
        if (typeof part.text === "string") out += part.text;
      }
    }
    return out;
  }
  const choice = record.choices?.[0];
  const delta = choice?.delta?.content ?? choice?.message?.content;
  if (typeof delta === "string") return delta;
  if (Array.isArray(delta)) {
    return delta
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part && typeof part.text === "string") return part.text;
        return "";
      })
      .join("");
  }
  return "";
}

export function providerText(value: unknown): string {
  if (Array.isArray(value)) return value.map((item) => providerText(item)).join("");
  return textFromParts(value);
}

async function openUpstream(input: ChatRequest, signal: AbortSignal): Promise<Response> {
  if (input.provider === "grok") {
    return fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${input.apiKey}`,
      },
      body: JSON.stringify({
        model: input.model,
        stream: true,
        max_tokens: MAX_OUTPUT_TOKENS,
        messages: input.messages,
      }),
    });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model)}:streamGenerateContent?alt=sse`;
  return fetch(url, {
    method: "POST",
    signal,
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": input.apiKey,
    },
    body: JSON.stringify({
      contents: geminiContents(input.messages),
      generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
    }),
  });
}

async function readSse(body: ReadableStream<Uint8Array> | null, signal: AbortSignal, onJson: (value: unknown) => void) {
  if (!body) throw new Error("empty");
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  try {
    while (!signal.aborted) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          onJson(JSON.parse(data) as unknown);
        } catch {
          /* Skip a partial frame. */
        }
      }
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
}

export async function proxyChat(input: ChatRequest, signal: AbortSignal): Promise<Response> {
  let upstream: Response;
  try {
    upstream = await openUpstream(input, signal);
  } catch (err) {
    if (signal.aborted) return Response.json({ error: "The request was cancelled." }, { status: 499 });
    const message = err instanceof Error ? err.message : "";
    return Response.json(
      { error: message ? `Could not reach the provider. ${redact(message, input.apiKey)}` : "Could not reach the provider." },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    const raw = await upstream.text();
    return Response.json({ error: explain(upstream.status, raw, input.apiKey) }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };
      try {
        const type = upstream.headers.get("content-type") ?? "";
        if (type.includes("application/json")) {
          const json: unknown = await upstream.json();
          const delta = providerText(json);
          if (delta) send({ delta });
        } else {
          let sent = 0;
          await readSse(upstream.body, signal, (json) => {
            const delta = providerText(json);
            if (!delta || sent > 24_000) return;
            sent += delta.length;
            send({ delta });
          });
        }
        send({ done: true });
      } catch {
        if (!signal.aborted) send({ error: "The provider connection dropped." });
      } finally {
        try {
          controller.close();
        } catch {
          /* Already closed. */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
    },
  });
}
