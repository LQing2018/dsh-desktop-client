// dsh-desktop-client — DeepSeek Harness plugin
// Gives the agent a `desktop_client` tool to locate and launch the native
// WebView2 desktop client on the same machine as the dsh server.
//
// Pure ESM, zero build step. Registered through ctx.tools.register with the
// standard defineTool contract from @deepseek-ai/dsh-tools.
import { defineTool } from "@deepseek-ai/dsh-tools";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import net from "node:net";

export const name = "desktop-client";
export const inject = ["tools"];

const DEFAULT_CLIENT_PATHS = [
  // portable build produced by this repo's build script
  process.env.LOCALAPPDATA
    ? `${process.env.LOCALAPPDATA}\\DeepSeek-Harness-Portable\\DeepSeek Harness.exe`
    : null,
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

async function status(extraPaths, port) {
  const candidates = [...(extraPaths || []), ...DEFAULT_CLIENT_PATHS];
  const found = findClient(candidates);
  const serverUp = await portOpen(port);
  return {
    installed: Boolean(found),
    clientPath: found,
    serverPort: port,
    serverRunning: serverUp,
    platform: process.platform
  };
}

export function apply(ctx, config) {
  const extraPaths = config && Array.isArray(config.clientPaths) ? config.clientPaths : [];
  const port = config && Number.isFinite(config.port) ? config.port : DEFAULT_PORT;

  ctx.tools.register(defineTool({
    name: "desktop_client",
    description:
      "Locate and optionally launch the DeepSeek Harness native desktop client " +
      "(the WebView2 wrapper around the web UI). Use `action=status` to check whether the " +
      "client is installed and whether the local server port is up, or `action=launch` to " +
      "start the installed client window. Answers should quote the returned JSON.",
    parameters: {
      action: {
        type: "string",
        required: true,
        description: "`status` to only inspect, `launch` to start the client window.",
        enum: ["status", "launch"]
      }
    },
    output: {
      schema: {
        type: "object",
        properties: {
          installed: { type: "boolean" },
          clientPath: { type: "string" },
          serverPort: { type: "integer" },
          serverRunning: { type: "boolean" },
          platform: { type: "string" },
          ok: { type: "boolean" },
          pid: { type: "integer" },
          error: { type: "string" }
        },
        additionalProperties: false
      },
      render: (_args, value) => [
        { type: "text", text: `Desktop client: ${JSON.stringify(value)}` }
      ]
    },
    presentCall: (args) => ({
      card: "generic",
      title: "Desktop client",
      kind: "other",
      rawInput: args
    }),
    async execute(args) {
      if (args.action === "status") {
        return status(extraPaths, port);
      }
      if (args.action === "launch") {
        const exe = findClient([...(extraPaths || []), ...DEFAULT_CLIENT_PATHS]);
        if (!exe) {
          return { ok: false, error: "client not found on this machine", ...(await status(extraPaths, port)) };
        }
        const launched = launchClient(exe);
        return { ...launched, installed: true, clientPath: exe, serverPort: port, platform: process.platform };
      }
      return { ok: false, error: `unknown action: ${args.action}` };
    }
  }));

  console.log(`[desktop-client] plugin loaded (port=${port}, extraPaths=${extraPaths.length})`);
}
