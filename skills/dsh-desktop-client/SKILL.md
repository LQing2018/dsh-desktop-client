---
name: dsh-desktop-client
description: Operate the DeepSeek Harness for Windows desktop client - check if it is installed, launch it, download and install it from the latest GitHub release, and check for updates. Use when the user mentions the desktop client, the Windows client, 桌面客户端, or wants to install/update/launch it.
---

# dsh-desktop-client (filesystem skill)

Guide the agent to manage the **DeepSeek Harness for Windows** desktop client
(self-contained WebView2 app, repo: `LQing2018/dsh-desktop-client`).

Default install location:

```
%LOCALAPPDATA%\DeepSeek-Harness-Portable\DeepSeek Harness.exe
```

Latest release: <https://github.com/LQing2018/dsh-desktop-client/releases/latest>
(download `DeepSeek-Harness-Setup.exe`, silent single-file installer).

## Tasks

### Check whether the client is installed

```powershell
Test-Path "$env:LOCALAPPDATA\DeepSeek-Harness-Portable\DeepSeek Harness.exe"
```

### Launch the client

```powershell
Start-Process "$env:LOCALAPPDATA\DeepSeek-Harness-Portable\DeepSeek Harness.exe"
```

First launch initializes the local server (30-60 s) - tell the user to wait.
Closing the window keeps the server running; `stop-server.cmd` in the install
folder stops it fully.

### Install / update the client

1. Download `DeepSeek-Harness-Setup.exe` from the latest release page above
   (use the browser if the download fails on the command line).
2. Run it - it silently extracts to `%LOCALAPPDATA%\DeepSeek-Harness-Portable`
   and launches the client automatically.
3. Verify with the `Test-Path` check above.

### Check the latest version

Fetch `https://api.github.com/repos/LQing2018/dsh-desktop-client/releases/latest`
and report `tag_name` and `published_at`.

## Notes

- Windows only - the client does not run on macOS/Linux.
- Preferred alternative: install the npm plugin
  `@lqing2018/dsh-desktop-client` (`dsh plugin --profile web add @lqing2018/dsh-desktop-client`)
  which provides the same abilities as a native `desktop_client` tool.
- API key setup: client window -> Settings (gear) -> Models.
