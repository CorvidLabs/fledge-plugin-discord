export function verifyHmacSignature(
	body: string,
	signature: string,
	secret: string,
	algorithm: "sha256" | "sha1" = "sha256",
): boolean {
	const hmac = new Bun.CryptoHasher(algorithm, secret);
	hmac.update(body);
	const expected = `${algorithm}=${hmac.digest("hex")}`;

	if (expected.length !== signature.length) return false;
	const bufA = Buffer.from(expected);
	const bufB = Buffer.from(signature);
	return crypto.timingSafeEqual(bufA, bufB);
}
