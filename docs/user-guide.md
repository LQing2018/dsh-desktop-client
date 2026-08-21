# 用户指南

本指南面向**普通用户**：从下载、安装、配置到日常使用与故障排查，一步一步来，不需要任何命令行基础。

---

## 1. 下载与安装

打开 [Releases 页面](https://github.com/LQing2018/dsh-desktop-client/releases)，在 **v0.1.0** 下有 2 个文件，任选一种：

| 文件 | 适用场景 | 说明 |
|---|---|---|
| **`DeepSeek-Harness-Setup.exe`**（约 91MB） | 日常使用（推荐） | 单文件安装器：双击后自动解压到 `%LOCALAPPDATA%\DeepSeek-Harness-Portable` 并启动 |
| **`DeepSeek-Harness-Portable.zip`**（约 113MB） | U 盘 / 免安装 | 绿色版：解压到任意位置直接运行 |

**安装器版（方式 A）**：

1. 双击下载好的 `DeepSeek-Harness-Setup.exe`
2. 程序会自动解压并弹出客户端窗口（静默安装，无任何弹窗）
3. 看到鲸鱼图标窗口 = 安装成功

**绿色版（方式 B）**：

1. 右键 ZIP → 「全部解压缩」
2. 打开解压出的 `DeepSeek-Harness-Portable` 文件夹
3. 双击 **`DeepSeek Harness.exe`**

> ⚠️ **环境要求**：Windows 10 / 11（64 位）+ WebView2 Runtime（Win11 和最新版 Edge 自带；若缺失，程序会提示，或[点此下载](https://developer.microsoft.com/microsoft-edge/webview2/)）。
> ⚠️ 若杀毒软件拦截，请选择「允许运行」（本程序完全本地运行、无网络上传行为，仅连接本地 `127.0.0.1` 服务）。
>
> ❌ **macOS / Linux 无法使用**本客户端。Mac 用户请运行官方 `npx dsh web` 后用浏览器访问，详见[仓库主页平台说明](../README.md#平台说明仅支持-windows)。

---

## 2. 首次启动（30~60 秒，只需一次）

第一次打开时，程序要初始化本地 AI 服务（创建配置、准备运行环境），请**耐心等待**：

1. 窗口打开后可能短暂显示加载状态 —— 正常
2. 等右下角或窗口内容变为完整界面后，即可继续

> 之后每次启动都是**秒开**，不会再等。

启动后你会看到这样的界面（示意）：

![DeepSeek Harness Windows 界面](../assets/dsh-hero.jpg)

---

## 3. 配置模型 API Key（必做）

客户端本身不包含模型密钥，你需要填入自己的 API Key：

1. 点击窗口**右上角的「设置」齿轮图标**
2. 找到 **Models**（模型）一栏
3. 添加你的模型（DeepSeek、OpenAI 兼容接口等均可），粘贴 **API Key**
4. 保存后回到对话页

> 💡 DeepSeek 官方 API Key 在 [platform.deepseek.com](https://platform.deepseek.com) 申请。
> 密钥只保存在**本机** `dsh-home` 目录里，不会上传到任何地方。

---

## 4. 开始使用

- 在底部输入框直接打字，回车发送
- 左侧可切换多个会话；长任务（如写代码、分析文件）可在**关掉窗口后继续在后台运行**
- 设置里可以调整模型、外观主题等

---

## 5. 日常管理

| 你想做什么 | 怎么做 |
|---|---|
| **再次打开客户端** | 双击桌面快捷方式（安装器版会自动创建）或 `DeepSeek Harness.exe` |
| **关闭窗口** | 点 ✕ —— 注意：**服务继续在后台跑**（长任务不中断） |
| **完全停止服务** | 打开安装目录，双击 **`stop-server.cmd`** |
| **换一个端口** | 安装目录新建 `client.json`，写入 `{"port": 1234}` 后重启客户端 |
| **清理/备份数据** | 数据都在 `dsh-home` 文件夹（会话、密钥、设置），备份它即可 |
| **移动整个程序** | 整个文件夹随便复制移动；**移动后如果启动失败，删除一次 `dsh-home`** 再启动（会自动重建，但会话会清空） |

---

## 6. 卸载

- **安装器版**：删除 `%LOCALAPPDATA%\DeepSeek-Harness-Portable` 整个文件夹（就是彻底卸载）
- **绿色版**：删除解压出的整个文件夹
- 无注册表残留、无开机自启项

---

## 7. 常见问题排查

| 症状 | 原因与解决 |
|---|---|
| **Mac / 苹果电脑能用吗？** | ❌ 不能，客户端仅支持 Windows。Mac 请用官方 Web 版（`npx dsh web` + 浏览器），见[主页平台说明](../README.md) |
| 双击没反应 / 白屏 | ① 未装 WebView2 Runtime → 按上文安装；② 被安全软件拦截 → 允许运行；③ 换个目录重试 |
| 首次启动超过 2 分钟 | 偶发；关掉窗口，运行 `stop-server.cmd`，再重新打开客户端 |
| 提示「端口被占用」 | 有别的程序占了 3080 → 按上文「换端口」 |
| 移动文件夹后打不开 | 删除一次 `dsh-home`，重新启动 |
| 想换 API Key / 换模型 | 设置 → Models 重新填写 |
| 服务一直后台跑着费电 | 用完后运行 `stop-server.cmd` 停止 |

---

## 8. 和插件一起用（可选，进阶）

如果你是 DeepSeek Harness 用户，还可以安装配套插件，让 agent 帮你检测/启动客户端：

```sh
dsh plugin --profile web add @lqing2018/dsh-desktop-client
```

安装后对 agent 说：

- *"桌面客户端装了吗？"*
- *"帮我打开桌面客户端"*

更多开发者信息见 [PUBLISH.md](../PUBLISH.md)。
