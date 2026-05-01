export function verifyGitHubSignature(
  body: string,
  signature: string,
  secret: string,
): boolean {
  const hmac = new Bun.CryptoHasher("sha256", secret);
  hmac.update(body);
  const expected = `sha256=${hmac.digest("hex")}`;
  return safeCompare(expected, signature);
}

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return crypto.timingSafeEqual(bufA, bufB);
}
