# 发布清单 / Release checklist

> 发布到 dsh-plugin 市场（github.com/topics/dsh-plugin）与 npm 的完整步骤。
> 需要你自己的 GitHub 与 npm 账号。所有命令在仓库根目录执行。

## 0. 准备（一次性）

```sh
# 安装 GitHub CLI（或直接用网页操作）
winget install GitHub.cli
gh auth login

# npm 登录
npm login
```

## 1. 创建 GitHub 仓库并打 dsh-plugin topic

```sh
git init
git add .
git commit -m "feat: portable desktop client + dsh-desktop-client plugin"
# 推送到 GitHub 并建仓（公开）
gh repo create dsh-desktop-client --public --source . --push
# 打上 dsh-plugin topic —— 这是进入插件市场的关键！
gh repo edit dsh-desktop-client --add-topic dsh-plugin
```

> 打上 `dsh-plugin` topic 后，仓库会自动出现在
> https://github.com/topics/dsh-plugin （现有 1800+ 仓库），
> 并被 AwesomeHou/dsh-plugin-marketplace 等市场 live-sync 收录。

## 2. 发布 npm 插件包

```sh
cd plugin/dsh-desktop-client
npm publish --access public
```

安装验证（在另一台有 dsh 的机器上）：

```sh
dsh plugin --profile web add dsh-desktop-client
```

## 3. 发布便携客户端 Release

```powershell
# 生成便携目录（约 350~430MB）
.\scripts\build-portable.ps1 -Source D:\anzhuang\deepseek-harness -OutDir .\dist
Compress-Archive -Path .\dist\DeepSeek-Harness-Portable -DestinationPath .\DeepSeek-Harness-Portable.zip -CompressionLevel Optimal
```

然后：

```sh
gh release create v0.1.0 DeepSeek-Harness-Portable.zip --title "v0.1.0" --notes "Portable client + plugin"
```

## 4. 提交到第三方市场（可选，增加曝光）

- https://github.com/AwesomeHou/dsh-plugin-marketplace — 提交收录（Issue/PR）
- https://github.com/YELEBAI/dsh-plugin-marketplace — 提交收录
- npm `dsh-plugin-hub` — 按该包 README 指引登记

## 5. 上线后检查

- [ ] https://github.com/topics/dsh-plugin 能搜到你的仓库
- [ ] `dsh plugin --profile web add dsh-desktop-client` 安装成功
- [ ] Release 里 zip 可下载、无 node 机器上双击可用
- [ ] README 中英文齐全（含截图更佳）
