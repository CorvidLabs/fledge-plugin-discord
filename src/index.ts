import { verifyHmacSignature } from "./verify";
import { sendDiscordWebhook } from "./discord";
import type { DiscordMessage } from "./discord";

const PORT = Number(process.env.PORT) || 3100;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!DISCORD_WEBHOOK_URL) {
  console.error("DISCORD_WEBHOOK_URL is required");
  process.exit(1);
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/health") {
      return new Response("ok");
    }

    if (req.method === "POST" && url.pathname === "/webhook") {
      const body = await req.text();

      if (WEBHOOK_SECRET) {
        const signature =
          req.headers.get("x-hub-signature-256") ??
          req.headers.get("x-signature-256") ??
          req.headers.get("x-signature");

        if (!signature || !verifyHmacSignature(body, signature, WEBHOOK_SECRET)) {
          return new Response("Invalid signature", { status: 401 });
        }
      }

      let payload: unknown;
      try {
        payload = JSON.parse(body);
      } catch {
        return new Response("Invalid JSON", { status: 400 });
      }

      const message = toDiscordMessage(payload);
      await sendDiscordWebhook(DISCORD_WEBHOOK_URL, message);

      return new Response("Sent", { status: 200 });
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`fledge-plugin-discord listening on port ${server.port}`);

function toDiscordMessage(payload: unknown): DiscordMessage {
  if (typeof payload !== "object" || payload === null) {
    return { content: String(payload) };
  }

  const obj = payload as Record<string, unknown>;

  if ("embeds" in obj || "content" in obj) {
    return obj as DiscordMessage;
  }

  if ("text" in obj && typeof obj.text === "string") {
    return { content: obj.text };
  }

  if ("message" in obj && typeof obj.message === "string") {
    return { content: obj.message };
  }

  return { content: `\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\`` };
}
