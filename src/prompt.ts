export interface PromptOptions {
	prompt: string;
	mask?: boolean;
}

export async function promptSecret(options: PromptOptions): Promise<string> {
	if (!process.stdin.isTTY) {
		return readPipedStdin();
	}

	process.stdout.write(options.prompt);

	const stdin = process.stdin as NodeJS.ReadStream & {
		setRawMode?: (raw: boolean) => void;
	};
	const wasRaw = Boolean((stdin as { isRaw?: boolean }).isRaw);
	stdin.setRawMode?.(true);
	stdin.resume();
	stdin.setEncoding("utf8");

	return new Promise<string>((resolve, reject) => {
		let buffer = "";

		const cleanup = () => {
			stdin.removeListener("data", onData);
			stdin.setRawMode?.(wasRaw);
			stdin.pause();
			process.stdout.write("\n");
		};

		const onData = (chunk: string) => {
			for (const ch of chunk) {
				const code = ch.charCodeAt(0);
				if (ch === "\r" || ch === "\n") {
					cleanup();
					resolve(buffer);
					return;
				}
				if (code === 3) {
					cleanup();
					reject(new Error("Cancelled"));
					return;
				}
				if (code === 127 || code === 8) {
					if (buffer.length > 0) {
						buffer = buffer.slice(0, -1);
						if (options.mask !== false) process.stdout.write("\b \b");
					}
					continue;
				}
				if (code < 32) continue;
				buffer += ch;
				if (options.mask !== false) process.stdout.write("*");
			}
		};

		stdin.on("data", onData);
	});
}

async function readPipedStdin(): Promise<string> {
	const chunks: Uint8Array[] = [];
	for await (const chunk of process.stdin as AsyncIterable<Uint8Array>)
		chunks.push(chunk);
	return Buffer.concat(chunks).toString("utf8").trim();
}
