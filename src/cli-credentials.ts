import { type ParsedArgs, parseArgs } from "./args";
import { isValidName, openCredentialStore } from "./credentials";
import { promptSecret } from "./prompt";

const HELP = `fledge discord — manage stored Discord webhook URLs

Usage:
  fledge discord set-url [--name <name>] [--from-stdin]
  fledge discord get-url [--name <name>] [--reveal]
  fledge discord list-urls
  fledge discord clear-url [--name <name>] [--all]

Notes:
  - URLs are stored in the OS-native secure store when available:
      macOS    → Keychain
      Linux    → libsecret (secret-tool)
      Windows  → DPAPI (per-user encryption)
    Falls back to a chmod 0600 file at ~/.config/fledge-plugin-discord/.

  - 'set-url' prompts with masked input by default (URL is not echoed,
    not visible in shell history, and not present in our argv).

  - Override the backend with FLEDGE_DISCORD_CRED_BACKEND={keychain|secret-tool|dpapi|file}.
`;

export async function runCredentialsCommand(
	subcommand: string,
	argv: string[],
): Promise<number> {
	const args = parseArgs(argv);

	if (args.flags.help || args.flags.h) {
		console.log(HELP);
		return 0;
	}

	switch (subcommand) {
		case "set-url":
			return setUrl(args);
		case "get-url":
			return getUrl(args);
		case "list-urls":
			return listUrls();
		case "clear-url":
			return clearUrl(args);
		default:
			console.error(`Unknown credential command: ${subcommand}`);
			console.error(HELP);
			return 64;
	}
}

async function setUrl(args: ParsedArgs): Promise<number> {
	const name = (args.options.name as string | undefined) ?? "default";
	if (!isValidName(name)) {
		console.error("Name must be 1–64 chars, [a-zA-Z0-9._-] only.");
		return 1;
	}

	let value: string;
	if (args.flags["from-stdin"] || !process.stdin.isTTY) {
		value = await readStdin();
	} else {
		value = await promptSecret({
			prompt: `Discord webhook URL for '${name}': `,
		});
	}

	value = value.trim();
	if (value.length === 0) {
		console.error("No URL provided.");
		return 1;
	}
	if (
		!/^https:\/\/(?:[a-z0-9-]+\.)?discord\.com\/api\/webhooks\//i.test(value)
	) {
		console.error(
			"That doesn't look like a Discord webhook URL (expected https://discord.com/api/webhooks/...).",
		);
		return 1;
	}

	const store = await openCredentialStore();
	try {
		await store.set(name, value);
	} catch (error) {
		console.error(`Failed to store credential: ${(error as Error).message}`);
		return 1;
	}

	console.log(`Stored '${name}' in ${store.description}.`);
	if (!store.secure) {
		console.warn(
			"Note: this backend stores the URL in plaintext on disk. Install secret-tool (Linux) or use macOS/Windows for OS-native encryption.",
		);
	}
	return 0;
}

async function getUrl(args: ParsedArgs): Promise<number> {
	const name = (args.options.name as string | undefined) ?? "default";
	const store = await openCredentialStore();
	const value = await store.get(name);
	if (value === undefined) {
		console.error(`No stored URL for '${name}'.`);
		return 1;
	}
	if (args.flags.reveal) {
		process.stdout.write(`${value}\n`);
		return 0;
	}
	console.log(
		`'${name}' is set in ${store.description}. Re-run with --reveal to print the URL.`,
	);
	return 0;
}

async function listUrls(): Promise<number> {
	const store = await openCredentialStore();
	const names = await store.list();
	if (names.length === 0) {
		console.log(`No stored URLs (backend: ${store.description}).`);
		return 0;
	}
	console.log(`Stored URLs (backend: ${store.description}):`);
	for (const name of names) console.log(`  • ${name}`);
	return 0;
}

async function clearUrl(args: ParsedArgs): Promise<number> {
	const store = await openCredentialStore();

	if (args.flags.all) {
		const names = await store.list();
		if (names.length === 0) {
			console.log("Nothing to clear.");
			return 0;
		}
		for (const name of names) await store.delete(name);
		console.log(
			`Cleared ${names.length} stored URL${names.length === 1 ? "" : "s"}.`,
		);
		return 0;
	}

	const name = (args.options.name as string | undefined) ?? "default";
	const removed = await store.delete(name);
	console.log(removed ? `Cleared '${name}'.` : `No stored URL for '${name}'.`);
	return removed ? 0 : 1;
}

async function readStdin(): Promise<string> {
	if (process.stdin.isTTY) return "";
	const chunks: Uint8Array[] = [];
	for await (const chunk of process.stdin as AsyncIterable<Uint8Array>)
		chunks.push(chunk);
	return Buffer.concat(chunks).toString("utf8");
}

if (import.meta.main) {
	const subcommand = process.argv[2] ?? "";
	const rest = process.argv.slice(3);
	const code = await runCredentialsCommand(subcommand, rest);
	process.exit(code);
}
