import { DPAPIStore } from "./credentials/dpapi";
import { FileStore } from "./credentials/file";
import { KeychainStore } from "./credentials/keychain";
import { SecretToolStore } from "./credentials/secret-tool";
import { commandExists } from "./credentials/spawn";
import type { CredentialStore } from "./credentials/types";

export { isValidName } from "./credentials/paths";
export type { CredentialStore } from "./credentials/types";
export { CredentialError } from "./credentials/types";

export interface OpenStoreOptions {
	preferFile?: boolean;
}

export async function openCredentialStore(
	options: OpenStoreOptions = {},
): Promise<CredentialStore> {
	if (options.preferFile) return new FileStore();

	if (process.env.FLEDGE_DISCORD_CRED_BACKEND) {
		return openExplicit(process.env.FLEDGE_DISCORD_CRED_BACKEND);
	}

	if (process.platform === "darwin") {
		return new KeychainStore();
	}

	if (process.platform === "linux" && (await commandExists("secret-tool"))) {
		return new SecretToolStore();
	}

	if (process.platform === "win32" && (await commandExists("powershell"))) {
		return new DPAPIStore();
	}

	return new FileStore();
}

function openExplicit(backend: string): CredentialStore {
	switch (backend.toLowerCase()) {
		case "keychain":
			return new KeychainStore();
		case "secret-tool":
			return new SecretToolStore();
		case "dpapi":
			return new DPAPIStore();
		case "file":
			return new FileStore();
		default:
			throw new Error(`Unknown credential backend: ${backend}`);
	}
}
