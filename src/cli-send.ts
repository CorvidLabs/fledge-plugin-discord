import { type ParsedArgs, parseArgs } from "./args";
import { parseColor } from "./colors";
import { openCredentialStore } from "./credentials";
import { type DiscordMessage, sendDiscordWebhook } from "./discord";
import { formatEmbed, formatText } from "./format";

const HELP = `fledge discord send — post a message to a Discord webhook

Usage:
  fledge discord send <message>
  fledge discord send --embed <title> [description]
  fledge discord send --json '<json>'
  echo '...' | fledge discord send -

Options:
  --embed                 Send as a rich embed
  --json <json>           Send raw JSON (Discord webhook payload)
  --webhook <url>         Override stored credentials and DISCORD_WEBHOOK_URL
  --name <name>           Use a named webhook URL from the secure store
  --color <name|hex>      Embed color (e.g. red, #57f287, 0x5865f2)
  --field <name=value>    Add an embed field (repeatable). Prefix with '+' for inline (+name=value)
  --footer <text>         Embed footer text
  --url <url>             Embed URL
  --username <name>       Override webhook username
  --avatar <url>          Override webhook avatar
  --timestamp <iso>       Embed timestamp (ISO 8601)
  --now                   Use the current time as the embed timestamp
  --dry-run               Print payload without sending
  -h, --help              Show this help

Environment:
  DISCORD_WEBHOOK_URL     Discord webhook URL (required unless --webhook)
`;

async function main() {
	const args = parseArgs(process.argv.slice(2));

	if (args.flags.help || args.flags.h) {
		console.log(HELP);
		return;
	}

	const message = await buildMessage(args);

	if (args.flags["dry-run"]) {
		console.log(JSON.stringify(message, null, 2));
		return;
	}

	const webhookUrl = await resolveWebhookUrl(args);
	if (!webhookUrl) {
		console.error(
			"No webhook URL available. Pass --webhook <url>, set DISCORD_WEBHOOK_URL, or store one via 'fledge discord set-url'.",
		);
		process.exit(1);
	}

	try {
		await sendDiscordWebhook(webhookUrl, message);
		console.log(args.flags.embed ? "Embed sent." : "Message sent.");
	} catch (error) {
		const detail = error instanceof Error ? error.message : String(error);
		console.error(`Send failed: ${detail}`);
		process.exit(1);
	}
}

async function resolveWebhookUrl(
	args: ParsedArgs,
): Promise<string | undefined> {
	const flagUrl = args.options.webhook as string | undefined;
	if (flagUrl) return flagUrl;

	const name = args.options.name as string | undefined;
	if (name) {
		const store = await openCredentialStore();
		const stored = await store.get(name);
		if (stored) return stored;
		console.error(
			`No stored URL for '${name}'. Run 'fledge discord set-url --name ${name}' first.`,
		);
		process.exit(1);
	}

	if (process.env.DISCORD_WEBHOOK_URL) return process.env.DISCORD_WEBHOOK_URL;

	const store = await openCredentialStore();
	return store.get("default");
}

async function buildMessage(args: ParsedArgs): Promise<DiscordMessage> {
	const username = args.options.username as string | undefined;
	const avatar = args.options.avatar as string | undefined;

	if (args.options.json !== undefined) {
		const raw =
			(args.options.json as string) === "-"
				? await readStdin()
				: (args.options.json as string);
		const parsed = JSON.parse(raw) as DiscordMessage;
		if (username) parsed.username = username;
		if (avatar) parsed.avatar_url = avatar;
		return parsed;
	}

	if (args.flags.embed) {
		const title = args.positional[0];
		const description = args.positional.slice(1).join(" ");
		if (!title) {
			console.error("Usage: fledge discord send --embed <title> [description]");
			process.exit(1);
		}

		const colorRaw = args.options.color as string | undefined;
		const color = colorRaw ? parseColor(colorRaw) : undefined;
		if (colorRaw && color === undefined) {
			console.error(`Invalid color: ${colorRaw}`);
			process.exit(1);
		}

		return formatEmbed(title, description || "", {
			color,
			url: args.options.url as string | undefined,
			footer: args.options.footer as string | undefined,
			fields: parseFields(args.options.field),
			timestamp: resolveTimestamp(args.options.timestamp, args.flags.now),
			username,
			avatar_url: avatar,
		});
	}

	let content = args.positional.join(" ");
	if (content === "-" || content === "") content = await readStdin();
	if (!content) {
		console.error(HELP);
		process.exit(1);
	}

	return formatText(content, { username, avatar_url: avatar });
}

function parseFields(
	raw: unknown,
): Array<{ name: string; value: string; inline?: boolean }> | undefined {
	const list =
		raw === undefined
			? []
			: Array.isArray(raw)
				? (raw as string[])
				: [raw as string];
	if (list.length === 0) return undefined;

	return list.map((entry) => {
		const inline = entry.startsWith("+");
		const body = inline ? entry.slice(1) : entry;
		const eq = body.indexOf("=");
		if (eq === -1) {
			console.error(`Invalid --field (expected name=value): ${entry}`);
			process.exit(1);
		}
		const field: { name: string; value: string; inline?: boolean } = {
			name: body.slice(0, eq),
			value: body.slice(eq + 1),
		};
		if (inline) field.inline = true;
		return field;
	});
}

function resolveTimestamp(
	raw: unknown,
	now: boolean | undefined,
): string | undefined {
	if (now) return new Date().toISOString();
	if (raw === undefined) return undefined;
	return String(raw);
}

async function readStdin(): Promise<string> {
	if (process.stdin.isTTY) return "";
	const chunks: Uint8Array[] = [];
	for await (const chunk of process.stdin as AsyncIterable<Uint8Array>)
		chunks.push(chunk);
	return Buffer.concat(chunks).toString("utf8").trim();
}

await main();
