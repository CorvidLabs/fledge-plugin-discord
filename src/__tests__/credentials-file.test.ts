import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { FileStore } from "../credentials/file";

describe("FileStore", () => {
  let tempRoot: string;
  let store: FileStore;

  beforeEach(async () => {
    tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "fledge-discord-creds-"));
    store = new FileStore({
      dir: path.join(tempRoot, "creds"),
      indexPath: path.join(tempRoot, "index"),
    });
  });

  afterEach(async () => {
    await fs.rm(tempRoot, { recursive: true, force: true });
  });

  test("backend metadata", () => {
    expect(store.backend).toBe("file");
    expect(store.secure).toBe(false);
    expect(store.description).toContain("chmod 0600");
  });

  test("set/get round-trips a value", async () => {
    await store.set("default", "https://discord.com/api/webhooks/1/abc");
    expect(await store.get("default")).toBe("https://discord.com/api/webhooks/1/abc");
  });

  test("get returns undefined for missing name", async () => {
    expect(await store.get("ghost")).toBeUndefined();
  });

  test("set adds name to index", async () => {
    await store.set("alpha", "https://discord.com/api/webhooks/1/x");
    await store.set("beta", "https://discord.com/api/webhooks/2/y");
    const names = await store.list();
    expect(names.sort()).toEqual(["alpha", "beta"]);
  });

  test("set overwrites existing value without duplicating index", async () => {
    await store.set("default", "https://discord.com/api/webhooks/1/x");
    await store.set("default", "https://discord.com/api/webhooks/1/y");
    expect(await store.get("default")).toBe("https://discord.com/api/webhooks/1/y");
    expect(await store.list()).toEqual(["default"]);
  });

  test("delete removes value and index entry", async () => {
    await store.set("temp", "https://discord.com/api/webhooks/1/z");
    expect(await store.delete("temp")).toBe(true);
    expect(await store.get("temp")).toBeUndefined();
    expect(await store.list()).toEqual([]);
  });

  test("delete returns false when nothing existed", async () => {
    expect(await store.delete("never")).toBe(false);
  });

  test("rejects invalid names", async () => {
    await expect(store.set("../escape", "x")).rejects.toThrow("Invalid credential name");
    await expect(store.set("with space", "x")).rejects.toThrow("Invalid credential name");
    await expect(store.set("", "x")).rejects.toThrow("Invalid credential name");
  });

  test("stored file has 0600 mode on POSIX", async () => {
    if (process.platform === "win32") return;
    await store.set("perm", "https://discord.com/api/webhooks/1/x");
    const stat = await fs.stat(path.join(tempRoot, "creds", "perm.url"));
    expect(stat.mode & 0o777).toBe(0o600);
  });
});
