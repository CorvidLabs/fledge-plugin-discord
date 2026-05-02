import { promises as fs } from "node:fs";
import path from "node:path";
import { NameIndex } from "./index-file";
import { fileBackendDir, indexFilePath, isValidName } from "./paths";
import { CredentialError, type CredentialStore } from "./types";

export class FileStore implements CredentialStore {
  readonly backend = "file";
  readonly secure = false;
  readonly description: string;

  private readonly dir: string;
  private readonly index: NameIndex;

  constructor(options: { dir?: string; indexPath?: string } = {}) {
    this.dir = options.dir ?? fileBackendDir();
    this.index = new NameIndex(options.indexPath ?? indexFilePath("file"));
    this.description = `Plaintext file store at ${this.dir} (chmod 0600)`;
  }

  async set(name: string, value: string): Promise<void> {
    if (!isValidName(name)) throw new CredentialError(`Invalid credential name: ${name}`);
    await fs.mkdir(this.dir, { recursive: true, mode: 0o700 });
    if (process.platform !== "win32") {
      try {
        await fs.chmod(this.dir, 0o700);
      } catch {
        // best-effort
      }
    }

    const filePath = this.pathFor(name);
    await fs.writeFile(filePath, value, { mode: 0o600 });
    if (process.platform !== "win32") {
      try {
        await fs.chmod(filePath, 0o600);
      } catch {
        // best-effort
      }
    }
    await this.index.add(name);
  }

  async get(name: string): Promise<string | undefined> {
    if (!isValidName(name)) return undefined;
    try {
      const text = await fs.readFile(this.pathFor(name), "utf8");
      return text.replace(/\r?\n$/, "").trim();
    } catch {
      return undefined;
    }
  }

  async delete(name: string): Promise<boolean> {
    if (!isValidName(name)) return false;
    let removed = false;
    try {
      await fs.unlink(this.pathFor(name));
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

  private pathFor(name: string): string {
    return path.join(this.dir, `${name}.url`);
  }
}
