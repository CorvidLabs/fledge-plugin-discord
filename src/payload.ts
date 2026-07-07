import type { DiscordMessage } from "./discord";

export function toDiscordMessage(payload: unknown): DiscordMessage {
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
