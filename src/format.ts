import type { DiscordEmbed, DiscordMessage } from "./discord";

export interface FormatOptions {
  color?: number;
  username?: string;
  avatar_url?: string;
}

export function formatEmbed(
  title: string,
  description: string,
  options: FormatOptions & {
    url?: string;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    footer?: string;
    timestamp?: string;
  } = {},
): DiscordMessage {
  const embed: DiscordEmbed = {
    title,
    description,
    color: options.color ?? 0x5865f2,
  };

  if (options.url) embed.url = options.url;
  if (options.fields) embed.fields = options.fields;
  if (options.footer) embed.footer = { text: options.footer };
  if (options.timestamp) embed.timestamp = options.timestamp;

  const message: DiscordMessage = { embeds: [embed] };
  if (options.username) message.username = options.username;
  if (options.avatar_url) message.avatar_url = options.avatar_url;

  return message;
}

export function formatText(
  content: string,
  options: FormatOptions = {},
): DiscordMessage {
  const message: DiscordMessage = { content };
  if (options.username) message.username = options.username;
  if (options.avatar_url) message.avatar_url = options.avatar_url;
  return message;
}
