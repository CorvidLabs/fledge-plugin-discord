import { describe, expect, test } from "bun:test";
import { NAMED_COLORS, parseColor } from "../colors";

describe("parseColor", () => {
  test("resolves named color", () => {
    expect(parseColor("green")).toBe(NAMED_COLORS.green);
    expect(parseColor("RED")).toBe(NAMED_COLORS.red);
  });

  test("resolves semantic alias", () => {
    expect(parseColor("success")).toBe(NAMED_COLORS.green);
    expect(parseColor("error")).toBe(NAMED_COLORS.red);
  });

  test("parses hex with #", () => {
    expect(parseColor("#5865f2")).toBe(0x5865f2);
  });

  test("parses 0x-prefixed hex", () => {
    expect(parseColor("0xed4245")).toBe(0xed4245);
  });

  test("parses bare hex", () => {
    expect(parseColor("57f287")).toBe(0x57f287);
  });

  test("parses decimal", () => {
    expect(parseColor("3066993")).toBe(3066993);
  });

  test("returns undefined for invalid", () => {
    expect(parseColor("not-a-color")).toBeUndefined();
    expect(parseColor("#zzz")).toBeUndefined();
  });
});
