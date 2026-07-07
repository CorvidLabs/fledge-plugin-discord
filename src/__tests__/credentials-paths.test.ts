import { describe, expect, test } from "bun:test";
import { isValidName } from "../credentials/paths";

describe("isValidName", () => {
	test("accepts safe names", () => {
		expect(isValidName("default")).toBe(true);
		expect(isValidName("prod")).toBe(true);
		expect(isValidName("team-alpha")).toBe(true);
		expect(isValidName("v1.2_beta")).toBe(true);
	});

	test("rejects path traversal", () => {
		expect(isValidName("../escape")).toBe(false);
		expect(isValidName("a/b")).toBe(false);
		expect(isValidName("a\\b")).toBe(false);
	});

	test("rejects empty and whitespace", () => {
		expect(isValidName("")).toBe(false);
		expect(isValidName(" ")).toBe(false);
		expect(isValidName("with space")).toBe(false);
	});

	test("rejects overlong names", () => {
		expect(isValidName("a".repeat(65))).toBe(false);
		expect(isValidName("a".repeat(64))).toBe(true);
	});
});
