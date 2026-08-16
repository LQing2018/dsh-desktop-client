@echo off
rem ============================================================
rem  One-time login for publishing dsh-desktop-client
rem  Double-click this, then follow the browser prompts.
rem  NOTE: npm publish uses the official registry (npmjs.org),
rem  so this script logs in against npmjs.org, not the mirror.
rem ============================================================
echo.
echo ================================================
echo  Step 1/2: GitHub CLI login (browser will open)
echo ================================================
gh auth login --web --git-protocol https --hostname github.com
if errorlevel 1 (
  echo.
  echo  GitHub login FAILED. Try again:  gh auth login
) else (
  echo  GitHub login OK.
)
echo.
echo ================================================
echo  Step 2/2: npm login (official registry, browser)
echo ================================================
cd /d "%~dp0plugin\dsh-desktop-client"
npm login --registry=https://registry.npmjs.org/
if errorlevel 1 (
  echo.
  echo  npm login FAILED. Try again:  npm login
) else (
  echo  npm login OK.
)
echo.
echo  Done. You can now run publish.ps1
pause
