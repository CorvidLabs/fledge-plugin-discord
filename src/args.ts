export interface ParsedArgs {
	positional: string[];
	flags: Record<string, boolean>;
	options: Record<string, string | string[] | boolean>;
}

const REPEATABLE = new Set(["field"]);
const BOOLEAN_FLAGS = new Set([
	"embed",
	"dry-run",
	"help",
	"h",
	"now",
	"from-stdin",
	"reveal",
	"all",
]);

export function parseArgs(argv: string[]): ParsedArgs {
	const positional: string[] = [];
	const flags: Record<string, boolean> = {};
	const options: Record<string, string | string[] | boolean> = {};

	let i = 0;
	while (i < argv.length) {
		const arg = argv[i];

		if (arg === "--") {
			positional.push(...argv.slice(i + 1));
			break;
		}

		if (arg.startsWith("--")) {
			const eq = arg.indexOf("=");
			const name = eq === -1 ? arg.slice(2) : arg.slice(2, eq);
			const inline = eq === -1 ? undefined : arg.slice(eq + 1);

			if (BOOLEAN_FLAGS.has(name)) {
				flags[name] = true;
				i += 1;
				continue;
			}

			const value = inline ?? argv[i + 1];
			if (value === undefined) {
				console.error(`Missing value for --${name}`);
				process.exit(1);
			}

			if (REPEATABLE.has(name)) {
				const existing = options[name];
				if (Array.isArray(existing)) existing.push(value);
				else if (typeof existing === "string")
					options[name] = [existing, value];
				else options[name] = [value];
			} else {
				options[name] = value;
			}

			i += inline === undefined ? 2 : 1;
			continue;
		}

		if (arg.startsWith("-") && arg.length === 2 && arg !== "-") {
			flags[arg.slice(1)] = true;
			i += 1;
			continue;
		}

		positional.push(arg);
		i += 1;
	}

	return { positional, flags, options };
}
