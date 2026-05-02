import { promises as fs } from "node:fs";
import path from "node:path";

export class NameIndex {
  constructor(private readonly filePath: string) {}

  async ensureDir(): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true, mode: 0o700 });
  }

  async list(): Promise<string[]> {
    try {
      const text = await fs.readFile(this.filePath, "utf8");
      return text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    } catch (error) {
      if (isNotFound(error)) return [];
      throw error;
    }
  }

  async add(name: string): Promise<void> {
    const current = new Set(await this.list());
    if (current.has(name)) return;
    current.add(name);
    await this.write([...current].sort());
  }

  async remove(name: string): Promise<boolean> {
    const current = new Set(await this.list());
    if (!current.delete(name)) return false;
    await this.write([...current].sort());
    return true;
  }

  private async write(names: string[]): Promise<void> {
    await this.ensureDir();
    const body = names.length === 0 ? "" : `${names.join("\n")}\n`;
    await fs.writeFile(this.filePath, body, { mode: 0o600 });
    if (process.platform !== "win32") {
      try {
        await fs.chmod(this.filePath, 0o600);
      } catch {
        // best-effort
      }
    }
  }
}

function isNotFound(error: unknown): boolean {
  return Boolean(error) && typeof error === "object" && "code" in (error as object) && (error as { code: string }).code === "ENOENT";
}
