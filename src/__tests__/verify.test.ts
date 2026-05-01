import { describe, expect, test } from "bun:test";
import { verifyGitHubSignature } from "../verify";

describe("verifyGitHubSignature", () => {
  const secret = "test-secret";
  const body = '{"action":"completed"}';

  function computeSignature(payload: string, key: string): string {
    const hmac = new Bun.CryptoHasher("sha256", key);
    hmac.update(payload);
    return `sha256=${hmac.digest("hex")}`;
  }

  test("accepts valid signature", () => {
    const sig = computeSignature(body, secret);
    expect(verifyGitHubSignature(body, sig, secret)).toBe(true);
  });

  test("rejects wrong secret", () => {
    const sig = computeSignature(body, "wrong-secret");
    expect(verifyGitHubSignature(body, sig, secret)).toBe(false);
  });

  test("rejects tampered body", () => {
    const sig = computeSignature(body, secret);
    expect(verifyGitHubSignature('{"action":"in_progress"}', sig, secret)).toBe(false);
  });

  test("rejects malformed signature", () => {
    expect(verifyGitHubSignature(body, "not-a-valid-sig", secret)).toBe(false);
  });
});
