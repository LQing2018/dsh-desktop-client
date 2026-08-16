// dsh-desktop-client - DeepSeek Harness plugin
// Gives the agent a `desktop_client` tool to locate, launch, install and
// update the native WebView2 desktop client on the same machine as the dsh
// server.
//
// Pure ESM, zero build step. Registered through ctx.tools.register with the
// standard defineTool contract from @deepseek-ai/dsh-tools.
import { defineTool } from "@deepseek-ai/dsh-tools";
import {
  createWriteStream,
  existsSync,
  readFileSync,
  statSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawn } from "node:child_process";
import net from "node:net";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

export const name = "desktop-client";
export const inject = ["tools"];

const REPO = "LQing2018/dsh-desktop-client";
const RELEASES_URL = `https://api.github.com/repos/${REPO}/releases/latest`;
const RELEASES_PAGE = `https://github.com/${REPO}/releases`;
const SETUP_ASSET_NAME = "DeepSeek-Harness-Setup.exe";
const API_TIMEOUT_MS = 15_000;
const DOWNLOAD_TIMEOUT_MS = 10 * 60_000;

const INSTALL_ROOT = process.env.LOCALAPPDATA
  ? join(process.env.LOCALAPPDATA, "DeepSeek-Harness-Portable")
  : null;
const INSTALL_EXE = INSTALL_ROOT ? join(INSTALL_ROOT, "DeepSeek Harness.exe") : null;

const DEFAULT_CLIENT_PATHS = [
  INSTALL_EXE,
  // portable build produced by this repo's build script
  "D:\\anzhuang\\deepseek-harness\\dist\\DeepSeek-Harness-Portable\\DeepSeek Harness.exe",
  "D:\\anzhuang\\deepseek-harness\\DeepSeek Harness.exe",
  // any client sitting next to the running server
  new URL("../../../DeepSeek Harness.exe", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")
].filter(Boolean);

const DEFAULT_PORT = 3080;

function portOpen(port, timeoutMs = 800) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;
    const finish = (ok) => {
      if (done) return;
      done = true;
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
    socket.connect(port, "127.0.0.1");
  });
}

function findClient(paths) {
  for (const p of paths) {
    try {
      if (p && existsSync(p)) return p;
    } catch {
      /* ignore */
    }
  }
  return null;
}

// Local version marker: written by the `install` action (.client-version) or
// by future builds (version.txt). Absent for manually-copied installs.
function readLocalVersion(exePath) {
  if (!exePath) return null;
  const dir = dirname(exePath);
  for (const name of [".client-version", "version.txt"]) {
    try {
      const p = join(dir, name);
      if (existsSync(p)) {
        const v = readFileSync(p, "utf8").trim();
        if (v) return v;
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

function launchClient(exePath) {
  if (process.platform !== "win32") {
    return { ok: false, error: "launch is only supported on Windows" };
  }
  try {
    const child = spawn(exePath, [], {
      detached: true,
      stdio: "ignore",
      windowsHide: false
    });
    child.unref();
    return { ok: true, pid: child.pid ?? null };
  } catch (e) {
    return { ok: false, error: String(e && e.message ? e.message : e) };
  }
}

async function fetchLatestRelease() {
  const res = await fetch(RELEASES_URL, {
    headers: {
      "User-Agent": "dsh-desktop-client-plugin",
      Accept: "application/vnd.github+json"
    },
    signal: AbortSignal.timeout(API_TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`GitHub API HTTP ${res.status}`);
  const rel = await res.json();
  return {
    tag: rel.tag_name || null,
    url: rel.html_url || RELEASES_PAGE,
    publishedAt: rel.published_at || null,
    assets: (rel.assets || []).map((a) => ({
      name: a.name,
      size: a.size,
      url: a.browser_download_url
    }))
  };
}

async function downloadFile(url, dest) {
  const res = await fetch(url, {
    headers: { "User-Agent": "dsh-desktop-client-plugin" },
    signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
    redirect: "follow"
  });
  if (!res.ok || !res.body) throw new Error(`download HTTP ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  return statSync(dest).size;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForFile(path, timeoutMs, stepMs = 3000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (existsSync(path)) return true;
    await sleep(stepMs);
  }
  return existsSync(path);
}

async function status(extraPaths, port) {
  const candidates = [...(extraPaths || []), ...DEFAULT_CLIENT_PATHS];
  const found = findClient(candidates);
  const serverUp = await portOpen(port);
  return {
    installed: Boolean(found),
    clientPath: found,
    localVersion: readLocalVersion(found),
    serverPort: port,
    serverRunning: serverUp,
    platform: process.platform
  };
}

async function versionInfo(extraPaths) {
  const found = findClient([...(extraPaths || []), ...DEFAULT_CLIENT_PATHS]);
  const localVersion = readLocalVersion(found);
  let latest = null;
  let latestError = null;
  try {
    latest = await fetchLatestRelease();
  } catch (e) {
    latestError = String(e && e.message ? e.message : e);
  }
  const result = {
    installed: Boolean(found),
    clientPath: found,
    localVersion,
    platform: process.platform
  };
  if (latest) {
    result.latestVersion = latest.tag;
    result.releaseUrl = latest.url;
    result.publishedAt = latest.publishedAt;
    if (localVersion && latest.tag) {
      result.upToDate = localVersion === latest.tag;
    }
  }
  if (latestError) {
    result.latestError = latestError;
    result.releaseUrl = RELEASES_PAGE;
  }
  return result;
}

async function installClient(extraPaths, port, force) {
  if (process.platform !== "win32") {
    return { ok: false, error: "install is only supported on Windows (the client is Windows-only)" };
  }
  if (!INSTALL_ROOT || !INSTALL_EXE) {
    return { ok: false, error: "LOCALAPPDATA is not set; cannot determine install directory" };
  }

  const found = findClient([...(extraPaths || []), ...DEFAULT_CLIENT_PATHS]);
  if (found && !force) {
    return {
      ok: true,
      alreadyInstalled: true,
      clientPath: found,
      localVersion: readLocalVersion(found),
      note: "client already installed; pass force=true to reinstall/update to the latest release"
    };
  }

  // Resolve the latest release and its single-file installer asset.
  let rel;
  try {
    rel = await fetchLatestRelease();
  } catch (e) {
    return {
      ok: false,
      error: `failed to query latest release: ${String(e && e.message ? e.message : e)}`,
      releaseUrl: RELEASES_PAGE,
      note: `network to GitHub may be blocked - download ${SETUP_ASSET_NAME} manually from the Releases page and double-click it (silent install)`
    };
  }
  const asset = rel.assets.find((a) => a.name === SETUP_ASSET_NAME);
  if (!asset) {
    return {
      ok: false,
      error: `asset ${SETUP_ASSET_NAME} not found on release ${rel.tag || "?"}`,
      releaseUrl: rel.url
    };
  }

  // Download the installer to the temp directory.
  const dest = join(tmpdir(), SETUP_ASSET_NAME);
  let bytes;
  try {
    bytes = await downloadFile(asset.url, dest);
  } catch (e) {
    return {
      ok: false,
      error: `failed to download installer: ${String(e && e.message ? e.message : e)}`,
      releaseUrl: rel.url,
      note: "network to GitHub downloads may be blocked - download the Setup exe manually from the Releases page and double-click it"
    };
  }

  // Run the installer: silent extract to INSTALL_ROOT + auto-launch (SFX config).
  try {
    const child = spawn(dest, [], { detached: true, stdio: "ignore", windowsHide: true });
    child.unref();
  } catch (e) {
    return {
      ok: false,
      error: `failed to run installer: ${String(e && e.message ? e.message : e)}`,
      installerPath: dest,
      downloadedBytes: bytes
    };
  }

  // Wait for the extraction to produce the client exe (91MB, usually <90s).
  const appeared = await waitForFile(INSTALL_EXE, 120_000);
  if (appeared) {
    try {
      writeFileSync(join(INSTALL_ROOT, ".client-version"), rel.tag || "unknown");
    } catch {
      /* marker is best-effort */
    }
    return {
      ok: true,
      installed: true,
      clientPath: INSTALL_EXE,
      version: rel.tag,
      downloadedBytes: bytes,
      serverPort: port
    };
  }
  return {
    ok: true,
    started: true,
    installerPath: dest,
    downloadedBytes: bytes,
    note: "installer is still extracting in the background; check again with action=status in a minute"
  };
}

export function apply(ctx, config) {
  const extraPaths = config && Array.isArray(config.clientPaths) ? config.clientPaths : [];
  const port = config && Number.isFinite(config.port) ? config.port : DEFAULT_PORT;

  ctx.tools.register(defineTool({
    name: "desktop_client",
    description:
      "Manage the DeepSeek Harness native desktop client (the WebView2 wrapper around the web UI). " +
      "`action=status` checks install + server port; `action=launch` opens the client window; " +
      "`action=install` downloads the latest release installer and installs silently " +
      "(pass force=true to reinstall/update); `action=update` is an alias for install with force; " +
      "`action=version` compares the local version with the latest GitHub release. Answers should quote the returned JSON.",
    parameters: {
      action: {
        type: "string",
        required: true,
        description:
          "`status` to inspect, `launch` to start the client window, `install` to download+install " +
          "(force=true to reinstall/update), `update` to install/update to latest, `version` to compare versions.",
        enum: ["status", "launch", "install", "update", "version"]
      },
      force: {
        type: "boolean",
        description: "with action=install: reinstall/update even if the client is already installed"
      }
    },
    output: {
      schema: {
        type: "object",
        properties: {
          installed: { type: "boolean" },
          clientPath: { type: "string" },
          localVersion: { type: "string" },
          serverPort: { type: "integer" },
          serverRunning: { type: "boolean" },
          platform: { type: "string" },
          ok: { type: "boolean" },
          pid: { type: "integer" },
          error: { type: "string" },
          note: { type: "string" },
          alreadyInstalled: { type: "boolean" },
          started: { type: "boolean" },
          version: { type: "string" },
          latestVersion: { type: "string" },
          upToDate: { type: "boolean" },
          releaseUrl: { type: "string" },
          downloadedBytes: { type: "integer" },
          installerPath: { type: "string" },
          latestError: { type: "string" },
          publishedAt: { type: "string" }
        },
        additionalProperties: false
      },
      render: (_args, value) => [
        { type: "text", text: `Desktop client: ${JSON.stringify(value)}` }
      ]
    },
    presentCall: (args) => ({
      card: "generic",
      title: `Desktop client: ${args.action || "?"}`,
      kind: "other",
      rawInput: args
    }),
    async execute(args) {
      try {
        if (args.action === "status") {
          return await status(extraPaths, port);
        }
        if (args.action === "launch") {
          const exe = findClient([...(extraPaths || []), ...DEFAULT_CLIENT_PATHS]);
          if (!exe) {
            return { ok: false, error: "client not found on this machine", ...(await status(extraPaths, port)) };
          }
          const launched = launchClient(exe);
          return { ...launched, installed: true, clientPath: exe, serverPort: port, platform: process.platform };
        }
        if (args.action === "install") {
          return await installClient(extraPaths, port, Boolean(args.force));
        }
        if (args.action === "update") {
          return await installClient(extraPaths, port, true);
        }
        if (args.action === "version") {
          return await versionInfo(extraPaths);
        }
        return { ok: false, error: `unknown action: ${args.action}` };
      } catch (e) {
        return { ok: false, error: String(e && e.message ? e.message : e) };
      }
    }
  }));

  console.log(`[desktop-client] plugin loaded (port=${port}, extraPaths=${extraPaths.length})`);
}
