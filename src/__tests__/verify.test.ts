import { describe, expect, test } from "bun:test";
import { verifyHmacSignature } from "../verify";

describe("verifyHmacSignature", () => {
  const secret = "test-secret";
  const body = '{"event":"deploy"}';

  function computeSignature(payload: string, key: string, algo: "sha256" | "sha1" = "sha256"): string {
    const hmac = new Bun.CryptoHasher(algo, key);
    hmac.update(payload);
    return `${algo}=${hmac.digest("hex")}`;
  }

  test("accepts valid sha256 signature", () => {
    const sig = computeSignature(body, secret);
    expect(verifyHmacSignature(body, sig, secret)).toBe(true);
  });

  test("accepts valid sha1 signature", () => {
    const sig = computeSignature(body, secret, "sha1");
    expect(verifyHmacSignature(body, sig, secret, "sha1")).toBe(true);
  });

  test("rejects wrong secret", () => {
    const sig = computeSignature(body, "wrong-secret");
    expect(verifyHmacSignature(body, sig, secret)).toBe(false);
  });

  test("rejects tampered body", () => {
    const sig = computeSignature(body, secret);
    expect(verifyHmacSignature('{"event":"hack"}', sig, secret)).toBe(false);
  });

  test("rejects malformed signature", () => {
    expect(verifyHmacSignature(body, "not-a-valid-sig", secret)).toBe(false);
  });
});
