import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import os from "node:os";
import path from "node:path";
import {
	configDir,
	dpapiBackendDir,
	fileBackendDir,
	indexFilePath,
} from "../credentials/paths";

describe("configDir", () => {
	const originalXdg = process.env.XDG_CONFIG_HOME;
	const originalPlatform = process.platform;

	afterEach(() => {
		if (originalXdg === undefined) {
			delete process.env.XDG_CONFIG_HOME;
		} else {
			process.env.XDG_CONFIG_HOME = originalXdg;
		}
	});

	test("uses XDG_CONFIG_HOME when set", () => {
		process.env.XDG_CONFIG_HOME = "/tmp/xdg-test";
		const dir = configDir();
		expect(dir).toBe("/tmp/xdg-test/fledge-plugin-discord");
	});

	test("falls back to ~/.config on POSIX without XDG", () => {
		delete process.env.XDG_CONFIG_HOME;
		if (process.platform !== "win32") {
			const dir = configDir();
			expect(dir).toBe(
				path.join(os.homedir(), ".config", "fledge-plugin-discord"),
			);
		}
	});

	test("includes plugin name in path", () => {
		const dir = configDir();
		expect(dir).toEndWith("fledge-plugin-discord");
	});
});

describe("indexFilePath", () => {
	test("includes backend name", () => {
		const p = indexFilePath("file");
		expect(p).toContain("credentials.file.index");
	});

	test("lives under configDir", () => {
		const p = indexFilePath("keychain");
		expect(p.startsWith(configDir())).toBe(true);
	});
});

describe("fileBackendDir", () => {
	test("is a subdirectory of configDir", () => {
		const dir = fileBackendDir();
		expect(dir.startsWith(configDir())).toBe(true);
		expect(dir).toEndWith("credentials");
	});
});

describe("dpapiBackendDir", () => {
	test("is a subdirectory of configDir for windows", () => {
		const dir = dpapiBackendDir();
		expect(dir.startsWith(configDir())).toBe(true);
		expect(dir).toEndWith("credentials.win");
	});
});
