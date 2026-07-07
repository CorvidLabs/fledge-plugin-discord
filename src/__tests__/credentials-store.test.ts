import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { openCredentialStore } from "../credentials";

describe("openCredentialStore", () => {
	const originalEnv = process.env.FLEDGE_DISCORD_CRED_BACKEND;

	afterEach(() => {
		if (originalEnv === undefined) {
			Reflect.deleteProperty(process.env, "FLEDGE_DISCORD_CRED_BACKEND");
		} else {
			process.env.FLEDGE_DISCORD_CRED_BACKEND = originalEnv;
		}
	});

	test("preferFile returns file backend", async () => {
		const store = await openCredentialStore({ preferFile: true });
		expect(store.backend).toBe("file");
		expect(store.secure).toBe(false);
	});

	test("FLEDGE_DISCORD_CRED_BACKEND=file returns file backend", async () => {
		process.env.FLEDGE_DISCORD_CRED_BACKEND = "file";
		const store = await openCredentialStore();
		expect(store.backend).toBe("file");
	});

	test("FLEDGE_DISCORD_CRED_BACKEND=keychain returns keychain backend", async () => {
		process.env.FLEDGE_DISCORD_CRED_BACKEND = "keychain";
		const store = await openCredentialStore();
		expect(store.backend).toBe("keychain");
	});

	test("unknown backend throws", async () => {
		process.env.FLEDGE_DISCORD_CRED_BACKEND = "unknown-backend";
		await expect(openCredentialStore()).rejects.toThrow(
			"Unknown credential backend",
		);
	});
});
