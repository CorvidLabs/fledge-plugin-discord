import { describe, expect, test, mock } from "bun:test";
import { sendDiscordWebhook } from "../discord";

describe("sendDiscordWebhook URL handling", () => {
  test("uses the exact URL provided", async () => {
    const originalFetch = globalThis.fetch;
    let capturedUrl = "";

    globalThis.fetch = mock(async (url: string | URL | Request, _init?: RequestInit) => {
      capturedUrl = String(url);
      return new Response("", { status: 204 });
    }) as typeof fetch;

    try {
      const url = "https://discord.com/api/webhooks/123456/abcdef-token";
      await sendDiscordWebhook(url, { content: "test" });
      expect(capturedUrl).toBe(url);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("sends correct Content-Type header", async () => {
    const originalFetch = globalThis.fetch;
    let capturedHeaders: Record<string, string> = {};

    globalThis.fetch = mock(async (_url: string | URL | Request, init?: RequestInit) => {
      const h = init?.headers as Record<string, string>;
      capturedHeaders = h;
      return new Response("", { status: 204 });
    }) as typeof fetch;

    try {
      await sendDiscordWebhook("https://discord.com/api/webhooks/1/x", { content: "hi" });
      expect(capturedHeaders["Content-Type"]).toBe("application/json");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("serializes embed payload as JSON", async () => {
    const originalFetch = globalThis.fetch;
    let capturedBody = "";

    globalThis.fetch = mock(async (_url: string | URL | Request, init?: RequestInit) => {
      capturedBody = init?.body as string;
      return new Response("", { status: 204 });
    }) as typeof fetch;

    try {
      const message = {
        embeds: [{ title: "Deploy", description: "v1.2.0", color: 0x57f287 }],
        username: "CI Bot",
      };
      await sendDiscordWebhook("https://discord.com/api/webhooks/1/x", message);
      const parsed = JSON.parse(capturedBody);
      expect(parsed.embeds[0].title).toBe("Deploy");
      expect(parsed.embeds[0].color).toBe(0x57f287);
      expect(parsed.username).toBe("CI Bot");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("includes response text in error message", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(async () => {
      return new Response("You are being rate limited.", { status: 429 });
    }) as typeof fetch;

    try {
      await expect(
        sendDiscordWebhook("https://discord.com/api/webhooks/1/x", { content: "hi" }),
      ).rejects.toThrow("You are being rate limited.");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
