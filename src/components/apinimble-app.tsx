import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  Eye,
  EyeOff,
  Menu,
  Pencil,
  Plus,
  RotateCcw,
  Send,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { MODEL_RE, PROVIDERS, modelName, nextModel, type ProviderId } from "@/lib/providers";
import {
  ago,
  loadVault,
  maskKey,
  saveVault,
  titleFrom,
  type ChatMessage,
  type ChatThread,
  type Vault,
} from "@/lib/vault";
import { Mark, Wordmark } from "@/components/mark";
import { Markdown } from "@/components/markdown-lite";

type Phase = "splash" | "setup" | "app";
type Panel = null | "chats" | "settings";

const SUGGESTIONS = [
  "Rewrite this so a tired reader gets it in one pass.",
  "Name the risks in this plan, then the one to fix first.",
  "Turn these notes into a short API spec.",
  "Explain this error like I have the code open.",
];

function Splash() {
  const letters = "APINimble".split("");
  return (
    <div className="stage fixed inset-0 z-50 flex items-center justify-center">
      <div className="grid-fade pointer-events-none absolute inset-0" />
      <div className="relative flex flex-col items-center px-6 text-center">
        <div className="relative mb-8">
          <div className="orbit" />
          <Mark className="size-20" />
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">
          {letters.map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className={cn("splash-letter", index >= 3 ? "text-primary" : "text-fg")}
              style={{ animationDelay: `${index * 45}ms` }}
            >
              {letter}
            </span>
          ))}
        </h1>
        <p className="mt-3 text-sm text-muted">A private desk for Gemini and Grok.</p>
        <div className="mt-8 h-1 w-40 overflow-hidden rounded-full bg-surface-2">
          <div className="splash-bar h-full w-full bg-primary" />
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <p className="mb-2 text-sm font-medium text-fg">{children}</p>;
}

function ConnectFields({
  provider,
  apiKey,
  model,
  showKey,
  error,
  onProvider,
  onKey,
  onModel,
  onToggleKey,
}: {
  provider: ProviderId;
  apiKey: string;
  model: string;
  showKey: boolean;
  error: string;
  onProvider: (id: ProviderId) => void;
  onKey: (value: string) => void;
  onModel: (value: string) => void;
  onToggleKey: () => void;
}) {
  const spec = PROVIDERS[provider];
  return (
    <div className="flex flex-col gap-5">
      <div>
        <FieldLabel>Provider</FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(PROVIDERS) as ProviderId[]).map((id) => {
            const item = PROVIDERS[id];
            const selected = id === provider;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                onClick={() => onProvider(id)}
                className={cn(
                  "press min-h-16 rounded-2xl border px-3 py-3 text-left",
                  selected
                    ? id === "grok"
                      ? "border-accent bg-accent/10"
                      : "border-primary bg-primary/10"
                    : "border-line bg-surface",
                )}
              >
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="mt-0.5 block text-xs text-muted">{item.vendor}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium">API key</p>
          <a className="text-xs text-primary underline-offset-2 hover:underline" href={spec.keyUrl} target="_blank" rel="noreferrer">
            {spec.keyUrlLabel}
          </a>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-3">
          <input
            value={apiKey}
            onChange={(event) => onKey(event.target.value)}
            type={showKey ? "text" : "password"}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder={spec.keyHint}
            aria-label="API key"
            className="min-h-12 w-full bg-transparent py-3 text-base text-fg outline-none placeholder:text-muted"
          />
          <button type="button" className="press grid size-11 place-items-center text-muted" onClick={onToggleKey} aria-label={showKey ? "Hide API key" : "Show API key"}>
            {showKey ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
        <p className="mt-2 text-xs leading-5 text-muted">
          Stored on this device only. Sent with each message so {spec.label} can answer. Not saved on a server.
        </p>
      </div>

      <div>
        <FieldLabel>Model</FieldLabel>
        <div className="flex flex-col gap-2">
          {spec.models.map((item, index) => {
            const selected = model === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onModel(item.id)}
                className={cn(
                  "press flex min-h-12 items-center gap-3 rounded-2xl border px-3 py-2 text-left",
                  selected ? "border-primary bg-primary/10" : "border-line bg-surface",
                )}
              >
                <span className="w-6 font-mono text-xs text-muted">{String(index + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{item.name}</span>
                  <span className="block truncate text-xs text-muted">{item.blurb}</span>
                </span>
              </button>
            );
          })}
        </div>
        <label className="mt-3 block">
          <span className="mb-2 block text-xs text-muted">Model id, if yours is not listed</span>
          <input
            value={model}
            onChange={(event) => onModel(event.target.value.trim())}
            spellCheck={false}
            autoCorrect="off"
            aria-label="Model id"
            className="min-h-12 w-full rounded-2xl border border-line bg-surface px-3 font-mono text-base text-fg outline-none placeholder:text-muted"
          />
        </label>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ApiNimbleApp() {
  const [phase, setPhase] = useState<Phase>("splash");
  const [vault, setVault] = useState<Vault | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [provider, setProvider] = useState<ProviderId>("gemini");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(PROVIDERS.gemini.defaultModel);
  const [showKey, setShowKey] = useState(false);
  const [formError, setFormError] = useState("");
  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const reasonRef = useRef<"stop" | "timeout" | null>(null);
  const boxRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const stickRef = useRef(true);

  useEffect(() => {
    const stored = loadVault();
    if (stored) {
      setVault(stored);
      setProvider(stored.provider);
      setApiKey(stored.apiKey);
      setModel(stored.model || PROVIDERS[stored.provider].defaultModel);
    }
    setHydrated(true);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      setPhase(stored?.apiKey ? "app" : "setup");
    }, reduce ? 280 : 1700);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated && vault) saveVault(vault);
  }, [hydrated, vault]);

  const active = vault?.threads.find((thread) => thread.id === vault.activeId) ?? null;
  const threads = useMemo(
    () => [...(vault?.threads ?? [])].sort((a, b) => b.updatedAt - a.updatedAt),
    [vault?.threads],
  );
  const visibleThreads = threads.filter((thread) => thread.title.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !stickRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [active?.messages, busy, phase]);

  function connectionError(): string {
    if (apiKey.trim().length < 8) return "Paste the full API key.";
    if (!MODEL_RE.test(model.trim())) return "Use a model id made of letters, numbers, dots, or dashes.";
    return "";
  }

  function saveConnection() {
    const issue = connectionError();
    if (issue) {
      setFormError(issue);
      return;
    }
    setFormError("");
    setVault((current) => ({
      provider,
      apiKey: apiKey.trim(),
      model: model.trim(),
      threads: current?.threads ?? [],
      activeId: current?.activeId ?? null,
    }));
    setPhase("app");
    setPanel(null);
  }

  function chooseProvider(id: ProviderId) {
    setProvider(id);
    setModel((current) => nextModel(id, current));
    setFormError("");
  }

  function patchThread(threadId: string, recipe: (thread: ChatThread) => ChatThread) {
    setVault((current) => {
      if (!current) return current;
      return { ...current, threads: current.threads.map((thread) => (thread.id === threadId ? recipe(thread) : thread)) };
    });
  }

  function patchMessage(threadId: string, messageId: string, content: string, flags: { pending?: boolean; error?: boolean }) {
    patchThread(threadId, (thread) => ({
      ...thread,
      updatedAt: Date.now(),
      messages: thread.messages.map((message) =>
        message.id === messageId ? { ...message, content, pending: flags.pending, error: flags.error } : message,
      ),
    }));
  }

  async function streamInto(threadId: string, messageId: string, body: Vault, history: ChatMessage[]) {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    reasonRef.current = null;
    const timer = window.setTimeout(() => {
      reasonRef.current = "timeout";
      ctrl.abort();
    }, 90_000);
    setBusy(true);
    let acc = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          provider: body.provider,
          model: body.model,
          apiKey: body.apiKey,
          messages: history
            .filter((message) => !message.error && !message.pending && message.content.trim())
            .map((message) => ({ role: message.role, content: message.content })),
        }),
      });
      if (!res.ok) {
        let message = `Request failed (${res.status}).`;
        const text = await res.text();
        try {
          const json = JSON.parse(text) as { error?: string };
          if (json.error) message = json.error;
        } catch {
          if (text.trim()) message = text.trim().slice(0, 300);
        }
        throw new Error(message);
      }
      if (!res.body) throw new Error("The provider returned an empty stream.");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload) continue;
          let event: { delta?: string; error?: string };
          try {
            event = JSON.parse(payload) as { delta?: string; error?: string };
          } catch {
            continue;
          }
          if (event.error) throw new Error(event.error);
          if (event.delta) {
            acc += event.delta;
            patchMessage(threadId, messageId, acc, { pending: true });
          }
        }
      }
      patchMessage(threadId, messageId, acc || "The model returned an empty reply.", { pending: false });
    } catch (err) {
      if (ctrl.signal.aborted && reasonRef.current !== "timeout") {
        patchMessage(threadId, messageId, acc || "Stopped.", { pending: false });
      } else if (ctrl.signal.aborted && reasonRef.current === "timeout") {
        patchMessage(threadId, messageId, acc || "The model took too long to answer.", {
          pending: false,
          error: !acc,
        });
      } else {
        const message = err instanceof Error ? err.message : "Something went wrong.";
        patchMessage(threadId, messageId, message, { pending: false, error: true });
      }
    } finally {
      window.clearTimeout(timer);
      setBusy(false);
      abortRef.current = null;
    }
  }

  function commitSend(text: string, prior?: ChatMessage[], existing?: ChatThread | null) {
    const clean = text.trim();
    if (!clean || !vault?.apiKey || busy) return;
    const thread = existing === undefined ? active : existing;
    const base = (prior ?? thread?.messages ?? []).filter((message) => !message.pending);
    const now = Date.now();
    const threadId = thread?.id ?? crypto.randomUUID();
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: clean };
    const assistantMessage: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: "", pending: true };
    const hadUser = base.some((message) => message.role === "user");
    const next: ChatThread = {
      id: threadId,
      title: thread && hadUser ? thread.title : titleFrom(clean),
      provider: vault.provider,
      model: vault.model,
      createdAt: thread?.createdAt ?? now,
      updatedAt: now,
      messages: [...base, userMessage, assistantMessage],
    };
    const snapshot = vault;
    setVault((current) => {
      if (!current) return current;
      const others = current.threads.filter((item) => item.id !== threadId);
      return { ...current, activeId: threadId, threads: [next, ...others] };
    });
    setDraft("");
    if (boxRef.current) boxRef.current.style.height = "";
    stickRef.current = true;
    void streamInto(threadId, assistantMessage.id, snapshot, [...base, userMessage]);
  }

  function retry() {
    if (!active || busy) return;
    const prior = active.messages.filter((message) => !message.pending);
    if (prior.at(-1)?.error) prior.pop();
    let lastUserIndex = -1;
    for (let index = prior.length - 1; index >= 0; index -= 1) {
      if (prior[index]?.role === "user") {
        lastUserIndex = index;
        break;
      }
    }
    if (lastUserIndex < 0) return;
    const text = prior[lastUserIndex]?.content ?? "";
    prior.splice(lastUserIndex, 1);
    commitSend(text, prior, active);
  }

  function removeThread(id: string) {
    setVault((current) => {
      if (!current) return current;
      const threadsNext = current.threads.filter((thread) => thread.id !== id);
      return { ...current, threads: threadsNext, activeId: current.activeId === id ? null : current.activeId };
    });
    setConfirmId(null);
  }

  function exportChats() {
    const blob = new Blob([JSON.stringify({ threads: vault?.threads ?? [] }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "apinimble-chats.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  const spec = PROVIDERS[vault?.provider ?? provider];

  return (
    <div className="stage relative min-h-dvh text-fg">
      {phase === "splash" ? <Splash /> : null}

      {phase === "setup" ? (
        <main className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5">
          <div className="grid-fade pointer-events-none absolute inset-0" />
          <header className="safe-t relative flex items-center gap-3 pb-6">
            <Mark className="size-10" />
            <Wordmark />
          </header>
          <div className="relative">
            <p className="rise font-mono text-xs tracking-widest text-muted">CONNECT</p>
            <h1 className="rise d1 mt-2 text-3xl font-semibold tracking-tight">Bring your own model.</h1>
            <p className="rise d2 mt-2 text-sm leading-6 text-muted">
              Paste a Gemini or Grok key, pick a model, and chat. Threads stay on this phone.
            </p>
          </div>
          <form
            className="rise d3 relative mt-6 flex flex-1 flex-col"
            onSubmit={(event) => {
              event.preventDefault();
              saveConnection();
            }}
          >
            <ConnectFields
              provider={provider}
              apiKey={apiKey}
              model={model}
              showKey={showKey}
              error={formError}
              onProvider={chooseProvider}
              onKey={setApiKey}
              onModel={setModel}
              onToggleKey={() => setShowKey((value) => !value)}
            />
            <div className="safe-b sticky bottom-0 mt-4 bg-bg/90 py-4 backdrop-blur">
              <button type="submit" className="press min-h-12 w-full rounded-2xl bg-primary font-semibold text-primary-ink">
                Start chatting
              </button>
            </div>
          </form>
        </main>
      ) : null}

      {phase === "app" && vault ? (
        <div className="flex h-dvh overflow-hidden">
          <aside className="hidden min-h-0 w-80 shrink-0 flex-col border-r border-line bg-bg/80 md:flex">
            <ChatList
              threads={visibleThreads}
              total={threads.length}
              activeId={vault.activeId}
              query={query}
              confirmId={confirmId}
              onQuery={setQuery}
              onNew={() => {
                setVault((current) => (current ? { ...current, activeId: null } : current));
                setRenaming(false);
              }}
              onOpen={(id) => {
                setVault((current) => (current ? { ...current, activeId: id } : current));
                setRenaming(false);
                stickRef.current = true;
              }}
              onAskDelete={setConfirmId}
              onDelete={removeThread}
            />
          </aside>

          <section className="flex min-h-0 min-w-0 flex-1 flex-col">
            <header className="safe-t flex shrink-0 items-center gap-2 border-b border-line px-3 pb-3">
              <button type="button" className="press grid size-11 place-items-center md:hidden" aria-label="Open chats" onClick={() => setPanel("chats")}>
                <Menu className="size-5" />
              </button>
              <div className="min-w-0 flex-1">
                {renaming && active ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      const next = titleDraft.trim().slice(0, 80) || active.title;
                      patchThread(active.id, (thread) => ({ ...thread, title: next }));
                      setRenaming(false);
                    }}
                  >
                    <input
                      value={titleDraft}
                      onChange={(event) => setTitleDraft(event.target.value)}
                      aria-label="Chat title"
                      autoFocus
                      className="w-full bg-transparent text-base font-semibold outline-none"
                      onBlur={() => setRenaming(false)}
                    />
                  </form>
                ) : (
                  <button
                    type="button"
                    className="flex max-w-full items-center gap-2 text-left"
                    onClick={() => {
                      if (!active) return;
                      setTitleDraft(active.title);
                      setRenaming(true);
                    }}
                  >
                    <span className="truncate font-semibold">{active?.title ?? "New chat"}</span>
                    {active ? <Pencil className="size-3.5 shrink-0 text-muted" /> : null}
                  </button>
                )}
                <p className="truncate text-xs text-muted">
                  {spec.label} · {modelName(vault.provider, vault.model)}
                </p>
              </div>
              <button
                type="button"
                className="press grid size-11 place-items-center"
                aria-label="New chat"
                onClick={() => {
                  setVault((current) => (current ? { ...current, activeId: null } : current));
                  setRenaming(false);
                }}
              >
                <Plus className="size-5" />
              </button>
              <button
                type="button"
                className="press grid size-11 place-items-center"
                aria-label="Settings"
                onClick={() => {
                  setProvider(vault.provider);
                  setApiKey(vault.apiKey);
                  setModel(vault.model);
                  setFormError("");
                  setConfirmClear(false);
                  setPanel("settings");
                }}
              >
                <Settings className="size-5" />
              </button>
            </header>

            <div
              ref={scrollerRef}
              className="scroll-y min-h-0 flex-1 px-4 py-4"
              onScroll={(event) => {
                const el = event.currentTarget;
                stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 96;
              }}
            >
              {!active || active.messages.length === 0 ? (
                <div className="mx-auto flex h-full max-w-lg flex-col justify-center">
                  <Mark className="size-12" />
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight">What should we take on?</h2>
                  <p className="mt-2 text-sm text-muted">Messages in this thread are saved on this device.</p>
                  <div className="mt-5 flex flex-col gap-2">
                    {SUGGESTIONS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        className="press rounded-2xl border border-line bg-surface px-3 py-3 text-left text-sm"
                        onClick={() => setDraft(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
                  {active.messages.map((message) => (
                    <MessageRow
                      key={message.id}
                      message={message}
                      speaker={modelName(active.provider, active.model)}
                      copied={copiedId === message.id}
                      onCopy={() => {
                        void navigator.clipboard.writeText(message.content).then(() => {
                          setCopiedId(message.id);
                          window.setTimeout(() => setCopiedId((current) => (current === message.id ? null : current)), 1200);
                        });
                      }}
                      onRetry={retry}
                    />
                  ))}
                </div>
              )}
            </div>

            <form
              className="safe-b shrink-0 border-t border-line bg-bg/90 px-3 pt-3 backdrop-blur"
              onSubmit={(event) => {
                event.preventDefault();
                commitSend(draft);
              }}
            >
              <div className="mx-auto flex w-full max-w-3xl items-end gap-2">
                <label className="flex min-h-12 flex-1 items-end rounded-2xl border border-line bg-surface px-3 py-2">
                  <span className="sr-only">Message</span>
                  <textarea
                    ref={boxRef}
                    value={draft}
                    rows={1}
                    enterKeyHint="send"
                    placeholder={`Message ${modelName(vault.provider, vault.model)}`}
                    className="max-h-40 min-h-8 w-full resize-none bg-transparent text-base outline-none placeholder:text-muted"
                    onChange={(event) => {
                      setDraft(event.target.value);
                      const el = event.target;
                      el.style.height = "0px";
                      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        commitSend(draft);
                      }
                    }}
                  />
                </label>
                {busy ? (
                  <button type="button" className="press grid size-12 shrink-0 place-items-center rounded-2xl bg-surface-2 text-fg" aria-label="Stop" onClick={() => {
                    reasonRef.current = "stop";
                    abortRef.current?.abort();
                  }}>
                    <span className="size-3.5 rounded-sm bg-fg" />
                  </button>
                ) : (
                  <button type="submit" disabled={!draft.trim()} className="press grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-ink disabled:opacity-40" aria-label="Send">
                    <Send className="size-5" />
                  </button>
                )}
              </div>
              <p className="mx-auto mt-2 hidden max-w-3xl text-xs text-muted md:block">Enter sends. Shift+Enter adds a line.</p>
            </form>
          </section>

          {panel === "chats" ? (
            <div className="fixed inset-0 z-40 md:hidden">
              <button type="button" className="absolute inset-0 bg-bg/70" aria-label="Close chats" onClick={() => setPanel(null)} />
              <aside className="absolute inset-y-0 left-0 flex w-72 max-w-full flex-col border-r border-line bg-surface">
                <ChatList
                  threads={visibleThreads}
                  total={threads.length}
                  activeId={vault.activeId}
                  query={query}
                  confirmId={confirmId}
                  onQuery={setQuery}
                  onNew={() => {
                    setVault((current) => (current ? { ...current, activeId: null } : current));
                    setPanel(null);
                  }}
                  onOpen={(id) => {
                    setVault((current) => (current ? { ...current, activeId: id } : current));
                    setPanel(null);
                    stickRef.current = true;
                  }}
                  onAskDelete={setConfirmId}
                  onDelete={removeThread}
                />
              </aside>
            </div>
          ) : null}

          {panel === "settings" ? (
            <div className="fixed inset-0 z-40">
              <button type="button" className="absolute inset-0 bg-bg/70" aria-label="Close settings" onClick={() => setPanel(null)} />
              <div className="safe-t absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-surface">
                <div className="flex items-center justify-between px-4 pb-3">
                  <h2 className="text-lg font-semibold">Connection</h2>
                  <button type="button" className="press grid size-11 place-items-center" aria-label="Close settings" onClick={() => setPanel(null)}>
                    <X className="size-5" />
                  </button>
                </div>
                <form
                  className="scroll-y flex-1 px-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveConnection();
                  }}
                >
                  <ConnectFields
                    provider={provider}
                    apiKey={apiKey}
                    model={model}
                    showKey={showKey}
                    error={formError}
                    onProvider={chooseProvider}
                    onKey={setApiKey}
                    onModel={setModel}
                    onToggleKey={() => setShowKey((value) => !value)}
                  />
                  <button type="submit" className="press mt-4 min-h-12 w-full rounded-2xl bg-primary font-semibold text-primary-ink">
                    Save connection
                  </button>
                  <div className="mt-6 flex flex-col gap-2 border-t border-line pt-4">
                    <p className="text-xs text-muted">Key on this device: {maskKey(vault.apiKey)}</p>
                    <button type="button" className="press flex min-h-11 items-center gap-2 text-left text-sm" onClick={exportChats}>
                      <Download className="size-4" /> Export saved chats
                    </button>
                    <button
                      type="button"
                      className="press flex min-h-11 items-center gap-2 text-left text-sm text-accent"
                      onClick={() => {
                        if (!confirmClear) {
                          setConfirmClear(true);
                          return;
                        }
                        setVault((current) => (current ? { ...current, threads: [], activeId: null } : current));
                        setConfirmClear(false);
                      }}
                    >
                      <Trash2 className="size-4" /> {confirmClear ? "Confirm clear all chats" : "Clear saved chats"}
                    </button>
                    <button
                      type="button"
                      className="press flex min-h-11 items-center gap-2 text-left text-sm"
                      onClick={() => {
                        setVault((current) => (current ? { ...current, apiKey: "" } : current));
                        setApiKey("");
                        setPhase("setup");
                        setPanel(null);
                      }}
                    >
                      <X className="size-4" /> Remove API key
                    </button>
                  </div>
                  <div className="safe-b" />
                </form>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ChatList({
  threads,
  total,
  activeId,
  query,
  confirmId,
  onQuery,
  onNew,
  onOpen,
  onAskDelete,
  onDelete,
}: {
  threads: ChatThread[];
  total: number;
  activeId: string | null;
  query: string;
  confirmId: string | null;
  onQuery: (value: string) => void;
  onNew: () => void;
  onOpen: (id: string) => void;
  onAskDelete: (id: string | null) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="safe-t flex items-center gap-3 px-4 pb-4">
        <Mark className="size-9" />
        <Wordmark />
      </div>
      <div className="px-3">
        <button type="button" className="press flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-primary-ink" onClick={onNew}>
          <Plus className="size-4" /> New chat
        </button>
      </div>
      {total > 3 ? (
        <div className="px-3 pt-3">
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Search chats"
            aria-label="Search chats"
            className="min-h-11 w-full rounded-xl border border-line bg-bg px-3 text-base outline-none placeholder:text-muted"
          />
        </div>
      ) : null}
      <div className="scroll-y mt-3 flex-1 px-2 pb-4">
        {total === 0 ? <p className="px-3 py-6 text-sm text-muted">Saved chats will line up here.</p> : null}
        {total > 0 && threads.length === 0 ? <p className="px-3 py-6 text-sm text-muted">No chats match.</p> : null}
        {threads.map((thread) => {
          const selected = thread.id === activeId;
          return (
            <div key={thread.id} className={cn("mb-1 flex items-stretch rounded-xl", selected ? "bg-surface-2" : "")}>
              <button type="button" className="min-w-0 flex-1 px-3 py-3 text-left" onClick={() => onOpen(thread.id)}>
                <span className="flex items-center gap-2">
                  <span className={cn("size-1.5 shrink-0 rounded-full", thread.provider === "grok" ? "bg-accent" : "bg-primary")} />
                  <span className="truncate text-sm font-medium">{thread.title}</span>
                </span>
                <span className="mt-1 block truncate pl-3.5 text-xs text-muted">
                  {modelName(thread.provider, thread.model)} · {ago(thread.updatedAt)}
                </span>
              </button>
              {confirmId === thread.id ? (
                <button type="button" className="press px-3 text-xs text-accent" onClick={() => onDelete(thread.id)}>
                  Delete
                </button>
              ) : (
                <button type="button" className="press grid w-11 place-items-center text-muted" aria-label={`Delete ${thread.title}`} onClick={() => onAskDelete(thread.id)}>
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MessageRow({
  message,
  speaker,
  copied,
  onCopy,
  onRetry,
}: {
  message: ChatMessage;
  speaker: string;
  copied: boolean;
  onCopy: () => void;
  onRetry: () => void;
}) {
  const mine = message.role === "user";
  return (
    <article className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div className={cn(mine ? "w-4/5" : "w-full")}>
        {!mine ? <p className="mb-1 text-xs font-medium text-muted">{speaker}</p> : null}
        <div className={cn("rounded-2xl px-3 py-3", mine ? "bg-primary text-primary-ink" : "border border-line bg-surface")}>
          {message.pending && !message.content ? (
            <p className="text-sm text-muted">Thinking…</p>
          ) : message.error ? (
            <p className="text-sm text-accent">{message.content}</p>
          ) : (
            <div className={cn(message.pending ? "caret" : "")}>
              <Markdown text={message.content} />
            </div>
          )}
        </div>
        {!message.pending && message.content ? (
          <div className={cn("mt-1 flex gap-1", mine ? "justify-end" : "justify-start")}>
            <button type="button" className="press inline-flex min-h-8 items-center gap-1 px-1 text-xs text-muted" onClick={onCopy}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
            {message.error ? (
              <button type="button" className="press inline-flex min-h-8 items-center gap-1 px-1 text-xs text-accent" onClick={onRetry}>
                <RotateCcw className="size-3.5" /> Try again
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
