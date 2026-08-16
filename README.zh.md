# dsh-desktop-client

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的自包含 Windows 桌面客户端，以及配套的 `dsh-desktop-client` Cordis 插件（让 agent 能定位并启动客户端）。

**无需安装 Node.js / npm / 任何服务** —— 运行时、服务端、界面全部打包在一个便携文件夹里，双击 `DeepSeek Harness.exe` 即用。

## 仓库内容

| 路径 | 说明 |
|---|---|
| `plugin/dsh-desktop-client/` | npm 插件：给 agent 增加 `desktop_client` 工具 |
| `scripts/build-portable.ps1` | 从本地 harness 安装生成便携客户端目录 |
| `releases/` | 便携客户端 zip（经 GitHub Releases 发布，不入库） |

## 快速开始（普通用户）

1. 从 [Releases](../../releases) 下载：
   - **`DeepSeek-Harness-Setup.exe`**（单文件安装器——自动解压到 `%LOCALAPPDATA%` 并启动），或
   - **`DeepSeek-Harness-Portable.zip`**（绿色便携版——解压到任意位置，U 盘也行）
2. 运行 `DeepSeek Harness.exe`
3. 首次启动自动初始化本地服务（30~60 秒）；打开设置 → Models 填入 API Key 即可使用

环境要求：Windows 10/11 64 位，带 WebView2 Runtime（Edge / Win11 自带）。

## 安装插件

```sh
dsh plugin --profile web add @lqing2018/dsh-desktop-client
```

然后对 agent 说：*"桌面客户端装了吗？"* 或 *"打开桌面客户端"*。

## 从源码构建

```powershell
# 在有完整 DeepSeek Harness npm 安装的机器上
.\scripts\build-portable.ps1 -Source D:\path\to\deepseek-harness -OutDir .\dist
```

完整发布清单（GitHub 仓库 + topic、npm publish、Releases、市场提交）见 [PUBLISH.md](PUBLISH.md)。

## 许可证

MIT
