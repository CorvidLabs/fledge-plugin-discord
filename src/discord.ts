export interface DiscordMessage {
	content?: string;
	embeds?: DiscordEmbed[];
	username?: string;
	avatar_url?: string;
}

export interface DiscordEmbed {
	title?: string;
	description?: string;
	url?: string;
	color?: number;
	fields?: Array<{ name: string; value: string; inline?: boolean }>;
	timestamp?: string;
	footer?: { text: string; icon_url?: string };
	author?: { name: string; url?: string; icon_url?: string };
	thumbnail?: { url: string };
}

export async function sendDiscordWebhook(
	webhookUrl: string,
	message: DiscordMessage,
): Promise<void> {
	const response = await fetch(webhookUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(message),
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Discord webhook failed (${response.status}): ${text}`);
	}
}
