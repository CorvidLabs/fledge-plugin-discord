import { promises as fs } from "node:fs";
import path from "node:path";
import { NameIndex } from "./index-file";
import { dpapiBackendDir, indexFilePath, isValidName } from "./paths";
import { spawnCmd } from "./spawn";
import { CredentialError, type CredentialStore } from "./types";

const ENCRYPT_SCRIPT = `
$ErrorActionPreference = 'Stop'
$plain = [Console]::In.ReadToEnd().Trim()
$secure = ConvertTo-SecureString -String $plain -AsPlainText -Force
ConvertFrom-SecureString -SecureString $secure | Write-Output
`;

const DECRYPT_SCRIPT = `
$ErrorActionPreference = 'Stop'
$blob = [Console]::In.ReadToEnd().Trim()
if ([string]::IsNullOrEmpty($blob)) { exit 1 }
$secure = ConvertTo-SecureString -String $blob
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
  [Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr) | Write-Output
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
}
`;

export class DPAPIStore implements CredentialStore {
	readonly backend = "dpapi";
	readonly secure = true;
	readonly description = "Windows DPAPI (per-user)";

	private readonly index = new NameIndex(indexFilePath("dpapi"));

	async set(name: string, value: string): Promise<void> {
		if (!isValidName(name))
			throw new CredentialError(`Invalid credential name: ${name}`);

		const result = await spawnCmd(
			[
				"powershell",
				"-NoProfile",
				"-NonInteractive",
				"-Command",
				ENCRYPT_SCRIPT,
			],
			value,
		);
		if (result.code !== 0) {
			throw new CredentialError(
				`DPAPI encryption failed (exit ${result.code}). ${result.stderr.trim()}`,
			);
		}

		const blob = result.stdout.trim();
		const dir = dpapiBackendDir();
		await fs.mkdir(dir, { recursive: true });
		await fs.writeFile(path.join(dir, `${name}.dpapi`), blob, { mode: 0o600 });
		await this.index.add(name);
	}

	async get(name: string): Promise<string | undefined> {
		if (!isValidName(name)) return undefined;
		const blobPath = path.join(dpapiBackendDir(), `${name}.dpapi`);
		let blob: string;
		try {
			blob = await fs.readFile(blobPath, "utf8");
		} catch {
			return undefined;
		}

		const result = await spawnCmd(
			[
				"powershell",
				"-NoProfile",
				"-NonInteractive",
				"-Command",
				DECRYPT_SCRIPT,
			],
			blob,
		);
		if (result.code !== 0) return undefined;
		return result.stdout.replace(/\r?\n$/, "").trim();
	}

	async delete(name: string): Promise<boolean> {
		if (!isValidName(name)) return false;
		const blobPath = path.join(dpapiBackendDir(), `${name}.dpapi`);
		let removed = false;
		try {
			await fs.unlink(blobPath);
			removed = true;
		} catch {
			// not found
		}
		await this.index.remove(name);
		return removed;
	}

	async list(): Promise<string[]> {
		return this.index.list();
	}
}
