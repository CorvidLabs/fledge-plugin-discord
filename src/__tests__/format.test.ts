import { describe, expect, test } from "bun:test";
import { formatEmbed, formatText } from "../format";

describe("formatEmbed", () => {
  test("creates embed with default color", () => {
    const result = formatEmbed("Title", "Description");
    expect(result.embeds?.[0].color).toBe(0x5865f2);
  });

  test("uses custom color", () => {
    const result = formatEmbed("Title", "Desc", { color: 0xed4245 });
    expect(result.embeds?.[0].color).toBe(0xed4245);
  });

  test("includes fields when provided", () => {
    const fields = [{ name: "Key", value: "Val", inline: true }];
    const result = formatEmbed("Title", "Desc", { fields });
    expect(result.embeds?.[0].fields).toEqual(fields);
  });

  test("sets username and avatar", () => {
    const result = formatEmbed("Title", "Desc", {
      username: "Fledge Bot",
      avatar_url: "https://example.com/avatar.png",
    });
    expect(result.username).toBe("Fledge Bot");
    expect(result.avatar_url).toBe("https://example.com/avatar.png");
  });

  test("includes url, footer, and timestamp", () => {
    const result = formatEmbed("Title", "Desc", {
      url: "https://example.com",
      footer: "Footer text",
      timestamp: "2026-05-01T12:00:00Z",
    });
    expect(result.embeds?.[0].url).toBe("https://example.com");
    expect(result.embeds?.[0].footer?.text).toBe("Footer text");
    expect(result.embeds?.[0].timestamp).toBe("2026-05-01T12:00:00Z");
  });
});

describe("formatText", () => {
  test("creates plain text message", () => {
    const result = formatText("Hello world");
    expect(result.content).toBe("Hello world");
  });

  test("sets username", () => {
    const result = formatText("Hello", { username: "Bot" });
    expect(result.username).toBe("Bot");
  });
});
