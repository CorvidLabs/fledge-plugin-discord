import { openCredentialStore } from "./credentials";
import { sendDiscordWebhook } from "./discord";
import { toDiscordMessage } from "./payload";
import { verifyHmacSignature } from "./verify";

const PORT = Number(process.env.PORT) || 3100;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const STORE_NAME = process.env.DISCORD_WEBHOOK_NAME ?? "default";

let DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
if (!DISCORD_WEBHOOK_URL) {
  const store = await openCredentialStore();
  DISCORD_WEBHOOK_URL = await store.get(STORE_NAME);
}

if (!DISCORD_WEBHOOK_URL) {
  console.error(
    "No webhook URL configured. Set DISCORD_WEBHOOK_URL or run 'fledge discord set-url' first.",
  );
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
      try {
        await sendDiscordWebhook(DISCORD_WEBHOOK_URL, message);
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        console.error(`[webhook] forward failed: ${detail}`);
        return new Response(`Forward failed: ${detail}`, { status: 502 });
      }

      console.log(`[webhook] forwarded ${body.length}b → discord`);
      return new Response("Sent", { status: 200 });
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`fledge-plugin-discord listening on port ${server.port}`);
console.log(`  POST http://localhost:${server.port}/webhook`);
console.log(`  GET  http://localhost:${server.port}/health`);
