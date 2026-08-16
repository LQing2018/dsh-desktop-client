# 🐳 dsh-desktop-client

> DeepSeek Harness 自包含 Windows 桌面客户端 + 配套插件
> **无需安装 Node.js / npm / 任何服务**，双击即用。

<p align="center">
  <img src="https://img.shields.io/npm/v/@lqing2018/dsh-desktop-client?label=npm&color=4FC3F7" alt="npm version">
  <img src="https://img.shields.io/badge/license-MIT-2EA44F" alt="MIT License">
  <img src="https://img.shields.io/badge/platform-Windows%2010%2F11%20x64-4493F8" alt="Windows 10/11 x64">
  <img src="https://img.shields.io/badge/topic-dsh--plugin-8A2BE2" alt="dsh-plugin">
</p>

<sub>[English](README.md) · 中文</sub>

## 这是什么

把 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的本地 Web UI 装进一个**原生 Windows 窗口**，并把整个运行环境（Node 运行时 + DSH 服务端 + 界面）打包在一起：

- **普通用户**：下载 → 双击 → 填写 API Key → 开始使用，全程不需要碰命令行
- **插件**：配套的 `@lqing2018/dsh-desktop-client` 插件让 agent 能帮你定位、启动桌面客户端

## 功能特性

| 特性 | 说明 |
|---|---|
| ⚡ 免安装免依赖 | node 运行时、服务端、界面全打包，无需安装 Node.js / npm / 任何服务 |
| 📦 两种形态 | 单文件安装器（推荐）或绿色便携版（U 盘可带） |
| 🔧 服务自管理 | 客户端自动拉起隐藏的后台服务，端口冲突自动规避 |
| 🐳 原生窗口 | WebView2 内核 + 鲸鱼图标，无浏览器边框 |
| 🤖 配套插件 | agent 可通过 `desktop_client` 工具检测/启动客户端 |

## 快速开始（2 分钟）

### 方式 A：单文件安装器（普通用户推荐）

1. 打开 [Releases](https://github.com/LQing2018/dsh-desktop-client/releases)，下载 **`DeepSeek-Harness-Setup.exe`**
2. **双击**运行 → 自动解压到 `%LOCALAPPDATA%\DeepSeek-Harness-Portable` 并启动客户端
3. 首次启动需 **30~60 秒**初始化本地服务（属正常现象），请稍等
4. 在窗口右上角 **设置（齿轮）→ Models** 填入你的模型 API Key（如 DeepSeek API）
5. 🎉 开始对话。以后每次启动都是秒开

### 方式 B：绿色便携版（U 盘 / 免安装）

1. 下载 **`DeepSeek-Harness-Portable.zip`**
2. 解压到任意位置（U 盘、移动硬盘都可以）
3. 双击文件夹里的 **`DeepSeek Harness.exe`**，步骤同上

> **环境要求**：Windows 10 / 11（64 位），带 WebView2 Runtime（新版 Edge / Win11 自带；缺失时 [点此安装](https://developer.microsoft.com/microsoft-edge/webview2/)）

## 首次使用详细步骤

1. **下载**：见上方「快速开始」
2. **启动**：双击后出现鲸鱼图标窗口；首次启动会先初始化本地服务（右下角托盘无窗口时耐心等待，窗口自动出现）
3. **配置密钥**：点击窗口右上角 **设置（齿轮图标）→ Models**，添加模型并填入 API Key（DeepSeek、OpenAI 兼容等均可）
4. **开始使用**：在输入框直接对话；支持长任务后台运行、多会话管理

> 详细图文版见 [用户指南](docs/user-guide.md)

## 日常使用

| 操作 | 方法 |
|---|---|
| 打开客户端 | 双击桌面快捷方式 / 安装目录下的 `DeepSeek Harness.exe` |
| 关闭窗口 | 点窗口 ✕ —— **服务会继续在后台运行**（长任务不中断） |
| 完全停止服务 | 双击安装目录下的 **`stop-server.cmd`**（只结束客户端拉起的服务，不误伤其他程序） |
| 换端口 | 在安装目录新建 `client.json`，内容 `{"port": 1234}` |
| 数据在哪 | 会话记录在 `dsh-home\sessions`，API Key 在 `dsh-home` 内（请勿分享整个目录） |
| 移动/备份 | 整个文件夹可复制移动；移动后**删除一次 `dsh-home`** 即可自动重建 |

## 配套插件

让 DeepSeek Harness 的 agent 能直接操作桌面客户端：

```sh
# 安装插件（在已运行 dsh web 的机器上）
dsh plugin --profile web add @lqing2018/dsh-desktop-client
```

安装后，在对话里直接说：

- *"桌面客户端装了吗？"* → agent 调用 `desktop_client` 检测安装状态与服务端口
- *"帮我打开桌面客户端"* → agent 启动客户端窗口

## 常见问题

| 问题 | 解决方法 |
|---|---|
| 双击没反应 / 白屏 | 确认已装 WebView2 Runtime；关闭杀毒软件拦截后重试 |
| 首次启动很久 | 正常，首次要初始化本地服务（30~60 秒），之后秒开 |
| 端口被占用 | 按上文「换端口」改 `client.json` |
| 移动文件夹后启动失败 | 删除一次 `dsh-home` 文件夹，重新启动会自动重建 |
| 忘了 API Key / 想换账号 | 设置 → Models 重新填写即可 |
| 想彻底卸载 | 见下节 |

## 卸载

- **安装器版**：删除 `%LOCALAPPDATA%\DeepSeek-Harness-Portable` 整个文件夹
- **绿色版**：删除解压出来的整个文件夹
- **插件**：`dsh plugin --profile web remove @lqing2018/dsh-desktop-client`

## 文档索引

| 文档 | 内容 |
|---|---|
| [用户指南](docs/user-guide.md) | 安装、配置、日常使用、排查（详细图文步骤） |
| [User Guide (English)](docs/user-guide.en.md) | 英文版用户指南 |
| [PUBLISH.md](PUBLISH.md) | 开发者：发布流程（npm / GitHub / 插件市场） |

## 开发者

```powershell
# 从本地 DeepSeek Harness 安装构建便携客户端目录
.\scripts\build-portable.ps1 -Source D:\path\to\deepseek-harness -OutDir .\dist
```

- `plugin/dsh-desktop-client/` — npm 插件源码（纯 ESM，零构建）
- `scripts/build-portable.ps1` — 便携目录构建脚本
- 客户端本体（WebView2 C# 源码）在 `dist/` 与 [client 分支文档](../../../client/PLAN.md) 中维护

## 与官方项目的关系

本项目基于 [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) 构建，官方项目提供核心智能体能力、插件系统与 Web UI；本项目负责 **Windows 桌面封装**（窗口、本地服务托管、免安装打包）与配套的客户端管理插件。

## 许可证

MIT
