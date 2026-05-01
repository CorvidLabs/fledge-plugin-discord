import { describe, expect, test, mock } from "bun:test";
import { sendDiscordWebhook } from "../discord";

describe("sendDiscordWebhook", () => {
  test("sends POST with JSON body", async () => {
    const originalFetch = globalThis.fetch;
    let capturedUrl = "";
    let capturedBody = "";

    globalThis.fetch = mock(async (url: string | URL | Request, init?: RequestInit) => {
      capturedUrl = String(url);
      capturedBody = init?.body as string;
      return new Response("ok", { status: 204 });
    }) as typeof fetch;

    try {
      await sendDiscordWebhook("https://discord.com/api/webhooks/test", {
        content: "Hello",
      });
      expect(capturedUrl).toBe("https://discord.com/api/webhooks/test");
      expect(JSON.parse(capturedBody)).toEqual({ content: "Hello" });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("throws on non-ok response", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(async () => {
      return new Response("rate limited", { status: 429 });
    }) as typeof fetch;

    try {
      await expect(
        sendDiscordWebhook("https://discord.com/api/webhooks/test", { content: "Hi" }),
      ).rejects.toThrow("Discord webhook failed (429)");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
