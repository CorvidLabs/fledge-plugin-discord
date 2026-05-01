import { sendDiscordWebhook } from "./discord";
import { formatEmbed, formatText } from "./format";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!DISCORD_WEBHOOK_URL) {
  console.error("DISCORD_WEBHOOK_URL is required");
  process.exit(1);
}

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: fledge discord send <message>");
  console.error("       fledge discord send --embed <title> <description>");
  process.exit(1);
}

if (args[0] === "--embed") {
  const title = args[1];
  const description = args.slice(2).join(" ");
  if (!title || !description) {
    console.error("Usage: fledge discord send --embed <title> <description>");
    process.exit(1);
  }
  const message = formatEmbed(title, description);
  await sendDiscordWebhook(DISCORD_WEBHOOK_URL, message);
  console.log("Embed sent.");
} else {
  const content = args.join(" ");
  const message = formatText(content);
  await sendDiscordWebhook(DISCORD_WEBHOOK_URL, message);
  console.log("Message sent.");
}
