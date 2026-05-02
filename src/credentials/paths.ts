import os from "node:os";
import path from "node:path";

export function configDir(): string {
  if (process.platform === "win32") {
    const appData = process.env.APPDATA ?? path.join(os.homedir(), "AppData", "Roaming");
    return path.join(appData, "fledge-plugin-discord");
  }
  const xdg = process.env.XDG_CONFIG_HOME;
  const base = xdg && xdg.length > 0 ? xdg : path.join(os.homedir(), ".config");
  return path.join(base, "fledge-plugin-discord");
}

export function indexFilePath(backend: string): string {
  return path.join(configDir(), `credentials.${backend}.index`);
}

export function fileBackendDir(): string {
  return path.join(configDir(), "credentials");
}

export function dpapiBackendDir(): string {
  return path.join(configDir(), "credentials.win");
}

export function isValidName(name: string): boolean {
  if (name.length === 0 || name.length > 64) return false;
  return /^[a-zA-Z0-9._-]+$/.test(name);
}
