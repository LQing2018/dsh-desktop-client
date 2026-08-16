# ============================================================
#  Publish dsh-desktop-client: GitHub repo + dsh-plugin topic
#  + npm package + GitHub Release (SFX + ZIP artifacts)
#  Prereq: run login.cmd once (gh auth login + npm login)
# ============================================================
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$plugin = Join-Path $root "plugin\dsh-desktop-client"
$gh = "C:\Program Files\GitHub CLI\gh.exe"

# npm publishing must go to the OFFICIAL registry. The machine's global
# env var npm_config_registry may point at a read-only mirror (npmmirror),
# which rejects registration/publish. Override it for this script only.
$env:npm_config_registry = "https://registry.npmjs.org/"

# 0) sanity checks
if (-not (Test-Path $gh)) { throw "gh not found at $gh" }
& $gh auth status 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { throw "gh not authenticated - run login.cmd first" }
npm whoami 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { throw "npm not authenticated - run login.cmd first" }

# 1) GitHub repo (create if missing) + push + dsh-plugin topic
Push-Location $root
if (-not (& $gh repo view dsh-desktop-client 2>$null)) {
  Write-Host "Creating GitHub repo dsh-desktop-client ..."
  & $gh repo create dsh-desktop-client --public --source . --remote origin --push
  if ($LASTEXITCODE -ne 0) { throw "gh repo create failed" }
} else {
  Write-Host "Repo exists; pushing ..."
  & git push -u origin main
  if ($LASTEXITCODE -ne 0) { throw "git push failed" }
}
Write-Host "Adding dsh-plugin topic (key for the marketplace) ..."
& $gh repo edit dsh-desktop-client --add-topic dsh-plugin
if ($LASTEXITCODE -ne 0) { throw "gh repo edit failed" }
Pop-Location

# 2) npm publish
Push-Location $plugin
Write-Host "Publishing to npm ..."
& npm publish --access public
if ($LASTEXITCODE -ne 0) { throw "npm publish failed" }
Pop-Location

# 3) GitHub Release with artifacts
$releases = "D:\anzhuang\deepseek-harness\publish\releases"
$sfx = Join-Path $releases "DeepSeek-Harness-Setup.exe"
$zip = Join-Path $releases "DeepSeek-Harness-Portable.zip"
$args = @("release", "create", "v0.1.0", "--title", "v0.1.0",
          "--notes", "Self-contained DeepSeek Harness desktop client (no Node.js needed) + dsh-desktop-client plugin.
Install: dsh plugin --profile web add dsh-desktop-client", "--repo", "dsh-desktop-client")
if (Test-Path $sfx) { $args += $sfx }
if (Test-Path $zip) { $args += $zip }
Write-Host "Creating GitHub Release ..."
& $gh $args
if ($LASTEXITCODE -ne 0) { throw "gh release create failed" }

Write-Host ""
Write-Host "=== PUBLISHED ==="
Write-Host "Repo:    https://github.com/<your-user>/dsh-desktop-client"
Write-Host "Topic:   https://github.com/topics/dsh-plugin"
Write-Host "npm:     npm view dsh-desktop-client"
Write-Host "Release: gh release view v0.1.0 --repo dsh-desktop-client"
