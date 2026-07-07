export interface CredentialStore {
	readonly backend: string;
	readonly secure: boolean;
	readonly description: string;
	set(name: string, value: string): Promise<void>;
	get(name: string): Promise<string | undefined>;
	delete(name: string): Promise<boolean>;
	list(): Promise<string[]>;
}

export const SERVICE_NAME = "fledge-plugin-discord";

export class CredentialError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "CredentialError";
	}
}
