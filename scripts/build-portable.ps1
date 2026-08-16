# Build the portable DeepSeek Harness client folder from a local install.
# Usage:
#   .\scripts\build-portable.ps1 -Source D:\anzhuang\deepseek-harness -OutDir .\dist
param(
    [Parameter(Mandatory = $true)][string]$Source,
    [string]$OutDir = ".\dist"
)
$ErrorActionPreference = "Stop"

$src = (Resolve-Path $Source).Path
$dst = Join-Path (Resolve-Path $OutDir).Path "DeepSeek-Harness-Portable"
New-Item -ItemType Directory -Force -Path $dst | Out-Null

Write-Host "Copying harness install from $src ..."
robocopy $src $dst /E /XD "$src\dist" "$src\.dsh-data" /XF "*.log" /NFL /NDL /NJH /NP | Out-Null

Write-Host "Bundling node.exe runtime..."
$node = (Get-Command node.exe -ErrorAction SilentlyContinue).Source
if (-not $node) { throw "node.exe not found on PATH" }
Copy-Item $node "$dst\node.exe" -Force

Write-Host "Copying client binaries..."
foreach ($f in @("DeepSeek Harness.exe", "Microsoft.Web.WebView2.Core.dll",
                 "Microsoft.Web.WebView2.WinForms.dll", "WebView2Loader.dll",
                 "stop-server.cmd", "dsh.ico")) {
    $p = Join-Path $src $f
    if (Test-Path $p) { Copy-Item $p $dst -Force }
}
if (-not (Test-Path "$dst\DeepSeek Harness.exe")) { throw "DeepSeek Harness.exe not found in $src" }

# Clean stale runtime artifacts so the delivered folder is pristine
Remove-Item "$dst\DeepSeek Harness.exe.WebView2" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$dst\dsh-home" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$dst\server.pid" -Force -ErrorAction SilentlyContinue
Remove-Item "$dst\client.json" -Force -ErrorAction SilentlyContinue

$size = [math]::Round((Get-ChildItem $dst -Recurse -File | Measure-Object Length -Sum).Sum / 1MB, 1)
Write-Host "Done: $dst ($size MB)"
