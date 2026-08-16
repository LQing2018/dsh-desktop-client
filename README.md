# dsh-desktop-client

Self-contained Windows desktop client for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), plus the `dsh-desktop-client` Cordis plugin that lets the agent locate & launch it.

**No Node.js / npm / server setup required** — the runtime, server and UI ship in one portable folder. Double-click `DeepSeek Harness.exe` and go.

## What's in this repo

| Path | Description |
|---|---|
| `plugin/dsh-desktop-client/` | npm plugin: adds a `desktop_client` tool to the harness agent |
| `scripts/build-portable.ps1` | builds the portable client folder from a local harness install |
| `releases/` | portable client zip (created via GitHub Releases, not committed) |

## Quick start (end users)

1. Download from [Releases](../../releases):
   - **`DeepSeek-Harness-Setup.exe`** (single-file installer — extracts to `%LOCALAPPDATA%` and launches), or
   - **`DeepSeek-Harness-Portable.zip`** (green/portable — unzip anywhere, USB works)
2. Run `DeepSeek Harness.exe`
3. First launch initializes the local server (30–60 s); open Settings → Models to add your API key

Requirements: Windows 10/11 x64 with WebView2 Runtime (built into Edge / Win11).

## Install the plugin

```sh
dsh plugin --profile web add dsh-desktop-client
```

Then ask the agent: *"is the desktop client installed?"* or *"open the desktop client"*.

## Build from source

```powershell
# from a machine with a full DeepSeek Harness npm install
.\scripts\build-portable.ps1 -Source D:\path\to\deepseek-harness -OutDir .\dist
```

See [PUBLISH.md](PUBLISH.md) for the full release checklist (GitHub repo + topic, npm publish, Releases, marketplace submissions).

## License

MIT
