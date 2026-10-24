import { createFileRoute } from "@tanstack/react-router";
import { parseChatRequest, proxyChat } from "@/lib/chat-upstream";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let json: unknown;
        try {
          const raw = await request.text();
          if (raw.length > 200_000) {
            return Response.json({ error: "That conversation is too long to send." }, { status: 413 });
          }
          json = JSON.parse(raw) as unknown;
        } catch {
          return Response.json({ error: "The request was not valid JSON." }, { status: 400 });
        }
        const parsed = parseChatRequest(json);
        if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });
        return proxyChat(parsed.data, request.signal);
      },
    },
  },
});
