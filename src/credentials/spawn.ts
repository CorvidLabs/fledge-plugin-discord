export interface SpawnResult {
  code: number;
  stdout: string;
  stderr: string;
}

export async function spawnCmd(cmd: string[], stdin?: string): Promise<SpawnResult> {
  const proc = Bun.spawn({
    cmd,
    stdin: stdin !== undefined ? "pipe" : "ignore",
    stdout: "pipe",
    stderr: "pipe",
  });

  if (stdin !== undefined && proc.stdin) {
    const writer = proc.stdin as WritableStream<Uint8Array> | { write: (s: string) => void; end: () => void };
    if ("write" in writer && typeof writer.write === "function") {
      writer.write(stdin);
      writer.end();
    }
  }

  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);

  return { code, stdout, stderr };
}

export async function commandExists(name: string): Promise<boolean> {
  const which = process.platform === "win32" ? "where" : "command";
  const cmd = process.platform === "win32" ? [which, name] : ["sh", "-c", `${which} -v ${name}`];
  try {
    const { code } = await spawnCmd(cmd);
    return code === 0;
  } catch {
    return false;
  }
}
