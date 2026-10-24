export type ProviderId = "gemini" | "grok";

export type ModelInfo = {
  id: string;
  name: string;
  blurb: string;
};

export const MODEL_RE = /^[a-zA-Z0-9._:-]{1,80}$/;

export const PROVIDERS: Record<
  ProviderId,
  {
    id: ProviderId;
    label: string;
    vendor: string;
    keyHint: string;
    keyUrl: string;
    keyUrlLabel: string;
    defaultModel: string;
    models: ModelInfo[];
  }
> = {
  gemini: {
    id: "gemini",
    label: "Gemini",
    vendor: "Google",
    keyHint: "Google AI Studio key",
    keyUrl: "https://aistudio.google.com/apikey",
    keyUrlLabel: "Get a Gemini key",
    defaultModel: "gemini-2.5-flash",
    models: [
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", blurb: "Fast everyday model" },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", blurb: "Deeper coding and analysis" },
      { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", blurb: "Lowest cost" },
      { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash", blurb: "Newer fast flagship" },
      { id: "gemini-4-argon", name: "Gemini 4 Argon", blurb: "Long reasoning" },
      { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash-Lite", blurb: "High throughput" },
    ],
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
      { id: "grok-4.7", name: "Grok 4.7", blurb: "Current flagship" },
      { id: "grok-4.6", name: "Grok 4.6", blurb: "Previous flagship" },
      { id: "grok-4.5", name: "Grok 4.5", blurb: "Strong general model" },
      { id: "grok-4.3", name: "Grok 4.3", blurb: "Long context" },
      { id: "grok-4.20", name: "Grok 4.20", blurb: "Million-token window" },
    ],
  },
};

const KNOWN_MODELS = new Set(
  Object.values(PROVIDERS).flatMap((provider) => provider.models.map((model) => model.id)),
);

export function modelName(provider: ProviderId, id: string): string {
  return PROVIDERS[provider].models.find((model) => model.id === id)?.name ?? id;
}

export function nextModel(provider: ProviderId, current: string): string {
  if (!KNOWN_MODELS.has(current)) return current;
  if (PROVIDERS[provider].models.some((model) => model.id === current)) return current;
  return PROVIDERS[provider].defaultModel;
}
