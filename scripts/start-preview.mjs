import { spawn, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  openSync,
  closeSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.MATH_ATLAS_PREVIEW_PORT || 3000);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw Error("Choose a preview port between 1024 and 65535.");
const url = `http://127.0.0.1:${port}/learn`;
const folder = path.join(root, ".preview");
const recordFile = path.join(folder, "server.json");
const next = path.join(root, "node_modules", "next", "dist", "bin", "next");
const noOpen = process.argv.includes("--no-open");
const pause = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function responds() {
  try {
    return (await fetch(url, { signal: AbortSignal.timeout(2000) })).ok;
  } catch {
    return false;
  }
}
function ownedServer() {
  try {
    const record = JSON.parse(readFileSync(recordFile, "utf8"));
    if (
      record.root !== root ||
      record.port !== port ||
      !Number.isInteger(record.pid)
    )
      return false;
    process.kill(record.pid, 0);
    return true;
  } catch {
    return false;
  }
}
async function available() {
  return new Promise((resolve) => {
    const socket = createServer();
    socket.once("error", () => resolve(false));
    socket.listen(port, "127.0.0.1", () => socket.close(() => resolve(true)));
  });
}
function openBrowser() {
  if (noOpen) return;
  const options = { detached: true, stdio: "ignore", windowsHide: true };
  const browser =
    process.platform === "win32"
      ? spawn("cmd.exe", ["/c", "start", "", url], options)
      : spawn(
          process.platform === "darwin" ? "open" : "xdg-open",
          [url],
          options,
        );
  browser.on("error", () =>
    console.log(`Open this address in your browser: ${url}`),
  );
  browser.unref();
}
async function main() {
  if (!existsSync(next))
    throw Error(
      "Project dependencies are missing. Run pnpm install in this folder first.",
    );
  if (ownedServer() && (await responds())) {
    console.log(`Math Atlas is ready: ${url}`);
    openBrowser();
    return;
  }
  if (!(await available()))
    throw Error(
      `Port ${port} is already in use. Set MATH_ATLAS_PREVIEW_PORT to a different port and try again.`,
    );
  if (!existsSync(path.join(root, ".next", "BUILD_ID"))) {
    console.log("Preparing Math Atlas for its first preview…");
    const build = spawnSync(process.execPath, [next, "build", "--webpack"], {
      cwd: root,
      stdio: "inherit",
      windowsHide: true,
    });
    if (build.error) throw build.error;
    if (build.status !== 0)
      throw Error("The preview could not build. See the message above.");
  }
  mkdirSync(folder, { recursive: true });
  const output = openSync(path.join(folder, "server.log"), "a");
  let server;
  try {
    server = spawn(
      process.execPath,
      [next, "start", "--hostname", "127.0.0.1", "--port", String(port)],
      {
        cwd: root,
        detached: true,
        windowsHide: true,
        stdio: ["ignore", output, output],
      },
    );
    await new Promise((resolve, reject) => {
      server.once("spawn", resolve);
      server.once("error", reject);
    });
    writeFileSync(recordFile, JSON.stringify({ root, port, pid: server.pid }));
    server.unref();
  } finally {
    closeSync(output);
  }
  for (let attempt = 0; attempt < 15; attempt++) {
    if (await responds()) {
      console.log(`Math Atlas is ready: ${url}`);
      openBrowser();
      return;
    }
    await pause(400);
  }
  throw Error(
    `The preview has not responded yet. Check ${path.join(folder, "server.log")} and try the launcher again.`,
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
