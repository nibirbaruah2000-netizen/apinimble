import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, _ as createFileRoute, b as require_jsx_runtime, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, v as createRootRoute, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CJ2ZdKkz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-accent",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-muted",
				children: errorMessage(error)
			})
		]
	});
}
/**
* Path-based preview hosts serve the dev server under `/{port_id}/` and strip
* that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
* prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
* client routing and generated links aligned with the public URL.
*/
var PATH_BASED_PREVIEW_HOSTS = /* @__PURE__ */ new Set([
	"preview.grok.genai.mil",
	"preview.grok.mil",
	"preview.grokgsac.com"
]);
var PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;
function previewPathPrefix(hostname, pathname) {
	if (!PATH_BASED_PREVIEW_HOSTS.has(hostname.toLowerCase())) return void 0;
	return PORT_ID_PREFIX.exec(pathname)?.[0];
}
function prefixRewrite(prefix) {
	return {
		input: ({ url }) => {
			if (url.pathname === prefix) url.pathname = "/";
			else if (url.pathname.startsWith(`${prefix}/`)) url.pathname = url.pathname.slice(prefix.length);
			return url;
		},
		output: ({ url }) => {
			url.pathname = `${prefix}${url.pathname}`;
			return url;
		}
	};
}
function previewPathRewrite() {
	if (typeof window === "undefined") return void 0;
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
	return prefix ? prefixRewrite(prefix) : void 0;
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-B4U16YlC.css";
var APP_NAME = "APINimble";
var Route$2 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "APINimble is a private chat desk for your Gemini and Grok API keys."
			},
			{
				name: "theme-color",
				content: "#07080c"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter = () => import("./routes-BnQ4gspp.mjs");
var Route$1 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var MODEL_RE = /^[a-zA-Z0-9._:-]{1,80}$/;
var PROVIDERS = {
	gemini: {
		id: "gemini",
		label: "Gemini",
		vendor: "Google",
		keyHint: "Google AI Studio key",
		keyUrl: "https://aistudio.google.com/apikey",
		keyUrlLabel: "Get a Gemini key",
		defaultModel: "gemini-2.5-flash",
		models: [
			{
				id: "gemini-2.5-flash",
				name: "Gemini 2.5 Flash",
				blurb: "Fast everyday model"
			},
			{
				id: "gemini-2.5-pro",
				name: "Gemini 2.5 Pro",
				blurb: "Deeper coding and analysis"
			},
			{
				id: "gemini-2.5-flash-lite",
				name: "Gemini 2.5 Flash-Lite",
				blurb: "Lowest cost"
			},
			{
				id: "gemini-3.8-flash",
				name: "Gemini 3.8 Flash",
				blurb: "Newer fast flagship"
			},
			{
				id: "gemini-4-argon",
				name: "Gemini 4 Argon",
				blurb: "Long reasoning"
			},
			{
				id: "gemini-3.1-flash-lite",
				name: "Gemini 3.1 Flash-Lite",
				blurb: "High throughput"
			}
		]
	},
	grok: {
		id: "grok",
		label: "Grok",
		vendor: "xAI",
		keyHint: "xAI console key",
		keyUrl: "https://console.x.ai/",
		keyUrlLabel: "Get a Grok key",
		defaultModel: "grok-4.7",
		models: [
			{
				id: "grok-4.7",
				name: "Grok 4.7",
				blurb: "Current flagship"
			},
			{
				id: "grok-4.6",
				name: "Grok 4.6",
				blurb: "Previous flagship"
			},
			{
				id: "grok-4.5",
				name: "Grok 4.5",
				blurb: "Strong general model"
			},
			{
				id: "grok-4.3",
				name: "Grok 4.3",
				blurb: "Long context"
			},
			{
				id: "grok-4.20",
				name: "Grok 4.20",
				blurb: "Million-token window"
			}
		]
	}
};
var KNOWN_MODELS = new Set(Object.values(PROVIDERS).flatMap((provider) => provider.models.map((model) => model.id)));
function modelName(provider, id) {
	return PROVIDERS[provider].models.find((model) => model.id === id)?.name ?? id;
}
function nextModel(provider, current) {
	if (!KNOWN_MODELS.has(current)) return current;
	if (PROVIDERS[provider].models.some((model) => model.id === current)) return current;
	return PROVIDERS[provider].defaultModel;
}
var MAX_MESSAGE_CHARS = 12e3;
var MAX_OUTPUT_TOKENS = 2048;
function parseChatRequest(input) {
	if (!input || typeof input !== "object") return {
		ok: false,
		error: "That request was empty."
	};
	const body = input;
	const provider = body.provider === "grok" ? "grok" : body.provider === "gemini" ? "gemini" : null;
	if (!provider) return {
		ok: false,
		error: "Choose Gemini or Grok."
	};
	const model = typeof body.model === "string" ? body.model.trim() : "";
	if (!MODEL_RE.test(model)) return {
		ok: false,
		error: "That model id is not valid."
	};
	const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
	if (apiKey.length < 8 || apiKey.length > 400 || /[\r\n]/.test(apiKey)) return {
		ok: false,
		error: "Paste a full API key first."
	};
	if (!Array.isArray(body.messages)) return {
		ok: false,
		error: "Write a message first."
	};
	const messages = [];
	for (const item of body.messages) {
		if (!item || typeof item !== "object") continue;
		const row = item;
		const role = row.role === "assistant" ? "assistant" : row.role === "user" ? "user" : null;
		const content = typeof row.content === "string" ? row.content.trim() : "";
		if (!role || !content) continue;
		if (content.length > MAX_MESSAGE_CHARS) return {
			ok: false,
			error: "One of those messages is too long."
		};
		const last = messages[messages.length - 1];
		if (last && last.role === role) last.content += `\n\n${content}`;
		else messages.push({
			role,
			content
		});
	}
	while (messages[0]?.role === "assistant") messages.shift();
	while (messages.length && messages[messages.length - 1]?.role !== "user") messages.pop();
	const trimmed = messages.slice(-24);
	if (!trimmed.length) return {
		ok: false,
		error: "Write a message first."
	};
	return {
		ok: true,
		data: {
			provider,
			model,
			apiKey,
			messages: trimmed
		}
	};
}
function redact(text, apiKey) {
	const clean = text.replace(/\s+/g, " ").trim();
	if (!apiKey) return clean.slice(0, 320);
	return clean.split(apiKey).join("••••").slice(0, 320);
}
function explain(status, raw, apiKey) {
	let detail = raw.slice(0, 500);
	try {
		const json = JSON.parse(raw);
		if (typeof json.error === "string") detail = json.error;
		else if (json.error?.message) detail = json.error.message;
		else if (json.message) detail = json.message;
		else if (json.error?.status) detail = json.error.status;
	} catch {}
	const note = redact(detail, apiKey);
	if (status === 400) return `The provider rejected the request. ${note}`;
	if (status === 401 || status === 403) return `That key was rejected. ${note}`;
	if (status === 404) return `That model was not found. ${note}`;
	if (status === 429) return `The provider is rate limiting this key. ${note}`;
	return `Provider error ${status}. ${note}`;
}
function geminiContents(messages) {
	return messages.map((message) => ({
		role: message.role === "assistant" ? "model" : "user",
		parts: [{ text: message.content }]
	}));
}
function textFromParts(value) {
	if (!value || typeof value !== "object") return "";
	const record = value;
	if (Array.isArray(record.candidates)) {
		let out = "";
		for (const candidate of record.candidates) for (const part of candidate.content?.parts ?? []) {
			if (part.thought) continue;
			if (typeof part.text === "string") out += part.text;
		}
		return out;
	}
	const choice = record.choices?.[0];
	const delta = choice?.delta?.content ?? choice?.message?.content;
	if (typeof delta === "string") return delta;
	if (Array.isArray(delta)) return delta.map((part) => {
		if (typeof part === "string") return part;
		if (part && typeof part === "object" && "text" in part && typeof part.text === "string") return part.text;
		return "";
	}).join("");
	return "";
}
function providerText(value) {
	if (Array.isArray(value)) return value.map((item) => providerText(item)).join("");
	return textFromParts(value);
}
async function openUpstream(input, signal) {
	if (input.provider === "grok") return fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		signal,
		headers: {
			"content-type": "application/json",
			authorization: `Bearer ${input.apiKey}`
		},
		body: JSON.stringify({
			model: input.model,
			stream: true,
			max_tokens: MAX_OUTPUT_TOKENS,
			messages: input.messages
		})
	});
	const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model)}:streamGenerateContent?alt=sse`;
	return fetch(url, {
		method: "POST",
		signal,
		headers: {
			"content-type": "application/json",
			"x-goog-api-key": input.apiKey
		},
		body: JSON.stringify({
			contents: geminiContents(input.messages),
			generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS }
		})
	});
}
async function readSse(body, signal, onJson) {
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
					onJson(JSON.parse(data));
				} catch {}
			}
		}
	} finally {
		await reader.cancel().catch(() => void 0);
	}
}
async function proxyChat(input, signal) {
	let upstream;
	try {
		upstream = await openUpstream(input, signal);
	} catch (err) {
		if (signal.aborted) return Response.json({ error: "The request was cancelled." }, { status: 499 });
		const message = err instanceof Error ? err.message : "";
		return Response.json({ error: message ? `Could not reach the provider. ${redact(message, input.apiKey)}` : "Could not reach the provider." }, { status: 502 });
	}
	if (!upstream.ok) {
		const raw = await upstream.text();
		return Response.json({ error: explain(upstream.status, raw, input.apiKey) }, { status: 502 });
	}
	const encoder = new TextEncoder();
	const stream = new ReadableStream({ async start(controller) {
		const send = (payload) => {
			controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
		};
		try {
			if ((upstream.headers.get("content-type") ?? "").includes("application/json")) {
				const delta = providerText(await upstream.json());
				if (delta) send({ delta });
			} else {
				let sent = 0;
				await readSse(upstream.body, signal, (json) => {
					const delta = providerText(json);
					if (!delta || sent > 24e3) return;
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
			} catch {}
		}
	} });
	return new Response(stream, { headers: {
		"content-type": "text/event-stream; charset=utf-8",
		"cache-control": "no-cache, no-transform"
	} });
}
var Route = createFileRoute("/api/chat")({ server: { handlers: { POST: async ({ request }) => {
	let json;
	try {
		const raw = await request.text();
		if (raw.length > 2e5) return Response.json({ error: "That conversation is too long to send." }, { status: 413 });
		json = JSON.parse(raw);
	} catch {
		return Response.json({ error: "The request was not valid JSON." }, { status: 400 });
	}
	const parsed = parseChatRequest(json);
	if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });
	return proxyChat(parsed.data, request.signal);
} } } });
var rootRouteChildren = {
	IndexRoute: Route$1.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$2
	}),
	ApiChatRoute: Route.update({
		id: "/api/chat",
		path: "/api/chat",
		getParentRoute: () => Route$2
	})
};
var routeTree = Route$2._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		rewrite: previewPathRewrite(),
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { nextModel as a, modelName as i, MODEL_RE as n, PROVIDERS as r, router_exports as t };
