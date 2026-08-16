# dsh-desktop-client

DeepSeek Harness 插件：让 agent 能够**定位并启动** DeepSeek Harness 原生桌面客户端（WebView2 外壳）。

A DeepSeek Harness plugin that lets the agent **locate and launch** the native DeepSeek Harness desktop client (WebView2 shell).

## 功能 / Features

- `desktop_client` 工具，两种动作：
  - `action=status` — 检测客户端是否安装、服务端口是否在线
  - `action=launch` — 启动已安装的客户端窗口（仅 Windows）
- 可配置搜索路径与端口（见下方配置）

## 安装 / Install

```sh
dsh plugin --profile web add dsh-desktop-client
```

或本地开发加载（cordis overlay patch）：

```yaml
# cordis.patch.yml / --patch overlay
- insert:
    - id: desktop-client
      name: '/absolute/path/to/dsh-desktop-client/lib/index.js'
```

## 配置 / Config

```yaml
# 可选：额外搜索路径、自定义端口（默认 3080）
- id: desktop-client
  config:
    clientPaths:
      - 'C:\Tools\DeepSeek Harness.exe'
    port: 3080
```

## 开发 / Dev

纯 ESM，零构建。`lib/index.js` 直接可用。发布到 npm：

```sh
npm publish
```

## 许可证 / License

MIT
