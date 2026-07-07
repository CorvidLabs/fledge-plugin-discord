import { NameIndex } from "./index-file";
import { indexFilePath } from "./paths";
import { spawnCmd } from "./spawn";
import { CredentialError, type CredentialStore, SERVICE_NAME } from "./types";

export class KeychainStore implements CredentialStore {
	readonly backend = "keychain";
	readonly secure = true;
	readonly description = "macOS Keychain";

	private readonly index = new NameIndex(indexFilePath("keychain"));

	async set(name: string, value: string): Promise<void> {
		await this.spawnSilent([
			"security",
			"delete-generic-password",
			"-s",
			SERVICE_NAME,
			"-a",
			name,
		]);

		const result = await spawnCmd([
			"security",
			"add-generic-password",
			"-U",
			"-s",
			SERVICE_NAME,
			"-a",
			name,
			"-w",
			value,
		]);

		if (result.code !== 0) {
			throw new CredentialError(
				`Keychain write failed (exit ${result.code}). ${redact(result.stderr)}`,
			);
		}

		await this.index.add(name);
	}

	async get(name: string): Promise<string | undefined> {
		const result = await spawnCmd([
			"security",
			"find-generic-password",
			"-s",
			SERVICE_NAME,
			"-a",
			name,
			"-w",
		]);
		if (result.code !== 0) return undefined;
		return result.stdout.replace(/\r?\n$/, "");
	}

	async delete(name: string): Promise<boolean> {
		const result = await spawnCmd([
			"security",
			"delete-generic-password",
			"-s",
			SERVICE_NAME,
			"-a",
			name,
		]);
		await this.index.remove(name);
		return result.code === 0;
	}

	async list(): Promise<string[]> {
		return this.index.list();
	}

	private async spawnSilent(cmd: string[]): Promise<void> {
		try {
			await spawnCmd(cmd);
		} catch {
			// intentional
		}
	}
}

function redact(text: string): string {
	return text
		.replace(
			/https:\/\/discord\.com\/api\/webhooks\/\S+/gi,
			"https://discord.com/api/webhooks/[redacted]",
		)
		.replace(/\s+/g, " ")
		.trim();
}
