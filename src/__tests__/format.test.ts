import { describe, expect, test } from "bun:test";
import { formatFailureEmbed } from "../format";

describe("formatFailureEmbed", () => {
  const mockRun = {
    name: "Build & Test",
    html_url: "https://github.com/CorvidLabs/corvid-agent/actions/runs/123",
    head_branch: "main",
    head_sha: "abc1234def5678",
    run_number: 42,
    actor: { login: "leif", avatar_url: "https://example.com/avatar.png" },
    created_at: "2026-05-01T12:00:00Z",
  };

  const mockRepo = {
    full_name: "CorvidLabs/corvid-agent",
    html_url: "https://github.com/CorvidLabs/corvid-agent",
  };

  test("creates embed with red color", () => {
    const result = formatFailureEmbed(mockRun, mockRepo);
    expect(result.embeds[0].color).toBe(0xed4245);
  });

  test("includes workflow name and run number in title", () => {
    const result = formatFailureEmbed(mockRun, mockRepo);
    expect(result.embeds[0].title).toBe("CI Failed: Build & Test #42");
  });

  test("truncates commit SHA to 7 chars", () => {
    const result = formatFailureEmbed(mockRun, mockRepo);
    const commitField = result.embeds[0].fields.find((f) => f.name === "Commit");
    expect(commitField?.value).toBe("`abc1234`");
  });

  test("includes branch, commit, and actor fields", () => {
    const result = formatFailureEmbed(mockRun, mockRepo);
    const fieldNames = result.embeds[0].fields.map((f) => f.name);
    expect(fieldNames).toEqual(["Branch", "Commit", "Triggered by"]);
  });

  test("links to workflow run", () => {
    const result = formatFailureEmbed(mockRun, mockRepo);
    expect(result.embeds[0].url).toBe(mockRun.html_url);
  });
});
