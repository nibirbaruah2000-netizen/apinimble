import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Send, c as Pencil, d as EyeOff, f as Download, i as Settings, l as Menu, m as Check, o as RotateCcw, p as Copy, r as Trash2, s as Plus, t as X, u as Eye } from "../_libs/lucide-react.mjs";
import { a as nextModel, i as modelName, n as MODEL_RE, r as PROVIDERS } from "./router-CJ2ZdKkz.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BnQ4gspp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var STORAGE_KEY = "apinimble.v1";
function sanitize(vault) {
	const threads = (Array.isArray(vault.threads) ? vault.threads : []).filter((thread) => thread && typeof thread.id === "string").map((thread) => ({
		...thread,
		title: String(thread.title || "New chat").slice(0, 80),
		messages: (Array.isArray(thread.messages) ? thread.messages : []).filter((message) => message && typeof message.content === "string" && message.content.trim()).map((message) => ({
			id: String(message.id),
			role: message.role === "assistant" ? "assistant" : "user",
			content: message.content,
			error: Boolean(message.error),
			pending: false
		}))
	})).slice(0, 40);
	return {
		provider: vault.provider === "grok" ? "grok" : "gemini",
		apiKey: typeof vault.apiKey === "string" ? vault.apiKey : "",
		model: typeof vault.model === "string" ? vault.model : "",
		threads,
		activeId: typeof vault.activeId === "string" ? vault.activeId : null
	};
}
function loadVault() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return sanitize(JSON.parse(raw));
	} catch {
		return null;
	}
}
function saveVault(vault) {
	try {
		const next = sanitize(vault);
		next.threads = [...next.threads].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 40);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	} catch {}
}
function maskKey(key) {
	const trimmed = key.trim();
	if (trimmed.length < 4) return "••••";
	return `•••• ${trimmed.slice(-4)}`;
}
function titleFrom(text) {
	const clean = text.replace(/\s+/g, " ").trim();
	if (clean.length <= 42) return clean || "New chat";
	return `${clean.slice(0, 42).trimEnd()}…`;
}
function ago(ts) {
	const seconds = Math.max(1, Math.round((Date.now() - ts) / 1e3));
	if (seconds < 60) return "now";
	const minutes = Math.round(seconds / 60);
	if (minutes < 60) return `${minutes}m`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours}h`;
	return `${Math.round(hours / 24)}d`;
}
function Mark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 64 64",
		className,
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "1.5",
				y: "1.5",
				width: "61",
				height: "61",
				rx: "18",
				strokeWidth: "1.5",
				style: {
					fill: "var(--color-surface)",
					stroke: "var(--color-line)"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M15 20h8.2L36.2 32 23.2 44H15l13-12L15 20z",
				style: { fill: "var(--color-primary)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M29 20h8.2L50.2 32 37.2 44H29l13-12L29 20z",
				style: { fill: "var(--color-accent)" }
			})
		]
	});
}
function Wordmark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("font-semibold tracking-tight text-fg", className),
		children: ["API", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-primary",
			children: "Nimble"
		})]
	});
}
function parseBlocks(src) {
	const lines = src.replace(/\r\n/g, "\n").split("\n");
	const blocks = [];
	let i = 0;
	while (i < lines.length) {
		const line = lines[i] ?? "";
		if (line.trim().startsWith("```")) {
			const lang = line.trim().slice(3).trim();
			const buf = [];
			i += 1;
			while (i < lines.length && !(lines[i] ?? "").trim().startsWith("```")) {
				buf.push(lines[i] ?? "");
				i += 1;
			}
			if (i < lines.length) i += 1;
			blocks.push({
				type: "code",
				lang,
				text: buf.join("\n")
			});
			continue;
		}
		if (!line.trim()) {
			i += 1;
			continue;
		}
		const heading = /^(#{1,3})\s+(.*)$/.exec(line);
		if (heading) {
			blocks.push({
				type: "h",
				level: heading[1].length > 2 ? 3 : 2,
				text: heading[2] ?? ""
			});
			i += 1;
			continue;
		}
		if (/^\s*[-*]\s+/.test(line)) {
			const items = [];
			while (i < lines.length && /^\s*[-*]\s+/.test(lines[i] ?? "")) {
				items.push((lines[i] ?? "").replace(/^\s*[-*]\s+/, ""));
				i += 1;
			}
			blocks.push({
				type: "ul",
				items
			});
			continue;
		}
		if (/^\s*\d+[.)]\s+/.test(line)) {
			const items = [];
			while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i] ?? "")) {
				items.push((lines[i] ?? "").replace(/^\s*\d+[.)]\s+/, ""));
				i += 1;
			}
			blocks.push({
				type: "ol",
				items
			});
			continue;
		}
		const para = [line];
		i += 1;
		while (i < lines.length && (lines[i] ?? "").trim() && !(lines[i] ?? "").trim().startsWith("```") && !/^#{1,3}\s+/.test(lines[i] ?? "") && !/^\s*[-*]\s+/.test(lines[i] ?? "") && !/^\s*\d+[.)]\s+/.test(lines[i] ?? "")) {
			para.push(lines[i] ?? "");
			i += 1;
		}
		blocks.push({
			type: "p",
			text: para.join(" ")
		});
	}
	return blocks;
}
function Inline({ text }) {
	const nodes = [];
	let i = 0;
	let key = 0;
	while (i < text.length) {
		if (text.startsWith("**", i)) {
			const end = text.indexOf("**", i + 2);
			if (end > i + 2) {
				nodes.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
					className: "font-semibold",
					children: text.slice(i + 2, end)
				}, key));
				key += 1;
				i = end + 2;
				continue;
			}
		}
		if (text[i] === "`") {
			const end = text.indexOf("`", i + 1);
			if (end > i + 1) {
				nodes.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
					className: "inline",
					children: text.slice(i + 1, end)
				}, key));
				key += 1;
				i = end + 1;
				continue;
			}
		}
		if (text[i] === "[") {
			const close = text.indexOf("]", i + 1);
			if (close > i && text[close + 1] === "(") {
				const end = text.indexOf(")", close + 2);
				const href = end > close ? text.slice(close + 2, end) : "";
				if (end > close && /^https?:\/\//i.test(href)) {
					nodes.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href,
						target: "_blank",
						rel: "noreferrer",
						children: text.slice(i + 1, close)
					}, key));
					key += 1;
					i = end + 1;
					continue;
				}
			}
		}
		if (text[i] === "*" && text[i + 1] !== "*") {
			const end = text.indexOf("*", i + 1);
			if (end > i + 1) {
				nodes.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: text.slice(i + 1, end) }, key));
				key += 1;
				i = end + 1;
				continue;
			}
		}
		let j = i + 1;
		while (j < text.length && text[j] !== "*" && text[j] !== "`" && text[j] !== "[") j += 1;
		nodes.push(text.slice(i, j));
		i = j;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: nodes });
}
function CodeBlock({ lang, text }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-hidden rounded-xl border border-line bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3 px-3 py-2 text-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate font-mono text-xs",
				children: lang || "code"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "press inline-flex min-h-8 items-center gap-1 text-xs text-muted",
				onClick: () => {
					navigator.clipboard.writeText(text).then(() => {
						setCopied(true);
						window.setTimeout(() => setCopied(false), 1200);
					});
				},
				children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), copied ? "Copied" : "Copy"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
			className: "overflow-x-auto px-3 pb-3 font-mono text-sm text-fg",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: text })
		})]
	});
}
function Markdown({ text }) {
	const blocks = parseBlocks(text);
	if (!blocks.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "md break-words",
		children: blocks.map((block, index) => {
			if (block.type === "code") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
				lang: block.lang,
				text: block.text
			}, index);
			if (block.type === "h") {
				const Tag = block.level === 2 ? "h2" : "h3";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inline, { text: block.text }) }, index);
			}
			if (block.type === "ul" || block.type === "ol") {
				const Tag = block.type === "ul" ? "ul" : "ol";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { children: block.items.map((item, itemIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inline, { text: item }) }, itemIndex)) }, index);
			}
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inline, { text: block.text }) }, index);
		})
	});
}
var SUGGESTIONS = [
	"Rewrite this so a tired reader gets it in one pass.",
	"Name the risks in this plan, then the one to fix first.",
	"Turn these notes into a short API spec.",
	"Explain this error like I have the code open."
];
function Splash() {
	const letters = "APINimble".split("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "stage fixed inset-0 z-50 flex items-center justify-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid-fade pointer-events-none absolute inset-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex flex-col items-center px-6 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mb-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "orbit" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-20" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-4xl font-semibold tracking-tight",
					children: letters.map((letter, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("splash-letter", index >= 3 ? "text-primary" : "text-fg"),
						style: { animationDelay: `${index * 45}ms` },
						children: letter
					}, `${letter}-${index}`))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "A private desk for Gemini and Grok."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 h-1 w-40 overflow-hidden rounded-full bg-surface-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "splash-bar h-full w-full bg-primary" })
				})
			]
		})]
	});
}
function FieldLabel({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mb-2 text-sm font-medium text-fg",
		children
	});
}
function ConnectFields({ provider, apiKey, model, showKey, error, onProvider, onKey, onModel, onToggleKey }) {
	const spec = PROVIDERS[provider];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldLabel, { children: "Provider" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3",
				children: Object.keys(PROVIDERS).map((id) => {
					const item = PROVIDERS[id];
					const selected = id === provider;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": selected,
						onClick: () => onProvider(id),
						className: cn("press min-h-16 rounded-2xl border px-3 py-3 text-left", selected ? id === "grok" ? "border-accent bg-accent/10" : "border-primary bg-primary/10" : "border-line bg-surface"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-semibold",
							children: item.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 block text-xs text-muted",
							children: item.vendor
						})]
					}, id);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-baseline justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "API key"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: "text-xs text-primary underline-offset-2 hover:underline",
						href: spec.keyUrl,
						target: "_blank",
						rel: "noreferrer",
						children: spec.keyUrlLabel
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-2xl border border-line bg-surface px-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: apiKey,
						onChange: (event) => onKey(event.target.value),
						type: showKey ? "text" : "password",
						autoComplete: "off",
						autoCorrect: "off",
						spellCheck: false,
						placeholder: spec.keyHint,
						"aria-label": "API key",
						className: "min-h-12 w-full bg-transparent py-3 text-base text-fg outline-none placeholder:text-muted"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "press grid size-11 place-items-center text-muted",
						onClick: onToggleKey,
						"aria-label": showKey ? "Hide API key" : "Show API key",
						children: showKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs leading-5 text-muted",
					children: [
						"Stored on this device only. Sent with each message so ",
						spec.label,
						" can answer. Not saved on a server."
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldLabel, { children: "Model" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-2",
					children: spec.models.map((item, index) => {
						const selected = model === item.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-pressed": selected,
							onClick: () => onModel(item.id),
							className: cn("press flex min-h-12 items-center gap-3 rounded-2xl border px-3 py-2 text-left", selected ? "border-primary bg-primary/10" : "border-line bg-surface"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-6 font-mono text-xs text-muted",
								children: String(index + 1).padStart(2, "0")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-sm font-medium",
									children: item.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-xs text-muted",
									children: item.blurb
								})]
							})]
						}, item.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-2 block text-xs text-muted",
						children: "Model id, if yours is not listed"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: model,
						onChange: (event) => onModel(event.target.value.trim()),
						spellCheck: false,
						autoCorrect: "off",
						"aria-label": "Model id",
						className: "min-h-12 w-full rounded-2xl border border-line bg-surface px-3 font-mono text-base text-fg outline-none placeholder:text-muted"
					})]
				})
			] }),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-sm text-accent",
				children: error
			}) : null
		]
	});
}
function ApiNimbleApp() {
	const [phase, setPhase] = (0, import_react.useState)("splash");
	const [vault, setVault] = (0, import_react.useState)(null);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const [provider, setProvider] = (0, import_react.useState)("gemini");
	const [apiKey, setApiKey] = (0, import_react.useState)("");
	const [model, setModel] = (0, import_react.useState)(PROVIDERS.gemini.defaultModel);
	const [showKey, setShowKey] = (0, import_react.useState)(false);
	const [formError, setFormError] = (0, import_react.useState)("");
	const [panel, setPanel] = (0, import_react.useState)(null);
	const [query, setQuery] = (0, import_react.useState)("");
	const [draft, setDraft] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [renaming, setRenaming] = (0, import_react.useState)(false);
	const [titleDraft, setTitleDraft] = (0, import_react.useState)("");
	const [confirmId, setConfirmId] = (0, import_react.useState)(null);
	const [confirmClear, setConfirmClear] = (0, import_react.useState)(false);
	const [copiedId, setCopiedId] = (0, import_react.useState)(null);
	const abortRef = (0, import_react.useRef)(null);
	const reasonRef = (0, import_react.useRef)(null);
	const boxRef = (0, import_react.useRef)(null);
	const scrollerRef = (0, import_react.useRef)(null);
	const stickRef = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
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
	(0, import_react.useEffect)(() => {
		if (hydrated && vault) saveVault(vault);
	}, [hydrated, vault]);
	const active = vault?.threads.find((thread) => thread.id === vault.activeId) ?? null;
	const threads = (0, import_react.useMemo)(() => [...vault?.threads ?? []].sort((a, b) => b.updatedAt - a.updatedAt), [vault?.threads]);
	const visibleThreads = threads.filter((thread) => thread.title.toLowerCase().includes(query.trim().toLowerCase()));
	(0, import_react.useEffect)(() => {
		const el = scrollerRef.current;
		if (!el || !stickRef.current) return;
		el.scrollTop = el.scrollHeight;
	}, [
		active?.messages,
		busy,
		phase
	]);
	function connectionError() {
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
			activeId: current?.activeId ?? null
		}));
		setPhase("app");
		setPanel(null);
	}
	function chooseProvider(id) {
		setProvider(id);
		setModel((current) => nextModel(id, current));
		setFormError("");
	}
	function patchThread(threadId, recipe) {
		setVault((current) => {
			if (!current) return current;
			return {
				...current,
				threads: current.threads.map((thread) => thread.id === threadId ? recipe(thread) : thread)
			};
		});
	}
	function patchMessage(threadId, messageId, content, flags) {
		patchThread(threadId, (thread) => ({
			...thread,
			updatedAt: Date.now(),
			messages: thread.messages.map((message) => message.id === messageId ? {
				...message,
				content,
				pending: flags.pending,
				error: flags.error
			} : message)
		}));
	}
	async function streamInto(threadId, messageId, body, history) {
		const ctrl = new AbortController();
		abortRef.current = ctrl;
		reasonRef.current = null;
		const timer = window.setTimeout(() => {
			reasonRef.current = "timeout";
			ctrl.abort();
		}, 9e4);
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
					messages: history.filter((message) => !message.error && !message.pending && message.content.trim()).map((message) => ({
						role: message.role,
						content: message.content
					}))
				})
			});
			if (!res.ok) {
				let message = `Request failed (${res.status}).`;
				const text = await res.text();
				try {
					const json = JSON.parse(text);
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
					let event;
					try {
						event = JSON.parse(payload);
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
			if (ctrl.signal.aborted && reasonRef.current !== "timeout") patchMessage(threadId, messageId, acc || "Stopped.", { pending: false });
			else if (ctrl.signal.aborted && reasonRef.current === "timeout") patchMessage(threadId, messageId, acc || "The model took too long to answer.", {
				pending: false,
				error: !acc
			});
			else patchMessage(threadId, messageId, err instanceof Error ? err.message : "Something went wrong.", {
				pending: false,
				error: true
			});
		} finally {
			window.clearTimeout(timer);
			setBusy(false);
			abortRef.current = null;
		}
	}
	function commitSend(text, prior, existing) {
		const clean = text.trim();
		if (!clean || !vault?.apiKey || busy) return;
		const thread = existing === void 0 ? active : existing;
		const base = (prior ?? thread?.messages ?? []).filter((message) => !message.pending);
		const now = Date.now();
		const threadId = thread?.id ?? crypto.randomUUID();
		const userMessage = {
			id: crypto.randomUUID(),
			role: "user",
			content: clean
		};
		const assistantMessage = {
			id: crypto.randomUUID(),
			role: "assistant",
			content: "",
			pending: true
		};
		const hadUser = base.some((message) => message.role === "user");
		const next = {
			id: threadId,
			title: thread && hadUser ? thread.title : titleFrom(clean),
			provider: vault.provider,
			model: vault.model,
			createdAt: thread?.createdAt ?? now,
			updatedAt: now,
			messages: [
				...base,
				userMessage,
				assistantMessage
			]
		};
		const snapshot = vault;
		setVault((current) => {
			if (!current) return current;
			const others = current.threads.filter((item) => item.id !== threadId);
			return {
				...current,
				activeId: threadId,
				threads: [next, ...others]
			};
		});
		setDraft("");
		if (boxRef.current) boxRef.current.style.height = "";
		stickRef.current = true;
		streamInto(threadId, assistantMessage.id, snapshot, [...base, userMessage]);
	}
	function retry() {
		if (!active || busy) return;
		const prior = active.messages.filter((message) => !message.pending);
		if (prior.at(-1)?.error) prior.pop();
		let lastUserIndex = -1;
		for (let index = prior.length - 1; index >= 0; index -= 1) if (prior[index]?.role === "user") {
			lastUserIndex = index;
			break;
		}
		if (lastUserIndex < 0) return;
		const text = prior[lastUserIndex]?.content ?? "";
		prior.splice(lastUserIndex, 1);
		commitSend(text, prior, active);
	}
	function removeThread(id) {
		setVault((current) => {
			if (!current) return current;
			const threadsNext = current.threads.filter((thread) => thread.id !== id);
			return {
				...current,
				threads: threadsNext,
				activeId: current.activeId === id ? null : current.activeId
			};
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "stage relative min-h-dvh text-fg",
		children: [
			phase === "splash" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Splash, {}) : null,
			phase === "setup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "relative mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid-fade pointer-events-none absolute inset-0" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "safe-t relative flex items-center gap-3 pb-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-10" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rise font-mono text-xs tracking-widest text-muted",
								children: "CONNECT"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "rise d1 mt-2 text-3xl font-semibold tracking-tight",
								children: "Bring your own model."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rise d2 mt-2 text-sm leading-6 text-muted",
								children: "Paste a Gemini or Grok key, pick a model, and chat. Threads stay on this phone."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "rise d3 relative mt-6 flex flex-1 flex-col",
						onSubmit: (event) => {
							event.preventDefault();
							saveConnection();
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectFields, {
							provider,
							apiKey,
							model,
							showKey,
							error: formError,
							onProvider: chooseProvider,
							onKey: setApiKey,
							onModel: setModel,
							onToggleKey: () => setShowKey((value) => !value)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "safe-b sticky bottom-0 mt-4 bg-bg/90 py-4 backdrop-blur",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								className: "press min-h-12 w-full rounded-2xl bg-primary font-semibold text-primary-ink",
								children: "Start chatting"
							})
						})]
					})
				]
			}) : null,
			phase === "app" && vault ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-dvh",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
						className: "hidden w-80 shrink-0 flex-col border-r border-line bg-bg/80 md:flex",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatList, {
							threads: visibleThreads,
							total: threads.length,
							activeId: vault.activeId,
							query,
							confirmId,
							onQuery: setQuery,
							onNew: () => {
								setVault((current) => current ? {
									...current,
									activeId: null
								} : current);
								setRenaming(false);
							},
							onOpen: (id) => {
								setVault((current) => current ? {
									...current,
									activeId: id
								} : current);
								setRenaming(false);
								stickRef.current = true;
							},
							onAskDelete: setConfirmId,
							onDelete: removeThread
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "flex min-w-0 flex-1 flex-col",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
								className: "safe-t flex items-center gap-2 border-b border-line px-3 pb-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "press grid size-11 place-items-center md:hidden",
										"aria-label": "Open chats",
										onClick: () => setPanel("chats"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [renaming && active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
											onSubmit: (event) => {
												event.preventDefault();
												const next = titleDraft.trim().slice(0, 80) || active.title;
												patchThread(active.id, (thread) => ({
													...thread,
													title: next
												}));
												setRenaming(false);
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: titleDraft,
												onChange: (event) => setTitleDraft(event.target.value),
												"aria-label": "Chat title",
												autoFocus: true,
												className: "w-full bg-transparent text-base font-semibold outline-none",
												onBlur: () => setRenaming(false)
											})
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "flex max-w-full items-center gap-2 text-left",
											onClick: () => {
												if (!active) return;
												setTitleDraft(active.title);
												setRenaming(true);
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "truncate font-semibold",
												children: active?.title ?? "New chat"
											}), active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5 shrink-0 text-muted" }) : null]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "truncate text-xs text-muted",
											children: [
												spec.label,
												" · ",
												modelName(vault.provider, vault.model)
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "press grid size-11 place-items-center",
										"aria-label": "New chat",
										onClick: () => {
											setVault((current) => current ? {
												...current,
												activeId: null
											} : current);
											setRenaming(false);
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "press grid size-11 place-items-center",
										"aria-label": "Settings",
										onClick: () => {
											setProvider(vault.provider);
											setApiKey(vault.apiKey);
											setModel(vault.model);
											setFormError("");
											setConfirmClear(false);
											setPanel("settings");
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-5" })
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								ref: scrollerRef,
								className: "scroll-y flex-1 px-4 py-4",
								onScroll: (event) => {
									const el = event.currentTarget;
									stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 96;
								},
								children: !active || active.messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mx-auto flex h-full max-w-lg flex-col justify-center",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-12" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "mt-4 text-2xl font-semibold tracking-tight",
											children: "What should we take on?"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-sm text-muted",
											children: "Messages in this thread are saved on this device."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-5 flex flex-col gap-2",
											children: SUGGESTIONS.map((prompt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "press rounded-2xl border border-line bg-surface px-3 py-3 text-left text-sm",
												onClick: () => setDraft(prompt),
												children: prompt
											}, prompt))
										})
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mx-auto flex w-full max-w-3xl flex-col gap-5",
									children: active.messages.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageRow, {
										message,
										copied: copiedId === message.id,
										onCopy: () => {
											navigator.clipboard.writeText(message.content).then(() => {
												setCopiedId(message.id);
												window.setTimeout(() => setCopiedId((current) => current === message.id ? null : current), 1200);
											});
										},
										onRetry: retry
									}, message.id))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "safe-b border-t border-line bg-bg/90 px-3 pt-3 backdrop-blur",
								onSubmit: (event) => {
									event.preventDefault();
									commitSend(draft);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mx-auto flex w-full max-w-3xl items-end gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex min-h-12 flex-1 items-end rounded-2xl border border-line bg-surface px-3 py-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "sr-only",
											children: "Message"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											ref: boxRef,
											value: draft,
											rows: 1,
											enterKeyHint: "send",
											placeholder: `Message ${modelName(vault.provider, vault.model)}`,
											className: "max-h-40 min-h-8 w-full resize-none bg-transparent text-base outline-none placeholder:text-muted",
											onChange: (event) => {
												setDraft(event.target.value);
												const el = event.target;
												el.style.height = "0px";
												el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
											},
											onKeyDown: (event) => {
												if (event.key === "Enter" && !event.shiftKey) {
													event.preventDefault();
													commitSend(draft);
												}
											}
										})]
									}), busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "press grid size-12 shrink-0 place-items-center rounded-2xl bg-surface-2 text-fg",
										"aria-label": "Stop",
										onClick: () => {
											reasonRef.current = "stop";
											abortRef.current?.abort();
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-3.5 rounded-sm bg-fg" })
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "submit",
										disabled: !draft.trim(),
										className: "press grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-ink disabled:opacity-40",
										"aria-label": "Send",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-5" })
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mx-auto mt-2 hidden max-w-3xl text-xs text-muted md:block",
									children: "Enter sends. Shift+Enter adds a line."
								})]
							})
						]
					}),
					panel === "chats" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "fixed inset-0 z-40 md:hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "absolute inset-0 bg-bg/70",
							"aria-label": "Close chats",
							onClick: () => setPanel(null)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
							className: "absolute inset-y-0 left-0 flex w-72 max-w-full flex-col border-r border-line bg-surface",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatList, {
								threads: visibleThreads,
								total: threads.length,
								activeId: vault.activeId,
								query,
								confirmId,
								onQuery: setQuery,
								onNew: () => {
									setVault((current) => current ? {
										...current,
										activeId: null
									} : current);
									setPanel(null);
								},
								onOpen: (id) => {
									setVault((current) => current ? {
										...current,
										activeId: id
									} : current);
									setPanel(null);
									stickRef.current = true;
								},
								onAskDelete: setConfirmId,
								onDelete: removeThread
							})
						})]
					}) : null,
					panel === "settings" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "fixed inset-0 z-40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "absolute inset-0 bg-bg/70",
							"aria-label": "Close settings",
							onClick: () => setPanel(null)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "safe-t absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-surface",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between px-4 pb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-semibold",
									children: "Connection"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "press grid size-11 place-items-center",
									"aria-label": "Close settings",
									onClick: () => setPanel(null),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "scroll-y flex-1 px-4",
								onSubmit: (event) => {
									event.preventDefault();
									saveConnection();
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectFields, {
										provider,
										apiKey,
										model,
										showKey,
										error: formError,
										onProvider: chooseProvider,
										onKey: setApiKey,
										onModel: setModel,
										onToggleKey: () => setShowKey((value) => !value)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "submit",
										className: "press mt-4 min-h-12 w-full rounded-2xl bg-primary font-semibold text-primary-ink",
										children: "Save connection"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-6 flex flex-col gap-2 border-t border-line pt-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-xs text-muted",
												children: ["Key on this device: ", maskKey(vault.apiKey)]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "press flex min-h-11 items-center gap-2 text-left text-sm",
												onClick: exportChats,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Export saved chats"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "press flex min-h-11 items-center gap-2 text-left text-sm text-accent",
												onClick: () => {
													if (!confirmClear) {
														setConfirmClear(true);
														return;
													}
													setVault((current) => current ? {
														...current,
														threads: [],
														activeId: null
													} : current);
													setConfirmClear(false);
												},
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }),
													" ",
													confirmClear ? "Confirm clear all chats" : "Clear saved chats"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "press flex min-h-11 items-center gap-2 text-left text-sm",
												onClick: () => {
													setVault((current) => current ? {
														...current,
														apiKey: ""
													} : current);
													setApiKey("");
													setPhase("setup");
													setPanel(null);
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), " Remove API key"]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "safe-b" })
								]
							})]
						})]
					}) : null
				]
			}) : null
		]
	});
}
function ChatList({ threads, total, activeId, query, confirmId, onQuery, onNew, onOpen, onAskDelete, onDelete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "safe-t flex items-center gap-3 px-4 pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-9" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "press flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-primary-ink",
					onClick: onNew,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " New chat"]
				})
			}),
			total > 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-3 pt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: query,
					onChange: (event) => onQuery(event.target.value),
					placeholder: "Search chats",
					"aria-label": "Search chats",
					className: "min-h-11 w-full rounded-xl border border-line bg-bg px-3 text-base outline-none placeholder:text-muted"
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "scroll-y mt-3 flex-1 px-2 pb-4",
				children: [
					total === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-3 py-6 text-sm text-muted",
						children: "Saved chats will line up here."
					}) : null,
					total > 0 && threads.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-3 py-6 text-sm text-muted",
						children: "No chats match."
					}) : null,
					threads.map((thread) => {
						const selected = thread.id === activeId;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("mb-1 flex items-stretch rounded-xl", selected ? "bg-surface-2" : ""),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "min-w-0 flex-1 px-3 py-3 text-left",
								onClick: () => onOpen(thread.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 shrink-0 rounded-full", thread.provider === "grok" ? "bg-accent" : "bg-primary") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate text-sm font-medium",
										children: thread.title
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-1 block truncate pl-3.5 text-xs text-muted",
									children: [
										modelName(thread.provider, thread.model),
										" · ",
										ago(thread.updatedAt)
									]
								})]
							}), confirmId === thread.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "press px-3 text-xs text-accent",
								onClick: () => onDelete(thread.id),
								children: "Delete"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "press grid w-11 place-items-center text-muted",
								"aria-label": `Delete ${thread.title}`,
								onClick: () => onAskDelete(thread.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})]
						}, thread.id);
					})
				]
			})
		]
	});
}
function MessageRow({ message, copied, onCopy, onRetry }) {
	const mine = message.role === "user";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
		className: cn("flex", mine ? "justify-end" : "justify-start"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("w-4/5", mine ? "" : "w-full"),
			children: [
				!mine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-1 text-xs font-medium text-muted",
					children: "Model"
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("rounded-2xl px-3 py-3", mine ? "bg-primary text-primary-ink" : "border border-line bg-surface"),
					children: message.pending && !message.content ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Thinking…"
					}) : message.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-accent",
						children: message.content
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn(message.pending ? "caret" : ""),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, { text: message.content })
					})
				}),
				!message.pending && message.content ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("mt-1 flex gap-1", mine ? "justify-end" : "justify-start"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "press inline-flex min-h-8 items-center gap-1 px-1 text-xs text-muted",
						onClick: onCopy,
						children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), copied ? "Copied" : "Copy"]
					}), message.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "press inline-flex min-h-8 items-center gap-1 px-1 text-xs text-accent",
						onClick: onRetry,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" }), " Try again"]
					}) : null]
				}) : null
			]
		})
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApiNimbleApp, {});
}
//#endregion
export { Home as component };
