# 🐳 DeepSeek Harness for Windows

> **The Windows desktop client for DeepSeek Harness** — no Node.js / npm / server setup required. Double-click and go.

<p align="center">
  <img src="assets/dsh-hero.jpg" alt="DeepSeek Harness for Windows desktop client" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/@lqing2018/dsh-desktop-client?label=npm&color=4FC3F7" alt="npm version">
  <img src="https://img.shields.io/badge/license-MIT-2EA44F" alt="MIT License">
  <img src="https://img.shields.io/badge/platform-Windows%2010%2F11%20x64-4493F8" alt="Windows 10/11 x64">
  <img src="https://img.shields.io/badge/topic-dsh--plugin-8A2BE2" alt="dsh-plugin">
  <img src="https://img.shields.io/badge/DSH-Desktop%20Edition-47848F" alt="DSH Desktop Edition">
</p>

<sub>English · [中文](README.zh.md)</sub>

> ### ⚠️ Platform note: Windows only
> This client **supports Windows 10/11 (x64) only** - **it does not run on macOS / Linux**.
>
> 💡 **For Mac users**: the official DSH itself is cross-platform - run `npx dsh web` in a terminal and open `http://127.0.0.1:3080` in a browser for the same experience; for a native Mac window, see [anywhere-labs/deepseek-harness-desktop](https://github.com/anywhere-labs/deepseek-harness-desktop) (macOS + Windows desktop edition).

## What is this?

The official DeepSeek Harness ships as a **browser Web UI** and a **CLI**. This project is its **Windows desktop edition**: the same DSH, wrapped in a native Windows window with the whole runtime (Node + DSH server + UI) bundled together, ready out of the box.

Puts the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) local Web UI into a **native Windows window**, bundled with the whole runtime (Node + DSH server + UI) in one package:

- **For end users**: download → double-click → add your API key → start chatting. No terminal required.
- **For the agent**: the companion `@lqing2018/dsh-desktop-client` plugin lets the harness agent locate and launch the desktop client for you.

## Features

| Feature | Description |
|---|---|
| ⚡ Zero setup | Node runtime, server and UI ship together — no Node.js / npm / services to install |
| 📦 Two flavors | Single-file installer (recommended) or portable ZIP (USB-friendly) |
| 🔧 Self-managed server | Client starts a hidden background server automatically; port conflicts handled |
| 🐳 Native window | WebView2 engine + whale icon, no browser chrome |
| 🤖 Companion plugin | Agent can check / launch the client via the `desktop_client` tool |

## Quick start (2 minutes)

### Option A: Single-file installer (recommended)

1. Open [Releases](https://github.com/LQing2018/dsh-desktop-client/releases) and download **`DeepSeek-Harness-Setup.exe`**
2. **Double-click** it — it extracts to `%LOCALAPPDATA%\DeepSeek-Harness-Portable` and launches the client
3. First launch initializes the local server (**30–60 s**, that's normal) — please wait
4. Click **Settings (gear) → Models** in the top-right and add your model API key (e.g. DeepSeek API)
5. 🎉 Start chatting. Every later launch is instant.

### Option B: Portable ZIP (USB / no install)

1. Download **`DeepSeek-Harness-Portable.zip`**
2. Unzip anywhere (USB drive works)
3. Run **`DeepSeek Harness.exe`** inside the folder — same steps as above

> **Requirements**: Windows 10 / 11 (x64) with the WebView2 Runtime (bundled with Edge / Win11; [install here](https://developer.microsoft.com/microsoft-edge/webview2/) if missing)

## First-run walkthrough

1. **Download** — see Quick start above
2. **Launch** — a whale-icon window appears; the first start initializes the local server (the window shows up by itself after a short wait)
3. **Add your API key** — Settings (gear icon) → Models, add a model and paste your key (DeepSeek, OpenAI-compatible, etc.)
4. **Chat** — type in the input box. Long-running tasks keep running in the background; multiple sessions are supported

> Detailed step-by-step guide: [User Guide](docs/user-guide.en.md)

## Daily usage

| Action | How |
|---|---|
| Open the client | Desktop shortcut, or `DeepSeek Harness.exe` in the install folder |
| Close the window | Click ✕ — **the server keeps running** (background tasks aren't interrupted) |
| Stop the server | Double-click **`stop-server.cmd`** in the install folder (only kills the server the client spawned) |
| Change port | Create `client.json` in the install folder: `{"port": 1234}` |
| Where is my data | Sessions live in `dsh-home\sessions`; API keys in `dsh-home` (don't share the folder) |
| Move / backup | Copy the whole folder; after moving, **delete `dsh-home` once** and it rebuilds automatically |

## Companion plugin

Let the DeepSeek Harness agent operate the desktop client:

```sh
dsh plugin --profile web add @lqing2018/dsh-desktop-client
```

Then just ask:

- *"Is the desktop client installed?"* → agent runs `desktop_client` to check install status & server port
- *"Open the desktop client"* → agent launches the client window

## FAQ

| Problem | Solution |
|---|---|
| Nothing happens / white screen | Make sure WebView2 Runtime is installed; retry after disabling antivirus interception |
| First launch is slow | Normal — first boot initializes the local server (30–60 s); later launches are instant |
| Port already in use | Change it via `client.json` (see Daily usage) |
| Fails after moving the folder | Delete the `dsh-home` folder once; it rebuilds on next launch |
| Forgot API key / switch account | Re-enter it in Settings → Models |
| How to fully uninstall | See below |

## Uninstall

- **Installer edition**: delete the whole `%LOCALAPPDATA%\DeepSeek-Harness-Portable` folder
- **Portable edition**: delete the whole unzipped folder
- **Plugin**: `dsh plugin --profile web remove @lqing2018/dsh-desktop-client`

## Docs

| Doc | Content |
|---|---|
| [User Guide](docs/user-guide.en.md) | Install, configure, daily use, troubleshooting |
| [用户指南](docs/user-guide.md) | 中文详细图文指南 |
| [PUBLISH.md](PUBLISH.md) | Maintainers: release flow (npm / GitHub / plugin marketplace) |

## Development

```powershell
# Build the portable client folder from a local DeepSeek Harness install
.\scripts\build-portable.ps1 -Source D:\path\to\deepseek-harness -OutDir .\dist
```

- `plugin/dsh-desktop-client/` — npm plugin source (pure ESM, zero build)
- `scripts/build-portable.ps1` — portable-folder build script
- The WebView2 client (C#) sources are tracked in the `dist/` artifacts and the client plan doc

## Relationship to the official project

Built on [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness), which provides the core agent capabilities, plugin system and Web UI. This project adds the **Windows desktop shell** (window, local server hosting, no-install packaging) and the companion client-management plugin.

## License

MIT
