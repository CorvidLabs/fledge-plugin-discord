import { describe, expect, test } from "bun:test";
import { parseArgs } from "../args";

describe("parseArgs", () => {
	test("parses positional arguments", () => {
		const result = parseArgs(["hello", "world"]);
		expect(result.positional).toEqual(["hello", "world"]);
	});

	test("parses boolean flags", () => {
		const result = parseArgs(["--embed", "--dry-run", "Title"]);
		expect(result.flags.embed).toBe(true);
		expect(result.flags["dry-run"]).toBe(true);
		expect(result.positional).toEqual(["Title"]);
	});

	test("parses option with separate value", () => {
		const result = parseArgs(["--color", "green", "msg"]);
		expect(result.options.color).toBe("green");
		expect(result.positional).toEqual(["msg"]);
	});

	test("parses option with = syntax", () => {
		const result = parseArgs(["--color=red"]);
		expect(result.options.color).toBe("red");
	});

	test("collects repeatable --field into array", () => {
		const result = parseArgs(["--field", "a=1", "--field", "+b=2"]);
		expect(result.options.field).toEqual(["a=1", "+b=2"]);
	});

	test("--timestamp captures the next value", () => {
		const result = parseArgs(["--timestamp", "2026-05-02T00:00:00Z"]);
		expect(result.options.timestamp).toBe("2026-05-02T00:00:00Z");
	});

	test("--now is a boolean flag", () => {
		const result = parseArgs(["--now", "--embed", "Title"]);
		expect(result.flags.now).toBe(true);
		expect(result.flags.embed).toBe(true);
		expect(result.positional).toEqual(["Title"]);
	});

	test("short flag -h is parsed", () => {
		const result = parseArgs(["-h"]);
		expect(result.flags.h).toBe(true);
	});

	test("bare - stays positional (stdin marker)", () => {
		const result = parseArgs(["-"]);
		expect(result.positional).toEqual(["-"]);
	});

	test("-- terminates options", () => {
		const result = parseArgs(["--", "--not-a-flag", "raw"]);
		expect(result.positional).toEqual(["--not-a-flag", "raw"]);
	});
});
