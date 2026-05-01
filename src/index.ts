import { verifyGitHubSignature } from "./verify";
import { formatFailureEmbed } from "./format";
import { sendDiscordWebhook } from "./discord";

const PORT = Number(process.env.PORT) || 3100;
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!GITHUB_WEBHOOK_SECRET) {
  console.error("GITHUB_WEBHOOK_SECRET is required");
  process.exit(1);
}

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

    if (req.method === "POST" && url.pathname === "/webhook/github") {
      const body = await req.text();

      const signature = req.headers.get("x-hub-signature-256");
      if (!signature || !verifyGitHubSignature(body, signature, GITHUB_WEBHOOK_SECRET)) {
        return new Response("Invalid signature", { status: 401 });
      }

      const event = req.headers.get("x-github-event");
      if (event !== "workflow_run") {
        return new Response("Ignored event", { status: 200 });
      }

      const payload = JSON.parse(body);

      if (payload.action !== "completed" || payload.workflow_run?.conclusion !== "failure") {
        return new Response("Not a failure", { status: 200 });
      }

      const embed = formatFailureEmbed(payload.workflow_run, payload.repository);
      await sendDiscordWebhook(DISCORD_WEBHOOK_URL, embed);

      console.log(`Posted failure: ${payload.repository.full_name} — ${payload.workflow_run.name}`);
      return new Response("Notified", { status: 200 });
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`fledge-ci-discord listening on port ${server.port}`);
