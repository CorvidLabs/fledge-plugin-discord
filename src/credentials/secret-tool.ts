import { NameIndex } from "./index-file";
import { indexFilePath } from "./paths";
import { spawnCmd } from "./spawn";
import { CredentialError, type CredentialStore, SERVICE_NAME } from "./types";

export class SecretToolStore implements CredentialStore {
	readonly backend = "secret-tool";
	readonly secure = true;
	readonly description = "GNOME Keyring (libsecret)";

	private readonly index = new NameIndex(indexFilePath("secret-tool"));

	async set(name: string, value: string): Promise<void> {
		const result = await spawnCmd(
			[
				"secret-tool",
				"store",
				"--label",
				`${SERVICE_NAME} (${name})`,
				"service",
				SERVICE_NAME,
				"account",
				name,
			],
			value,
		);
		if (result.code !== 0) {
			throw new CredentialError(
				`secret-tool write failed (exit ${result.code}). ${result.stderr.trim()}`,
			);
		}
		await this.index.add(name);
	}

	async get(name: string): Promise<string | undefined> {
		const result = await spawnCmd([
			"secret-tool",
			"lookup",
			"service",
			SERVICE_NAME,
			"account",
			name,
		]);
		if (result.code !== 0 || result.stdout.length === 0) return undefined;
		return result.stdout.replace(/\r?\n$/, "");
	}

	async delete(name: string): Promise<boolean> {
		const result = await spawnCmd([
			"secret-tool",
			"clear",
			"service",
			SERVICE_NAME,
			"account",
			name,
		]);
		await this.index.remove(name);
		return result.code === 0;
	}

	async list(): Promise<string[]> {
		return this.index.list();
	}
}
