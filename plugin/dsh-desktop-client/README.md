# @lqing2018/dsh-desktop-client

DeepSeek Harness 插件：让 agent 能够**定位、启动、安装、升级** DeepSeek Harness 原生桌面客户端（WebView2 外壳）。

A DeepSeek Harness plugin that lets the agent **locate, launch, install and update** the native DeepSeek Harness desktop client (WebView2 shell).

## 功能 / Features

`desktop_client` 工具，五个动作 / five actions:

| action | 说明 | Description |
|---|---|---|
| `status` | 检测客户端是否安装、服务端口是否在线 | check install + server port |
| `launch` | 启动已安装的客户端窗口（仅 Windows） | start the installed client window (Windows only) |
| `install` | **从 GitHub Release 下载安装器并静默安装**；`force=true` 重装/升级 | download the latest release installer and install silently; `force=true` to reinstall/update |
| `update` | 升级到最新 Release（= install + force） | update to the latest release (= install with force) |
| `version` | 对比本地版本与 GitHub 最新 Release | compare local version with the latest GitHub release |

## 安装 / Install

```sh
dsh plugin --profile web add @lqing2018/dsh-desktop-client
```

装好后直接对 agent 说 / then just ask the agent:

- *"桌面客户端装了吗？"* -> `action=status`
- *"帮我打开桌面客户端"* -> `action=launch`
- *"帮我安装桌面客户端"* -> `action=install`（自动下载最新 Release 静默安装）
- *"客户端有新版本吗？"* -> `action=version`
- *"升级桌面客户端"* -> `action=update`

网络不佳时 install 会优雅失败并给出手动下载链接 / on blocked networks `install` fails gracefully with the manual download URL.

## 本地开发加载 / Dev load

```yaml
# cordis.patch.yml / --patch overlay
- insert:
    - id: desktop-client
      name: '/absolute/path/to/dsh-desktop-client/lib/index.js'
```

## 配置 / Config

```yaml
# 可选：额外搜索路径、自定义端口（默认 3080）
# optional: extra search paths and port (default 3080)
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
