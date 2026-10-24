import type { ProviderId } from "@/lib/providers";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  pending?: boolean;
  error?: boolean;
};

export type ChatThread = {
  id: string;
  title: string;
  provider: ProviderId;
  model: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
};

export type Vault = {
  provider: ProviderId;
  apiKey: string;
  model: string;
  threads: ChatThread[];
  activeId: string | null;
};

const STORAGE_KEY = "apinimble.v1";

function sanitize(vault: Vault): Vault {
  const threads = (Array.isArray(vault.threads) ? vault.threads : [])
    .filter((thread) => thread && typeof thread.id === "string")
    .map((thread) => ({
      ...thread,
      title: String(thread.title || "New chat").slice(0, 80),
      messages: (Array.isArray(thread.messages) ? thread.messages : [])
        .filter((message) => message && typeof message.content === "string" && message.content.trim())
        .map((message) => ({
          id: String(message.id),
          role: message.role === "assistant" ? "assistant" as const : "user" as const,
          content: message.content,
          error: Boolean(message.error),
          pending: false,
        })),
    }))
    .slice(0, 40);

  return {
    provider: vault.provider === "grok" ? "grok" : "gemini",
    apiKey: typeof vault.apiKey === "string" ? vault.apiKey : "",
    model: typeof vault.model === "string" ? vault.model : "",
    threads,
    activeId: typeof vault.activeId === "string" ? vault.activeId : null,
  };
}

export function loadVault(): Vault | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return sanitize(JSON.parse(raw) as Vault);
  } catch {
    return null;
  }
}

export function saveVault(vault: Vault) {
  try {
    const next = sanitize(vault);
    next.threads = [...next.threads].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 40);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* Private mode or a full disk — keep the session in memory. */
  }
}

export function maskKey(key: string): string {
  const trimmed = key.trim();
  if (trimmed.length < 4) return "••••";
  return `•••• ${trimmed.slice(-4)}`;
}

export function titleFrom(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 42) return clean || "New chat";
  return `${clean.slice(0, 42).trimEnd()}…`;
}

export function ago(ts: number): string {
  const seconds = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (seconds < 60) return "now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}
