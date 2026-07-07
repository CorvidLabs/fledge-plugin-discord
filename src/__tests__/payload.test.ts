import { describe, expect, test } from "bun:test";
import { toDiscordMessage } from "../payload";

describe("toDiscordMessage", () => {
	test("passes through Discord-shaped payload with content", () => {
		const result = toDiscordMessage({ content: "hi" });
		expect(result).toEqual({ content: "hi" });
	});

	test("passes through Discord-shaped payload with embeds", () => {
		const result = toDiscordMessage({ embeds: [{ title: "T" }] });
		expect(result.embeds?.[0].title).toBe("T");
	});

	test("maps {text} to content", () => {
		const result = toDiscordMessage({ text: "hello" });
		expect(result).toEqual({ content: "hello" });
	});

	test("maps {message} to content", () => {
		const result = toDiscordMessage({ message: "hello" });
		expect(result).toEqual({ content: "hello" });
	});

	test("renders unknown JSON as code block", () => {
		const result = toDiscordMessage({ status: "ok", count: 3 });
		expect(result.content).toContain("```json");
		expect(result.content).toContain('"status": "ok"');
	});

	test("stringifies non-objects", () => {
		expect(toDiscordMessage("hi")).toEqual({ content: "hi" });
		expect(toDiscordMessage(42)).toEqual({ content: "42" });
		expect(toDiscordMessage(null)).toEqual({ content: "null" });
	});
});
